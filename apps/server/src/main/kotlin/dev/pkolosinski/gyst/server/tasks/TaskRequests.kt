package dev.pkolosinski.gyst.server.tasks

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import dev.pkolosinski.gyst.core.task.DescriptionChange
import dev.pkolosinski.gyst.core.task.NewTask
import dev.pkolosinski.gyst.core.task.TaskDetails
import dev.pkolosinski.gyst.core.task.TaskPatch
import dev.pkolosinski.gyst.core.task.TaskStatus
import dev.pkolosinski.gyst.core.task.TaskStep
import dev.pkolosinski.gyst.core.task.Violation
import kotlinx.serialization.SerializationException
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull
import java.time.DateTimeException
import java.time.LocalDate

/** Reads request values, collecting a violation for each one that does not fit the contract. */
private class Reader(private val path: String = "") {
    val violations = mutableListOf<Violation>()

    private fun field(name: String) = if (path.isEmpty()) name else "$path.$name"

    fun string(
        body: JsonObject,
        name: String,
        required: Boolean,
    ): String? {
        val element = body[name]
        return when {
            element == null && required -> null.also {
                violations +=
                    Violation(field(name), "Is required")
            }

            element == null -> null

            element is JsonPrimitive && element.isString -> element.content

            else -> null.also { violations += Violation(field(name), "Must be a string") }
        }
    }

    fun date(body: JsonObject, name: String): LocalDate? {
        val text = string(body, name, required = true) ?: return null
        return try {
            LocalDate.parse(text)
        } catch (_: DateTimeException) {
            null.also { violations += Violation(field(name), "Must be a date in YYYY-MM-DD form") }
        }
    }

    fun status(body: JsonObject): TaskStatus? {
        val name = string(body, "status", required = true) ?: return null
        return statusFromWireName(name)
            ?: null.also {
                violations +=
                    Violation(
                        field("status"),
                        "Must be one of ${statusWireNames.joinToString(", ")}",
                    )
            }
    }

    fun steps(body: JsonObject): List<TaskStep>? {
        val element = body["steps"] ?: return null
        if (element !is JsonArray) {
            violations += Violation(field("steps"), "Must be an array")
            return null
        }
        val steps = element.mapIndexed { index, step -> step(step, index) }
        return steps.takeIf { it.none { step -> step == null } }?.filterNotNull()
    }

    private fun step(element: JsonElement, index: Int): TaskStep? {
        val path = "${field("steps")}[$index]"
        if (element !is JsonObject) {
            violations += Violation(path, "Must be an object")
            return null
        }
        val reader = Reader(path)
        val name = reader.string(element, "name", required = true)
        val completed = (element["completed"] as? JsonPrimitive)?.takeIf {
            !it.isString
        }?.booleanOrNull
        if (completed == null) {
            reader.violations += Violation("$path.completed", "Must be a boolean")
        }
        violations += reader.violations
        return if (name != null && completed != null) TaskStep(name, completed) else null
    }
}

internal fun parseObject(body: String): JsonObject? = try {
    taskJson.parseToJsonElement(body) as? JsonObject
} catch (_: SerializationException) {
    null
}

private fun parseDate(name: String, text: String?): Either<Violation, LocalDate> = when {
    text == null -> Violation(name, "Is required").left()

    else -> try {
        LocalDate.parse(text).right()
    } catch (_: DateTimeException) {
        Violation(name, "Must be a date in YYYY-MM-DD form").left()
    }
}

internal fun parseDateRange(
    from: String?,
    to: String?,
): Either<List<Violation>, Pair<LocalDate, LocalDate>> {
    val parsedFrom = parseDate("from", from)
    val parsedTo = parseDate("to", to)
    val violations = listOfNotNull(parsedFrom.leftOrNull(), parsedTo.leftOrNull())
    if (violations.isNotEmpty()) return violations.left()
    val range = parsedFrom.getOrNull()!! to parsedTo.getOrNull()!!
    return if (range.first > range.second) {
        listOf(Violation("from", "Must not be after to")).left()
    } else {
        range.right()
    }
}

internal fun parseNewTask(body: JsonObject): Either<List<Violation>, NewTask> {
    val reader = Reader()
    val createdOn = reader.date(body, "createdOn")
    val fields = parseFields(reader, body)
    return if (createdOn != null &&
        fields != null
    ) {
        NewTask(createdOn, fields).right()
    } else {
        reader.violations.left()
    }
}

internal fun parseFields(body: JsonObject): Either<List<Violation>, TaskDetails> {
    val reader = Reader()
    return parseFields(reader, body)?.right() ?: reader.violations.left()
}

private fun parseFields(reader: Reader, body: JsonObject): TaskDetails? {
    val title = reader.string(body, "title", required = true)
    val description = reader.string(body, "description", required = false)
    val status = reader.status(body)
    val steps = reader.steps(body)
    return if (reader.violations.isEmpty()) {
        TaskDetails(
            title!!,
            description,
            status!!,
            steps,
        )
    } else {
        null
    }
}

internal fun parsePatch(body: JsonObject): Either<List<Violation>, TaskPatch> {
    val reader = Reader()
    val title = reader.string(body, "title", required = false)
    val description = when {
        "description" !in body -> DescriptionChange.Keep

        body["description"] == JsonNull -> DescriptionChange.Clear

        else -> reader.string(
            body,
            "description",
            required = false,
        )?.let(DescriptionChange::Replace)
    }
    val status = if ("status" in body) reader.status(body) else null
    val steps = reader.steps(body)
    return if (reader.violations.isEmpty()) {
        TaskPatch(title, description!!, status, steps).right()
    } else {
        reader.violations.left()
    }
}
