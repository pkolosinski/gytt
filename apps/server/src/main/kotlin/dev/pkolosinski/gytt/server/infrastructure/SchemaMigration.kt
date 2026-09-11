package dev.pkolosinski.gytt.server.infrastructure

import com.couchbase.client.core.error.BucketExistsException
import com.couchbase.client.core.error.BucketNotFoundException
import com.couchbase.client.core.error.CollectionExistsException
import com.couchbase.client.core.error.CouchbaseException
import com.couchbase.client.core.error.InternalServerFailureException
import com.couchbase.client.core.error.ServiceNotAvailableException
import com.couchbase.client.core.error.ScopeExistsException
import com.couchbase.client.core.msg.kv.DurabilityLevel
import com.couchbase.client.java.Cluster
import com.couchbase.client.java.Collection
import com.couchbase.client.java.json.JsonObject
import com.couchbase.client.java.kv.GetOptions
import com.couchbase.client.java.kv.InsertOptions
import com.couchbase.client.java.manager.bucket.BucketSettings
import com.couchbase.client.java.manager.collection.CollectionSpec
import com.couchbase.client.java.manager.collection.CreateCollectionSettings
import com.couchbase.client.java.manager.query.GetAllQueryIndexesOptions
import com.couchbase.client.java.query.QueryOptions
import com.couchbase.client.java.manager.user.Role
import com.couchbase.client.java.manager.user.User
import java.nio.charset.StandardCharsets
import java.security.MessageDigest
import java.time.Instant

const val APPLICATION_SCOPE_NAME = "app"
const val TASKS_COLLECTION_NAME = "tasks"
const val HABITS_COLLECTION_NAME = "habits"
const val HABIT_PROGRESS_COLLECTION_NAME = "habit_progress"
const val SCHEMA_MIGRATIONS_COLLECTION_NAME = "schema_migrations"
const val BOARD_COMPOSITION_KEY = "task-board-composition::current"
const val INITIAL_MIGRATION_KEY = "migration::1"

private const val SCHEMA_MIGRATION_DOCUMENT_TYPE = "schemaMigration"
private const val BOARD_COMPOSITION_DOCUMENT_TYPE = "taskBoardCompositionRevision"

data class SchemaMigrationRecord(
    val version: Int,
    val name: String,
    val checksum: String,
    val provisioningChecks: ProvisioningChecks,
) {
    fun toJson(appliedAt: Instant = Instant.now()): JsonObject =
        JsonObject
            .create()
            .put("documentType", SCHEMA_MIGRATION_DOCUMENT_TYPE)
            .put("schemaVersion", version)
            .put("version", version)
            .put("name", name)
            .put("checksum", checksum)
            .put("appliedAt", appliedAt.toString())
            .put(
                "provisioningChecks",
                JsonObject
                    .create()
                    .put("applicationTelemetryDisabled", provisioningChecks.applicationTelemetryDisabled)
                    .put("usageSharingDisabled", provisioningChecks.usageSharingDisabled)
                    .put(
                        "updateChecksDisabled",
                        provisioningChecks.updateChecksDisabled,
                    )
                    .put(
                        "communityEditionPrivacyLimitationsAccepted",
                        provisioningChecks.communityEditionPrivacyLimitationsAccepted,
                    ),
            )

    companion object {
        fun fromJson(document: JsonObject): SchemaMigrationRecord {
            try {
                val checks = document.getObject("provisioningChecks")
                require(document.getString("documentType") == SCHEMA_MIGRATION_DOCUMENT_TYPE)
                require(checks != null)
                return SchemaMigrationRecord(
                    version = document.getInt("version"),
                    name = document.getString("name"),
                    checksum = document.getString("checksum"),
                    provisioningChecks =
                        ProvisioningChecks(
                            applicationTelemetryDisabled = checks.getBoolean("applicationTelemetryDisabled"),
                            usageSharingDisabled = checks.getBoolean("usageSharingDisabled"),
                            updateChecksDisabled = checks.getBoolean("updateChecksDisabled"),
                            communityEditionPrivacyLimitationsAccepted =
                                checks.getBoolean("communityEditionPrivacyLimitationsAccepted"),
                        ),
                )
            } catch (_: IllegalStateException) {
                throw SchemaMigrationException("migration_document_invalid")
            } catch (_: IllegalArgumentException) {
                throw SchemaMigrationException("migration_document_invalid")
            } catch (_: ClassCastException) {
                throw SchemaMigrationException("migration_document_invalid")
            } catch (_: NullPointerException) {
                throw SchemaMigrationException("migration_document_invalid")
            }
        }
    }
}

