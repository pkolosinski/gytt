package dev.pkolosinski.gytt.server

import com.couchbase.client.kotlin.Cluster
import dev.pkolosinski.gytt.core.tasks.Tasks
import dev.pkolosinski.gytt.server.infrastructure.CouchbaseProperties
import dev.pkolosinski.gytt.server.infrastructure.ReadinessResult
import dev.pkolosinski.gytt.server.infrastructure.configureInfrastructureModule
import dev.pkolosinski.gytt.server.tasks.CouchbaseTaskStore
import dev.pkolosinski.gytt.server.tasks.tasksModule
import io.ktor.server.application.Application
import io.ktor.server.application.ApplicationStopped
import io.ktor.server.config.property
import io.ktor.server.http.content.staticResources
import io.ktor.server.netty.EngineMain
import io.ktor.server.routing.routing
import kotlinx.coroutines.runBlocking
import org.slf4j.LoggerFactory

fun main(args: Array<String>) = EngineMain.main(args)

fun Application.rootModule() {
    val couchbaseProperties = property<CouchbaseProperties>("couchbase")
    val cluster = Cluster.connect(
        couchbaseProperties.url,
        couchbaseProperties.username,
        couchbaseProperties.password,
    )
    monitor.subscribe(ApplicationStopped) { runBlocking { cluster.disconnect() } }
    val bucket = cluster.bucket(couchbaseProperties.bucket)

    configureInfrastructureModule {
        try {
            bucket.ping()
            ReadinessResult.ready()
        } catch (exception: com.couchbase.client.core.error.CouchbaseException) {
            LoggerFactory.getLogger(
                "dev.pkolosinski.gytt.server",
            ).warn("Couchbase readiness check failed: {}", exception::class.simpleName)
            ReadinessResult.unhealthy("database_unavailable")
        }
    }
    tasksModule(Tasks(CouchbaseTaskStore(cluster, couchbaseProperties.bucket)))
    routing {
        staticResources("/", "web")
    }
}
