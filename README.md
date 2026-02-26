# Set Up Nest

You have to build a microservice that exposes a REST API to manage users and pokemons.

### Badges

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/ManuelForneri/set-up-nest/tree/main.svg?style=svg&circle-token=CCIPRJ_Wp5BmdE3RFjFDAyyPEXcwB_d38043eb7cbc136e3f4030ab5093b5a2f6e08880)](https://dl.circleci.com/status-badge/redirect/gh/ManuelForneri/set-up-nest/tree/main)

[![Coverage Status](https://coveralls.io/repos/github/ManuelForneri/set-up-nest/badge.svg?branch=main)](https://coveralls.io/github/ManuelForneri/set-up-nest?branch=main)

### How to run locally coveralls

```
COVERALLS_REPO_TOKEN=qDLfbs2WKPGziYDp3dcGJv9WMovimcGtd npm run test:cov
```

### Features

- Create a new Users with their Pokemon IDs.
- Get Users list.
- Get User by ID and gathering pokemons names from Poke API.
- Update User.
- Delete User.

## Pre-Requisites

- Docker installed without SUDO permissions.
- Docker Compose installed without SUDO permissions.
- Ports free: 3000 and 5432.

## How to run the app

```
chmod 711 ./up_dev.sh
./up_dev.sh

```

## How to run the tests

```
chmod 711 ./up_test.sh
./up_test.sh
```

## Areas to improve

- Data should be moved from tests to an external file
- Generic method should be used to mock endpoints
- Error handling could be improved (I.E handle already existing user error)
- A seed migration would be useful to have an already working app with data
- The ORM is being used with synchronize instead of migrations. Migrations would be the best option for productions

## Errors to be fixed

- Docker app is not running properly

## Technologies used

- NestJS: 11
- Node: 20.11.1
- TypeORM
- PostgreSQL

## Desicions made

- Clean Architecture: To be able to handle further changes in the future in a proper way.
- TypeORM: Because it is the already integrated ORM in the nest Framework and it is the most popular ORM so it is easy to find fixes and people that know how to use it.
- Docker: To make portable
- Jest/Testing/E2E: Jest is the most popular testing framework of JS. Same argument as above. E2E testing was done because it is unless to alwayse test every single part.

That's why if the controller provide the proper answer the test has passed.

## Route

- API Swagger: [API Swagger](http://localhost:3000/api)

## Env vars should be defined

- To find an example of values you can use the .env.example file
