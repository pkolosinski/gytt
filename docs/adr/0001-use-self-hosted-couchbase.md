# 0001 — Use self-hosted Couchbase

Accepted. GYTT will use a single self-hosted Couchbase Server Community node with zero replicas, deployed separately from the application in one Compose project. This preserves the private data boundary and establishes a document store suitable for later clients, at the accepted cost of higher operating overhead and no failover or protection from loss of the only database volume.
