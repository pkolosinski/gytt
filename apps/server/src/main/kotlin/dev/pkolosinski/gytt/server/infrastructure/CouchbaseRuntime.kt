package dev.pkolosinski.gytt.server.infrastructure

import com.couchbase.client.core.error.CouchbaseException
import com.couchbase.client.kotlin.Cluster
import com.couchbase.client.kotlin.Collection
import com.couchbase.client.kotlin.CommonOptions
import com.couchbase.client.kotlin.Scope
import com.couchbase.client.kotlin.kv.Expiry
import com.couchbase.client.kotlin.query.QueryParameters
import com.couchbase.client.kotlin.query.QueryScanConsistency
import com.couchbase.client.kotlin.query.execute
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.sync.Mutex
import org.slf4j.LoggerFactory
import java.util.UUID
import kotlin.time.Duration.Companion.minutes
import kotlin.time.Duration.Companion.seconds

private const val DEFAULT_SCOPE = "_default"
private const val READINESS_COLLECTION = "tasks"
private const val READINESS_DOCUMENT_TYPE = "gyttReadinessProbe"
private val CONNECTION_TIMEOUT = 10.seconds
private val OPERATION_TIMEOUT = 3.seconds

data class ReadinessResult(
    val ready: Boolean,
    val reasonCode: String? = null,
) {
    companion object {
        fun ready(): ReadinessResult = ReadinessResult(ready = true)

        fun unhealthy(reasonCode: String): ReadinessResult =
            ReadinessResult(ready = false, reasonCode = reasonCode)
    }
}

class CouchbaseRuntime(
    private val configuration: CouchbaseConfiguration,
) : AutoCloseable {
    private val logger = LoggerFactory.getLogger(CouchbaseRuntime::class.java)
    private val connectionMutex = Mutex()

    @Volatile
    private var connection: RuntimeConnection? = null

    private suspend fun connect(): RuntimeConnection {
        connection?.let { return it }
        connectionMutex.lock()
        try {
            connection?.let { return it }

            return Cluster.connect(
                connectionString = configuration.connectionString,
                username = configuration.username,
                password = configuration.password,
                envConfigBlock = {
                    timeout {
                        connectTimeout = CONNECTION_TIMEOUT
                        disconnectTimeout = CONNECTION_TIMEOUT
                        kvTimeout = OPERATION_TIMEOUT
                        queryTimeout = OPERATION_TIMEOUT
                    }
                    disableAppTelemetry = true
                },
            ).let { cluster ->
                try {
                    cluster.waitUntilReady(CONNECTION_TIMEOUT)
                    val bucket = cluster.bucket(configuration.bucketName)
                    bucket.waitUntilReady(CONNECTION_TIMEOUT)
                    RuntimeConnection(
                        cluster = cluster,
                        scope = bucket.scope(DEFAULT_SCOPE),
                        collection = bucket.scope(DEFAULT_SCOPE).collection(READINESS_COLLECTION),
                    ).also { connection = it }
                } catch (exception: CouchbaseException) {
                    cluster.disconnect(CONNECTION_TIMEOUT)
                    throw exception
                } catch (exception: IllegalArgumentException) {
                    cluster.disconnect(CONNECTION_TIMEOUT)
                    throw exception
                } catch (exception: IllegalStateException) {
                    cluster.disconnect(CONNECTION_TIMEOUT)
                    throw exception
                }
            }
        } finally {
            connectionMutex.unlock()
        }
    }

    suspend fun readiness(): ReadinessResult = try {
        probe(connect())
    } catch (exception: CouchbaseException) {
        logger.warn("Couchbase readiness check failed: {}", exception::class.simpleName)
        ReadinessResult.unhealthy("database_unavailable")
    } catch (exception: IllegalArgumentException) {
        logger.warn("Couchbase readiness configuration failed: {}", exception::class.simpleName)
        ReadinessResult.unhealthy("database_configuration")
    } catch (exception: IllegalStateException) {
        logger.warn("Couchbase readiness configuration failed: {}", exception::class.simpleName)
        ReadinessResult.unhealthy("database_configuration")
    }

    private suspend fun probe(connection: RuntimeConnection): ReadinessResult {
        val probeId = UUID.randomUUID().toString()
        val key = "__gytt_readiness_probe__::$probeId"
        var inserted = false
        try {
            connection.collection.insert(
                key,
                mapOf(
                    "documentType" to READINESS_DOCUMENT_TYPE,
                    "probeId" to probeId,
                ),
                common = CommonOptions(timeout = OPERATION_TIMEOUT),
                expiry = Expiry.of(1.minutes),
            )
            inserted = true

            val storedProbe =
                connection.collection
                    .get(key, common = CommonOptions(timeout = OPERATION_TIMEOUT))
                    .contentAs<Map<String, String>>()["probeId"]
            val queryRows =
                connection.scope
                    .query(
                        "SELECT RAW META().id FROM `$READINESS_COLLECTION` USE KEYS @probeKey",
                        common = CommonOptions(timeout = OPERATION_TIMEOUT),
                        parameters = QueryParameters.named { param("probeKey", key) },
                        consistency = QueryScanConsistency.requestPlus(),
                    ).execute()
                    .rows
                    .map { it.contentAs<String>() }

            return if (storedProbe == probeId && queryRows == listOf(key)) {
                ReadinessResult.ready()
            } else {
                ReadinessResult.unhealthy("database_probe_failed")
            }
        } finally {
            if (inserted) {
                connection.collection.remove(
                    key,
                    common = CommonOptions(timeout = OPERATION_TIMEOUT),
                )
            }
        }
    }

    override fun close() {
        runBlocking {
            connectionMutex.lock()
            try {
                connection?.let {
                    connection = null
                    it.cluster.disconnect(CONNECTION_TIMEOUT)
                }
            } finally {
                connectionMutex.unlock()
            }
        }
    }
}

private data class RuntimeConnection(
    val cluster: Cluster,
    val scope: Scope,
    val collection: Collection,
)
