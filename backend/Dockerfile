# ---- Stage 1: Dependency caching ----
FROM maven:3.9-eclipse-temurin-17-alpine AS deps
WORKDIR /app

# Copy only POM first so dependencies are cached independently of source changes
COPY pom.xml .
RUN mvn dependency:go-offline -B

# ---- Stage 2: Build ----
FROM deps AS build
WORKDIR /app

COPY src ./src
RUN mvn clean package -DskipTests -B \
    && java -Djarmode=layertools -jar target/*.jar extract --destination /layers

# ---- Stage 3: Production runtime ----
FROM eclipse-temurin:17-jre-alpine AS runtime
WORKDIR /app

# Security: non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Spring Boot layered JAR — ordered from least to most frequently changing
COPY --from=build /layers/dependencies/ ./
COPY --from=build /layers/spring-boot-loader/ ./
COPY --from=build /layers/snapshot-dependencies/ ./
COPY --from=build /layers/application/ ./

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8080

# JVM tuning for containers (respects cgroup memory limits)
ENV JAVA_OPTS="-XX:+UseContainerSupport \
  -XX:MaxRAMPercentage=75.0 \
  -XX:InitialRAMPercentage=50.0 \
  -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS org.springframework.boot.loader.launch.JarLauncher"]
