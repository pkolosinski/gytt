package dev.pkolosinski.gyst.server

import dev.pkolosinski.gyst.server.infrastructure.ReadinessResult
import dev.pkolosinski.gyst.server.infrastructure.configureInfrastructureModule
import io.ktor.server.testing.ApplicationTestBuilder
import io.ktor.server.testing.testApplication

fun testGystApplication(
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
