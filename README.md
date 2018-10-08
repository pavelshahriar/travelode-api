# Travelode REST API
1. Clone the github project : `git clone git@github.com:pavelshahriar/travelode-api.git`
2. Install swagger : `npm install -g swagger`
3. Install project dependencies : `npm install`
4. Create a `env/.local` file at the root with the following environment variales:
   ```
    ENV= //set an unique environment name. system will look bucket of this name in server startup
    HOST=localhost
    PORT=28252
    DB_HOST=localhost
    DB_USER= //your local DB user name
    DB_PASS= //your local DB pass
    DB_NAME= //your local DB name
    DB_PORT= //your local DB port
    LOCAL_CDN=false
    AWS_ACCESS_KEY_ID= //AWS access key
    AWS_SECRET_ACCESS_KEY= //AWS secret
    AWS_REGION=us-east-1
    S3_BUCKET_NAME_PREFIX=travelode.media
    NEWMAN_ENV=local
   ```
5. Start Swagger project : `npm run start`
6. Go to : `http://localhost:28252`
