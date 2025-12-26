# Stage 1: Build the JAR
# FROM eclipse-temurin:17-jdk-jammy AS builder
FROM gradle:8.4-jdk17 AS builder
WORKDIR /app
COPY build.gradle settings.gradle gradlew ./
COPY gradle ./gradle
RUN chmod +x gradlew
RUN ./gradlew dependencies --no-daemon

COPY src ./src
RUN ./gradlew build -x test --no-daemon

# Stage 2: Run the JAR
FROM eclipse-temurin:17-jre-jammy
COPY --from=builder /app/build/libs/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
