package dev.pkolosinski.gytt.server.infrastructure

import com.couchbase.client.core.error.CouchbaseException
import com.couchbase.client.java.Cluster
import com.couchbase.client.java.ClusterOptions
import com.couchbase.client.java.env.ClusterEnvironment
import java.net.URI
import java.net.URLEncoder
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.nio.charset.StandardCharsets
import java.util.Base64

object CouchbaseClusterFactory {
    fun connect(
        configuration: PersistenceConfiguration,
        credentials: DatabaseCredentials,
    ): Cluster {
        val environment =
            ClusterEnvironment
                .builder()
                .timeoutConfig { timeout ->
                    timeout
                        .kvTimeout(configuration.timeouts.kv)
                        .kvDurableTimeout(configuration.timeouts.kv)
                        .queryTimeout(configuration.timeouts.query)
                        .connectTimeout(configuration.timeouts.httpRequest)
                        .disconnectTimeout(configuration.timeouts.httpRequest)
                        .managementTimeout(configuration.timeouts.query)
                }.disableAppTelemetry(true)
                .build()
        return Cluster.connect(
            configuration.connectionString,
            ClusterOptions.clusterOptions(credentials.username, credentials.password).environment(environment),
        )
    }
}

class CouchbaseClusterBootstrapper(
    private val configuration: PersistenceConfiguration,
    private val httpClient: HttpClient =
        HttpClient
            .newBuilder()
            .connectTimeout(configuration.timeouts.query)
            .build(),
) {
    fun ensureInitialized(credentials: DatabaseCredentials) {
        val poolsEndpoint = "${configuration.managementUrl.trimEnd('/')}/pools"
        val currentStatus = request(poolsEndpoint, credentials, null, "GET")
        if (currentStatus.status in 200..299 &&
            !currentStatus.body.replace("\\s".toRegex(), "").contains("\"pools\":[]")
        ) {
            return
        }
        if (currentStatus.status !in 200..299 && currentStatus.status != 401 && currentStatus.status != 404) {
            throw ProvisioningException("couchbase_initialization_state")
        }

        val setupServicesEndpoint = "${configuration.managementUrl.trimEnd('/')}/node/controller/setupServices"
        val setupStatus =
            request(
                setupServicesEndpoint,
                credentials,
                formBody("services" to "kv,n1ql,index"),
                "POST",
            )
        if (setupStatus.status !in 200..299) {
            throw ProvisioningException("couchbase_services_rejected")
        }

        val indexSettingsEndpoint = "${configuration.managementUrl.trimEnd('/')}/settings/indexes"
        val indexSettingsStatus =
            request(
                indexSettingsEndpoint,
                credentials,
                formBody("storageMode" to "forestdb"),
                "POST",
            )
        if (indexSettingsStatus.status !in 200..299) {
            throw ProvisioningException("couchbase_index_settings_rejected")
        }

        val webSettingsEndpoint = "${configuration.managementUrl.trimEnd('/')}/settings/web"
        val webSettingsStatus =
            request(
                webSettingsEndpoint,
                credentials,
                formBody(
                    "username" to credentials.username,
                    "password" to credentials.password,
                    "port" to "8091",
                ),
                "POST",
            )
        if (webSettingsStatus.status !in 200..299) {
            throw ProvisioningException("couchbase_admin_setup_rejected")
        }
    }

    private fun request(
        endpoint: String,
        credentials: DatabaseCredentials,
        body: String?,
        method: String,
    ): ManagementResponse {
        val builder =
            HttpRequest
                .newBuilder(URI.create(endpoint))
                .timeout(configuration.timeouts.query)
                .header("Content-Type", "application/x-www-form-urlencoded")
                .header("Authorization", basicAuthorization(credentials))
        val request =
            when (method) {
                "GET" -> builder.GET().build()
                "POST" -> builder.POST(HttpRequest.BodyPublishers.ofString(body.orEmpty())).build()
                else -> throw ProvisioningException("unsupported_management_method")
            }
        val response =
            try {
                httpClient.send(request, HttpResponse.BodyHandlers.ofString())
            } catch (_: java.io.IOException) {
                throw ProvisioningException("couchbase_management_unavailable")
            } catch (_: InterruptedException) {
                Thread.currentThread().interrupt()
                throw ProvisioningException("couchbase_management_interrupted")
            }
        return ManagementResponse(response.statusCode(), response.body())
    }

    private fun formBody(vararg values: Pair<String, String>): String =
        values.joinToString("&") { (name, value) ->
            "${encode(name)}=${encode(value)}"
        }

    private data class ManagementResponse(
        val status: Int,
        val body: String,
    )

    private fun encode(value: String): String =
        URLEncoder.encode(value, StandardCharsets.UTF_8)

    private fun basicAuthorization(credentials: DatabaseCredentials): String =
        "Basic " +
            Base64
                .getEncoder()
                .encodeToString("${credentials.username}:${credentials.password}".toByteArray(StandardCharsets.UTF_8))
}

class CouchbaseProvisioningCommand(
    private val configuration: PersistenceConfiguration,
    private val secretReader: (PathPair) -> DatabaseCredentials =
        { paths ->
            SecretFileReader.readCredentials(paths.username, paths.password)
        },
    private val privacyAttestor: (PersistenceConfiguration, DatabaseCredentials) -> ProvisioningChecks =
        { config, credentials ->
            CouchbasePrivacyAttestor(config).ensureDisabled(credentials)
        },
) {
    fun run() {
        val adminCredentials =
            secretReader(
                PathPair(
                    username = configuration.adminUsernameFile,
                    password = configuration.adminPasswordFile,
                ),
            )
        val runtimeCredentials =
            secretReader(
                PathPair(
                    username = configuration.runtimeUsernameFile,
                    password = configuration.runtimePasswordFile,
                ),
            )
        if (adminCredentials.username.equals(runtimeCredentials.username, ignoreCase = true)) {
            throw ProvisioningException("admin_runtime_identity_must_differ")
        }

        CouchbaseClusterBootstrapper(configuration).ensureInitialized(adminCredentials)
        val cluster = CouchbaseClusterFactory.connect(configuration, adminCredentials)
        try {
            cluster.waitUntilReady(configuration.timeouts.httpRequest)
            val checks = privacyAttestor(configuration, adminCredentials)
            SchemaProvisioner(configuration).provision(cluster, runtimeCredentials, checks)
        } finally {
            cluster.disconnect(configuration.timeouts.httpRequest)
        }
    }
}

data class PathPair(
    val username: java.nio.file.Path,
    val password: java.nio.file.Path,
)

fun runProvisioningCommand(environment: Map<String, String> = System.getenv()): Int {
    return try {
        CouchbaseProvisioningCommand(PersistenceConfiguration.fromEnvironment(environment)).run()
        0
    } catch (exception: SecretConfigurationException) {
        System.err.println("provisioning_failed:${exception.message ?: "secret_configuration"}")
        1
    } catch (exception: ProvisioningException) {
        System.err.println("provisioning_failed:${exception.reasonCode}")
        1
    } catch (exception: SchemaMigrationException) {
        System.err.println("provisioning_failed:${exception.reasonCode}")
        1
    } catch (exception: CouchbaseException) {
        System.err.println("provisioning_failed:database_${exception::class.simpleName}")
        1
    } catch (exception: IllegalArgumentException) {
        System.err.println("provisioning_failed:invalid_configuration_${exception::class.simpleName}")
        1
    }
}
