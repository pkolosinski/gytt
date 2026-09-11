package dev.pkolosinski.gytt.server.infrastructure

import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.attribute.PosixFilePermission
import java.time.Duration

private const val DEFAULT_CONNECTION_STRING = "couchbase://db"
private const val DEFAULT_MANAGEMENT_URL = "http://db:8091"
private const val DEFAULT_BUCKET = "gytt"
private const val DEFAULT_USERNAME_FILE = "/run/secrets/gytt-couchbase-username"
private const val DEFAULT_PASSWORD_FILE = "/run/secrets/gytt-couchbase-password"
private const val DEFAULT_ADMIN_USERNAME_FILE = "/run/secrets/gytt-couchbase-admin-username"
private const val DEFAULT_ADMIN_PASSWORD_FILE = "/run/secrets/gytt-couchbase-admin-password"
private const val DEFAULT_LOG_LEVEL = "INFO"
private const val DEFAULT_KV_TIMEOUT_MS = 750L
private const val DEFAULT_QUERY_TIMEOUT_MS = 1_500L
private const val DEFAULT_TRANSACTION_TIMEOUT_MS = 4_000L
private const val DEFAULT_READ_BACK_TIMEOUT_MS = 500L
private const val DEFAULT_HTTP_TIMEOUT_MS = 5_000L
private const val APPLICATION_TIMEOUT_MARGIN_MS = 250L
private const val CURRENT_SCHEMA_VERSION = 1
private const val DEFAULT_ALLOW_COMMUNITY_PRIVACY_LIMITATIONS = false

data class CouchbaseTimeouts(
    val kv: Duration,
    val query: Duration,
    val transaction: Duration,
    val ambiguityReadBack: Duration,
    val httpRequest: Duration,
) {
    init {
        requirePositive("KV", kv)
        requirePositive("query", query)
        requirePositive("transaction", transaction)
        requirePositive("ambiguity read-back", ambiguityReadBack)
        requirePositive("HTTP request", httpRequest)

        val longestCouchbaseOperation = maxOf(kv, query, transaction)
        val requiredHttpTimeout =
            longestCouchbaseOperation
                .plus(ambiguityReadBack)
                .plus(Duration.ofMillis(APPLICATION_TIMEOUT_MARGIN_MS))
        require(httpRequest > requiredHttpTimeout) {
            "HTTP request timeout must exceed the longest Couchbase timeout, ambiguity read-back allowance, and application margin"
        }
    }

    private fun requirePositive(
        label: String,
        value: Duration,
    ) {
        require(!value.isZero && !value.isNegative) { "$label timeout must be positive" }
        require(value <= Duration.ofMinutes(2)) { "$label timeout must be at most two minutes" }
    }
}

