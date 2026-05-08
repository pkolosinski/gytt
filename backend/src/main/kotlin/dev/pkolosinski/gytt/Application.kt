package dev.pkolosinski.gytt

import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.cio.CIO
import io.ktor.server.engine.embeddedServer
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.response.respond
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.routing
import io.ktor.http.HttpStatusCode
import io.ktor.server.request.receiveParameters

fun main() {
    embeddedServer(CIO, port = 8080, host = "0.0.0.0", module = Application::module)
        .start(wait = true)
}

fun Application.module() {
    install(ContentNegotiation) {
        json()
    }
    routing {
        get { call.respond("Hello world!") }
        post("/sample") {
            when (val result = call.receiveValidated<SampleDto>()) {
                is ValidationResult.Valid -> call.respond(result.value)
                is ValidationResult.Invalid -> call.respond(HttpStatusCode.BadRequest, result.reasons)
            }
        }
    }
}
