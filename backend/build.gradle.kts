plugins {
    kotlin("jvm") version "2.3.10"
    id("io.kotest") version "6.1.3"
    id("io.ktor.plugin") version "3.4.0"
    id("org.jetbrains.kotlin.plugin.serialization") version "2.3.10"
}

group = "dev.pkolosinski"
version = "0.0.1"

application {
    mainClass = "dev.pkolosinski.ApplicationKt"
}

kotlin {
    jvmToolchain(25)
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("io.ktor:ktor-server-content-negotiation")
    implementation("io.ktor:ktor-server-core")
    implementation("io.ktor:ktor-serialization-kotlinx-json")
    implementation("io.ktor:ktor-server-host-common")
    implementation("io.ktor:ktor-server-cio")
    implementation("ch.qos.logback:logback-classic:1.5.28")

    testImplementation(platform("io.kotest:kotest-bom:6.1.3"))
    testImplementation("io.kotest:kotest-assertions-core")
    testImplementation("io.kotest:kotest-runner-junit5")
    testImplementation("io.ktor:ktor-server-test-host")
}

tasks.withType<Test>().configureEach {
    useJUnitPlatform()
}
