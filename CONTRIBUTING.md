# Contributing to Ruma Studio

Fork this repository, create a focused branch, and follow the README quick start. Describe the problem and resulting behavior in your pull request.

## Checks

```sh
python -m pytest backend/tests -q
cd frontend
npm ci
npm run lint
npm run build
```

For UI changes, check the home page, drawing tools, templates, isometric view, catalog, cart, and demo summary at desktop and phone widths. Verify reload preserves the draft. Keep Malay user-facing copy consistent and give icon-only controls accessible labels.

## Catalog changes

Use fictional brands and neutral SKUs: `RUMA-<ITEM>-<NUMBER>` for Ruma Living and `DAPUR-<ITEM>-<NUMBER>` for Dapur Works. Do not imply sponsorship or use real vendor assets without permission.

Copy the backend catalog to `frontend/lib/catalog.json` after catalog changes; a regression test checks that these files match. The catalog currently has several representations. Update `backend/data/products.json`, `backend/routers/suggest.py`, the available product IDs in `backend/services/deepseek_service.py`, `frontend/components/FurnitureSidebar.tsx`, `frontend/lib/mockData.ts`, and relevant templates or tests together. Product artwork is maintained in `frontend/components/ProductArt.tsx`.

## Scope and privacy

Keep pull requests focused. Add regression tests for behavioral fixes, update documentation for setup changes, and never commit secrets, uploaded plans, generated proposals, build output, or personal data. AI integration work should be isolated from the manual drawing experience. Use GitHub Issues for reproducible bugs and feature proposals; see SECURITY.md for sensitive reports.
