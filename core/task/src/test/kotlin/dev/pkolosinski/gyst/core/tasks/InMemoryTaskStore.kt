package dev.pkolosinski.gyst.core.tasks

import java.time.Clock
import java.time.LocalDate

class InMemoryTaskStore(private val clock: Clock) : TaskStore {
    private val tasks = linkedMapOf<TaskId, Task>()

    /** Runs before each replace, to simulate a concurrent change. */
    var beforeWrite: () -> Unit = {}

    override suspend fun listActiveOrderedByCreatedAt(from: LocalDate, to: LocalDate): List<Task> =
        tasks.values.filter {
            LocalDate.ofInstant(it.createdAt, clock.zone) <= to &&
                (it.details.completedOn == null || it.details.completedOn >= from)
        }
            .sortedBy { it.createdAt }

    override suspend fun findById(id: TaskId): Task? = tasks[id]

    override suspend fun insert(task: Task) {
        tasks[task.id] = task
    }

    override suspend fun replace(id: TaskId, task: Task) {
        beforeWrite()
        tasks[id] = task
    }
}
