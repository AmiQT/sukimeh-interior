# Security

Do not publish credentials or private floor plans in issues. Use GitHub private vulnerability reporting when enabled on the repository. If unavailable, ask the maintainer for a private reporting channel without disclosing exploit details publicly.

Ruma Studio is a local-first demonstration project. The API has no accounts, authentication, rate limiting, or per-user storage isolation. Shared proposals are accessible to anyone who knows their link. Run the backend on localhost; review and implement access controls before exposing it publicly.

API keys belong in the root `.env` file on the server. Never use a `NEXT_PUBLIC_` variable for secrets. Uploads and proposals are runtime data and must not be committed. Browser drafts are stored in localStorage on the current device and origin. Clear site data to remove them.

Optional AI providers receive data only when their related features are invoked and credentials are configured. Checkout is a local simulation and does not collect payment or contact information.
