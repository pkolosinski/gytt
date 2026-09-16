package dev.pkolosinski.gytt.server

import io.ktor.server.application.Application
import io.ktor.server.engine.embeddedServer
import io.ktor.server.http.content.staticResources
import io.ktor.server.routing.routing

fun main(args: Array<String>) {
    embeddedServer(
        factory = io.ktor.server.netty.Netty,
        port = 8080,
        host = "0.0.0.0",
        module = Application::rootModule,
    ).start(wait = true)
}

fun Application.rootModule() {
    routing {
        staticResources("/", "web")
    }
}
