package dev.pkolosinski.gytt

import dev.pkolosinski.dev.pkolosinski.gytt.module
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.ktor.client.request.get
import io.ktor.http.HttpStatusCode
import io.ktor.server.testing.testApplication

class AppTest : FunSpec({
    test("server should start") {
        testApplication {
            application {
                module()
            }

            val res = client.get("/")

            res.status shouldBe HttpStatusCode.OK
        }
    }
})
