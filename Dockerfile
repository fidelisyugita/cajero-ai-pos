# Stage 1: Build the JAR
FROM eclipse-temurin:17-jdk-jammy as builder
WORKDIR /app
COPY . .
# RUN ./gradlew build
RUN ./gradlew build -x test  # Skip tests during Docker build

# Stage 2: Run the JAR
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=builder /app/build/libs/cajero-spring.jar .
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "cajero-spring.jar"]