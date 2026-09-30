package dev.pkolosinski.gytt.server

import ch.qos.logback.classic.Logger
import ch.qos.logback.classic.spi.ILoggingEvent
import ch.qos.logback.core.read.ListAppender
import dev.pkolosinski.gytt.server.infrastructure.TRACE_ID_HEADER
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import io.ktor.client.request.header
import io.ktor.client.request.get
import io.ktor.http.HttpHeaders
import org.slf4j.LoggerFactory

class RequestTracingIntegrationTest : FunSpec({
    test("propagates a safe trace ID and emits a redacted structured request log") {
        val logger = LoggerFactory.getLogger("dev.pkolosinski.gytt.server.request") as Logger
        val appender = ListAppender<ILoggingEvent>().apply { start() }
        logger.addAppender(appender)

        try {
            testGyttApplication {
                val response =
                    client.get("/health/live?secret=do-not-log") {
                        header(TRACE_ID_HEADER, "operator-trace-42")
                        header(HttpHeaders.Authorization, "Basic do-not-log")
                    }

                response.headers[TRACE_ID_HEADER] shouldBe "operator-trace-42"
            }

            val message = appender.list.last().formattedMessage
            message.startsWith("{") shouldBe true
            message.contains("\"traceId\":\"operator-trace-42\"") shouldBe true
            message.contains("\"operation\":\"GET /health/live\"") shouldBe true
            message.contains("\"status\":200") shouldBe true
            message.contains("secret=do-not-log") shouldBe false
            message.contains("Basic do-not-log") shouldBe false
        } finally {
            logger.detachAppender(appender)
            appender.stop()
        }
    }

    test("replaces an invalid trace ID with a generated UUID") {
        testGyttApplication {
            val response =
                client.get("/health/live") {
                    header(TRACE_ID_HEADER, "invalid/trace-id")
                }

            val traceId = response.headers[TRACE_ID_HEADER].shouldNotBeNull()
            traceId.matches(Regex("[0-9a-f-]{36}")) shouldBe true
        }
    }
})
