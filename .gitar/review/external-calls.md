# External calls

- Every outbound HTTP call has a timeout and a bounded retry with backoff (honour `Retry-After` on 429).
- Never parse upstream JSON without validating it against the schema in `src/schema.mjs`.
- Every upstream shape we depend on has a fixture-backed contract test.
- Never hardcode schedule source URLs; read them from config or env.
