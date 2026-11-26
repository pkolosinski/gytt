package dev.pkolosinski.gyst.server.tasks

import dev.pkolosinski.gyst.core.task.Task
import dev.pkolosinski.gyst.core.task.TaskId
import dev.pkolosinski.gyst.core.task.TaskStore
import dev.pkolosinski.gyst.core.task.TaskStoreUnavailableException
import dev.pkolosinski.gyst.core.task.WriteResult
import dev.pkolosinski.gyst.core.task.taskFacade
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.ktor.client.HttpClient
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.request.patch
import io.ktor.client.request.post
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import io.ktor.client.statement.HttpResponse
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.server.testing.ApplicationTestBuilder
import io.ktor.server.testing.testApplication
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import java.time.Clock
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneOffset

private class MemoryStore : TaskStore {
    val tasks = linkedMapOf<TaskId, Task>()
    var unavailable = false

    private fun check() {
        if (unavailable) throw TaskStoreUnavailableException(RuntimeException("down"))
    }

    override suspend fun listActiveBetween(from: LocalDate, to: LocalDate): List<Task> {
        check()
        return tasks.values.filter {
            val completedOn = it.completedOn
            it.startedOn <= to && (completedOn == null || completedOn >= from)
        }
    }

    override suspend fun find(id: TaskId): Task? {
        check()
        return tasks[id]
    }

    override suspend fun insert(task: Task) {
        check()
        tasks[task.id] = task
    }

    override suspend fun replace(task: Task, expectedRevision: Long): WriteResult {
        check()
        val stored = tasks[task.id] ?: return WriteResult.Missing
        if (stored.version != expectedRevision) return WriteResult.Conflict
        tasks[task.id] = task
        return WriteResult.Written
    }

    override suspend fun delete(id: TaskId, expectedRevision: Long): WriteResult {
        check()
        val stored = tasks[id] ?: return WriteResult.Missing
        if (stored.version != expectedRevision) return WriteResult.Conflict
        tasks.remove(id)
        return WriteResult.Written
    }
}

private fun tasksApp(
    store: MemoryStore = MemoryStore(),
    block: suspend ApplicationTestBuilder.() -> Unit,
) = testApplication {
    application {
        tasksModule(
            taskFacade(
                store,
                Clock.fixed(Instant.parse("2026-11-23T10:00:00Z"), ZoneOffset.UTC),
            ) { testTaskId },
        )
    }
    block()
}

private suspend fun HttpClient.send(
    method: String,
    path: String,
    body: String? = null,
    ifMatch: String? = null,
): HttpResponse {
    val configure: io.ktor.client.request.HttpRequestBuilder.() -> Unit = {
        if (ifMatch != null) header(HttpHeaders.IfMatch, ifMatch)
        if (body != null) {
            contentType(ContentType.Application.Json)
            setBody(body)
        }
    }
    return when (method) {
        "GET" -> get(path, configure)
        "POST" -> post(path, configure)
        "PUT" -> put(path, configure)
        "PATCH" -> patch(path, configure)
        else -> delete(path, configure)
    }
}

private suspend fun HttpResponse.json(): JsonObject =
    Json.parseToJsonElement(bodyAsText()).jsonObject

private const val CREATE = """{"title":"Renew card","description":"Bring proof","status":"todo","createdOn":"2026-11-21",
    "steps":[{"name":"Find proof","completed":false}]}"""
private val testTaskId = TaskId("01ARZ3NDEKTSV4RRFFQ69G5FAV")

private suspend fun HttpClient.create(body: String = CREATE): JsonObject =
    send("POST", "/api/tasks", body).json()

private fun JsonObject.id() = getValue("id").jsonPrimitive.content

private fun JsonObject.etag() = "\"${getValue("revision").jsonPrimitive.content}\""

private fun JsonObject.violationFields() = getValue("violations").jsonArray.map {
    it.jsonObject.getValue("field").jsonPrimitive.content
}

