package dev.pkolosinski.gytt.server.infrastructure

import com.couchbase.client.java.json.JsonObject
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.nio.charset.StandardCharsets
import java.util.Base64

class ProvisioningException(
    val reasonCode: String,
) : IllegalStateException(reasonCode)

class CouchbasePrivacyAttestor(
    private val configuration: PersistenceConfiguration,
    private val httpClient: HttpClient =
        HttpClient
            .newBuilder()
            .connectTimeout(configuration.timeouts.query)
            .build(),
) {
    fun ensureDisabled(credentials: DatabaseCredentials): ProvisioningChecks {
        val telemetry = ensureApplicationTelemetryDisabled(credentials)
        val usage = ensureUsageSharingAndUpdateChecksDisabled(credentials, telemetry.communityEditionLimitation)
        val communityEditionPrivacyLimitationsAccepted =
            telemetry.communityEditionLimitation || usage.communityEditionLimitation
        if (communityEditionPrivacyLimitationsAccepted && !configuration.allowCommunityPrivacyLimitations) {
            throw ProvisioningException("community_privacy_limitation_not_accepted")
        }
        return ProvisioningChecks(
            applicationTelemetryDisabled = telemetry.disabled,
            usageSharingDisabled = usage.disabled,
            updateChecksDisabled = usage.disabled,
            communityEditionPrivacyLimitationsAccepted = communityEditionPrivacyLimitationsAccepted,
        )
    }

    private fun ensureApplicationTelemetryDisabled(credentials: DatabaseCredentials): PrivacySettingResult {
        val endpoint = "${configuration.managementUrl.trimEnd('/')}/settings/appTelemetry"
        val current = request(endpoint, credentials, HttpRequest.BodyPublishers.noBody(), "GET")
        if (isCommunityUnsupportedEndpoint(current)) {
            return PrivacySettingResult(disabled = true, communityEditionLimitation = true)
        }
        requireSuccessful(current, "application_telemetry_settings")
        val currentJson = parseJson(current.body, "application_telemetry_settings")
        if (!isFalse(currentJson, "enabled")) {
            val updated =
                request(
                    endpoint,
                    credentials,
                    HttpRequest.BodyPublishers.ofString("""{"enabled":false}"""),
                    "POST",
                    contentType = "application/json",
                )
            requireSuccessful(updated, "application_telemetry_update")
        }
        val verified =
            request(
                endpoint,
                credentials,
                HttpRequest.BodyPublishers.noBody(),
                "GET",
            )
        requireSuccessful(verified, "application_telemetry_verify")
        val verifiedJson = parseJson(verified.body, "application_telemetry_verify")
        if (!isFalse(verifiedJson, "enabled")) {
            throw ProvisioningException("application_telemetry_enabled")
        }
        return PrivacySettingResult(disabled = true, communityEditionLimitation = false)
    }

    private fun ensureUsageSharingAndUpdateChecksDisabled(
        credentials: DatabaseCredentials,
        communityEditionHint: Boolean,
    ): PrivacySettingResult {
        val endpoint = "${configuration.managementUrl.trimEnd('/')}/settings/stats"
        val current = request(endpoint, credentials, HttpRequest.BodyPublishers.noBody(), "GET")
        requireSuccessful(current, "usage_settings")
        val currentJson = parseJson(current.body, "usage_settings")
        if (!isFalse(currentJson, "sendStats")) {
            val updated =
                request(
                    endpoint,
                    credentials,
                    HttpRequest.BodyPublishers.ofString("sendStats=false"),
                    "POST",
                    contentType = "application/x-www-form-urlencoded",
                )
            if (isCommunitySendStatsRestriction(updated)) {
                return PrivacySettingResult(disabled = false, communityEditionLimitation = true)
            }
            requireSuccessful(updated, "usage_settings_update")
        }
        val verified =
            request(
                endpoint,
                credentials,
                HttpRequest.BodyPublishers.noBody(),
                "GET",
            )
        requireSuccessful(verified, "usage_settings_verify")
        val verifiedJson = parseJson(verified.body, "usage_settings_verify")
        if (!isFalse(verifiedJson, "sendStats")) {
            if (communityEditionHint) {
                return PrivacySettingResult(disabled = false, communityEditionLimitation = true)
            }
            throw ProvisioningException("usage_or_update_checks_enabled")
        }
        return PrivacySettingResult(disabled = true, communityEditionLimitation = false)
    }

    private fun request(
        endpoint: String,
        credentials: DatabaseCredentials,
        body: HttpRequest.BodyPublisher,
        method: String,
        contentType: String = "application/json",
    ): ManagementResponse {
        val requestBuilder =
            HttpRequest
                .newBuilder(URI.create(endpoint))
                .timeout(configuration.timeouts.query)
                .header("Authorization", basicAuthorization(credentials))
                .header("Content-Type", contentType)
        val request =
            when (method) {
                "GET" -> requestBuilder.GET().build()
                "POST" -> requestBuilder.POST(body).build()
                else -> throw ProvisioningException("unsupported_management_method")
            }
        val response =
            try {
                httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8))
            } catch (_: java.io.IOException) {
                throw ProvisioningException("couchbase_management_unavailable")
            } catch (_: InterruptedException) {
                Thread.currentThread().interrupt()
                throw ProvisioningException("couchbase_management_interrupted")
            }
        return ManagementResponse(response.statusCode(), response.body())
    }

    private fun requireSuccessful(
        response: ManagementResponse,
        reason: String,
    ) {
        if (response.status !in 200..299) {
            throw ProvisioningException("couchbase_management_rejected_$reason")
        }
    }

    private fun isCommunityUnsupportedEndpoint(response: ManagementResponse): Boolean =
        response.status == 400 &&
            response.body.contains("enterprise edition", ignoreCase = true)

    private fun isCommunitySendStatsRestriction(response: ManagementResponse): Boolean =
        response.status == 400 &&
            response.body.contains("sendStats cannot be false", ignoreCase = true) &&
            response.body.contains("community edition", ignoreCase = true)

    private fun parseJson(
        body: String,
        reason: String,
    ): JsonObject =
        try {
            JsonObject.fromJson(body)
        } catch (_: RuntimeException) {
            throw ProvisioningException("${reason}_invalid")
        }

    private fun isFalse(
        json: JsonObject,
        field: String,
    ): Boolean {
        val value = json.get(field) ?: return false
        return value == false || value.toString().equals("false", ignoreCase = true)
    }

    private fun basicAuthorization(credentials: DatabaseCredentials): String {
        val encoded =
            Base64
                .getEncoder()
                .encodeToString("${credentials.username}:${credentials.password}".toByteArray(StandardCharsets.UTF_8))
        return "Basic $encoded"
    }

    private data class PrivacySettingResult(
        val disabled: Boolean,
        val communityEditionLimitation: Boolean,
    )

    private data class ManagementResponse(
        val status: Int,
        val body: String,
    )
}
