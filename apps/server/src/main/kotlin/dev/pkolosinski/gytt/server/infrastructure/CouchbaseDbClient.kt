package dev.pkolosinski.gytt.server.infrastructure

import com.couchbase.client.kotlin.Bucket

internal class GyttCouchbaseClient(private val bucket: Bucket) {
    suspend fun ping() = bucket.ping()
}
