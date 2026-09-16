plugins {
    id("kotlin-jvm-conventions")
    alias(libs.plugins.integration.test)
    alias(libs.plugins.kotlinx.serialization)
    alias(libs.plugins.ktor)
}

application {
    mainClass = "dev.pkolosinski.gytt.server.MainKt"
}

dependencies {
    implementation(project(":core"))

    // ktor
    implementation(libs.ktor.serialization.kotlinx.json)
    implementation(libs.ktor.server.content.negotiation)
    implementation(libs.ktor.server.core)
    implementation(libs.ktor.server.netty)

    implementation(libs.logback.classic)

    testImplementation(libs.ktor.server.test.host)
}
