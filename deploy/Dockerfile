# Build the browser application with the toolchain owned by apps/web.
FROM node:24.21.0-slim AS web-build

WORKDIR /workspace/apps/web

RUN corepack enable

COPY apps/web/package.json apps/web/pnpm-lock.yaml apps/web/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY apps/web/ ./
RUN pnpm build

# Build the Ktor application with the Gradle version provided by the builder image.
FROM gradle:9.7.1-jdk17 AS server-build

USER root
WORKDIR /workspace

COPY settings.gradle.kts gradle.properties ./
COPY gradle/libs.versions.toml ./gradle/libs.versions.toml
COPY build-logic/ ./build-logic/
COPY apps/server/ ./apps/server/
COPY core/ ./core/

# Package the compiled SPA as Ktor classpath resources.
COPY --from=web-build /workspace/apps/web/dist ./apps/server/src/main/resources/web

RUN chown -R gradle:gradle /workspace

USER gradle

RUN gradle :apps:server:buildFatJar --no-daemon

# Run only the packaged application and its local assets.
FROM eclipse-temurin:17.0.16_8-jre-noble AS runtime

WORKDIR /app

RUN groupadd --system --gid 10001 gytt \
    && useradd --system --uid 10001 --gid 10001 --home-dir /nonexistent --no-create-home gytt

COPY --from=server-build /workspace/apps/server/build/libs/*-all.jar /app/gytt.jar

USER 10001:10001

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/gytt.jar"]
