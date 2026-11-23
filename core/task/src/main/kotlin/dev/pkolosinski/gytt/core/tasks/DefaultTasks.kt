package dev.pkolosinski.gytt.core.tasks

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import java.time.LocalDate
import java.util.UUID

internal class DefaultTasks(
    private val store: TaskStore,
    private val newId: () -> UUID,
) : Tasks {
    override suspend fun list(date: LocalDate): List<Task> = store.listCreatedOnOrBefore(date)

    override suspend fun create(newTask: NewTask): Either<TaskError, Task> {
        val violations = validateFields(newTask.fields)
        if (violations.isNotEmpty()) return TaskError.Invalid(violations).left()

        val task =
            Task(
                id = newId(),
                createdOn = newTask.createdOn,
                revision = 1,
                fields = newTask.fields.normalized(),
            )
        store.insert(task)
        return task.right()
    }

    override suspend fun replace(
        id: UUID,
        expectedRevision: Long,
        fields: TaskFields,
    ): Either<TaskError, Task> {
        val violations = validateFields(fields)
        if (violations.isNotEmpty()) return TaskError.Invalid(violations).left()
        return change(id, expectedRevision) { fields.normalized() }
    }

    override suspend fun update(
        id: UUID,
        expectedRevision: Long,
        patch: TaskPatch,
    ): Either<TaskError, Task> {
        val violations = validatePatch(patch)
        if (violations.isNotEmpty()) return TaskError.Invalid(violations).left()
        return change(id, expectedRevision) { it.apply(patch).normalized() }
    }

    override suspend fun delete(id: UUID, expectedRevision: Long): Either<TaskError, Unit> =
        when (store.delete(id, expectedRevision)) {
            WriteResult.Written, WriteResult.Missing -> Unit.right()
            WriteResult.Conflict -> TaskError.RevisionMismatch(id).left()
        }

    private suspend fun change(
        id: UUID,
        expectedRevision: Long,
        newFields: (TaskFields) -> TaskFields,
    ): Either<TaskError, Task> {
        val current = store.find(id) ?: return TaskError.NotFound(id).left()
        if (current.revision != expectedRevision) return TaskError.RevisionMismatch(id).left()

        val updated = current.copy(
            revision = current.revision + 1,
            fields = newFields(current.fields),
        )
        return when (store.replace(updated, expectedRevision)) {
            WriteResult.Written -> updated.right()
            WriteResult.Conflict -> TaskError.RevisionMismatch(id).left()
            WriteResult.Missing -> TaskError.NotFound(id).left()
        }
    }
}

private fun TaskFields.apply(patch: TaskPatch): TaskFields = copy(
    title = patch.title ?: title,
    description = when (val change = patch.description) {
        DescriptionChange.Keep -> description
        DescriptionChange.Clear -> null
        is DescriptionChange.Replace -> change.text
    },
    status = patch.status ?: status,
    steps = patch.steps ?: steps,
)

/** A Task without steps has no steps list rather than an empty one. */
private fun TaskFields.normalized(): TaskFields = copy(steps = steps?.takeIf { it.isNotEmpty() })
