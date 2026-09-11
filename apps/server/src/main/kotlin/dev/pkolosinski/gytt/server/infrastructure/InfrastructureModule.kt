package dev.pkolosinski.gytt.server.infrastructure

import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.ApplicationCall
import io.ktor.server.application.ApplicationCallPipeline
import io.ktor.server.application.call
import io.ktor.server.request.httpMethod
import io.ktor.server.request.path
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import io.ktor.util.AttributeKey
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.slf4j.LoggerFactory
import java.time.Instant
import java.util.UUID

const val TRACE_ID_HEADER = HttpHeaders.XRequestId
const val CONTENT_SECURITY_POLICY_HEADER = "Content-Security-Policy"
const val CONTENT_SECURITY_POLICY =
    "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; " +
        "img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"

private const val REQUEST_LOGGER_NAME = "dev.pkolosinski.gytt.server.request"
private const val TRACE_ID_ATTRIBUTE_NAME = "gytt.traceId"
private val traceIdAttributeKey = AttributeKey<String>(TRACE_ID_ATTRIBUTE_NAME)
private val requestLogger = LoggerFactory.getLogger(REQUEST_LOGGER_NAME)
private val acceptedTraceId = Regex("[A-Za-z0-9][A-Za-z0-9._-]{0,127}")

fun Application.configureInfrastructureModule(
    persistence: CouchbaseRuntime,
    readinessChecker: SchemaReadinessChecker,
) {
    intercept(ApplicationCallPipeline.Monitoring) {
        val traceId = traceIdOrGenerate(call.request.headers[TRACE_ID_HEADER])
        call.attributes.put(traceIdAttributeKey, traceId)
        call.response.headers.append(TRACE_ID_HEADER, traceId)

        val startedAt = System.nanoTime()
        try {
            proceed()
        } finally {
            requestLogger.info(
                requestLogJson(
                    traceId = traceId,
                    method = call.request.httpMethod.value,
                    path = call.request.path(),
                    status = call.response.status()?.value ?: 500,
                    latencyMilliseconds = (System.nanoTime() - startedAt) / 1_000_000,
                ),
            )
        }
    }

    intercept(ApplicationCallPipeline.Plugins) {
        call.response.headers.append(CONTENT_SECURITY_POLICY_HEADER, CONTENT_SECURITY_POLICY)
        if (call.request.path().startsWith("/api/v1")) {
            val readiness =
                withContext(Dispatchers.IO) {
                    persistence.readiness(readinessChecker::check)
                }
            if (!readiness.ready) {
                call.respondText(
                    text = """{"ready":false}""",
                    contentType = ContentType.Application.Json,
                    status = HttpStatusCode.ServiceUnavailable,
                )
                finish()
            }
        }
        proceed()
    }

    routing {
        get("/health/live") {
            call.respond(HttpStatusCode.OK)
        }
        get("/health/ready") {
            val readiness =
                withContext(Dispatchers.IO) {
                    persistence.readiness(readinessChecker::check)
                }
            if (readiness.ready) {
                call.respondText(
                    text = """{"ready":true}""",
                    contentType = ContentType.Application.Json,
                    status = HttpStatusCode.OK,
                )
            } else {
                call.respondText(
                    text = """{"ready":false}""",
                    contentType = ContentType.Application.Json,
                    status = HttpStatusCode.ServiceUnavailable,
                )
            }
        }
    }
}

fun ApplicationCall.traceId(): String = attributes[traceIdAttributeKey]

internal fun traceIdOrGenerate(candidate: String?): String =
    candidate?.takeIf(acceptedTraceId::matches) ?: UUID.randomUUID().toString()

internal fun requestLogJson(
    traceId: String,
    method: String,
    path: String,
    status: Int,
    latencyMilliseconds: Long,
): String =
    buildString {
        append('{')
        appendJsonField("timestamp", Instant.now().toString())
        append(',')
        appendJsonField("level", "INFO")
        append(',')
        appendJsonField("traceId", traceId)
        append(',')
        appendJsonField("operation", "$method $path")
        append(',')
        appendJsonField("method", method)
        append(',')
        appendJsonField("path", path)
        append(",\"status\":")
        append(status)
        append(",\"latencyMs\":")
        append(latencyMilliseconds)
        append(",\"errorCode\":null")
        append('}')
    }

private fun StringBuilder.appendJsonField(
    name: String,
    value: String,
) {
    append('"')
    appendJsonString(name)
    append("\":\"")
    appendJsonString(value)
    append('"')
}

private fun StringBuilder.appendJsonString(value: String) {
    value.forEach { character ->
        when (character) {
            '\\' -> append("\\\\")
            '"' -> append("\\\"")
            '\b' -> append("\\b")
            '\u000C' -> append("\\f")
            '\n' -> append("\\n")
            '\r' -> append("\\r")
            '\t' -> append("\\t")
            in '\u0000'..'\u001F' -> append("\\u%04x".format(character.code))
            else -> append(character)
        }
    }
}
