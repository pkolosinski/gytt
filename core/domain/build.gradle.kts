plugins {
    id("buildlogic.kotlin-library-conventions")
}

group = "dev.pkolosinski.gytt"
version = "unspecified"

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(kotlin("test"))
}

kotlin {
    jvmToolchain(17)
}

tasks.test {
    useJUnitPlatform()
}
