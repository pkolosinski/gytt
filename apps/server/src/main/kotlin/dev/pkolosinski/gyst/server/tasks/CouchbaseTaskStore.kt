package dev.pkolosinski.gyst.server.tasks

import com.couchbase.client.core.error.CasMismatchException
import com.couchbase.client.core.error.CouchbaseException
import com.couchbase.client.core.error.DocumentNotFoundException
import com.couchbase.client.kotlin.Cluster
import com.couchbase.client.kotlin.Collection
import com.couchbase.client.kotlin.codec.Content
import com.couchbase.client.kotlin.query.QueryParameters
import com.couchbase.client.kotlin.query.QueryScanConsistency
import com.couchbase.client.kotlin.query.execute
import dev.pkolosinski.gyst.core.task.Task
import dev.pkolosinski.gyst.core.task.TaskId
import dev.pkolosinski.gyst.core.task.TaskStore
import dev.pkolosinski.gyst.core.task.TaskStoreUnavailableException
import dev.pkolosinski.gyst.core.task.WriteResult
import java.time.LocalDate

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

    override suspend fun listActiveBetween(from: LocalDate, to: LocalDate): List<Task> =
        unavailableOnFailure {
            cluster.query(
                "SELECT RAW t FROM `$bucketName`.`_default`.`$TASKS_COLLECTION` AS t " +
                    "WHERE t.createdOn <= \$to AND (t.completedOn IS NOT VALUED OR t.completedOn >= \$from)",
                parameters = QueryParameters.named {
                    param("from", from.toString())
                    param("to", to.toString())
                },
                consistency = QueryScanConsistency.requestPlus(),
            ).execute().rows.map {
                taskJson.decodeFromString<TaskJson>(it.content.decodeToString()).toTask()
            }
        }

    override suspend fun find(id: TaskId): Task? = unavailableOnFailure {
        try {
            collection.get(id.value).content.bytes.decodeToString().toTask()
        } catch (_: DocumentNotFoundException) {
            null
        }
    }

    override suspend fun insert(task: Task) = unavailableOnFailure {
        collection.insert(task.id.value, task.toContent())
        Unit
    }

    override suspend fun replace(task: Task, expectedRevision: Long): WriteResult =
        unavailableOnFailure {
            try {
                val stored = collection.get(task.id.value)
                if (stored.content.bytes.decodeToString().toTask().version != expectedRevision) {
                    WriteResult.Conflict
                } else {
                    collection.replace(task.id.value, task.toContent(), cas = stored.cas)
                    WriteResult.Written
                }
            } catch (_: DocumentNotFoundException) {
                WriteResult.Missing
            } catch (_: CasMismatchException) {
                WriteResult.Conflict
            }
        }

    override suspend fun delete(id: TaskId, expectedRevision: Long): WriteResult =
        unavailableOnFailure {
            try {
                val stored = collection.get(id.value)
                if (stored.content.bytes.decodeToString().toTask().version != expectedRevision) {
                    WriteResult.Conflict
                } else {
                    collection.remove(id.value, cas = stored.cas)
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
