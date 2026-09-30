package dev.pkolosinski.gytt.core.persistence

typealias Collection = String

interface CouchbaseRepository<T> {
    suspend fun insert(key: String, value: T)

    suspend fun getByKey(key: String): T

    suspend fun getByKeyOrNull(key: String): T?

    suspend fun replace(key: String, value: T)

    suspend fun remove(key: String)

    suspend fun upsert(key: String, value: T)
}
