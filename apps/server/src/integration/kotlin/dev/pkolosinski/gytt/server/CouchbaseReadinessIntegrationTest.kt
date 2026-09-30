package dev.pkolosinski.gytt.server

import com.couchbase.client.core.error.CouchbaseException
import com.couchbase.client.java.Cluster
import com.couchbase.client.java.ClusterOptions
import com.couchbase.client.java.manager.collection.CreateCollectionSettings
import com.couchbase.client.java.manager.user.AuthDomain
import com.couchbase.client.java.manager.user.Role
import com.couchbase.client.java.manager.user.User
import dev.pkolosinski.gytt.server.infrastructure.CouchbaseConfiguration
import dev.pkolosinski.gytt.server.infrastructure.CouchbaseRuntime
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import org.testcontainers.couchbase.BucketDefinition
import org.testcontainers.couchbase.CouchbaseContainer
import org.testcontainers.utility.DockerImageName
import java.time.Duration

private const val ADMIN_USERNAME = "Administrator"
private const val ADMIN_PASSWORD = "readiness-admin-password"
private const val RUNTIME_USERNAME = "gytt-app"
private const val RUNTIME_PASSWORD = "readiness-app-password"

class CouchbaseReadinessIntegrationTest : FunSpec({
    test("readiness verifies query and mutation access with the bucket-scoped runtime identity") {
        if (System.getenv("GYTT_RUN_COUCHBASE_INTEGRATION") != "true") {
            return@test
        }

        val container =
            CouchbaseContainer(
                DockerImageName
                    .parse("couchbase:community-8.0.2")
                    .asCompatibleSubstituteFor("couchbase/server"),
            )
                .withCredentials(ADMIN_USERNAME, ADMIN_PASSWORD)
                .withBucket(BucketDefinition("gytt").withQuota(256))
        container.start()

        val adminCluster =
            Cluster.connect(
                container.connectionString,
                ClusterOptions.clusterOptions(ADMIN_USERNAME, ADMIN_PASSWORD),
            )
        try {
            val bucket = adminCluster.bucket("gytt")
            bucket.waitUntilReady(Duration.ofSeconds(30))
            bucket.collections().createCollection(
                "_default",
                "tasks",
                CreateCollectionSettings.createCollectionSettings(),
            )
            adminCluster.users().upsertUser(
                User(RUNTIME_USERNAME)
                    .password(RUNTIME_PASSWORD)
                    .displayName("GYTT runtime")
                    .roles(listOf(Role("bucket_full_access", "gytt"))),
            )

            val runtime =
                CouchbaseRuntime(
                    CouchbaseConfiguration(
                        connectionString = container.connectionString,
                        username = RUNTIME_USERNAME,
                        password = RUNTIME_PASSWORD,
                    ),
                )
            try {
                runtime.readiness().ready shouldBe true
            } finally {
                runtime.close()
            }

            val runtimeCluster =
                Cluster.connect(
                    container.connectionString,
                    ClusterOptions.clusterOptions(RUNTIME_USERNAME, RUNTIME_PASSWORD),
                )
            try {
                shouldThrow<CouchbaseException> {
                    runtimeCluster.users().getUser(AuthDomain.LOCAL, ADMIN_USERNAME)
                }
            } finally {
                runtimeCluster.disconnect()
            }
        } finally {
            adminCluster.disconnect()
            container.stop()
        }
    }
})
