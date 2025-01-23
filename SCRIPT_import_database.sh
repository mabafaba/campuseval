#!/bin/bash
set -x

# Variables
DUMP_FILE="./campuseval_db.dump.tar.gz"
CONTAINER_NAME="campuseval-mongodb"
DB_NAME="campuseval"

# Check if the dump file exists
if [ ! -f "$DUMP_FILE" ]; then
    echo "Dump file not found: $DUMP_FILE"
    exit 1
fi

# Copy the dump file to the Docker container
docker cp "$DUMP_FILE" "$CONTAINER_NAME:/tmp/"

# Extract the dump file inside the Docker container
docker exec -it "$CONTAINER_NAME" tar -zxvf "/tmp/$(basename $DUMP_FILE)" -C /tmp/
 
# Import the database
# explanation of the following line:
# exec -it "$CONTAINER_NAME": executes the command inside the specified Docker container
# - `--uri="mongodb://campuseval-mongodb:27017"`: specifies the URI of the MongoDB server
# - `--db="$DB_NAME"`: specifies the name of the database to restore
# - `"/tmp/campuseval_db.dump/$DB_NAME"`: specifies the path to the dump file to restore

docker exec -it "$CONTAINER_NAME" mongorestore --uri="mongodb://campuseval-mongodb:27017" --db="$DB_NAME" "/tmp/campuseval_db.dump/$DB_NAME"

# Clean up
docker exec -it "$CONTAINER_NAME" rm -rf "/tmp/$(basename $DUMP_FILE)" "/tmp/campuseval_db.dump"

echo "Database import completed successfully."