data class ProvisioningChecks(
    val applicationTelemetryDisabled: Boolean,
    val usageSharingDisabled: Boolean,
    val updateChecksDisabled: Boolean,
    val communityEditionPrivacyLimitationsAccepted: Boolean = false,
) {
    val allDisabled: Boolean
        get() = applicationTelemetryDisabled && usageSharingDisabled && updateChecksDisabled

    fun privacyGateSatisfied(allowCommunityPrivacyLimitations: Boolean): Boolean =
        allDisabled ||
            (applicationTelemetryDisabled &&
                allowCommunityPrivacyLimitations &&
                communityEditionPrivacyLimitationsAccepted)
}

object InitialSchemaMigration {
    const val VERSION = 1
    const val NAME = "initial-couchbase-schema"

    private val descriptor =
        """
        bucket:gytt
        replicas:0
        scope:app
        collections:tasks,habits,habit_progress,schema_migrations
        indexes:tasks_by_dates,tasks_by_status_transition,habits_by_lifecycle,habit_progress_by_period
        document:task-board-composition::current
        runtime-identity:least-privileged
        privacy:community-edition-limitations-recorded
        """.trimIndent()

    val checksum: String = sha256(descriptor)

    fun record(checks: ProvisioningChecks): SchemaMigrationRecord =
        SchemaMigrationRecord(
            version = VERSION,
            name = NAME,
            checksum = checksum,
            provisioningChecks = checks,
        )
}

class SchemaMigrationException(
    val reasonCode: String,
) : IllegalStateException(reasonCode)

