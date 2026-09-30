package dev.pkolosinski.gytt.server

import dev.pkolosinski.gytt.server.infrastructure.ReadinessResult
import io.ktor.server.testing.ApplicationTestBuilder
import io.ktor.server.testing.testApplication

    testApplication {
        application {
            rootModule(readinessCheck)
        }
        block()
    }
}
