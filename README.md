# Subquery Network Auth Service

The auth service provides a convinient way for users consume the queries from indexers with ongoing service agreements or PAYG plans.

## Architecture

![auth](https://user-images.githubusercontent.com/8177474/200216575-9cd0f92c-23df-4272-a37f-4b92f37e4efa.png)

## Start Service

1. Provide the local env:

```
# private key of the consumer or controller account
SK="c2902e065cf0aa3af47b7e067b8c57dd9249d2639e4ca7fefd8c000cc9567d07"
# consumer address
CONSUMER="0x7ADb4675B448295b6be86812DDC28F1B0E0Eb876"
# chain id for the network
CHAIN_ID=80001
# port number
PORT=3031
# connected network: `testnet` | `kepler`
NETWORK=testnet
```

2. Run `yarn dev` to start the server locally.

## Development
### Swagger
open `http://localhost:3000/openapi`

### Swagger-Stats
for local: open `http://localhost:3000/stats`
for dev (require vpn): `http://kepler-auth.mx-dev.internal/stats`
for kepler (require vpn): `http://kepler-auth.mx-prod.internal/stats`

### Legacy APIs

```
# get metadata of a valid agreement from the target chain
 curl http://localhost:3031/metadata/0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3

# check availability of the target chain
 curl http://localhost:3031/availability/0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3

 # get all the available service agreements for the target chain
  curl http://localhost:3031/agreements/0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3
```
