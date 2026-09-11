
plugins {
    id("buildlogic.kotlin-application-conventions")
    alias(ktorLibs.plugins.ktor)
    alias(libs.plugins.kotlin.serialization)
}

group = "de.pkolosinski.gytt"
version = "1.0.0-SNAPSHOT"

application {
    mainClass = "de.pkolosinski.gytt.MainKt"
}

dependencies {
    implementation(ktorLibs.serialization.kotlinx.json)
    implementation(ktorLibs.server.contentNegotiation)
    implementation(ktorLibs.server.core)
    implementation(ktorLibs.server.netty)
//    implementation(libs.logback.classic)

    testImplementation(kotlin("test"))
    testImplementation(ktorLibs.server.testHost)
}
