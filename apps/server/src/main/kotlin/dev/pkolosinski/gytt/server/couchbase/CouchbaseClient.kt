package dev.pkolosinski.gytt.server.couchbase

import com.couchbase.client.kotlin.Bucket

class CouchbaseClient(private val bucket: Bucket) {
    override suspend inline fun <reified T> findByKey(
        key: String,
        collection: String,
    ): T? {
        bucket.collection(collection)
            .getOrNull(key)
            ?.contentAs<T>()
    }
}