class SchemaProvisioner(
    private val configuration: PersistenceConfiguration,
) {
    fun provision(
        cluster: Cluster,
        runtimeCredentials: DatabaseCredentials,
        provisioningChecks: ProvisioningChecks,
    ) {
        val bucket = ensureBucket(cluster)
        val collections = bucket.collections()
        ensureScopeAndCollections(collections)

        val scope = bucket.scope(APPLICATION_SCOPE_NAME)
        val migrations = scope.collection(SCHEMA_MIGRATIONS_COLLECTION_NAME)
        val existingMigration = migrations.getOrNull(INITIAL_MIGRATION_KEY, boundedGetOptions())
        if (existingMigration != null) {
            val record = SchemaMigrationRecord.fromJson(existingMigration.contentAsObject())
            validateRecordedMigration(record, provisioningChecks)
        }

        ensureIndexes(cluster)
        ensureRuntimeUser(cluster, runtimeCredentials)
        ensureBoardCompositionDocument(scope.collection(TASKS_COLLECTION_NAME))

        if (existingMigration == null) {
            migrations.insert(
                INITIAL_MIGRATION_KEY,
                InitialSchemaMigration.record(provisioningChecks).toJson(),
                InsertOptions
                    .insertOptions()
                    .durability(DurabilityLevel.MAJORITY_AND_PERSIST_TO_ACTIVE)
                    .timeout(configuration.timeouts.kv),
            )
        }
    }

    private fun ensureBucket(cluster: Cluster): com.couchbase.client.java.Bucket {
        val bucketSettings =
            try {
                cluster.buckets().getBucket(configuration.bucketName)
            } catch (_: BucketNotFoundException) {
                val desired =
                    BucketSettings
                        .create(configuration.bucketName)
                        .ramQuotaMB(configuration.bucketRamQuotaMb)
                        .numReplicas(0)
                try {
                    cluster.buckets().createBucket(desired)
                } catch (_: BucketExistsException) {
                    // A concurrent provisioner won the create race; validate it below.
                }
                desired
            }

        if (bucketSettings.numReplicas() != 0) {
            throw SchemaMigrationException("bucket_replica_configuration")
        }
        val bucket = cluster.bucket(configuration.bucketName)
        bucket.waitUntilReady(configuration.timeouts.query)
        return bucket
    }

    private fun ensureScopeAndCollections(collections: com.couchbase.client.java.manager.collection.CollectionManager) {
        try {
            collections.createScope(APPLICATION_SCOPE_NAME)
        } catch (_: ScopeExistsException) {
            // Idempotent provisioning: the scope already has the requested name.
        }

        val expected = setOf(
            TASKS_COLLECTION_NAME,
            HABITS_COLLECTION_NAME,
            HABIT_PROGRESS_COLLECTION_NAME,
            SCHEMA_MIGRATIONS_COLLECTION_NAME,
        )
        val existing =
            collections
                .getScope(APPLICATION_SCOPE_NAME)
                .collections()
                .map(CollectionSpec::name)
                .toSet()
        val unexpected = existing - expected
        if (unexpected.isNotEmpty()) {
            throw SchemaMigrationException("unexpected_collection")
        }

        expected
            .filterNot(existing::contains)
            .forEach { name ->
                try {
                    collections.createCollection(
                        APPLICATION_SCOPE_NAME,
                        name,
                        CreateCollectionSettings.createCollectionSettings(),
                    )
                } catch (_: CollectionExistsException) {
                    // Idempotent provisioning: the collection appeared concurrently.
                }
            }
    }

    private fun ensureIndexes(cluster: Cluster) {
        createIndex(
            cluster = cluster,
            name = "idx_tasks_by_dates",
            collection = TASKS_COLLECTION_NAME,
            keys = listOf("type", "startDate", "fixedDate"),
            condition = "documentType = \"task\"",
        )
        createIndex(
            cluster = cluster,
            name = "idx_tasks_by_status_transition",
            collection = TASKS_COLLECTION_NAME,
            keys = listOf("DISTINCT ARRAY transition.effectiveDate FOR transition IN statusTransitions END"),
            condition = "documentType = \"task\"",
        )
        createIndex(
            cluster = cluster,
            name = "idx_habits_by_lifecycle",
            collection = HABITS_COLLECTION_NAME,
            keys = listOf("startedOn", "archivedFrom"),
            condition = "documentType = \"habit\"",
        )
        createIndex(
            cluster = cluster,
            name = "idx_habit_progress_by_period",
            collection = HABIT_PROGRESS_COLLECTION_NAME,
            keys = listOf("habitId", "period"),
            condition = "documentType = \"habitProgress\"",
        )
    }

    private fun createIndex(
        cluster: Cluster,
        name: String,
        collection: String,
        keys: List<String>,
        condition: String,
    ) {
        withQueryServiceRetry {
            val indexes = cluster.queryIndexes()
            val existing =
                indexes
                    .getAllIndexes(
                        configuration.bucketName,
                        GetAllQueryIndexesOptions
                            .getAllQueryIndexesOptions()
                            .scopeName(APPLICATION_SCOPE_NAME)
                            .collectionName(collection)
                            .timeout(configuration.timeouts.httpRequest),
                    )
                    .firstOrNull { index ->
                        index.name() == name &&
                            index.scopeName().orElse(null) == APPLICATION_SCOPE_NAME &&
                            index.collectionName().orElse(null) == collection
                    }
            if (existing != null) {
                val actualKeys = normalizeIndexDefinition(existing.indexKey().toString())
                val expectedCondition = normalizeIndexDefinition(condition)
                val actualCondition = normalizeIndexDefinition(existing.condition().orElse(""))
                if (
                    !keys.all { key -> actualKeys.contains(normalizeIndexDefinition(key)) } ||
                    !actualCondition.contains(expectedCondition) ||
                    existing.state() != "online"
                ) {
                    throw SchemaMigrationException("index_definition")
                }
                return@withQueryServiceRetry
            }
            cluster.query(
                """
                CREATE INDEX `${name}`
                ON `${configuration.bucketName}`.`$APPLICATION_SCOPE_NAME`.`$collection`(${keys.joinToString(",")})
                WHERE $condition
                USING GSI
                """.trimIndent(),
                QueryOptions
                    .queryOptions()
                    .timeout(configuration.timeouts.httpRequest),
            )
        }
    }

    private fun normalizeIndexDefinition(value: String): String =
        value
            .lowercase()
            .replace(Regex("[^a-z0-9]"), "")

    private fun <T> withQueryServiceRetry(action: () -> T): T {
        val deadline = System.nanoTime() + configuration.timeouts.httpRequest.toNanos()
        var lastFailure: CouchbaseException? = null
        while (System.nanoTime() < deadline) {
            try {
                return action()
            } catch (failure: ServiceNotAvailableException) {
                lastFailure = failure
                waitForQueryService()
            } catch (failure: InternalServerFailureException) {
                lastFailure = failure
                waitForQueryService()
            }
        }
        throw lastFailure ?: SchemaMigrationException("query_service_unavailable")
    }

    private fun waitForQueryService() {
        try {
            Thread.sleep(100)
        } catch (_: InterruptedException) {
            Thread.currentThread().interrupt()
            throw SchemaMigrationException("query_service_interrupted")
        }
    }

    private fun ensureRuntimeUser(
        cluster: Cluster,
        credentials: DatabaseCredentials,
    ) {
        val roles =
            // Couchbase Community Edition exposes bucket_full_access as its only application-data role.
            listOf(Role("bucket_full_access", configuration.bucketName))
        cluster.users().upsertUser(
            User(credentials.username)
                .password(credentials.password)
                .displayName("GYTT runtime")
                .roles(roles),
        )
    }

    private fun ensureBoardCompositionDocument(collection: Collection) {
        val existing = collection.getOrNull(BOARD_COMPOSITION_KEY, boundedGetOptions())
        if (existing == null) {
            collection.insert(
                BOARD_COMPOSITION_KEY,
                JsonObject
                    .create()
                    .put("documentType", BOARD_COMPOSITION_DOCUMENT_TYPE)
                    .put("schemaVersion", InitialSchemaMigration.VERSION)
                    .put("revision", 0)
                    .put("updatedAt", Instant.now().toString()),
                InsertOptions
                    .insertOptions()
                    .durability(DurabilityLevel.MAJORITY_AND_PERSIST_TO_ACTIVE)
                    .timeout(configuration.timeouts.kv),
            )
        } else {
            val document = existing.contentAsObject()
            if (
                document.getString("documentType") != BOARD_COMPOSITION_DOCUMENT_TYPE ||
                document.getInt("schemaVersion") != InitialSchemaMigration.VERSION
            ) {
                throw SchemaMigrationException("board_composition_document")
            }
        }
    }

    private fun validateRecordedMigration(
        record: SchemaMigrationRecord,
        expectedChecks: ProvisioningChecks,
    ) {
        if (
            record.version != InitialSchemaMigration.VERSION ||
            record.name != InitialSchemaMigration.NAME ||
            record.checksum != InitialSchemaMigration.checksum
        ) {
            throw SchemaMigrationException("migration_checksum_mismatch")
        }
        if (
            !record.provisioningChecks.privacyGateSatisfied(configuration.allowCommunityPrivacyLimitations) ||
            record.provisioningChecks != expectedChecks
        ) {
            throw SchemaMigrationException("provisioning_attestation_mismatch")
        }
    }

    private fun boundedGetOptions(): GetOptions =
        GetOptions.getOptions().timeout(configuration.timeouts.kv)
}

