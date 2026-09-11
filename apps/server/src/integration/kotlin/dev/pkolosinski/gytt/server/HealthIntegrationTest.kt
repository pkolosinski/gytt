package dev.pkolosinski.gytt.server

import dev.pkolosinski.gytt.server.infrastructure.CONTENT_SECURITY_POLICY
import dev.pkolosinski.gytt.server.infrastructure.CONTENT_SECURITY_POLICY_HEADER
import dev.pkolosinski.gytt.server.infrastructure.TRACE_ID_HEADER
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.ktor.client.request.get
import io.ktor.client.statement.bodyAsText
import io.ktor.http.HttpStatusCode

class HealthIntegrationTest : FunSpec({
    test("liveness endpoint returns an empty successful response") {
        testGyttApplication {
            val response = client.get("/health/live")

            response.status shouldBe HttpStatusCode.OK
            response.bodyAsText() shouldBe ""
            response.headers[TRACE_ID_HEADER]?.matches(Regex("[0-9a-f-]{36}")) shouldBe true
            response.headers[CONTENT_SECURITY_POLICY_HEADER] shouldBe CONTENT_SECURITY_POLICY
            response.headers.getAll(CONTENT_SECURITY_POLICY_HEADER) shouldBe listOf(CONTENT_SECURITY_POLICY)
        }
    }

    test("readiness stays unavailable when Couchbase credentials are not mounted") {
        testGyttApplication {
            val response = client.get("/health/ready")

            response.status shouldBe HttpStatusCode.ServiceUnavailable
            response.bodyAsText() shouldBe """{"ready":false}"""
        }
    }
})
