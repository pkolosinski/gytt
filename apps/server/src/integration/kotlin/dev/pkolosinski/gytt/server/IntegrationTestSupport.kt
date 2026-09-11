package dev.pkolosinski.gytt.server

import io.ktor.server.testing.ApplicationTestBuilder
import io.ktor.server.testing.testApplication

fun testGyttApplication(block: suspend ApplicationTestBuilder.() -> Unit) {
    testApplication {
        application {
            rootModule()
        }
        block()
    }
}
