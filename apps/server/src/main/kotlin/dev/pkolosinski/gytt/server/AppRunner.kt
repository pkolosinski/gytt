package dev.pkolosinski.gytt.server

import com.couchbase.client.kotlin.Cluster
import dev.pkolosinski.gytt.server.infrastructure.CouchbaseProperties
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.config.property
import io.ktor.server.http.content.staticResources
import io.ktor.server.netty.EngineMain
import io.ktor.server.response.respond
import io.ktor.server.routing.get
import io.ktor.server.routing.routing

fun main(args: Array<String>) = EngineMain.main(args)

fun Application.rootModule() {
    val couchbaseProperties = property<CouchbaseProperties>("couchbase")
    val cluster = Cluster.connect(
        couchbaseProperties.url,
        couchbaseProperties.username,
        couchbaseProperties.password,
    )
    val bucket = cluster.bucket(couchbaseProperties.url)

    routing {
        staticResources("/", "web")

get("/health/live") {
            call.respond(HttpStatusCode.OK)
        }
        get("/health/ready") {
            try {
                bucket.ping()
                call.respond(HttpStatusCode.OK)
            } catch (_: Exception) {
                call.respond(HttpStatusCode.ServiceUnavailable)
            }
        }
    }
}

// DO NOT DELETE THIS COMMENTED PART AND RELATED FILES
// fun Application.rootModule() {
//    val persistence = CouchbaseRuntime(CouchbaseConfiguration.fromEnvironment())
//
//    monitor.subscribe(ApplicationStopped) {
//        persistence.close()
//    }
//    configureRootModule(persistence::readiness)
// }
//
// internal fun Application.rootModule(readinessCheck: suspend () -> ReadinessResult) {
//    configureRootModule(readinessCheck)
// }
//
// private fun Application.configureRootModule(readinessCheck: suspend () -> ReadinessResult) {
//    configureInfrastructureModule(readinessCheck)
//    routing {
//        staticResources("/", "web")
//    }
// }
