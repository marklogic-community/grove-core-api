# muir-middletier-api-docs

This project provides OpenAPI v3 specifications for MUIR-complient middle-tier implementations. It concerns the public facing REST api endpoints.

## Principles

Design principles:

1. Separation of concerns. In other words, the endpoints are divided into smaller distinct segments that can operate independently.
2. Consistency. One single supported input and output format for all endpoints, being application/json.
3. Simplicity. Tasks are broken into small pieces to avoid duplication of work.

## Endpoints

The baseline for MUIR middle-tiers consists of 4 sets of endpoints:

1. /api/auth: Authentication
2. /api/user: User management
3. /api/xxx/id: CRUD for type 'xxx'
4. /api/xxx/search: Search for type 'xxx'

Example implementations apply CRUD and Search for the (pseudo-)type 'document'.

## Testing an implementation

This project comes with a small VueJS page that can be used to run a quick test against your middle-tier of choice. It may require CORS to be disabled on that middle-tier.
