package dev.pkolosinski.gytt.server.tasks

import dev.pkolosinski.gytt.core.tasks.Task
import dev.pkolosinski.gytt.core.tasks.TaskFields
import dev.pkolosinski.gytt.core.tasks.TaskStatus
import dev.pkolosinski.gytt.core.tasks.TaskStep
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.time.LocalDate
import java.util.UUID

internal val taskJson = Json { explicitNulls = false }

@Serializable
internal data class TaskStepJson(val name: String, val completed: Boolean)

/** A Task as the API contract shows it; also the shape of the stored document. */
@Serializable
internal data class TaskJson(
    val id: String,
    val createdOn: String,
    val revision: Long,
    val title: String,
    val description: String? = null,
    val status: String,
    val steps: List<TaskStepJson>? = null,
)

private val statusNames = mapOf(
    TaskStatus.TODO to "todo",
    TaskStatus.IN_PROGRESS to "inProgress",
    TaskStatus.COMPLETED to "completed",
)

internal val statusWireNames: Collection<String> = statusNames.values

internal fun statusFromWireName(name: String): TaskStatus? = statusNames.entries.firstOrNull {
    it.value ==
        name
}?.key

internal fun Task.toJson() = TaskJson(
    id = id.toString(),
    createdOn = createdOn.toString(),
    revision = revision,
    title = fields.title,
    description = fields.description,
    status = statusNames.getValue(fields.status),
    steps = fields.steps?.map { TaskStepJson(it.name, it.completed) },
)

internal fun TaskJson.toTask() = Task(
    id = UUID.fromString(id),
    createdOn = LocalDate.parse(createdOn),
    revision = revision,
    fields = TaskFields(
        title = title,
        description = description,
        status = checkNotNull(statusFromWireName(status)) { "Unknown stored status $status" },
        steps = steps?.map { TaskStep(it.name, it.completed) },
    ),
)
