package dev.pkolosinski.gyst.core.task

import java.time.LocalDate

class InMemoryTaskStore : TaskStore {
    private val tasks = mutableMapOf<TaskId, Task>()

    /** Runs before each replace, to simulate a concurrent change. */
    var beforeWrite: () -> Unit = {}

    fun clear() {
        tasks.clear()
    }

    override suspend fun listActiveBetween(from: LocalDate, to: LocalDate): List<Task> =
        tasks.values.asSequence()
            .filter { it.details.status != TaskStatus.ARCHIVED }
            .filter { it.details.startedOn <= to }
            .filter { (it.details.completedOn == null || it.details.completedOn >= from) }
            .sortedBy { it.createdAt }
            .toList()

    override suspend fun findById(id: TaskId): Task? = tasks[id]

    override suspend fun insert(task: Task) {
        tasks[task.id] = task
    }

    override suspend fun replace(id: TaskId, task: Task) {
        beforeWrite()
        tasks[id] = task
    }
}
