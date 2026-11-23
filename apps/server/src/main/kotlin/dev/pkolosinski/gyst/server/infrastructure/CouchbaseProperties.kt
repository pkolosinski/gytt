package dev.pkolosinski.gyst.server.infrastructure

import kotlinx.serialization.Serializable

@Serializable
data class CouchbaseProperties(
    val url: String,
    val username: String,
    val password: String,
    val bucket: String,
)
