# Frontend invariants

- Public smoke is read-only and may accept an intentionally empty catalog.
- Browser clients consume shared canonical DTOs and stable error envelopes.
- Card images must retain a safe placeholder/fallback path; frontend image
  preparation must not make catalog validation silently pass on malformed input.
- Frontend delivery must publish an immutable commit tag before chart update.
- The browser talks to the backend through the explicit `/api` boundary; no backend source is imported.
