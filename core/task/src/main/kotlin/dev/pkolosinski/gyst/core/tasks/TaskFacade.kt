package dev.pkolosinski.gyst.core.tasks

import arrow.core.Either
import java.time.Instant
import java.time.LocalDate

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

    suspend fun archive(id: TaskId)
}

fun taskFacade(store: TaskStore, idGenerator: () -> TaskId): TaskFacade =
    DefaultTaskFacade(store, idGenerator)

data class DateRange(val from: LocalDate, val to: LocalDate) {
    init {
        require(!from.isAfter(to)) { "from=$from must not be after to=$to" }
    }
}
