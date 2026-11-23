package dev.pkolosinski.gytt.core.tasks

import java.time.LocalDate
import java.util.UUID

enum class WriteResult {
    Written,

    /** The stored Task no longer has the expected revision. */
    Conflict,

    /** There is no stored Task with that id. */
    Missing,
}

/** The store could not be reached or did not confirm the operation, so nothing is known to be saved. */
class TaskStoreUnavailableException(cause: Throwable) : RuntimeException(cause)

/**
 * Where Tasks are kept. Implementations signal an unavailable store by throwing
 * [TaskStoreUnavailableException]; the revision checks of [replace] and [delete] must be atomic
 * with the write.
 */
interface TaskStore {
    suspend fun listCreatedOnOrBefore(date: LocalDate): List<Task>

    suspend fun find(id: UUID): Task?

    suspend fun insert(task: Task)

    /** Stores [task] if the stored copy still has [expectedRevision]. */
    suspend fun replace(task: Task, expectedRevision: Long): WriteResult

    /** Removes the Task if the stored copy still has [expectedRevision]. */
    suspend fun delete(id: UUID, expectedRevision: Long): WriteResult
}
