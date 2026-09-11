package dev.pkolosinski.gytt.server.infrastructure

import com.couchbase.client.core.error.CouchbaseException
import com.couchbase.client.core.msg.kv.DurabilityLevel
import com.couchbase.client.java.Cluster
import com.couchbase.client.java.Collection
import com.couchbase.client.java.Scope
import com.couchbase.client.java.json.JsonObject
import com.couchbase.client.java.kv.GetOptions
import com.couchbase.client.java.kv.GetResult
import com.couchbase.client.java.kv.UpsertOptions
import com.couchbase.client.java.query.QueryOptions
import com.couchbase.client.java.query.QueryResult
import com.couchbase.client.java.query.QueryScanConsistency
import com.couchbase.client.java.transactions.Transactions
import com.couchbase.client.java.transactions.config.TransactionOptions
import org.slf4j.LoggerFactory
import java.time.Duration

private const val APPLICATION_SCOPE = "app"

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
    private val configuration: PersistenceConfiguration,
    private val credentialsReader: (PersistenceConfiguration) -> DatabaseCredentials =
        { config ->
            SecretFileReader.readCredentials(
                usernamePath = config.runtimeUsernameFile,
                passwordPath = config.runtimePasswordFile,
            )
        },
) : AutoCloseable {
    private val logger = LoggerFactory.getLogger(CouchbaseRuntime::class.java)

    @Volatile
    private var connection: RuntimeConnection? = null

    @Synchronized
    private fun connect(): RuntimeConnection {
        connection?.let { return it }

        val credentials = credentialsReader(configuration)
        val cluster = CouchbaseClusterFactory.connect(configuration, credentials)
        try {
            cluster.waitUntilReady(configuration.timeouts.httpRequest)
            val runtimeConnection =
                RuntimeConnection(
                    cluster = cluster,
                    bucket = cluster.bucket(configuration.bucketName),
                    scope = cluster.bucket(configuration.bucketName).scope(APPLICATION_SCOPE),
                    transactions = cluster.transactions(),
                )
            connection = runtimeConnection
            return runtimeConnection
        } catch (exception: CouchbaseException) {
            cluster.disconnect()
            throw exception
        } catch (exception: IllegalStateException) {
            cluster.disconnect()
            throw exception
        }
    }

    fun readiness(checker: (RuntimeConnection) -> ReadinessResult): ReadinessResult =
        try {
            checker(connect())
        } catch (exception: SecretConfigurationException) {
            ReadinessResult.unhealthy(exception.message ?: "secret_configuration")
        } catch (exception: CouchbaseException) {
            logger.warn("Couchbase readiness check failed: {}", exception::class.simpleName)
            ReadinessResult.unhealthy("database_unavailable")
        } catch (exception: SchemaMigrationException) {
            logger.warn("Couchbase schema readiness failed: {}", exception.reasonCode)
            ReadinessResult.unhealthy(exception.reasonCode)
        } catch (exception: IllegalStateException) {
            logger.warn("Couchbase readiness configuration failed: {}", exception::class.simpleName)
            ReadinessResult.unhealthy("database_configuration")
        } catch (_: IllegalArgumentException) {
            ReadinessResult.unhealthy("database_configuration")
        }

    fun connectionForInfrastructure(): RuntimeConnection = connect()

    override fun close() {
        synchronized(this) {
            connection?.cluster?.disconnect(configuration.timeouts.httpRequest)
            connection = null
        }
    }
}

class RuntimeConnection(
    val cluster: Cluster,
    val bucket: com.couchbase.client.java.Bucket,
    val scope: Scope,
    val transactions: Transactions,
) {
    fun collection(name: String): Collection = scope.collection(name)

    fun knownIdRead(
        collection: Collection,
        key: String,
    ): GetResult =
        collection.get(
            key,
            GetOptions
                .getOptions()
                .timeout(cluster.environment().timeoutConfig().kvTimeout()),
        )

    fun userQuery(
        statement: String,
        parameters: JsonObject? = null,
        timeout: Duration = cluster.environment().timeoutConfig().queryTimeout(),
    ): QueryResult {
        val options =
            QueryOptions
                .queryOptions()
                .scanConsistency(QueryScanConsistency.REQUEST_PLUS)
                .timeout(timeout)
        if (parameters != null) {
            options.parameters(parameters)
        }
        return scope.query(statement, options)
    }

    fun durableUpsert(
        collection: Collection,
        key: String,
        content: Any,
    ) {
        collection.upsert(
            key,
            content,
            UpsertOptions
                .upsertOptions()
                .durability(DurabilityLevel.MAJORITY_AND_PERSIST_TO_ACTIVE)
                .timeout(cluster.environment().timeoutConfig().kvDurableTimeout()),
        )
    }

    fun transactionOptions(timeout: Duration): TransactionOptions =
        TransactionOptions
            .transactionOptions()
            .durabilityLevel(DurabilityLevel.MAJORITY_AND_PERSIST_TO_ACTIVE)
            .timeout(timeout)
}
