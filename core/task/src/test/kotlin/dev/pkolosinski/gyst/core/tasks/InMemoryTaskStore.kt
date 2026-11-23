package dev.pkolosinski.gyst.core.tasks

import java.time.LocalDate
import java.util.UUID

class InMemoryTaskStore : TaskStore {
    private val tasks = linkedMapOf<UUID, Task>()

    /** Runs before each replace/delete, to simulate a concurrent change. */
    var beforeWrite: () -> Unit = {}

    fun put(task: Task) {
        tasks[task.id] = task
    }

    override suspend fun listCreatedOnOrBefore(date: LocalDate) = tasks.values.filter {
        it.createdOn <=
            date
    }

    override suspend fun find(id: UUID) = tasks[id]

    override suspend fun insert(task: Task) {
        tasks[task.id] = task
    }

    override suspend fun replace(task: Task, expectedRevision: Long): WriteResult {
        beforeWrite()
        val stored = tasks[task.id] ?: return WriteResult.Missing
        if (stored.revision != expectedRevision) return WriteResult.Conflict
        tasks[task.id] = task
        return WriteResult.Written
    }

    override suspend fun delete(id: UUID, expectedRevision: Long): WriteResult {
        beforeWrite()
        val stored = tasks[id] ?: return WriteResult.Missing
        if (stored.revision != expectedRevision) return WriteResult.Conflict
        tasks.remove(id)
        return WriteResult.Written
    }
}
