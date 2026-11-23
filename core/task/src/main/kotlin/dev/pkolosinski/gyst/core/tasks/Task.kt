package dev.pkolosinski.gyst.core.tasks

import arrow.core.None
import arrow.core.Option
import arrow.core.getOrElse
import java.time.Instant
import java.time.LocalDate

@JvmInline
value class TaskId(val value: String)

data class Task(
    val id: TaskId,
    val details: TaskDetails,
    val createdAt: Instant,
    /** Starts at 1 and increases on every change. */
    val version: Long = 1L,
) {
    fun withUpdate(newDetails: TaskDetails): Task = copy(
        details = newDetails,
        version = version + 1,
    )
}

data class TaskDetails(
    val title: String,
    val description: String?,
    val status: TaskStatus,
    val steps: List<TaskStep>,
    val startedOn: LocalDate,
    val completedOn: LocalDate? = null,
) {
    fun apply(patch: TaskPatch): TaskDetails = copy(
        title = patch.title.getOrElse { this.title },
        description = patch.description.getOrElse { this.description },
        status = patch.status.getOrElse { this.status },
        steps = patch.steps.getOrElse { this.steps },
    )
}

enum class TaskStatus { TODO, IN_PROGRESS, COMPLETED, ARCHIVED }

data class TaskStep(val text: String, val completed: Boolean)

/** A partial update: `arrow.core.None` leaves a part unchanged. */
data class TaskPatch(
    val title: Option<String> = None,
    val description: Option<String?> = None,
    val status: Option<TaskStatus> = None,
    val steps: Option<List<TaskStep>> = None,
)
