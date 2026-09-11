package de.pkolosinski.gytt

import io.ktor.server.application.Application

fun Application.rootModule() {
    configureSerialization()
    configureRouting()
}
