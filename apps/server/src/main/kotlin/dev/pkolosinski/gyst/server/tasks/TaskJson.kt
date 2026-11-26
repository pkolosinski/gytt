package dev.pkolosinski.gyst.server.tasks

import dev.pkolosinski.gyst.core.task.Task
import dev.pkolosinski.gyst.core.task.TaskDetails
import dev.pkolosinski.gyst.core.task.TaskId
import dev.pkolosinski.gyst.core.task.TaskStatus
import dev.pkolosinski.gyst.core.task.TaskStep
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.time.LocalDate

internal val taskJson = Json { explicitNulls = false }

@Serializable
internal data class TaskStepJson(val name: String, val completed: Boolean)

/** A Task as the API contract shows it; also the shape of the stored document. */
@Serializable
internal data class TaskJson(
    val id: String,
    val createdOn: String,
    val startedOn: String,
    val completedOn: String? = null,
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
    id = id.value,
    createdOn = createdAt.toString(),
    startedOn = startedOn.toString(),
    completedOn = completedOn?.toString(),
    revision = version,
    title = details.title,
    description = details.description,
    status = statusNames.getValue(details.status),
    steps = details.steps?.map { TaskStepJson(it.text, it.completed) },
)

internal fun TaskJson.toTask() = Task(
    id = TaskId.parse(id) ?: error("Invalid stored Task ID"),
    createdAt = LocalDate.parse(createdOn),
    completedOn = completedOn?.let(LocalDate::parse),
    version = revision,
    details = TaskDetails(
        title = title,
        description = description,
        status = checkNotNull(statusFromWireName(status)) { "Unknown stored status $status" },
        steps = steps?.map { TaskStep(it.name, it.completed) },
    ),
)
