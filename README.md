# VIENTo E-commerce — Client Demo

Interactive frontend demo for VIENTo (poly sealing machines & packaging equipment).
React 19 + TypeScript + Vite + Tailwind CSS 4 + React Router 7 + Lucide. No backend: data lives in `localStorage`.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build to dist/
```

Demo admin: `/admin` · **admin@vientodemo.com** / **Demo@123** (demo only, not real authentication).
Use **Reset Demo Data** in the admin sidebar before each client presentation.

## Structure

```
src/
  types/        Domain models (mirror future API DTOs)
  data/seed.ts  Sample products, categories, seed orders, testimonials
  services/     productService / orderService / authService — async, API-shaped
                mockDb.ts is the localStorage "database"
  context/      StoreContext (catalog + orders), CartContext, ToastContext, AdminAuthContext
  components/   ui kit, layouts, product & admin components
  pages/store   Customer pages      pages/admin  Admin pages
```

## Moving to ASP.NET Core + SQL Server

Only `src/services/*` needs to change. Each service file lists the REST endpoint each method maps to
(e.g. `POST /api/orders`). Replace the `db.*` calls with `fetch` calls returning the same types, then
delete `mockDb.ts`. Stock validation and reservation on order placement must move server-side.
Replace `authService` with real authentication (JWT/cookie) and protect admin endpoints on the API.

## Assets

Product photos are in `Public/images/products/` (copies of the supplied images with clean names).
`vite.config.ts` sets `publicDir: 'Public'` to match the folder's actual casing.
