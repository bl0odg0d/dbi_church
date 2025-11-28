# Church Hierarchy Graph Generator
## Prerequisites

- Node.js
- Access to a running Postgresql server

## Setup

1. **Copy the folder** to your working directory or locate the folder in your System.
2. **Edit the .env file** located under config
3. **Install dependencies and start the programm**:
```
psql -U User -d Database -h hostIpAdress -f schema.sql
npm install
node generate.js [Optional:ip] [Optional:port]
```
