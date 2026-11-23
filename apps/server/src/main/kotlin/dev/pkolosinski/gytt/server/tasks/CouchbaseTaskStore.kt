package dev.pkolosinski.gytt.server.tasks

import com.couchbase.client.core.error.CasMismatchException
import com.couchbase.client.core.error.CouchbaseException
import com.couchbase.client.core.error.DocumentNotFoundException
import com.couchbase.client.kotlin.Cluster
import com.couchbase.client.kotlin.Collection
import com.couchbase.client.kotlin.codec.Content
import com.couchbase.client.kotlin.query.QueryParameters
import com.couchbase.client.kotlin.query.QueryScanConsistency
import com.couchbase.client.kotlin.query.execute
import dev.pkolosinski.gytt.core.tasks.Task
import dev.pkolosinski.gytt.core.tasks.TaskStore
import dev.pkolosinski.gytt.core.tasks.TaskStoreUnavailableException
import dev.pkolosinski.gytt.core.tasks.WriteResult
import kotlinx.serialization.encodeToString
import java.time.LocalDate
import java.util.UUID

private const val TASKS_COLLECTION = "tasks"

/** Keeps each Task as one document in the `tasks` collection, keyed by its id. */
internal class CouchbaseTaskStore(
    private val cluster: Cluster,
    private val bucketName: String,
    private val collection: Collection,
) : TaskStore {
    constructor(cluster: Cluster, bucketName: String) : this(
        cluster,
        bucketName,
        cluster.bucket(bucketName).defaultScope().collection(TASKS_COLLECTION),
    )

    override suspend fun listCreatedOnOrBefore(date: LocalDate): List<Task> = unavailableOnFailure {
        cluster.query(
            "SELECT RAW t FROM `$bucketName`.`_default`.`$TASKS_COLLECTION` AS t WHERE t.createdOn <= \$date",
            parameters = QueryParameters.named { param("date", date.toString()) },
            consistency = QueryScanConsistency.requestPlus(),
        ).execute().rows.map {
            taskJson.decodeFromString<TaskJson>(it.content.decodeToString()).toTask()
        }
    }

    override suspend fun find(id: UUID): Task? = unavailableOnFailure {
        try {
            collection.get(id.toString()).content.bytes.decodeToString().toTask()
        } catch (_: DocumentNotFoundException) {
            null
        }
    }

    override suspend fun insert(task: Task) = unavailableOnFailure {
        collection.insert(task.id.toString(), task.toContent())
        Unit
    }

    override suspend fun replace(task: Task, expectedRevision: Long): WriteResult =
        unavailableOnFailure {
            try {
                val stored = collection.get(task.id.toString())
                if (stored.content.bytes.decodeToString().toTask().revision != expectedRevision) {
                    WriteResult.Conflict
                } else {
                    collection.replace(task.id.toString(), task.toContent(), cas = stored.cas)
                    WriteResult.Written
                }
            } catch (_: DocumentNotFoundException) {
                WriteResult.Missing
            } catch (_: CasMismatchException) {
                WriteResult.Conflict
            }
        }

    override suspend fun delete(id: UUID, expectedRevision: Long): WriteResult =
        unavailableOnFailure {
            try {
                val stored = collection.get(id.toString())
                if (stored.content.bytes.decodeToString().toTask().revision != expectedRevision) {
                    WriteResult.Conflict
                } else {
                    collection.remove(id.toString(), cas = stored.cas)
                    WriteResult.Written
                }
            } catch (_: DocumentNotFoundException) {
                WriteResult.Missing
            } catch (_: CasMismatchException) {
                WriteResult.Conflict
            }
        }

    private fun Task.toContent() = Content.json(taskJson.encodeToString(toJson()))

    private fun String.toTask() = taskJson.decodeFromString<TaskJson>(this).toTask()

    private suspend fun <T> unavailableOnFailure(block: suspend () -> T): T = try {
        block()
    } catch (exception: CouchbaseException) {
        throw TaskStoreUnavailableException(exception)
    }
}
