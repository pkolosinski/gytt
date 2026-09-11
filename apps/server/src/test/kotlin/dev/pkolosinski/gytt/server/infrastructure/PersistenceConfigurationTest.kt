package dev.pkolosinski.gytt.server.infrastructure

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import java.nio.file.Files
import java.nio.file.attribute.PosixFilePermission
import java.time.Duration

class PersistenceConfigurationTest : FunSpec({
    test("loads the documented environment and preserves timeout ordering") {
        val configuration =
            PersistenceConfiguration.fromEnvironment(
                mapOf(
                    "GYTT_COUCHBASE_CONNECTION_STRING" to "couchbase://private-db",
                    "GYTT_COUCHBASE_MANAGEMENT_URL" to "http://private-db:8091",
                    "GYTT_COUCHBASE_KV_TIMEOUT_MS" to "100",
                    "GYTT_COUCHBASE_QUERY_TIMEOUT_MS" to "200",
                    "GYTT_COUCHBASE_TRANSACTION_TIMEOUT_MS" to "400",
                    "GYTT_AMBIGUITY_READBACK_TIMEOUT_MS" to "100",
                    "GYTT_HTTP_REQUEST_TIMEOUT_MS" to "1000",
                    "GYTT_COUCHBASE_ALLOW_COMMUNITY_PRIVACY_LIMITATIONS" to "true",
                ),
            )

        configuration.connectionString shouldBe "couchbase://private-db"
        configuration.timeouts.transaction shouldBe Duration.ofMillis(400)
        configuration.timeouts.httpRequest shouldBe Duration.ofSeconds(1)
        configuration.allowCommunityPrivacyLimitations shouldBe true
    }

    test("rejects an HTTP timeout that cannot cover database work and read-back") {
        shouldThrow<IllegalArgumentException> {
            CouchbaseTimeouts(
                kv = Duration.ofMillis(500),
                query = Duration.ofMillis(500),
                transaction = Duration.ofMillis(500),
                ambiguityReadBack = Duration.ofMillis(500),
                httpRequest = Duration.ofMillis(1_000),
            )
        }
    }

    test("rejects a group-writable secret file") {
        val secret = Files.createTempFile("gytt-secret", ".txt")
        try {
            Files.writeString(secret, "runtime-user")
            Files.setPosixFilePermissions(
                secret,
                setOf(PosixFilePermission.OWNER_READ, PosixFilePermission.GROUP_WRITE),
            )

            shouldThrow<SecretConfigurationException> {
                SecretFileReader.read(secret)
            }
        } finally {
            Files.deleteIfExists(secret)
        }
    }

    test("rejects a group-readable secret file") {
        val secret = Files.createTempFile("gytt-secret", ".txt")
        try {
            Files.writeString(secret, "runtime-user")
            Files.setPosixFilePermissions(
                secret,
                setOf(PosixFilePermission.OWNER_READ, PosixFilePermission.GROUP_READ),
            )

            shouldThrow<SecretConfigurationException> {
                SecretFileReader.read(secret)
            }
        } finally {
            Files.deleteIfExists(secret)
        }
    }

    test("rejects an invalid community privacy limitation setting") {
        shouldThrow<IllegalArgumentException> {
            PersistenceConfiguration.fromEnvironment(
                mapOf("GYTT_COUCHBASE_ALLOW_COMMUNITY_PRIVACY_LIMITATIONS" to "maybe"),
            )
        }
    }
})
