package dev.pkolosinski.gytt.server.infrastructure

private const val DEFAULT_CONNECTION_STRING = "couchbase://couchbase"
private const val DEFAULT_USERNAME = "gytt-app"
private const val DEFAULT_PASSWORD = "gytt-app-password"
private const val DEFAULT_BUCKET = "gytt"

class CouchbaseConfiguration(
    val connectionString: String = DEFAULT_CONNECTION_STRING,
    val username: String = DEFAULT_USERNAME,
    val password: String = DEFAULT_PASSWORD,
    val bucketName: String = DEFAULT_BUCKET,
) {
    init {
        require(connectionString.isNotBlank()) { "Couchbase connection string must not be blank" }
        require(username.isNotBlank()) { "Couchbase username must not be blank" }
        require(password.isNotBlank()) { "Couchbase password must not be blank" }
        require(bucketName.isNotBlank()) { "Couchbase bucket must not be blank" }
    }

    companion object {
        fun fromEnvironment(
            environment: Map<String, String> = System.getenv(),
        ): CouchbaseConfiguration = CouchbaseConfiguration(
            connectionString =
            environment.valueOrDefault(
                "GYTT_COUCHBASE_CONNECTION_STRING",
                DEFAULT_CONNECTION_STRING,
            ),
            username = environment.valueOrDefault("GYTT_COUCHBASE_USERNAME", DEFAULT_USERNAME),
            password = environment.valueOrDefault("GYTT_COUCHBASE_PASSWORD", DEFAULT_PASSWORD),
            bucketName = environment.valueOrDefault("GYTT_COUCHBASE_BUCKET", DEFAULT_BUCKET),
        )
    }
}

private fun Map<String, String>.valueOrDefault(name: String, default: String): String {
    val value = this[name] ?: return default
    require(value.isNotBlank()) { "$name must not be blank" }
    return value
}
