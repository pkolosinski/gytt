package dev.pkolosinski.gyst.core.tasks

import java.time.LocalDate
import java.util.UUID

enum class TaskStatus { TODO, IN_PROGRESS, COMPLETED }

data class TaskStep(val name: String, val completed: Boolean)

/** The fields a user edits on a Task. */
data class TaskFields(
    val title: String,
    val description: String?,
    val status: TaskStatus,
    val steps: List<TaskStep>?,
)

/** A Task to create; [createdOn] is the date the user created it on. */
data class NewTask(val createdOn: LocalDate, val fields: TaskFields)

data class Task(
    val id: UUID,
    val createdOn: LocalDate,
    /** Starts at 1 and increases on every change. */
    val revision: Long,
    val fields: TaskFields,
)

sealed interface DescriptionChange {
    data object Keep : DescriptionChange

    data object Clear : DescriptionChange

    data class Replace(val text: String) : DescriptionChange
}

/** A partial update: `null` leaves a part unchanged; an empty [steps] list removes all steps. */
data class TaskPatch(
    val title: String? = null,
    val description: DescriptionChange = DescriptionChange.Keep,
    val status: TaskStatus? = null,
    val steps: List<TaskStep>? = null,
) {
    val isEmpty: Boolean
        get() = title == null &&
            description == DescriptionChange.Keep &&
            status == null &&
            steps == null
}
