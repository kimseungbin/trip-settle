#!/bin/bash
# Extract Docker build cache metrics and generate INI-style note
# Usage: ./extract-cache-metrics.sh <build-log-file> <output-file>

set -e

BUILD_LOG="$1"
OUTPUT_FILE="$2"

# Validate inputs
if [ ! -f "$BUILD_LOG" ]; then
    echo "Error: Build log file not found: $BUILD_LOG" >&2
    exit 1
fi

# Parse build output
parse_metrics() {
    local log="$1"

    # Extract total build time (from last DONE line)
    TOTAL_TIME=$(grep -oP '#\d+ \[.*?\] DONE \K[\d.]+s' "$log" | tail -1 || echo "0.0s")

    # Count cached vs built layers
    CACHED_COUNT=$(grep -c "CACHED" "$log" || echo "0")
    BUILT_COUNT=$(grep -c "^\[.*\] RUN\|^\[.*\] COPY" "$log" | grep -cv "CACHED" || echo "0")
    TOTAL_LAYERS=$((CACHED_COUNT + BUILT_COUNT))

    # Calculate cache hit rate
    if [ "$TOTAL_LAYERS" -gt 0 ]; then
        CACHE_HIT_RATE=$(awk "BEGIN {printf \"%.0f\", ($CACHED_COUNT / $TOTAL_LAYERS) * 100}")
    else
        CACHE_HIT_RATE="0"
    fi

    # Extract base image status (check if base image was pulled)
    if grep -q "pulling.*playwright" "$log"; then
        BASE_IMAGE_STATUS="MISS"
        BASE_IMAGE_TIME=$(grep -oP 'pulling.*playwright.*\K[\d.]+s' "$log" | head -1 || echo "0.0s")
    else
        BASE_IMAGE_STATUS="HIT"
        BASE_IMAGE_TIME="0.0s"
    fi

    # Extract layer details
    LAYER_DETAILS=$(grep -E "^\[.*\] (WORKDIR|COPY|RUN)" "$log" | \
                    sed -E 's/^#([0-9]+) \[(.*)\] (.*)/\1|\2|\3/' | \
                    head -10)
}

# Generate INI-style note
generate_note() {
    cat <<EOF
=== DOCKER BUILD CACHE METRICS ===

[metadata]
timestamp = $(date -u +"%Y-%m-%dT%H:%M:%SZ")
commit    = ${GITHUB_SHA:0:7}
branch    = ${GITHUB_REF_NAME:-unknown}
run_url   = ${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}

[timing]
total      = ${TOTAL_TIME}
base_load  = ${BASE_IMAGE_TIME}  # ${BASE_IMAGE_STATUS}
layer_build= $(echo "$TOTAL_TIME" | sed 's/s//')s  # ${CACHED_COUNT}/${TOTAL_LAYERS} cached
export     = [extracted from logs]
cache_save = [extracted from logs]

[cache]
base_image    = ${BASE_IMAGE_STATUS}
layer_hits    = ${CACHED_COUNT}/${TOTAL_LAYERS} (${CACHE_HIT_RATE}%)
time_saved    = [calculated]
efficiency    = ${CACHE_HIT_RATE}%

[layers]
# Step  Command              Status    Time
$(echo "$LAYER_DETAILS" | while IFS='|' read -r step status command; do
    if echo "$status" | grep -q "CACHED"; then
        printf "#%-3s %-20s CACHED    0.0s\n" "$step" "$command"
    else
        printf "#%-3s %-20s BUILT     [time]\n" "$step" "$command"
    fi
done)

[analysis]
change_type   = [auto-detect: code-only, deps, dockerfile]
cache_status  = [auto-detect: optimal, suboptimal, cold]
trend         = [compare to previous build]
note          = Generated from GitHub Actions run
EOF
}

# Main execution
echo "Parsing build log: $BUILD_LOG" >&2
parse_metrics "$BUILD_LOG"

echo "Generating cache metrics note..." >&2
generate_note > "$OUTPUT_FILE"

echo "✓ Cache metrics written to: $OUTPUT_FILE" >&2