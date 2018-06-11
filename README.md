# muir-middletier-api-docs

This project provides OpenAPI v3 specifications for MUIR-complient middle-tier implementations. It concerns the public facing REST api endpoints.

## Principles

Design principles:

1. Separation of concerns. In other words, the endpoints are divided into smaller distinct segments that can operate independently.
2. Consistency. One single supported input and output format for all endpoints, being application/json.
3. Simplicity. Tasks are broken into small pieces to avoid duplication of work.

## Endpoints Overview

The baseline for MUIR middle-tiers consists of 4 sets of endpoints:

1. /api/auth: Authentication
2. /api/user: User management
3. /api/xxx/id: CRUD for type 'xxx'
4. /api/search/xxx: Search for type 'xxx'

Example implementations apply CRUD and Search for the (pseudo-)type 'document'.

## Endpoints Detail

### /search

Three endpoints are specified for /search, allowing the consumer to request results-only, facets-only, or the combination of the two:

    /search/{type}/results
    /search/{type}/facets
    /search/{type}

The `type` parameter allows several different searches to be mounted. We envision that middle-tiers, out-of-the-box, will support an `all` pseudo-type that implements generic search-and-discovery against documents stored in the database (perhaps within a "data" collection). Particular applications can modify the search or mount additional search endpoints, perhaps changing the `type` to entities like "patients" or concepts like "raw" or "harmonized". The exact meaning and of those types (and implementation of typed searches) will be up to the middle-tier implementation.

All requests against these endpoints are POST requests, allowing the search filters and options to be arbitrarily large in the request body. The request and response bodies are very similar for each of the three endpoints.

#### Search Request

A search request includes two top-level properties: `options` and `filters`.

`options` includes `start` and `pageLength` for pagination, and can be arbitrarily expanded to cover other concepts understood by both the UI and the middle-tier.

`filters` specify the search query.

In the MUIR search API, "filters" refer to values applied, typically by a user through the UI, against "constraints", which are filter capabilities known to the middle-tier.

In MUIR, "filter" and "constraint" are broad terms which do not specify how a particular constraint operates. They could be backed by a MarkLogic Search API constraint, a MarkLogic REST extension using cts queries, or even some Elasticsearch implementation.

In this spec, we aim to strike a balance between expressive power and convenience for UI developers. Most filter interfaces will be fairly simple, such as a search bar or selectable list of facets. Authors of such components should not be burdened with complicated filter structures. Advanced search interfaces, however, are possible within the Muir search spec as recursive combinations of simpler filters.

The filter types described by this spec include:

1. **QueryTextFilter**. Yes, even qtext is treated as a filter value matched against a search constraint. This is typically a simple string for full-text searching, though it can optionally include a "constraint" name. A middle-tier implmentation could use that "constraint" name to handle the queryText in a special way, such as searching against a field in MarkLogic that is narrower than full-text search.

2. SelectionFilter. This filter allows for individual values to be ANDed or ORed (but not both) together against a search constraint. The values can optionally be negated. A SelectionFilter is only one level deep, which corresponds to simple facet UIs. More complicated selections can be modeled using the CombinedFilter described below.

3. RangeFilter. This filter allows ranges of values to be specified against a search constraint. Like SelectionFilter, it is intentionally simple and tailored for ease of use in creating range-selection UI components.

4. CombinedFilter. This is the advanced search filter. It is recurisve. Actually, the `filters` field in the SearchRequest body is one large CombinedFilter. This allows the 3 simple filter types to be combined in arbitrarily-complex combinations of AND, OR, NOT, and NEAR.

#### Search Response

The specified SearchResponse is similar to the response from the MarkLogic Search API, for ease of implementation. Results from other sources could be marshalled into the same structure. It covers some metadata, such as `total` and pagination properties, as well as facets and results.

We only specified certain properties likely to be widely used in MUIR UIs. The response can be expanded with additional properties by middle-tier implementations.

## Testing an implementation

This project comes with a small VueJS page that can be used to run a quick test against your middle-tier of choice. It may require CORS to be disabled on that middle-tier.
