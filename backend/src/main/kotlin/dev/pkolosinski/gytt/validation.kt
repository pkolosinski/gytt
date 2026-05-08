package dev.pkolosinski.gytt

import io.ktor.server.application.ApplicationCall
import io.ktor.server.request.receive

@JvmInline
value class ValidationError(
    val message: String,
)

sealed interface ValidationResult<T> {
    data class Valid<T>(
        val value: T,
    ) : ValidationResult<T>

    data class Invalid(
        val reasons: List<ValidationError>,
    ) : ValidationResult<Nothing> {
        constructor(reason: ValidationError) : this(listOf(reason))
        constructor(reason: String) : this(ValidationError(reason))
    }
}

context(errors: MutableList<ValidationError>)
fun ensure(
    condition: Boolean,
    errorMsg: String,
) {
    if (!condition) errors.add(ValidationError(errorMsg))
}

fun <T> validated(
    value: T,
    validator: context(MutableList<ValidationError>) T.() -> Unit,
): ValidationResult<out T> {
    val errors = mutableListOf<ValidationError>()
    with(errors) {
        value.validator()
    }
    return if (errors.isEmpty()) {
        ValidationResult.Valid(value)
    } else {
        ValidationResult.Invalid(errors)
    }
}

interface Validatable<T> {
    fun validate(): ValidationResult<out T>
}

data class SampleDto(
    val name: String = "Ala",
    val age: Int = 12,
) : Validatable<SampleDto> {
    override fun validate(): ValidationResult<out SampleDto> =
        validated(this) {
            ensure(name.isNotBlank(), "Name cannot be blank")
            ensure(age > 0, "Age must be positive")
        }
}

suspend inline fun <reified T : Validatable<T>> ApplicationCall.receiveValidated(): ValidationResult<out T> =
    runCatching { receive<T>() }
        .fold(
            onSuccess = { it.validate() },
            onFailure = { ValidationResult.Invalid(it.message.orEmpty()) },
        )
