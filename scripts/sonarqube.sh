#!/usr/bin/env bash

# ==============================================================================
# SonarQube on Podman Lifecycle Management Script
# ==============================================================================
# Usage:
#   ./scripts/sonarqube.sh start   - Start or resume SonarQube container
#   ./scripts/sonarqube.sh stop    - Stop SonarQube container
#   ./scripts/sonarqube.sh restart - Restart SonarQube container
#   ./scripts/sonarqube.sh status  - Check SonarQube container status & health
#   ./scripts/sonarqube.sh logs    - Stream container logs
#   ./scripts/sonarqube.sh clean   - Remove container & persistent volumes
# ==============================================================================

set -euo pipefail

CONTAINER_NAME="cajero-sonarqube"
IMAGE_NAME="docker.io/library/sonarqube:lts-community"
PORT="9000"
DATA_VOLUME="cajero_sonarqube_data"
EXT_VOLUME="cajero_sonarqube_extensions"
LOGS_VOLUME="cajero_sonarqube_logs"

# Ensure podman is available
if ! command -v podman >/dev/null 2>&1; then
  echo "❌ Error: Podman is not installed or not in PATH."
  exit 1
fi

# Ensure podman machine is running on macOS if applicable
ensure_podman_machine() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    if ! podman system connection list >/dev/null 2>&1 || ! podman info >/dev/null 2>&1; then
      echo "ℹ️  Podman machine is not running. Starting podman machine..."
      podman machine start || true
    fi
  fi
}

start_sonarqube() {
  ensure_podman_machine

  # Check if container already exists
  if podman ps -a --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
    if podman ps --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
      echo "✅ SonarQube container '${CONTAINER_NAME}' is already running at http://localhost:${PORT}"
      return 0
    fi
    echo "🚀 Starting existing container '${CONTAINER_NAME}'..."
    podman start "${CONTAINER_NAME}"
  else
    echo "📦 Creating persistent volumes..."
    podman volume create "${DATA_VOLUME}" >/dev/null 2>&1 || true
    podman volume create "${EXT_VOLUME}" >/dev/null 2>&1 || true
    podman volume create "${LOGS_VOLUME}" >/dev/null 2>&1 || true

    echo "🚀 Launching SonarQube container '${CONTAINER_NAME}' on port ${PORT}..."
    podman run -d \
      --name "${CONTAINER_NAME}" \
      -p "${PORT}:9000" \
      -v "${DATA_VOLUME}:/opt/sonarqube/data:Z" \
      -v "${EXT_VOLUME}:/opt/sonarqube/extensions:Z" \
      -v "${LOGS_VOLUME}:/opt/sonarqube/logs:Z" \
      -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true \
      "${IMAGE_NAME}"
  fi

  echo ""
  echo "🎉 SonarQube is starting up!"
  echo "🌐 URL: http://localhost:${PORT}"
  echo "🔑 Default Credentials: admin / admin"
  echo "⏳ Note: Initial startup may take 30-60 seconds for Elasticsearch & plugins to initialize."
  echo "💡 Tip: Run 'yarn sonarqube:logs' or './scripts/sonarqube.sh logs' to follow progress."
}

stop_sonarqube() {
  ensure_podman_machine
  if podman ps --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
    echo "🛑 Stopping '${CONTAINER_NAME}'..."
    podman stop "${CONTAINER_NAME}"
    echo "✅ SonarQube stopped."
  else
    echo "ℹ️  Container '${CONTAINER_NAME}' is not running."
  fi
}

restart_sonarqube() {
  stop_sonarqube
  start_sonarqube
}

status_sonarqube() {
  ensure_podman_machine
  echo "📊 SonarQube Podman Status:"
  if podman ps --format "{{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -q "^${CONTAINER_NAME}"; then
    echo "  Status: RUNNING"
    podman ps --filter "name=${CONTAINER_NAME}" --format "  ID: {{.ID}}\n  Image: {{.Image}}\n  Status: {{.Status}}\n  Ports: {{.Ports}}"
    echo ""
    echo "🌐 Access: http://localhost:${PORT}"
  elif podman ps -a --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
    echo "  Status: STOPPED (Container exists)"
  else
    echo "  Status: NOT CREATED"
  fi
}

logs_sonarqube() {
  ensure_podman_machine
  echo "📜 Streaming logs from '${CONTAINER_NAME}' (Press Ctrl+C to exit)..."
  podman logs -f "${CONTAINER_NAME}"
}

clean_sonarqube() {
  ensure_podman_machine
  echo "⚠️  Cleaning SonarQube container and persistent volumes..."
  if podman ps -a --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
    podman stop "${CONTAINER_NAME}" >/dev/null 2>&1 || true
    podman rm "${CONTAINER_NAME}"
    echo "✅ Removed container '${CONTAINER_NAME}'"
  fi

  podman volume rm "${DATA_VOLUME}" "${EXT_VOLUME}" "${LOGS_VOLUME}" >/dev/null 2>&1 || true
  echo "✅ Removed persistent volumes."
  echo "🎉 Full cleanup completed."
}

case "${1:-}" in
  start)
    start_sonarqube
    ;;
  stop)
    stop_sonarqube
    ;;
  restart)
    restart_sonarqube
    ;;
  status)
    status_sonarqube
    ;;
  logs)
    logs_sonarqube
    ;;
  clean)
    clean_sonarqube
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status|logs|clean}"
    exit 1
    ;;
esac
