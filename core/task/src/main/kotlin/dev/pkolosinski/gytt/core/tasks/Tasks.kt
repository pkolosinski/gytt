package dev.pkolosinski.gytt.core.tasks

import arrow.core.Either
import java.time.LocalDate
import java.util.UUID

/** The Tasks capability. */
interface Tasks {
    /** The Tasks shown for [date]: every Task created on or before it. */
    suspend fun list(date: LocalDate): List<Task>

    suspend fun create(newTask: NewTask): Either<TaskError, Task>

    /** Replaces the editable fields of a Task. */
    suspend fun replace(
        id: UUID,
        expectedRevision: Long,
        fields: TaskFields,
    ): Either<TaskError, Task>

    suspend fun update(
        id: UUID,
        expectedRevision: Long,
        patch: TaskPatch,
    ): Either<TaskError, Task>

    /** Deleting a Task that no longer exists succeeds. */
    suspend fun delete(id: UUID, expectedRevision: Long): Either<TaskError, Unit>
}

fun Tasks(store: TaskStore, newId: () -> UUID = UUID::randomUUID): Tasks =
    DefaultTasks(store, newId)
