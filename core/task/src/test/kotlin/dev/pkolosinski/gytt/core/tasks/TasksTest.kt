package dev.pkolosinski.gytt.core.tasks

import arrow.core.Either
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.shouldBe
import java.time.LocalDate
import java.util.UUID

private fun <E, A> Either<E, A>.shouldBeRight(): A =
    fold({ error("Expected Right but was Left($it)") }, { it })

private fun <E, A> Either<E, A>.shouldBeLeft(): E =
    fold({ it }, { error("Expected Left but was Right($it)") })

private val today = LocalDate.of(2026, 11, 21)
private val id = UUID.fromString("6f1c2d4e-8a3b-4c5d-9e6f-7a8b9c0d1e2f")
private val fields =
    TaskFields("Renew card", "Bring proof", TaskStatus.TODO, listOf(TaskStep("Find proof", false)))

private fun newTasks(store: InMemoryTaskStore = InMemoryTaskStore()) = Tasks(store) { id } to store

class TasksTest : FunSpec({
    context("create") {
        test("stores the Task at revision 1 and shows it from its creation date on") {
            val (tasks, _) = newTasks()

            val task = tasks.create(NewTask(today, fields)).shouldBeRight()

            task shouldBe Task(id, today, 1, fields)
            tasks.list(today.minusDays(1)) shouldBe emptyList()
            tasks.list(today) shouldContainExactly listOf(task)
            tasks.list(today.plusDays(5)) shouldContainExactly listOf(task)
        }

        test("reports every invalid field with its path") {
            val (tasks, store) = newTasks()
            val invalid =
                TaskFields(
                    "",
                    "x".repeat(1001),
                    TaskStatus.TODO,
                    listOf(TaskStep("ok", false), TaskStep("", true)),
                )

            val error = tasks.create(NewTask(today, invalid)).shouldBeLeft()

            error shouldBe TaskError.Invalid(
                listOf(
                    Violation("title", "Must not be empty"),
                    Violation("description", "Must be at most 1000 characters"),
                    Violation("steps[1].name", "Must not be empty"),
                ),
            )
            store.listCreatedOnOrBefore(today) shouldBe emptyList()
        }

        test("rejects an empty step list") {
            val (tasks, _) = newTasks()

            tasks.create(NewTask(today, fields.copy(steps = emptyList()))).shouldBeLeft() shouldBe
                TaskError.Invalid(listOf(Violation("steps", "Must have at least 1 item")))
        }
    }

    context("replace") {
        test("replaces the fields, clears omitted parts and increments the revision") {
            val (tasks, store) = newTasks()
            store.put(Task(id, today, 3, fields))
            val replacement = TaskFields("New title", null, TaskStatus.COMPLETED, null)

            val task = tasks.replace(id, 3, replacement).shouldBeRight()

            task shouldBe Task(id, today, 4, replacement)
            store.find(id) shouldBe task
        }

        test("reports a missing Task") {
            val (tasks, _) = newTasks()

            tasks.replace(id, 1, fields).shouldBeLeft() shouldBe TaskError.NotFound(id)
        }

        test("rejects a stale revision without writing") {
            val (tasks, store) = newTasks()
            val stored = Task(id, today, 3, fields)
            store.put(stored)

            tasks.replace(id, 2, fields.copy(title = "Other")).shouldBeLeft() shouldBe
                TaskError.RevisionMismatch(id)
            store.find(id) shouldBe stored
        }

        test("rejects a write that loses a race with another change") {
            val (tasks, store) = newTasks()
            store.put(Task(id, today, 1, fields))
            store.beforeWrite = { store.put(Task(id, today, 2, fields.copy(title = "Elsewhere"))) }

            tasks.replace(id, 1, fields.copy(title = "Mine")).shouldBeLeft() shouldBe
                TaskError.RevisionMismatch(id)
            store.find(id)?.fields?.title shouldBe "Elsewhere"
        }
    }

    context("update") {
        suspend fun updated(patch: TaskPatch): Either<TaskError, Task> {
            val (tasks, store) = newTasks()
            store.put(Task(id, today, 1, fields))
            return tasks.update(id, 1, patch)
        }

        test("changes only the given fields") {
            val task = updated(TaskPatch(status = TaskStatus.IN_PROGRESS)).shouldBeRight()

            task shouldBe Task(id, today, 2, fields.copy(status = TaskStatus.IN_PROGRESS))
        }

        test("replaces or clears the description") {
            updated(
                TaskPatch(description = DescriptionChange.Replace("New")),
            ).shouldBeRight().fields.description shouldBe
                "New"
            updated(
                TaskPatch(description = DescriptionChange.Clear),
            ).shouldBeRight().fields.description shouldBe
                null
        }

        test("replaces all steps, and an empty list removes them") {
            val steps = listOf(TaskStep("A", true), TaskStep("B", false))

            updated(TaskPatch(steps = steps)).shouldBeRight().fields.steps shouldBe steps
            updated(TaskPatch(steps = emptyList())).shouldBeRight().fields.steps shouldBe null
        }

        test("rejects an empty patch and invalid values") {
            updated(TaskPatch()).shouldBeLeft() shouldBe
                TaskError.Invalid(listOf(Violation("", "At least one field is required")))
            updated(TaskPatch(title = "x".repeat(101))).shouldBeLeft() shouldBe
                TaskError.Invalid(listOf(Violation("title", "Must be at most 100 characters")))
            updated(TaskPatch(description = DescriptionChange.Replace(""))).shouldBeLeft() shouldBe
                TaskError.Invalid(listOf(Violation("description", "Must not be empty")))
        }

        test("reports a missing Task and a stale revision") {
            val (tasks, store) = newTasks()
            tasks.update(id, 1, TaskPatch(title = "T")).shouldBeLeft() shouldBe
                TaskError.NotFound(id)

            store.put(Task(id, today, 2, fields))
            tasks.update(id, 1, TaskPatch(title = "T")).shouldBeLeft() shouldBe
                TaskError.RevisionMismatch(id)
        }
    }

    context("delete") {
        test("removes the Task when the revision matches") {
            val (tasks, store) = newTasks()
            store.put(Task(id, today, 2, fields))

            tasks.delete(id, 2).shouldBeRight()

            store.find(id) shouldBe null
        }

        test("rejects a stale revision and keeps the Task") {
            val (tasks, store) = newTasks()
            store.put(Task(id, today, 2, fields))

            tasks.delete(id, 1).shouldBeLeft() shouldBe TaskError.RevisionMismatch(id)
            store.find(id)?.revision shouldBe 2
        }

        test("succeeds for a Task that is already gone") {
            val (tasks, _) = newTasks()

            tasks.delete(id, 1).shouldBeRight()
        }
    }
})
