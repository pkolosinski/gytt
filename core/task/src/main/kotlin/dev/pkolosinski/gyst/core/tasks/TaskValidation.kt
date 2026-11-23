package dev.pkolosinski.gyst.core.tasks

internal const val TITLE_MAX = 100
internal const val DESCRIPTION_MAX = 1000
internal const val STEP_NAME_MAX = 100

internal fun validateFields(fields: TaskFields): List<Violation> = validateTitle(fields.title) +
    validateDescription(fields.description) +
    validateSteps(fields.steps, minimum = 1)

internal fun validatePatch(patch: TaskPatch): List<Violation> =
    listOfNotNull(patch.title).flatMap(::validateTitle) +
        ((patch.description as? DescriptionChange.Replace)?.text).let(::validateDescription) +
        validateSteps(patch.steps, minimum = 0) +
        if (patch.isEmpty) listOf(Violation("", "At least one field is required")) else emptyList()

private fun validateTitle(title: String): List<Violation> =
    lengthViolation("title", title, TITLE_MAX)

private fun validateDescription(description: String?): List<Violation> =
    description?.let { lengthViolation("description", it, DESCRIPTION_MAX) } ?: emptyList()

private fun validateSteps(steps: List<TaskStep>?, minimum: Int): List<Violation> {
    if (steps == null) return emptyList()
    val tooFew = if (steps.size <
        minimum
    ) {
        listOf(Violation("steps", "Must have at least $minimum item"))
    } else {
        emptyList()
    }
    return tooFew + steps.flatMapIndexed { index, step ->
        lengthViolation("steps[$index].name", step.name, STEP_NAME_MAX)
    }
}

private fun lengthViolation(
    field: String,
    value: String,
    max: Int,
): List<Violation> = when {
    value.isEmpty() -> listOf(Violation(field, "Must not be empty"))
    value.length > max -> listOf(Violation(field, "Must be at most $max characters"))
    else -> emptyList()
}
