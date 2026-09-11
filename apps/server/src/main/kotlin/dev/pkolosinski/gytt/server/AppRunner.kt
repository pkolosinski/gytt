package dev.pkolosinski.gytt.server

import com.couchbase.client.kotlin.Cluster
import dev.pkolosinski.gytt.server.infrastructure.CouchbaseRuntime
import dev.pkolosinski.gytt.server.infrastructure.PersistenceConfiguration
import dev.pkolosinski.gytt.server.infrastructure.SchemaReadinessChecker
import dev.pkolosinski.gytt.server.infrastructure.configureInfrastructureModule
import io.ktor.server.application.Application
import io.ktor.server.application.ApplicationStopped
import io.ktor.server.engine.embeddedServer
import io.ktor.server.http.content.staticResources
import io.ktor.server.routing.routing

fun main(args: Array<String>) {
    embeddedServer(
        factory = io.ktor.server.netty.Netty,
        port = 8080,
        host = "0.0.0.0",
        module = Application::rootModule,
    ).start(wait = true)
}

data class Env(
    val couchbase: Couchbase = Couchbase()
) {
    data class Couchbase(
        val connectionString: String = System.getenv("COUCHBASE_URL") ?: "couchbase://localhost",
        val username: String = System.getenv("COUCHBASE_USERNAME") ?: "user",
        val password: String = System.getenv("COUCHBASE_PASSWORD") ?: "password",
    )
}

fun Application.rootModule() {
    val env = Env()
    val cluster = Cluster.connect(
        connectionString = env.couchbase.connectionString,
        username = env.couchbase.username,
        password = env.couchbase.password,
    )

    val configuration = PersistenceConfiguration.fromEnvironment()
    val persistence = CouchbaseRuntime(configuration)
    val readinessChecker = SchemaReadinessChecker(configuration)

    monitor.subscribe(ApplicationStopped) {
        persistence.close()
    }
    configureInfrastructureModule(persistence, readinessChecker)

    routing {
        staticResources("/", "web")
    }
}
