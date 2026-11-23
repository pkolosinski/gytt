package dev.pkolosinski.gyst.core.tasks

import arrow.core.Either
import arrow.core.raise.either
import arrow.core.raise.ensure
import arrow.core.raise.ensureNotNull
import arrow.core.right
import java.time.Instant

internal class DefaultTaskFacade(
    private val store: TaskStore,
    private val idGenerator: () -> TaskId,
) : TaskFacade {
    override suspend fun list(range: DateRange): List<Task> =
        store.listActiveOrderedByCreatedAt(range.from, range.to)

    override suspend fun create(input: TaskDetails, createdAt: Instant): Either<TaskError, Task> {
        val newTask = Task(
            id = idGenerator(),
            details = input,
            createdAt = createdAt,
            version = 1,
        )
        store.insert(newTask)
        return newTask.right()
    }

    override suspend fun update(
        id: TaskId,
        expectedVersion: Long,
        fields: TaskDetails,
    ): Either<TaskError, Task> = update(id, expectedVersion) { fields }

    override suspend fun patch(
        id: TaskId,
        expectedVersion: Long,
        patch: TaskPatch,
    ): Either<TaskError, Task> = update(id, expectedVersion) { it.apply(patch) }

    override suspend fun archive(id: TaskId) {
        store.findById(id)?.let {
            val archived = it.withUpdate(
                newDetails = it.details.copy(status = TaskStatus.ARCHIVED),
            )
            store.replace(id, archived)
        }
    }

    private suspend fun update(
        id: TaskId,
        expectedVersion: Long,
        newFields: (TaskDetails) -> TaskDetails,
    ): Either<TaskError, Task> = either {
        val existing = store.findById(id)

        ensureNotNull(existing) { TaskError.NotFound(id) }
        ensure(existing.version == expectedVersion) { TaskError.RevisionMismatch(id) }

        val updated = existing.withUpdate(newDetails = newFields(existing.details))
        store.replace(id, updated)

        updated
    }
}
