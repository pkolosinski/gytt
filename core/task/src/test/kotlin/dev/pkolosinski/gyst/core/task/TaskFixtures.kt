package dev.pkolosinski.gyst.core.task

import java.time.LocalDate

fun aTaskDetails(
    title: String = "title",
    description: String = "description",
    status: TaskStatus = TaskStatus.TODO,
    steps: List<TaskStep> = emptyList(),
    startedOn: LocalDate = LocalDate.now(),
    completedOn: LocalDate? = null,
): TaskDetails = TaskDetails(
    title = title,
    description = description,
    status = status,
    steps = steps,
    startedOn = startedOn,
    completedOn = completedOn,
)