class SchemaReadinessChecker(
    private val configuration: PersistenceConfiguration,
) {
    fun check(connection: RuntimeConnection): ReadinessResult {
        val migration =
            connection
                .collection(SCHEMA_MIGRATIONS_COLLECTION_NAME)
                .getOrNull(INITIAL_MIGRATION_KEY, GetOptions.getOptions().timeout(configuration.timeouts.kv))
                ?: return ReadinessResult.unhealthy("migration_missing")
        val record =
            try {
                SchemaMigrationRecord.fromJson(migration.contentAsObject())
            } catch (exception: SchemaMigrationException) {
                return ReadinessResult.unhealthy(exception.reasonCode)
            }
        if (
            record.version !in configuration.minimumSchemaVersion..configuration.maximumSchemaVersion ||
            record.version != configuration.currentSchemaVersion ||
            record.name != InitialSchemaMigration.NAME ||
            record.checksum != InitialSchemaMigration.checksum ||
            !record.provisioningChecks.privacyGateSatisfied(configuration.allowCommunityPrivacyLimitations)
        ) {
            return ReadinessResult.unhealthy("schema_incompatible")
        }

        val composition =
            connection
                .collection(TASKS_COLLECTION_NAME)
                .getOrNull(BOARD_COMPOSITION_KEY, GetOptions.getOptions().timeout(configuration.timeouts.kv))
                ?: return ReadinessResult.unhealthy("board_composition_missing")
        val compositionDocument = composition.contentAsObject()
        val compositionValid =
            try {
                compositionDocument.getString("documentType") == "taskBoardCompositionRevision" &&
                    compositionDocument.getInt("schemaVersion") == InitialSchemaMigration.VERSION
            } catch (_: IllegalStateException) {
                false
            } catch (_: NullPointerException) {
                false
            }
        if (!compositionValid) {
            return ReadinessResult.unhealthy("board_composition_invalid")
        }

        listOf(
            TASKS_COLLECTION_NAME,
            HABITS_COLLECTION_NAME,
            HABIT_PROGRESS_COLLECTION_NAME,
            SCHEMA_MIGRATIONS_COLLECTION_NAME,
        ).forEach { collection ->
            connection.userQuery("SELECT RAW 1 FROM `$collection` LIMIT 1")
        }

        val expectedIndexes =
            mapOf(
                TASKS_COLLECTION_NAME to setOf("idx_tasks_by_dates", "idx_tasks_by_status_transition"),
                HABITS_COLLECTION_NAME to setOf("idx_habits_by_lifecycle"),
                HABIT_PROGRESS_COLLECTION_NAME to setOf("idx_habit_progress_by_period"),
            )
        expectedIndexes.forEach { (collection, indexes) ->
            val actual =
                connection
                    .userQuery(
                        """
                        SELECT RAW name
                        FROM system:indexes
                        WHERE bucket_id = "${configuration.bucketName}"
                          AND scope_id = "$APPLICATION_SCOPE_NAME"
                          AND keyspace_id = "$collection"
                          AND state = "online"
                        """.trimIndent(),
                    ).rowsAs(String::class.java)
                    .toSet()
            if (!actual.containsAll(indexes)) {
                return ReadinessResult.unhealthy("schema_indexes_missing")
            }
        }

        val primaryIndexes =
            connection
                .userQuery(
                    """
                    SELECT RAW name
                    FROM system:indexes
                    WHERE bucket_id = "${configuration.bucketName}"
                      AND scope_id = "$APPLICATION_SCOPE_NAME"
                      AND is_primary = true
                    """.trimIndent(),
                ).rowsAs(String::class.java)
        if (primaryIndexes.isNotEmpty()) {
            return ReadinessResult.unhealthy("primary_index_present")
        }
        return ReadinessResult.ready()
    }
}

private fun sha256(value: String): String =
    MessageDigest
        .getInstance("SHA-256")
        .digest(value.toByteArray(StandardCharsets.UTF_8))
        .joinToString("") { byte -> "%02x".format(byte) }