class TasksHttpTest : FunSpec({
    test("creating a Task returns it with its revision, ETag and Location") {
        tasksApp {
            val response = client.send("POST", "/api/tasks", CREATE)

            response.status shouldBe HttpStatusCode.Created
            val task = response.json()
            TaskId.parse(task.id()) shouldBe testTaskId
            task.getValue("revision").jsonPrimitive.content shouldBe "1"
            task.getValue("status").jsonPrimitive.content shouldBe "todo"
            response.headers[HttpHeaders.ETag] shouldBe "\"1\""
            response.headers[HttpHeaders.Location] shouldBe "/api/tasks/${task.id()}"
            response.headers[HttpHeaders.ContentType]?.startsWith("application/json") shouldBe true
        }
    }

    test("a created Task is listed for its date and later dates, not earlier ones") {
        tasksApp {
            val id = client.create().id()

            fun JsonArray.ids() = map { it.jsonObject.id() }
            client.send("GET", "/api/tasks?from=2026-11-20&to=2026-11-20").bodyAsText() shouldBe
                "[]"
            Json.parseToJsonElement(
                client.send("GET", "/api/tasks?from=2026-11-21&to=2026-11-21").bodyAsText(),
            ).jsonArray.ids() shouldBe
                listOf(id)
            Json.parseToJsonElement(
                client.send("GET", "/api/tasks?from=2026-12-01&to=2026-12-01").bodyAsText(),
            ).jsonArray.ids() shouldBe
                listOf(id)
        }
    }

    test("a range lists Tasks started on or before its end and not completed before its start") {
        tasksApp {
            val id = client.create().id()
            suspend fun ids(query: String) = Json.parseToJsonElement(
                client.send("GET", "/api/tasks?$query").bodyAsText(),
            ).jsonArray.map { it.jsonObject.id() }

            ids("from=2026-11-01&to=2026-11-20") shouldBe emptyList()
            ids("from=2026-11-01&to=2026-11-21") shouldBe listOf(id)
            ids("from=2026-11-25&to=2026-11-30") shouldBe listOf(id)
        }
    }

    test("a Task created today is returned with startedOn and without completedOn") {
        tasksApp {
            val created = client.create()
            created.getValue("startedOn").jsonPrimitive.content shouldBe "2026-11-21"
            created.containsKey("completedOn") shouldBe false
        }
    }

    test("listing requires a valid date") {
        tasksApp {
            client.send("GET", "/api/tasks").status shouldBe HttpStatusCode.BadRequest
            client.send("GET", "/api/tasks?from=2026-11-22&to=2026-11-21").status shouldBe
                HttpStatusCode.BadRequest
            val response = client.send("GET", "/api/tasks?from=21-11-2026&to=21-11-2026")

            response.status shouldBe HttpStatusCode.BadRequest
            response.headers[HttpHeaders.ContentType]?.startsWith(
                "application/problem+json",
            ) shouldBe
                true
            response.json().violationFields() shouldBe listOf("from", "to")
        }
    }

    test("invalid create bodies report each field") {
        tasksApp {
            val response = client.send(
                "POST",
                "/api/tasks",
                """{"title":"","status":"later","steps":[{"name":"","completed":true},{"name":"x"}]}""",
            )

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().violationFields().sorted() shouldBe
                listOf("createdOn", "status", "steps[1].completed")
        }
    }

    test("values outside the contract limits are reported by field") {
        tasksApp {
            val response = client.send(
                "POST",
                "/api/tasks",
                """{"title":"","status":"todo","createdOn":"2026-11-21","steps":[{"name":"ok","completed":true},{"name":"","completed":false}]}""",
            )

            response.status shouldBe HttpStatusCode.BadRequest
            response.json().violationFields() shouldBe listOf("title", "steps[1].name")
        }
    }

    test("a body that is not a JSON object is rejected") {
        tasksApp {
            client.send("POST", "/api/tasks", "[1]").status shouldBe HttpStatusCode.BadRequest
            client.send("POST", "/api/tasks", "{nope").status shouldBe HttpStatusCode.BadRequest
        }
    }

    test("replacing needs If-Match, applies the revision and clears omitted parts") {
        tasksApp {
            val created = client.create()
            val path = "/api/tasks/${created.id()}"
            val body = """{"title":"New","status":"completed"}"""

            client.send("PUT", path, body).status shouldBe HttpStatusCode.PreconditionRequired
            client.send("PUT", path, body, ifMatch = "\"7\"").status shouldBe
                HttpStatusCode.PreconditionFailed

            val response = client.send("PUT", path, body, ifMatch = created.etag())
            response.status shouldBe HttpStatusCode.OK
            response.headers[HttpHeaders.ETag] shouldBe "\"2\""
            response.json().toString() shouldBe
                """{"id":"${created.id()}","createdOn":"2026-11-21","startedOn":"2026-11-21","completedOn":"2026-11-23","revision":2,"title":"New","status":"completed"}"""
        }
    }

    test("patching changes only the given fields and null clears the description") {
        tasksApp {
            val created = client.create()
            val path = "/api/tasks/${created.id()}"

            val moved = client.send(
                "PATCH",
                path,
                """{"status":"inProgress"}""",
                ifMatch = created.etag(),
            ).json()
            moved.getValue("title").jsonPrimitive.content shouldBe "Renew card"
            moved.getValue("description").jsonPrimitive.content shouldBe "Bring proof"
            moved.getValue("status").jsonPrimitive.content shouldBe "inProgress"

            val cleared = client.send(
                "PATCH",
                path,
                """{"description":null,"steps":[]}""",
                ifMatch = moved.etag(),
            ).json()
            cleared.containsKey("description") shouldBe false
            cleared.containsKey("steps") shouldBe false
            cleared.getValue("revision").jsonPrimitive.content shouldBe "3"
        }
    }

    test("an empty patch is invalid") {
        tasksApp {
            val created = client.create()

            client.send(
                "PATCH",
                "/api/tasks/${created.id()}",
                "{}",
                ifMatch = created.etag(),
            ).status shouldBe
                HttpStatusCode.BadRequest
        }
    }

    test("a stale revision is rejected and nothing is written") {
        tasksApp {
            val created = client.create()
            val path = "/api/tasks/${created.id()}"
            client.send("PATCH", path, """{"status":"inProgress"}""", ifMatch = created.etag())

            val stale = client.send("PATCH", path, """{"title":"Lost"}""", ifMatch = created.etag())

            stale.status shouldBe HttpStatusCode.PreconditionFailed
            client.send(
                "GET",
                "/api/tasks?from=2026-11-21&to=2026-11-21",
            ).bodyAsText().contains("Lost") shouldBe
                false
        }
    }

    test("a missing or malformed Task id is not found") {
        tasksApp {
            client.send(
                "PATCH",
                "/api/tasks/01ARZ3NDEKTSV4RRFFQ69G5FAW",
                """{"title":"x"}""",
                ifMatch = "\"1\"",
            ).status shouldBe
                HttpStatusCode.NotFound
            client.send("PUT", "/api/tasks/nope", CREATE, ifMatch = "\"1\"").status shouldBe
                HttpStatusCode.NotFound
        }
    }

    test("deleting needs the current revision") {
        tasksApp {
            val created = client.create()
            val path = "/api/tasks/${created.id()}"

            client.send("DELETE", path).status shouldBe HttpStatusCode.PreconditionRequired
            client.send("DELETE", path, ifMatch = "\"2\"").status shouldBe
                HttpStatusCode.PreconditionFailed
            client.send("DELETE", path, ifMatch = created.etag()).status shouldBe
                HttpStatusCode.NoContent
            client.send("GET", "/api/tasks?from=2026-11-21&to=2026-11-21").bodyAsText() shouldBe
                "[]"
            client.send("DELETE", path, ifMatch = created.etag()).status shouldBe
                HttpStatusCode.NoContent
        }
    }

    test("an unavailable database yields 503 and saves nothing") {
        val store = MemoryStore()
        tasksApp(store) {
            store.unavailable = true

            val response = client.send("POST", "/api/tasks", CREATE)

            response.status shouldBe HttpStatusCode.ServiceUnavailable
            response.headers[HttpHeaders.ContentType]?.startsWith(
                "application/problem+json",
            ) shouldBe
                true
            store.tasks.isEmpty() shouldBe true
            client.send("GET", "/api/tasks?from=2026-11-21&to=2026-11-21").status shouldBe
                HttpStatusCode.ServiceUnavailable
        }
    }
})
