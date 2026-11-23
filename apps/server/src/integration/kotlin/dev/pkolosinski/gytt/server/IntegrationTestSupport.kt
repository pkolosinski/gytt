package dev.pkolosinski.gytt.server

import dev.pkolosinski.gytt.server.infrastructure.ReadinessResult
import dev.pkolosinski.gytt.server.infrastructure.configureInfrastructureModule
import io.ktor.server.testing.ApplicationTestBuilder
import io.ktor.server.testing.testApplication

fun testGyttApplication(
    readinessCheck: suspend () -> ReadinessResult = {
        ReadinessResult.unhealthy("database_unavailable")
    },
    block: suspend ApplicationTestBuilder.() -> Unit,
) = testApplication {
    application {
        configureInfrastructureModule(readinessCheck)
    }
    block()
}
