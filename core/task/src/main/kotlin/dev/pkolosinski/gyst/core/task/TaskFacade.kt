package dev.pkolosinski.gyst.core.task

import arrow.core.Either
import java.time.Instant

interface TaskFacade {
    suspend fun list(range: DateRange): List<Task>

    suspend fun create(input: TaskDetails, createdAt: Instant): Either<TaskError, Task>

    suspend fun update(
        id: TaskId,
        expectedVersion: Long,
        fields: TaskDetails,
    ): Either<TaskError, Task>

    suspend fun patch(
        id: TaskId,
        expectedVersion: Long,
        patch: TaskPatch,
    ): Either<TaskError, Task>

    suspend fun archive(id: TaskId): Either<TaskError, Unit>
}

fun taskFacade(store: TaskStore, idGenerator: () -> TaskId): TaskFacade =
    DefaultTaskFacade(store, idGenerator)
