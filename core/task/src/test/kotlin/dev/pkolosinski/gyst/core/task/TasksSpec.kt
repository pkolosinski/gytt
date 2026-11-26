package dev.pkolosinski.gyst.core.task

import arrow.core.Some
import io.kotest.assertions.arrow.core.shouldBeLeft
import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.ShouldSpec
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.shouldBe
import java.time.Instant
import java.time.LocalDate

class TasksSpec : ShouldSpec({
    val now = Instant.parse("2024-01-01T00:00:00Z")
    val id = TaskId("task-1")
    val allTimeRange = DateRange(from = LocalDate.MIN, to = LocalDate.MAX)
    var nextId = 0
    val store = InMemoryTaskStore()
    val facade = taskFacade(
        store,
        idGenerator = { TaskId("task-${++nextId}") },
    )

    beforeEach {
        store.clear()
        nextId = 0
    }

    context("create") {
        should("create a new task") {
            val input = aTaskDetails()

            val createdTask = facade.create(input, now).shouldBeRight()

            with(createdTask) {
                this.id shouldBe id
                this.details shouldBe input
                this.createdAt shouldBe now
                this.version shouldBe 1L
            }
        }

        should("make the created task visible through list") {
            val createdTask = facade.create(aTaskDetails(), now).shouldBeRight()

            facade.list(allTimeRange) shouldBe listOf(createdTask)
        }
    }

    context("list") {
        should(
            "include tasks on the date boundaries and exclude tasks outside the range or archived",
        ) {
            val from = LocalDate.of(2024, 1, 10)
            val to = LocalDate.of(2024, 1, 20)

            val startsOnTo = facade.create(
                aTaskDetails(startedOn = to),
                now,
            ).shouldBeRight()
            facade.create(
                aTaskDetails(startedOn = to.plusDays(1)),
                now,
            ).shouldBeRight()
            val completesOnFrom = facade.create(
                aTaskDetails(
                    status = TaskStatus.COMPLETED,
                    startedOn = from.minusDays(1),
                    completedOn = from,
                ),
                now,
            ).shouldBeRight()
            facade.create(
                aTaskDetails(
                    status = TaskStatus.COMPLETED,
                    startedOn = from.minusDays(2),
                    completedOn = from.minusDays(1),
                ),
                now,
            ).shouldBeRight()
            facade.create(
                aTaskDetails(status = TaskStatus.ARCHIVED, startedOn = from),
                now,
            ).shouldBeRight()

            facade.list(DateRange(from, to)).map { it.id }.toSet() shouldBe
                setOf(startsOnTo.id, completesOnFrom.id)
        }
    }

    context("update") {
        should("replace task details, increment version, and expose the update through list") {
            val originalDetails = aTaskDetails(title = "original")
            val createdTask = facade.create(originalDetails, now).shouldBeRight()
            val updatedDetails = aTaskDetails(
                title = "updated",
                status = TaskStatus.COMPLETED,
                startedOn = LocalDate.of(2024, 1, 2),
                completedOn = LocalDate.of(2024, 1, 3),
            )

            val updatedTask = facade.update(
                createdTask.id,
                createdTask.version,
                updatedDetails,
            ).shouldBeRight()

            updatedTask shouldBe createdTask.copy(
                details = updatedDetails,
                version = createdTask.version + 1,
            )
            facade.list(allTimeRange) shouldBe listOf(updatedTask)
        }

        should("return NotFound for a missing task") {
            val missingId = TaskId("missing")

            facade.update(missingId, 1L, aTaskDetails()).shouldBeLeft() shouldBe
                TaskError.NotFound(missingId)
        }

        should("reject a stale version without changing the visible task") {
            val createdTask = facade.create(aTaskDetails(), now).shouldBeRight()
            val currentTask = facade.update(
                createdTask.id,
                createdTask.version,
                aTaskDetails(title = "current"),
            ).shouldBeRight()

            facade.update(
                createdTask.id,
                createdTask.version,
                aTaskDetails(title = "stale"),
            ).shouldBeLeft() shouldBe TaskError.RevisionMismatch(createdTask.id)

            facade.list(allTimeRange) shouldBe listOf(currentTask)
        }
    }

    context("patch") {
        should("change supplied fields and preserve omitted fields") {
            val originalDetails = aTaskDetails(
                title = "original",
                description = "keep this",
                status = TaskStatus.TODO,
                steps = listOf(TaskStep("existing", completed = false)),
                startedOn = LocalDate.of(2024, 1, 1),
            )
            val createdTask = facade.create(originalDetails, now).shouldBeRight()
            val updatedSteps = listOf(TaskStep("updated", completed = true))

            val patchedTask = facade.patch(
                createdTask.id,
                createdTask.version,
                TaskPatch(
                    title = Some("patched"),
                    status = Some(TaskStatus.IN_PROGRESS),
                    steps = Some(updatedSteps),
                ),
            ).shouldBeRight()

            patchedTask.details shouldBe originalDetails.copy(
                title = "patched",
                status = TaskStatus.IN_PROGRESS,
                steps = updatedSteps,
            )
            patchedTask.version shouldBe createdTask.version + 1
            facade.list(allTimeRange) shouldBe listOf(patchedTask)
        }

        should("clear description when the patch explicitly supplies null") {
            val originalDetails = aTaskDetails(description = "to be cleared")
            val createdTask = facade.create(originalDetails, now).shouldBeRight()

            val patchedTask = facade.patch(
                createdTask.id,
                createdTask.version,
                TaskPatch(description = Some<String?>(null)),
            ).shouldBeRight()

            patchedTask.details shouldBe originalDetails.copy(description = null)
            patchedTask.version shouldBe createdTask.version + 1
            facade.list(allTimeRange) shouldBe listOf(patchedTask)
        }
    }

    context("archive") {
        should("archive existing task, so it is no longer listed") {
            val input = aTaskDetails()
            val createdTask = facade.create(input, now).shouldBeRight()

            facade.archive(createdTask.id).shouldBeRight()

            facade.list(allTimeRange).shouldBeEmpty()
        }

        should("do nothing if task does not exist") {
            facade.archive(TaskId("non-existent")).shouldBeRight()
        }
    }
})
