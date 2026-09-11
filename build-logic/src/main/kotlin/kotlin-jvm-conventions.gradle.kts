plugins {
    id("org.jetbrains.kotlin.jvm")
    id("org.jlleitschuh.gradle.ktlint")
    id("io.kotest")
}

kotlin {
    jvmToolchain(17)
}

repositories {
    mavenCentral()
}

val libs = extensions.getByType(VersionCatalogsExtension::class.java).named("libs")

dependencies {
    implementation(libs.findLibrary("arrow-core").get())
    implementation(libs.findLibrary("arrow-fx-coroutines").get())

    testImplementation(libs.findLibrary("kotest-assertions-core").get())
    testImplementation(libs.findLibrary("kotest-runner").get())
}

tasks.withType<Test>().configureEach {
    useJUnitPlatform()
}
