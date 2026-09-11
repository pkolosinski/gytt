package dev.pkolosinski.gytt.server.infrastructure

import com.sun.net.httpserver.HttpServer
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import java.net.InetSocketAddress
import java.net.http.HttpClient

class CouchbasePrivacyTest : FunSpec({
    test("records the pinned Community Edition privacy limitations") {
        val server = communityPrivacyServer()
        try {
            val configuration =
                PersistenceConfiguration(
                    managementUrl = "http://127.0.0.1:${server.address.port}",
                    allowCommunityPrivacyLimitations = true,
                )

            CouchbasePrivacyAttestor(configuration, HttpClient.newHttpClient())
                .ensureDisabled(DatabaseCredentials("Administrator", "not-recorded"))
                .shouldBe(
                    ProvisioningChecks(
                        applicationTelemetryDisabled = true,
                        usageSharingDisabled = false,
                        updateChecksDisabled = false,
                        communityEditionPrivacyLimitationsAccepted = true,
                    ),
                )
        } finally {
            server.stop(0)
        }
    }

    test("fails closed when Community Edition limitations are not accepted") {
        val server = communityPrivacyServer()
        try {
            val configuration =
                PersistenceConfiguration(
                    managementUrl = "http://127.0.0.1:${server.address.port}",
                    allowCommunityPrivacyLimitations = false,
                )

            shouldThrow<ProvisioningException> {
                CouchbasePrivacyAttestor(configuration, HttpClient.newHttpClient())
                    .ensureDisabled(DatabaseCredentials("Administrator", "not-recorded"))
            }.reasonCode shouldBe "community_privacy_limitation_not_accepted"
        } finally {
            server.stop(0)
        }
    }
})

private fun communityPrivacyServer(): HttpServer {
    val server = HttpServer.create(InetSocketAddress("127.0.0.1", 0), 0)
    server.createContext("/settings/appTelemetry") { exchange ->
        respond(exchange, 400, """{"errors":["This http API endpoint requires enterprise edition"]}""")
    }
    server.createContext("/settings/stats") { exchange ->
        if (exchange.requestMethod == "GET") {
            respond(exchange, 200, """{"sendStats":true}""")
        } else {
            respond(
                exchange,
                400,
                """{"errors":["sendStats cannot be false for Community Edition clusters running 7.6 or later"]}""",
            )
        }
    }
    server.start()
    return server
}

private fun respond(
    exchange: com.sun.net.httpserver.HttpExchange,
    status: Int,
    body: String,
) {
    val bytes = body.toByteArray()
    exchange.sendResponseHeaders(status, bytes.size.toLong())
    exchange.responseBody.use { it.write(bytes) }
}
