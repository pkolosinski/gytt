package dev.pkolosinski.gytt.server

import com.couchbase.client.core.error.CouchbaseException
import com.couchbase.client.java.manager.user.AuthDomain
import dev.pkolosinski.gytt.server.infrastructure.CouchbaseClusterFactory
import dev.pkolosinski.gytt.server.infrastructure.CouchbaseProvisioningCommand
import dev.pkolosinski.gytt.server.infrastructure.CouchbaseRuntime
import dev.pkolosinski.gytt.server.infrastructure.CouchbaseTimeouts
import dev.pkolosinski.gytt.server.infrastructure.DatabaseCredentials
import dev.pkolosinski.gytt.server.infrastructure.PersistenceConfiguration
import dev.pkolosinski.gytt.server.infrastructure.SchemaReadinessChecker
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import org.testcontainers.couchbase.CouchbaseContainer
import org.testcontainers.utility.DockerImageName
import java.nio.file.Files
import java.nio.file.attribute.PosixFilePermission
import java.time.Duration

private const val ADMIN_USERNAME = "Administrator"
private const val ADMIN_PASSWORD = "task2-admin-password"
private const val RUNTIME_USERNAME = "gytt-runtime"
private const val RUNTIME_PASSWORD = "task2-runtime-password"

class CouchbaseProvisioningIntegrationTest : FunSpec({
    test("provisions the schema and enforces runtime readiness and privilege boundaries") {
        if (System.getenv("GYTT_RUN_COUCHBASE_INTEGRATION") != "true") {
            return@test
        }

        val container =
            CouchbaseContainer(DockerImageName.parse("couchbase/server:community-8.0.2"))
                .withCredentials(ADMIN_USERNAME, ADMIN_PASSWORD)
        container.start()
        val secretDirectory = Files.createTempDirectory("gytt-couchbase-secrets")
        try {
            val adminUsernameFile = privateSecret(secretDirectory, "admin-username", ADMIN_USERNAME)
            val adminPasswordFile = privateSecret(secretDirectory, "admin-password", ADMIN_PASSWORD)
            val runtimeUsernameFile = privateSecret(secretDirectory, "runtime-username", RUNTIME_USERNAME)
            val runtimePasswordFile = privateSecret(secretDirectory, "runtime-password", RUNTIME_PASSWORD)
            val configuration =
                PersistenceConfiguration(
                    connectionString = container.connectionString,
                    managementUrl = "http://${container.host}:${container.getMappedPort(8091)}",
                    runtimeUsernameFile = runtimeUsernameFile,
                    runtimePasswordFile = runtimePasswordFile,
                    adminUsernameFile = adminUsernameFile,
                    adminPasswordFile = adminPasswordFile,
                    bucketRamQuotaMb = 100,
                    timeouts =
                        CouchbaseTimeouts(
                            kv = Duration.ofSeconds(5),
                            query = Duration.ofSeconds(10),
                            transaction = Duration.ofSeconds(10),
                            ambiguityReadBack = Duration.ofSeconds(1),
                            httpRequest = Duration.ofSeconds(30),
                        ),
                    allowCommunityPrivacyLimitations = true,
                )
            CouchbaseProvisioningCommand(configuration).run()

            val runtime = CouchbaseRuntime(configuration)
            try {
                val readiness = runtime.readiness(SchemaReadinessChecker(configuration)::check)

                readiness.ready shouldBe true
            } finally {
                runtime.close()
            }

            val runtimeCluster =
                CouchbaseClusterFactory.connect(
                    configuration,
                    DatabaseCredentials(RUNTIME_USERNAME, RUNTIME_PASSWORD),
                )
            try {
                shouldThrow<CouchbaseException> {
                    runtimeCluster.users().getUser(AuthDomain.LOCAL, ADMIN_USERNAME)
                }
            } finally {
                runtimeCluster.disconnect()
            }
        } finally {
            Files.walk(secretDirectory).use { paths ->
                paths.sorted(Comparator.reverseOrder()).forEach(Files::deleteIfExists)
            }
            container.stop()
        }
    }
})

private fun privateSecret(
    directory: java.nio.file.Path,
    name: String,
    value: String,
): java.nio.file.Path {
    val path = directory.resolve(name)
    Files.writeString(path, value)
    Files.setPosixFilePermissions(path, setOf(PosixFilePermission.OWNER_READ))
    return path
}
