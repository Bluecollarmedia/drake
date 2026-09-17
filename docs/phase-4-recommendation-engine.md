# Phase 4 recommendation engine

Phase 4 uses two server-generated `text-embedding-3-large` vectors at 1,536 dimensions for each current `wd-song-intelligence-v1` profile. The profile vector contains the meaning, emotional conflict, context, strong matches, realistic inputs, and clearly labeled non-matches. The situational vector emphasizes strong scenarios and natural user language. Both are source-hashed, profile-linked, versioned, idempotent, resumable, and cost-accounted.

At request time, the server normalizes an 8–1,500 character situation, creates one query embedding, and performs exact cosine retrieval across the small 461-song catalog. It combines the two vector scores and sends the top 20 profiles to GPT-5.4 Mini. The structured reranker applies negative-fit scenarios as penalties, selects one retrieved song, and returns a concise original explanation without lyrics.

The production interface is the authenticated `recommend` Supabase Edge Function. It atomically reserves server-side allowance before any model call, validates the pseudonymous installation proof, enforces configurable rate limits, and uses service credentials only inside the function. Clients cannot read profiles, embeddings, model runs, recommendation runs, or the retrieval RPC. Raw situations are never stored. A short idempotency result expires after 24 hours.

The endpoint expects a JSON body containing `requestId`, `installationId`, `installationToken`, and `situation`. It returns the selected song, provider links when available, confidence, and the personalized explanation. `OPENAI_API_KEY` belongs in Supabase Edge Function secrets. The client environment must contain only the existing public Supabase configuration.

The usage policy remains the release gate. Phase 5 enabled `recommendations_enabled` after deployment and UI integration; it can still be disabled immediately without an app release. Production economics remain unfinished.
