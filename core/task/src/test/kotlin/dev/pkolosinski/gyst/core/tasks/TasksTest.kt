package dev.pkolosinski.gyst.core.tasks

import arrow.core.Either
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.shouldBe
import java.time.Clock
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneOffset

private fun <E, A> Either<E, A>.shouldBeRight(): A =
    fold({ error("Expected Right but was Left($it)") }, { it })

private fun <E, A> Either<E, A>.shouldBeLeft(): E =
    fold({ it }, { error("Expected Left but was Right($it)") })

private val today = LocalDate.of(2026, 11, 21)
private val id = TaskId("01ARZ3NDEKTSV4RRFFQ69G5FAV")
private val id2 = TaskId("01ARZ3NDEKTSV4RRFFQ69G5FAW")
private val id3 = TaskId("01ARZ3NDEKTSV4RRFFQ69G5FAX")
private val id4 = TaskId("01ARZ3NDEKTSV4RRFFQ69G5FAY")
private val fields =
    TaskDetails("Renew card", "Bring proof", TaskStatus.TODO, listOf(TaskStep("Find proof", false)))

private val clock = Clock.fixed(Instant.parse("2026-11-23T10:00:00Z"), ZoneOffset.UTC)

private fun newTasks(store: InMemoryTaskStore = InMemoryTaskStore(clock)) =
    taskFacade(store) { id } to store

