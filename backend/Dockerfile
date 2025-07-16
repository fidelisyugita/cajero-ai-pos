# Stage 1: Build the JAR
FROM eclipse-temurin:17-jdk-jammy as builder
# FROM gradle:8.4-jdk17 AS builder
WORKDIR /app
COPY . .
RUN ./gradlew build -x test  # Skip tests during Docker build

# Stage 2: Run the JAR
FROM eclipse-temurin:17-jre-jammy
COPY --from=builder /app/build/libs/app.jar app.jar
# EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]