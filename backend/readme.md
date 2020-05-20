# How to run the backend server
### Prerequisites
Must have npm installed
Inside this directory(in the git repo) run the following bash commands
```bash
npm install --save-dev nodemon
npm install express --save
npm install
```
You must also have a mongodb instance running
I recommended using a docker image, but feel free to use your own solution
This is what I did:
```bash
# Create a mongodb image
docker pull mongo
docker run --name pedmongo --restart=always -d -p 27017:27017 mongo mongod

# connect through local mongo client to check if the server is up
mongo
```

### Environment Variable Configuration
Create a `.env` file in the root of the backend directory.
This file will be ignored by git, and should contain any configuration environmental variables.
The following variables are currently supported:
```
# Server port
PORT=...

# Mongo database configuration style. Can be left undefined, or set to 'production', 'testing',
or 'custom'
APP_DEPLOYMENT_MODE=...

# Mongo database password
MONGODB_URI=...

# Mongo database username
MONGODB_UNAME=...

# Mongo database hostpath
MONGODB_HOST=...

# Default admin user for backend, should only be used in dev
# When you signup, this email will create an admin account
DEFAULT_ADMIN_EMAIL=

# Openroutingservice.org API key
ORS_API_KEY=...
```

### How to actually run the server
There are two different ways to run the server
```bash
npm start # Runs the prod environment
npm run start-dev # Runs the dev enviornment, recommended for dev
```
