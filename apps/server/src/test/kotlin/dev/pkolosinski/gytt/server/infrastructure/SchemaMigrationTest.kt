package dev.pkolosinski.gytt.server.infrastructure

import com.couchbase.client.java.json.JsonObject
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe

class SchemaMigrationTest : FunSpec({
    test("serializes a deterministic discriminated migration document") {
        val checks = ProvisioningChecks(true, true, true)
        val record = InitialSchemaMigration.record(checks)

        SchemaMigrationRecord.fromJson(record.toJson()) shouldBe record
        record.toJson().getString("documentType") shouldBe "schemaMigration"
        record.checksum.matches(Regex("[0-9a-f]{64}")) shouldBe true
    }

    test("rejects a migration document with the wrong discriminator") {
        val document =
            InitialSchemaMigration
                .record(ProvisioningChecks(true, true, true))
                .toJson()
                .put("documentType", "task")

        shouldThrow<SchemaMigrationException> {
            SchemaMigrationRecord.fromJson(document)
        }.reasonCode shouldBe "migration_document_invalid"
    }

    test("records every privacy attestation independently") {
        val document =
            InitialSchemaMigration
                .record(
                    ProvisioningChecks(
                        applicationTelemetryDisabled = true,
                        usageSharingDisabled = false,
                        updateChecksDisabled = true,
                    ),
                ).toJson()

        val checks = document.getObject("provisioningChecks")
        checks.getBoolean("applicationTelemetryDisabled") shouldBe true
        checks.getBoolean("usageSharingDisabled") shouldBe false
        checks.getBoolean("updateChecksDisabled") shouldBe true
        checks.getBoolean("communityEditionPrivacyLimitationsAccepted") shouldBe false
    }

    test("allows an explicitly accepted Community Edition privacy limitation") {
        ProvisioningChecks(
            applicationTelemetryDisabled = true,
            usageSharingDisabled = false,
            updateChecksDisabled = false,
            communityEditionPrivacyLimitationsAccepted = true,
        ).privacyGateSatisfied(allowCommunityPrivacyLimitations = true) shouldBe true

        ProvisioningChecks(
            applicationTelemetryDisabled = true,
            usageSharingDisabled = false,
            updateChecksDisabled = false,
            communityEditionPrivacyLimitationsAccepted = true,
        ).privacyGateSatisfied(allowCommunityPrivacyLimitations = false) shouldBe false
    }

    test("does not accept an empty migration document") {
        shouldThrow<SchemaMigrationException> {
            SchemaMigrationRecord.fromJson(JsonObject.create())
        }.reasonCode shouldBe "migration_document_invalid"
    }
})