data class PersistenceConfiguration(
    val connectionString: String = DEFAULT_CONNECTION_STRING,
    val managementUrl: String = DEFAULT_MANAGEMENT_URL,
    val bucketName: String = DEFAULT_BUCKET,
    val runtimeUsernameFile: Path = Path.of(DEFAULT_USERNAME_FILE),
    val runtimePasswordFile: Path = Path.of(DEFAULT_PASSWORD_FILE),
    val adminUsernameFile: Path = Path.of(DEFAULT_ADMIN_USERNAME_FILE),
    val adminPasswordFile: Path = Path.of(DEFAULT_ADMIN_PASSWORD_FILE),
    val logLevel: String = DEFAULT_LOG_LEVEL,
    val timeouts: CouchbaseTimeouts =
        CouchbaseTimeouts(
            kv = Duration.ofMillis(DEFAULT_KV_TIMEOUT_MS),
            query = Duration.ofMillis(DEFAULT_QUERY_TIMEOUT_MS),
            transaction = Duration.ofMillis(DEFAULT_TRANSACTION_TIMEOUT_MS),
            ambiguityReadBack = Duration.ofMillis(DEFAULT_READ_BACK_TIMEOUT_MS),
            httpRequest = Duration.ofMillis(DEFAULT_HTTP_TIMEOUT_MS),
        ),
    val minimumSchemaVersion: Int = CURRENT_SCHEMA_VERSION,
    val maximumSchemaVersion: Int = CURRENT_SCHEMA_VERSION,
    val currentSchemaVersion: Int = CURRENT_SCHEMA_VERSION,
    val bucketRamQuotaMb: Long = 256,
    val allowCommunityPrivacyLimitations: Boolean = DEFAULT_ALLOW_COMMUNITY_PRIVACY_LIMITATIONS,
) {
    init {
        require(connectionString.isNotBlank()) { "Couchbase connection string must not be blank" }
        require(managementUrl.isNotBlank()) { "Couchbase management URL must not be blank" }
        require(bucketName == DEFAULT_BUCKET) { "Couchbase bucket must be gytt" }
        require(logLevel.matches(Regex("(?i)TRACE|DEBUG|INFO|WARN|ERROR"))) {
            "GYTT_LOG_LEVEL must be one of TRACE, DEBUG, INFO, WARN, or ERROR"
        }
        require(minimumSchemaVersion > 0) { "Minimum schema version must be positive" }
        require(maximumSchemaVersion >= minimumSchemaVersion) {
            "Maximum schema version must not be lower than minimum schema version"
        }
        require(currentSchemaVersion in minimumSchemaVersion..maximumSchemaVersion) {
            "Current schema version must be within the supported schema range"
        }
        require(bucketRamQuotaMb >= 100) { "Couchbase bucket RAM quota must be at least 100 MB" }
    }

    companion object {
        fun fromEnvironment(environment: Map<String, String> = System.getenv()): PersistenceConfiguration {
            val kvTimeout = environment.duration("GYTT_COUCHBASE_KV_TIMEOUT_MS", DEFAULT_KV_TIMEOUT_MS)
            val queryTimeout = environment.duration("GYTT_COUCHBASE_QUERY_TIMEOUT_MS", DEFAULT_QUERY_TIMEOUT_MS)
            val transactionTimeout =
                environment.duration("GYTT_COUCHBASE_TRANSACTION_TIMEOUT_MS", DEFAULT_TRANSACTION_TIMEOUT_MS)
            val ambiguityReadBack =
                environment.duration("GYTT_AMBIGUITY_READBACK_TIMEOUT_MS", DEFAULT_READ_BACK_TIMEOUT_MS)
            val httpRequest = environment.duration("GYTT_HTTP_REQUEST_TIMEOUT_MS", DEFAULT_HTTP_TIMEOUT_MS)

            return PersistenceConfiguration(
                connectionString = environment.value("GYTT_COUCHBASE_CONNECTION_STRING", DEFAULT_CONNECTION_STRING),
                managementUrl = environment.value("GYTT_COUCHBASE_MANAGEMENT_URL", DEFAULT_MANAGEMENT_URL),
                bucketName = environment.value("GYTT_COUCHBASE_BUCKET", DEFAULT_BUCKET),
                runtimeUsernameFile =
                    environment.path("GYTT_COUCHBASE_USERNAME_FILE", DEFAULT_USERNAME_FILE),
                runtimePasswordFile =
                    environment.path("GYTT_COUCHBASE_PASSWORD_FILE", DEFAULT_PASSWORD_FILE),
                adminUsernameFile =
                    environment.path("GYTT_COUCHBASE_ADMIN_USERNAME_FILE", DEFAULT_ADMIN_USERNAME_FILE),
                adminPasswordFile =
                    environment.path("GYTT_COUCHBASE_ADMIN_PASSWORD_FILE", DEFAULT_ADMIN_PASSWORD_FILE),
                logLevel = environment.value("GYTT_LOG_LEVEL", DEFAULT_LOG_LEVEL).uppercase(),
                timeouts =
                    CouchbaseTimeouts(
                        kv = kvTimeout,
                        query = queryTimeout,
                        transaction = transactionTimeout,
                        ambiguityReadBack = ambiguityReadBack,
                        httpRequest = httpRequest,
                    ),
                minimumSchemaVersion =
                    environment.intValue("GYTT_SCHEMA_MIN_VERSION", CURRENT_SCHEMA_VERSION),
                maximumSchemaVersion =
                    environment.intValue("GYTT_SCHEMA_MAX_VERSION", CURRENT_SCHEMA_VERSION),
                currentSchemaVersion =
                    environment.intValue("GYTT_SCHEMA_VERSION", CURRENT_SCHEMA_VERSION),
                bucketRamQuotaMb =
                    environment.longValue("GYTT_COUCHBASE_BUCKET_RAM_MB", 256),
                allowCommunityPrivacyLimitations =
                    environment.booleanValue(
                        "GYTT_COUCHBASE_ALLOW_COMMUNITY_PRIVACY_LIMITATIONS",
                        DEFAULT_ALLOW_COMMUNITY_PRIVACY_LIMITATIONS,
                    ),
            )
        }
    }
}

