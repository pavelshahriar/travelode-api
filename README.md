# Travelode REST API
1. Clone the github project : `git clone git@github.com:pavelshahriar/travelode-api.git`
2. Install swagger : `npm install -g swagger`
3. Install project dependencies : `npm install`
4. Create a `.env` file at the root with the following environment variales:
   ```
   HOST=localhost
   PORT=28252
   DB_HOST=localhost
   DB_USER=root
   DB_PASS= <your local mysql db root password>
   DB_NAME=travelodeApi
   DB_PORT=3306
   ```
5. Start Swagger project : `npm run start`
6. Go to : `http://localhost:28252`
