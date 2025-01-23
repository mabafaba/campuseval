# shell script (ios/ubuntu) to export the database from mongodb

# export the database
mongodump --uri="mongodb://localhost:27017" --db=campuseval --out=./campuseval_db.dump

# compress the database
tar -zcvf ./campuseval_db.dump.tar.gz ./campuseval_db.dump