data class DatabaseCredentials(
    val username: String,
    val password: String,
)

class SecretConfigurationException(
    message: String,
) : IllegalStateException(message)

object SecretFileReader {
    fun read(path: Path): String {
        if (!Files.isRegularFile(path)) {
            throw SecretConfigurationException("secret_file_unavailable")
        }
        if (!isPrivate(path)) {
            throw SecretConfigurationException("secret_file_permissions")
        }

        val value =
            try {
                Files.readString(path).trim()
            } catch (_: java.io.IOException) {
                throw SecretConfigurationException("secret_file_unavailable")
            }
        if (value.isEmpty() || value.contains('\u0000') || value.contains('\n')) {
            throw SecretConfigurationException("secret_file_invalid")
        }
        return value
    }

    fun readCredentials(
        usernamePath: Path,
        passwordPath: Path,
    ): DatabaseCredentials =
        DatabaseCredentials(
            username = read(usernamePath),
            password = read(passwordPath),
        )

    private fun isPrivate(path: Path): Boolean =
        try {
            Files.getPosixFilePermissions(path) == setOf(PosixFilePermission.OWNER_READ)
        } catch (_: UnsupportedOperationException) {
            false
        } catch (_: java.io.IOException) {
            false
        }
}

private fun Map<String, String>.value(
    name: String,
    default: String,
): String = this[name]?.takeIf { it.isNotBlank() } ?: default

private fun Map<String, String>.path(
    name: String,
    default: String,
): Path = Path.of(value(name, default))

private fun Map<String, String>.duration(
    name: String,
    defaultMilliseconds: Long,
): Duration {
    val rawValue = this[name] ?: defaultMilliseconds.toString()
    val milliseconds =
        rawValue.toLongOrNull()
            ?: throw IllegalArgumentException("$name must be an integer number of milliseconds")
    return Duration.ofMillis(milliseconds)
}

private fun Map<String, String>.intValue(
    name: String,
    default: Int,
): Int =
    (this[name] ?: default.toString()).toIntOrNull()
        ?: throw IllegalArgumentException("$name must be an integer")

private fun Map<String, String>.longValue(
    name: String,
    default: Long,
): Long =
    (this[name] ?: default.toString()).toLongOrNull()
        ?: throw IllegalArgumentException("$name must be an integer")

private fun Map<String, String>.booleanValue(
    name: String,
    default: Boolean,
): Boolean {
    val value = this[name] ?: return default
    return when (value.lowercase()) {
        "true" -> true
        "false" -> false
        else -> throw IllegalArgumentException("$name must be true or false")
    }
}

private fun maxOf(
    first: Duration,
    second: Duration,
    third: Duration,
): Duration = maxOf(first, maxOf(second, third))
