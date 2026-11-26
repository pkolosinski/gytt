package dev.pkolosinski.gyst.server

import com.couchbase.client.kotlin.Cluster
import com.github.f4b6a3.ulid.UlidCreator
import dev.pkolosinski.gyst.core.task.TaskId
import dev.pkolosinski.gyst.core.task.taskFacade
import dev.pkolosinski.gyst.server.infrastructure.CouchbaseProperties
import dev.pkolosinski.gyst.server.infrastructure.ReadinessResult
import dev.pkolosinski.gyst.server.infrastructure.configureInfrastructureModule
import dev.pkolosinski.gyst.server.tasks.CouchbaseTaskStore
import dev.pkolosinski.gyst.server.tasks.tasksModule
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
                "dev.pkolosinski.gyst.server",
            ).warn("Couchbase readiness check failed: {}", exception::class.simpleName)
            ReadinessResult.unhealthy("database_unavailable")
        }
    }
    tasksModule(
        taskFacade(
            CouchbaseTaskStore(cluster, couchbaseProperties.bucket),
            idGenerator = { TaskId(UlidCreator.getUlid().toString()) },
        ),
    )
    routing {
        staticResources("/", "web")
    }
}
