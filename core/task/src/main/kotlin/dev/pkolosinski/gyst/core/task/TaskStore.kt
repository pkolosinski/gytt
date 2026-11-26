package dev.pkolosinski.gyst.core.task

import java.time.LocalDate

interface TaskStore {
    /**
     * The Tasks that are active on some day in `from..to`: started on or before [to] and either
     * not completed or completed on or after [from].
     */
    suspend fun listActiveBetween(from: LocalDate, to: LocalDate): List<Task>

    suspend fun findById(id: TaskId): Task?

    suspend fun insert(task: Task)

    suspend fun replace(id: TaskId, task: Task)
}
