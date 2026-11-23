package dev.pkolosinski.gyst.server.tasks

import arrow.core.Either
import dev.pkolosinski.gyst.core.tasks.Task
import dev.pkolosinski.gyst.core.tasks.TaskError
import dev.pkolosinski.gyst.core.tasks.TaskStoreUnavailableException
import dev.pkolosinski.gyst.core.tasks.Tasks
import dev.pkolosinski.gyst.core.tasks.Violation
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.ApplicationCall
import io.ktor.server.request.receiveText
import io.ktor.server.response.header
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.RoutingContext
import io.ktor.server.routing.delete
import io.ktor.server.routing.get
import io.ktor.server.routing.patch
import io.ktor.server.routing.post
import io.ktor.server.routing.put
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import kotlinx.serialization.Serializable
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.JsonObject
import org.slf4j.LoggerFactory
import java.util.UUID

private val logger = LoggerFactory.getLogger("dev.pkolosinski.gyst.server.tasks")
private val problemContentType = ContentType.parse("application/problem+json")
private val ifMatchPattern = Regex("\"(\\d+)\"")

@Serializable
private data class ProblemJson(
    val title: String,
    val status: Int,
    val detail: String? = null,
    val violations: List<ViolationJson>? = null,
)

@Serializable
private data class ViolationJson(val field: String, val message: String)

/** The Tasks endpoints of the HTTP contract. */
fun Application.tasksModule(tasks: Tasks) {
    routing {
        route("/api/tasks") {
            get {
                respondGuarded {
                    parseDate(call.request.queryParameters["date"]).fold(
                        { call.respondInvalid(it) },
                        { date ->
                            val body = taskJson.encodeToString(
                                ListSerializer(TaskJson.serializer()),
                                tasks.list(date).map(Task::toJson),
                            )
                            call.respondText(body, ContentType.Application.Json)
                        },
                    )
                }
            }
            post {
                respondGuarded {
                    val body = call.receiveJsonObject() ?: return@respondGuarded
                    parseNewTask(body).fold(
                        { call.respondInvalid(it) },
                        { newTask ->
                            call.respondTask(
                                tasks.create(newTask),
                                HttpStatusCode.Created,
                            ) { task ->
                                call.response.header(HttpHeaders.Location, "/api/tasks/${task.id}")
                            }
                        },
                    )
                }
            }
            route("/{taskId}") {
                put {
                    respondGuarded {
                        val target = target() ?: return@respondGuarded
                        val body = call.receiveJsonObject() ?: return@respondGuarded
                        parseFields(body).fold(
                            { call.respondInvalid(it) },
                            {
                                call.respondTask(
                                    tasks.replace(target.id, target.revision, it),
                                    HttpStatusCode.OK,
                                )
                            },
                        )
                    }
                }
                patch {
                    respondGuarded {
                        val target = target() ?: return@respondGuarded
                        val body = call.receiveJsonObject() ?: return@respondGuarded
                        parsePatch(body).fold(
                            { call.respondInvalid(it) },
                            {
                                call.respondTask(
                                    tasks.update(target.id, target.revision, it),
                                    HttpStatusCode.OK,
                                )
                            },
                        )
                    }
                }
                delete {
                    respondGuarded {
                        val id =
                            call.parameters["taskId"].toUuid()
                                ?: return@respondGuarded call.respondProblem(
                                    HttpStatusCode.NotFound,
                                    "Task not found",
                                )
                        val revision = call.requestedRevision() ?: return@respondGuarded
                        when (val result = tasks.delete(id, revision)) {
                            is Either.Left -> call.respondError(result.value)
                            is Either.Right -> call.respond(HttpStatusCode.NoContent)
                        }
                    }
                }
            }
        }
    }
}

private class Target(val id: UUID, val revision: Long)

/** The Task and revision a request refers to; responds and returns null if either is unusable. */
private suspend fun RoutingContext.target(): Target? {
    val id = call.parameters["taskId"].toUuid()
    if (id == null) {
        call.respondProblem(HttpStatusCode.NotFound, "Task not found")
        return null
    }
    val revision = call.requestedRevision() ?: return null
    return Target(id, revision)
}

private fun String?.toUuid(): UUID? = try {
    UUID.fromString(this)
} catch (_: IllegalArgumentException) {
    null
}

/** Reads the revision from `If-Match`. A missing header gets 428; one naming no revision gets 412. */
private suspend fun ApplicationCall.requestedRevision(): Long? {
    val header = request.headers[HttpHeaders.IfMatch]
    if (header == null) {
        respondProblem(
            HttpStatusCode.PreconditionRequired,
            "If-Match header required",
            "Send the revision you last saw as If-Match.",
        )
        return null
    }
    val revision = ifMatchPattern.matchEntire(header.trim())?.groupValues?.get(1)?.toLongOrNull()
    if (revision == null) {
        respondProblem(
            HttpStatusCode.PreconditionFailed,
            "Task changed",
            "If-Match does not name a revision.",
        )
    }
    return revision
}

private suspend fun ApplicationCall.receiveJsonObject(): JsonObject? =
    parseObject(receiveText()) ?: null.also {
        respondProblem(
            HttpStatusCode.BadRequest,
            "Invalid request",
            "The body must be a JSON object.",
        )
    }

private suspend fun RoutingContext.respondGuarded(block: suspend () -> Unit) {
    try {
        block()
    } catch (exception: TaskStoreUnavailableException) {
        logger.warn("Tasks store unavailable: {}", exception.cause?.let { it::class.simpleName })
        call.respondProblem(
            HttpStatusCode.ServiceUnavailable,
            "Service unavailable",
            "The database is unavailable. Nothing was saved.",
        )
    }
}

private suspend fun ApplicationCall.respondTask(
    result: Either<TaskError, Task>,
    status: HttpStatusCode,
    extras: (Task) -> Unit = {},
) = result.fold({ respondError(it) }, { task ->
    extras(task)
    response.header(HttpHeaders.ETag, "\"${task.revision}\"")
    respondText(taskJson.encodeToString(task.toJson()), ContentType.Application.Json, status)
})

private suspend fun ApplicationCall.respondError(error: TaskError) = when (error) {
    is TaskError.Invalid -> respondInvalid(error.violations)
    is TaskError.NotFound -> respondProblem(HttpStatusCode.NotFound, "Task not found")
    is TaskError.RevisionMismatch ->
        respondProblem(
            HttpStatusCode.PreconditionFailed,
            "Task changed",
            "The Task changed since the revision in If-Match. Nothing was written.",
        )
}

private suspend fun ApplicationCall.respondInvalid(violations: List<Violation>) =
    respondProblem(HttpStatusCode.BadRequest, "Invalid request", "A value is invalid.", violations)

private suspend fun ApplicationCall.respondProblem(
    status: HttpStatusCode,
    title: String,
    detail: String? = null,
    violations: List<Violation>? = null,
) {
    val problem =
        ProblemJson(
            title,
            status.value,
            detail,
            violations?.map {
                ViolationJson(it.field, it.message)
            },
        )
    respondText(taskJson.encodeToString(problem), problemContentType, status)
}