class TasksTest : FunSpec() {
    init {


    context("Task IDs") {
        test("parses a canonical ULID") {
            TaskId.parse(id.value) shouldBe id
        }

        test("rejects malformed or non-canonical ULIDs") {
            TaskId.parse("not-a-ulid") shouldBe null
            TaskId.parse("01arz3ndektsv4rrffq69g5fav") shouldBe null
        }
    }

    context("create") {
        test("stores the Task at revision 1 and shows it from its creation date on") {
            val (tasks, _) = newTasks()

            val task = tasks.create(NewTask(today, fields)).shouldBeRight()

            task shouldBe Task(id, today, 1, fields)
            tasks.list(today.minusDays(1), today.minusDays(1)) shouldBe emptyList()
            tasks.list(today, today) shouldContainExactly listOf(task)
            tasks.list(today.plusDays(5), today.plusDays(5)) shouldContainExactly listOf(task)
        }
    }

    context("completion") {
        val completedDay = LocalDate.of(2026, 11, 23)

        test("completing sets completedOn and reopening clears it") {
            val store = InMemoryTaskStore()
            val tasks = taskFacade(store, clock) { id }
            store.put(Task(id, today, 1, fields))

            val done = tasks.patch(
                id,
                1,
                TaskPatch(newStatus = TaskStatus.COMPLETED),
            ).shouldBeRight()
            done.completedOn shouldBe completedDay

            val again = tasks.patch(id, 2, TaskPatch(title = "Renamed")).shouldBeRight()
            again.completedOn shouldBe completedDay

            tasks.patch(
                id,
                3,
                TaskPatch(newStatus = TaskStatus.TODO),
            ).shouldBeRight().completedOn shouldBe
                null
        }

        test("a Task created completed is completed on its creation day") {
            val tasks = taskFacade(InMemoryTaskStore(), clock) { id }

            tasks.create(NewTask(today, fields.copy(status = TaskStatus.COMPLETED)))
                .shouldBeRight().completedOn shouldBe today
        }

        test("a range lists open Tasks and Tasks completed on or after its start") {
            val store = InMemoryTaskStore()
            val tasks = taskFacade(store, clock) { id }
            val open = Task(id2, today, 1, fields)
            val doneEarly =
                Task(
                    id3,
                    today,
                    1,
                    fields.copy(status = TaskStatus.COMPLETED),
                    today.plusDays(1),
                )
            val doneLate =
                Task(
                    id4,
                    today,
                    1,
                    fields.copy(status = TaskStatus.COMPLETED),
                    today.plusDays(5),
                )
            listOf(open, doneEarly, doneLate).forEach(store::put)

            tasks.list(today.plusDays(2), today.plusDays(6)) shouldContainExactly
                listOf(open, doneLate)
            tasks.list(today, today) shouldContainExactly listOf(open, doneEarly, doneLate)
            tasks.list(today.minusDays(3), today.minusDays(1)) shouldBe emptyList()
        }
    }

    context("replace") {
        test("replaces the fields, clears omitted parts and increments the revision") {
            val store = InMemoryTaskStore()
            val tasks = taskFacade(store, clock) { id }
            store.put(Task(id, today, 3, fields))
            val replacement = TaskDetails("New title", null, TaskStatus.COMPLETED, null)

            val task = tasks.update(id, 3, replacement).shouldBeRight()

            task shouldBe Task(id, today, 4, replacement, completedOn = LocalDate.now(clock))
            store.find(id) shouldBe task
        }

        test("reports a missing Task") {
            val (tasks, _) = newTasks()

            tasks.update(id, 1, fields).shouldBeLeft() shouldBe TaskError.NotFound(id)
        }

        test("rejects a stale revision without writing") {
            val (tasks, store) = newTasks()
            val stored = Task(id, today, 3, fields)
            store.put(stored)

            tasks.update(id, 2, fields.copy(title = "Other")).shouldBeLeft() shouldBe
                TaskError.RevisionMismatch(id)
            store.find(id) shouldBe stored
        }

        test("rejects a write that loses a race with another change") {
            val (tasks, store) = newTasks()
            store.put(Task(id, today, 1, fields))
            store.beforeWrite = { store.put(Task(id, today, 2, fields.copy(title = "Elsewhere"))) }

            tasks.update(id, 1, fields.copy(title = "Mine")).shouldBeLeft() shouldBe
                TaskError.RevisionMismatch(id)
            store.find(id)?.details?.title shouldBe "Elsewhere"
        }
    }

    context("update") {
        suspend fun updated(patch: TaskPatch): Either<TaskError, Task> {
            val (tasks, store) = newTasks()
            store.put(Task(id, today, 1, fields))
            return tasks.patch(id, 1, patch)
        }

        test("changes only the given fields") {
            val task = updated(TaskPatch(newStatus = TaskStatus.IN_PROGRESS)).shouldBeRight()

            task shouldBe Task(id, today, 2, fields.copy(status = TaskStatus.IN_PROGRESS))
        }

        test("replaces or clears the description") {
            updated(
                TaskPatch(newDescription = DescriptionChange.Replace("New")),
            ).shouldBeRight().details.description shouldBe
                "New"
            updated(
                TaskPatch(newDescription = DescriptionChange.Clear),
            ).shouldBeRight().details.description shouldBe
                null
        }

        test("replaces all steps, and an empty list removes them") {
            val steps = listOf(TaskStep("A", true), TaskStep("B", false))

            updated(TaskPatch(steps = steps)).shouldBeRight().details.steps shouldBe steps
            updated(TaskPatch(steps = emptyList())).shouldBeRight().details.steps shouldBe null
        }

        test("reports a missing Task and a stale revision") {
            val (tasks, store) = newTasks()
            tasks.patch(id, 1, TaskPatch(title = "T")).shouldBeLeft() shouldBe
                TaskError.NotFound(id)

            store.put(Task(id, today, 2, fields))
            tasks.patch(id, 1, TaskPatch(title = "T")).shouldBeLeft() shouldBe
                TaskError.RevisionMismatch(id)
        }
    }

    context("delete") {
        test("removes the Task when the revision matches") {
            val (tasks, store) = newTasks()
            store.put(Task(id, today, 2, fields))

            tasks.archive(id, 2).shouldBeRight()

            store.find(id) shouldBe null
        }

        test("rejects a stale revision and keeps the Task") {
            val (tasks, store) = newTasks()
            store.put(Task(id, today, 2, fields))

            tasks.archive(id, 1).shouldBeLeft() shouldBe TaskError.RevisionMismatch(id)
            store.find(id)?.version shouldBe 2
        }

        test("succeeds for a Task that is already gone") {
            val (tasks, _) = newTasks()

            tasks.archive(id, 1).shouldBeRight()
        }
    }
})
