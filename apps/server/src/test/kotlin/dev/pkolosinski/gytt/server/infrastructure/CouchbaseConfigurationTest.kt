package dev.pkolosinski.gytt.server.infrastructure

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe

class CouchbaseConfigurationTest : FunSpec({
    test("defaults to the Compose database service and bootstrap application identity") {
        val configuration = CouchbaseConfiguration.fromEnvironment(emptyMap())

        configuration.connectionString shouldBe "couchbase://couchbase"
        configuration.username shouldBe "gytt-app"
        configuration.password shouldBe "gytt-app-password"
        configuration.bucketName shouldBe "gytt"
    }

    test("loads connection settings from the environment") {
        val configuration =
            CouchbaseConfiguration.fromEnvironment(
                mapOf(
                    "GYTT_COUCHBASE_CONNECTION_STRING" to "couchbase://database.internal",
                    "GYTT_COUCHBASE_USERNAME" to "app-user",
                    "GYTT_COUCHBASE_PASSWORD" to "app-password",
                    "GYTT_COUCHBASE_BUCKET" to "gytt",
                ),
            )

        configuration.connectionString shouldBe "couchbase://database.internal"
        configuration.username shouldBe "app-user"
        configuration.password shouldBe "app-password"
        configuration.bucketName shouldBe "gytt"
    }

    test("rejects blank credentials or connection settings") {
        shouldThrow<IllegalArgumentException> {
            CouchbaseConfiguration.fromEnvironment(
                mapOf("GYTT_COUCHBASE_PASSWORD" to " "),
            )
        }
    }
})
