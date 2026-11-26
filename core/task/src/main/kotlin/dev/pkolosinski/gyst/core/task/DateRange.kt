package dev.pkolosinski.gyst.core.task

import java.time.LocalDate

data class DateRange(val from: LocalDate, val to: LocalDate) {
    init {
        require(!from.isAfter(to)) { "from=$from must not be after to=$to" }
    }
}
