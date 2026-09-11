plugins {
    id("kotlin-jvm-conventions")
}

dependencies {
    api(project(":core:habit"))
    api(project(":core:persistence"))
    api(project(":core:task"))
}
