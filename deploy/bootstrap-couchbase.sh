#!/bin/bash
set -euo pipefail

# Couchbase bootstrap script for GYTT
# Creates single-node cluster, bucket, and collections (tasks, habits)
# Idempotent - won't create resources if they already exist
# Uses couchbase-cli where possible

COUCHBASE_HOST="${COUCHBASE_HOST:-couchbase}"
COUCHBASE_PORT="${COUCHBASE_PORT:-8091}"
ADMIN_USER="${ADMIN_USER:-Administrator}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-password}"
BUCKET_NAME="${BUCKET_NAME:-gytt}"

CLI="couchbase-cli"
CLI_OPTS="--cluster ${COUCHBASE_HOST}:${COUCHBASE_PORT} --username ${ADMIN_USER} --password ${ADMIN_PASSWORD}"

# Wait for Couchbase to be ready using couchbase-cli
wait_for_couchbase() {
    local max_wait=60
    local waited=0
    echo "Waiting for Couchbase to be ready..."
    while [ $waited -lt $max_wait ]; do
        # Try to get cluster version - if it works, couchbase is ready
        if $CLI version --cluster "${COUCHBASE_HOST}:${COUCHBASE_PORT}" > /dev/null 2>&1; then
            echo "Couchbase is ready"
            return 0
        fi
        sleep 1
        waited=$((waited + 1))
    done
    echo "Timeout waiting for Couchbase"
    return 1
}

# Check if cluster is initialized by listing buckets
cluster_initialized() {
    $CLI bucket-list $CLI_OPTS > /dev/null 2>&1
    return $?
}

# Check if bucket exists
bucket_exists() {
    local bucket="$1"
    $CLI bucket-list $CLI_OPTS 2>/dev/null | grep -q "^${bucket}$"
    return $?
}

# Check if collection exists in bucket
collection_exists() {
    local bucket="$1"
    local collection="$2"
    $CLI collection-manage list $CLI_OPTS --bucket "$bucket" 2>/dev/null | grep -q "^${collection}$"
    return $?
}

# Main execution
wait_for_couchbase || exit 1

# Check if cluster is already initialized
if cluster_initialized; then
    echo "Cluster already initialized"
else
    # Initialize the cluster
    echo "Initializing Couchbase cluster..."
    if ! $CLI cluster-init \
        --cluster "${COUCHBASE_HOST}:${COUCHBASE_PORT}" \
        --cluster-username "${ADMIN_USER}" \
        --cluster-password "${ADMIN_PASSWORD}" \
        --services data,index,query \
        --cluster-ramsize 512 \
        --index-ramsize 256 \
        --query-ramsize 256 \
        --no-wait; then
        echo "Failed to initialize cluster"
        exit 1
    fi
    
    # Wait for cluster to be ready
    echo "Waiting for cluster initialization..."
    max_wait=60
    waited=0
    while [ $waited -lt $max_wait ]; do
        if cluster_initialized; then
            echo "Cluster initialized successfully"
            break
        fi
        sleep 1
        waited=$((waited + 1))
    done
    
    if [ $waited -ge $max_wait ]; then
        echo "Timeout waiting for cluster initialization"
        exit 1
    fi
fi

# Check if bucket already exists
if bucket_exists "$BUCKET_NAME"; then
    echo "Bucket '$BUCKET_NAME' already exists"
else
    # Create bucket
    echo "Creating bucket '$BUCKET_NAME'..."
    if ! $CLI bucket-create \
        $CLI_OPTS \
        --bucket "${BUCKET_NAME}" \
        --bucket-type couchbase \
        --bucket-ramsize 256 \
        --wait; then
        echo "Failed to create bucket"
        exit 1
    fi
    echo "Bucket '$BUCKET_NAME' created successfully"
fi

# Create collections in the default scope
for collection in "tasks" "habits"; do
    # Check if collection already exists
    if collection_exists "$BUCKET_NAME" "$collection"; then
        echo "Collection '$collection' already exists in bucket '$BUCKET_NAME'"
    else
        echo "Creating collection '$collection' in bucket '$BUCKET_NAME'..."
        if ! $CLI collection-manage create \
            $CLI_OPTS \
            --bucket "${BUCKET_NAME}" \
            --scope "_default" \
            --collection "${collection}" \
            --max-ttl 0; then
            echo "Failed to create collection '$collection'"
            exit 1
        fi
        echo "Collection '$collection' created successfully"
    fi
done

echo "Couchbase bootstrap completed successfully"
exit 0
