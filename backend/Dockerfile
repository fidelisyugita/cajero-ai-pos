# Stage 1: Build the JAR
# FROM eclipse-temurin:17-jdk-jammy as builder
FROM gradle:8.4-jdk17 AS builder
WORKDIR /app
COPY . .
# COPY --chown=gradle:gradle . .
# RUN ./gradlew build
RUN ./gradlew build -x test  # Skip tests during Docker build
# RUN gradle build --no-daemon --stacktrace

# Stage 2: Run the JAR
# FROM eclipse-temurin:17-jre-jammy
# WORKDIR /app
# COPY --from=builder /app/build/libs/cajero-spring.jar .
# EXPOSE 8080
# ENTRYPOINT ["java", "-jar", "cajero-spring.jar"]

FROM eclipse-temurin:17-jre
# COPY --from=builder /app/build/libs/cajero-spring.jar .
# ENTRYPOINT ["java", "-jar", "cajero-spring.jar"]
COPY --from=builder /app/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]