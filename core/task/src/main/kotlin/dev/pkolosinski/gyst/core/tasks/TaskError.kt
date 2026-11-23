package dev.pkolosinski.gyst.core.tasks

import java.util.UUID

/** An invalid input value. [field] is a path such as `steps[1].name`. */
data class Violation(val field: String, val message: String)

sealed interface TaskError {
    data class Invalid(val violations: List<Violation>) : TaskError

    data class NotFound(val id: UUID) : TaskError

    /** The Task changed since the revision the caller last saw; nothing was written. */
    data class RevisionMismatch(val id: UUID) : TaskError
}
