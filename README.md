# duties-backend

## Install Node.js

https://nodejs.org/en/download/package-manager

Recommend using node v.20.16.0

## Install PostgreSql

https://www.postgresql.org/download/

### create database
```
CREATE DATABASE duties
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LOCALE_PROVIDER = 'libc'
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;
```

### create table

```
CREATE TABLE public.todo (
    id integer NOT NULL,
    name text
);
```

## create .env in root directory

```
POSTGRES_HOST=<host>
POSTGRES_USER=<user>
POSTGRES_PASSWORD=<password>
POSTGRES_DB=<database>
POSTGRES_PORT=<port>
```

## Before run available Scripts, you need

### `npm install`


### `npm install -g bun`

For running pm2

### `npm install -g pm2`

For starting a service in background by using serve

## Available Scripts

### `npm start`

Runs the app in the development mode.\

### `npm run serve`

Runs the app in the background mode.\

### `npm stop`

Stop the app.\