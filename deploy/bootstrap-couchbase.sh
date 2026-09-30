#!/bin/bash
set -euo pipefail

COUCHBASE_HOST="${COUCHBASE_HOST:-couchbase}"
COUCHBASE_PORT="${COUCHBASE_PORT:-8091}"
ADMIN_USER="${ADMIN_USER:-admin}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-password}"
APP_USER="${APP_USER:-gytt-app}"
APP_PASSWORD="${APP_PASSWORD:-gytt-app-password}"
BUCKET_NAME="${BUCKET_NAME:-gytt}"
COLLECTIONS=("tasks" "habits")

CLI=(couchbase-cli)
COUCHBASE_ENDPOINT="couchbase://${COUCHBASE_HOST}"
COUCHBASE_URL="http://${COUCHBASE_HOST}:${COUCHBASE_PORT}"
COMMON_ARGS=(
    --cluster "$COUCHBASE_ENDPOINT"
    --username "$ADMIN_USER"
    --password "$ADMIN_PASSWORD"
)

# Wait for the Couchbase management endpoint to be ready.
wait_for_couchbase() {
    local max_wait=60
    local waited=0
    echo "Waiting for Couchbase Server to be ready..."
    while [ $waited -lt $max_wait ]; do
        if curl --fail --silent --show-error --max-time 2 \
            --output /dev/null "$COUCHBASE_URL/ui/index.html" 2>/dev/null; then
            echo "Couchbase Server is ready"
            return 0
        fi
        sleep 1
        waited=$((waited + 1))
    done
    echo "Timeout waiting for Couchbase Server"
    return 1
}

# Check if the cluster is initialized.
cluster_initialized() {
    "${CLI[@]}" bucket-list "${COMMON_ARGS[@]}" > /dev/null 2>&1
}

# Check if a bucket exists.
bucket_exists() {
    local bucket="$1"
    local output
    output=$("${CLI[@]}" bucket-list "${COMMON_ARGS[@]}")
    grep -Fqx -- "$bucket" <<<"$output"
}

# Check if collection exists in bucket
collection_exists() {
    local bucket="$1"
    local collection="$2"
    local output
    output=$(
        "${CLI[@]}" collection-manage "${COMMON_ARGS[@]}" \
            --bucket "$bucket" \
            --list-collections "_default"
    )
    grep -Fq -- "- $collection" <<<"$output"
}

ensure_application_user() {
    if [[ "$APP_USER" == "$ADMIN_USER" ]]; then
        echo "Application user must differ from the Couchbase administrator" >&2
        return 1
    fi
    if [[ -z "$APP_PASSWORD" ]]; then
        echo "Application password must not be empty" >&2
        return 1
    fi

    echo "Configuring bucket-scoped application user '$APP_USER'..."
    "${CLI[@]}" user-manage \
        "${COMMON_ARGS[@]}" \
        --set \
        --rbac-username "$APP_USER" \
        --rbac-password "$APP_PASSWORD" \
        --roles "bucket_full_access[$BUCKET_NAME]" \
        --auth-domain local
}

# Main execution
wait_for_couchbase

# Check if cluster is already initialized
if cluster_initialized; then
    echo "Cluster already initialized"
else
    # Initialize the cluster
    echo "Initializing Couchbase cluster..."
    if ! "${CLI[@]}" cluster-init \
        --cluster "$COUCHBASE_ENDPOINT" \
        --cluster-username "${ADMIN_USER}" \
        --cluster-password "${ADMIN_PASSWORD}" \
        --services data,index,query \
        --cluster-ramsize 512 \
        --cluster-index-ramsize 256 \
        --cluster-query-ramsize 256; then
        echo "Failed to initialize cluster" >&2
        exit 1
    fi
    echo "Cluster initialized successfully"
fi

# Check if bucket already exists
if bucket_exists "$BUCKET_NAME"; then
    echo "Bucket '$BUCKET_NAME' already exists"
else
    # Create bucket
    echo "Creating bucket '$BUCKET_NAME'..."
    if ! "${CLI[@]}" bucket-create \
        "${COMMON_ARGS[@]}" \
        --bucket "${BUCKET_NAME}" \
        --bucket-type couchbase \
        --storage-backend couchstore \
        --bucket-ramsize 256 \
        --bucket-replica 0 \
        --wait; then
        echo "Failed to create bucket" >&2
        exit 1
    fi
    echo "Bucket '$BUCKET_NAME' created successfully"
fi

ensure_application_user

# Create collections in the default scope
for collection in "${COLLECTIONS[@]}"; do
    # Check if collection already exists
    if collection_exists "$BUCKET_NAME" "$collection"; then
        echo "Collection '$collection' already exists in bucket '$BUCKET_NAME'"
    else
        echo "Creating collection '$collection' in bucket '$BUCKET_NAME'..."
        if ! "${CLI[@]}" collection-manage \
            "${COMMON_ARGS[@]}" \
            --bucket "${BUCKET_NAME}" \
            --create-collection "_default.${collection}"; then
            echo "Failed to create collection '$collection'" >&2
            exit 1
        fi
        echo "Collection '$collection' created successfully"
    fi
done

echo "Couchbase bootstrap completed successfully"
