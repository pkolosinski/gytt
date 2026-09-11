plugins {
    id("kotlin-jvm-conventions")
    alias(libs.plugins.integration.test)
    alias(libs.plugins.kotlinx.serialization)
    alias(libs.plugins.ktor)
}

application {
    mainClass = "io.ktor.server.netty.EngineMain"
}

dependencies {
    implementation(project(":core"))

    // ktor
    implementation(libs.ktor.serialization.kotlinx.json)
    implementation(libs.ktor.server.content.negotiation)
    implementation(libs.ktor.server.core)
    implementation(libs.ktor.server.netty)

    // persistence
    implementation(libs.couchbase.kotlin.client)

    implementation(libs.logback.classic)

    // test
    testImplementation(libs.couchbase.java.client)
    testImplementation(libs.ktor.server.test.host)
    testImplementation(libs.testcontainers.couchbase)
}
