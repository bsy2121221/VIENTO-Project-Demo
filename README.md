# VIENTo E-commerce — Client Demo

Interactive frontend demo of the VIENTo **multi-vendor marketplace**: many colour-coded categories, many sellers,
and VIENTo's own range (sealing machines, décor, kitchen) sold through the built-in *VIENTo Official Store*.
React 19 + TypeScript + Vite + Tailwind CSS 4 + React Router 7 + Lucide. No backend: data lives in `localStorage`.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build to dist/
```

Demo admin: `/admin` · **admin@vientodemo.com** / **Demo@123** (demo only, not real authentication).
Use **Reset Demo Data** in the admin sidebar before each client presentation.

## Marketplace model

| Concept | Where | Notes |
|---|---|---|
| **Categories** | `types` `Category`, seeded in `data/seed.ts`, managed at `/admin/categories` | Data, not code: admin adds, edits, re-orders, recolours or hides them. A hidden category hides its products. |
| **Sellers** | `types` `Seller`, `services/sellerService.ts`, managed at `/admin/sellers` | Statuses: `pending → approved / rejected`, `approved ↔ suspended`. Per-seller commission %. The official store cannot be suspended. |
| **Seller sign-up** | `/sell` | Public application form; creates a `pending` seller for admin review. |
| **Seller shop** | `/sellers/:slug` | Public page for approved sellers only. |
| **Products** | `Product.sellerId` | Assigned to an approved seller in the admin product form. |
| **Orders** | `OrderItem.sellerId / sellerName` | Each line records its seller, so per-seller sales and commission can be reported (and later split into sub-orders). |

Customers only see what `useCatalog()` returns: active products **from approved sellers in visible categories**.
The cart and checkout apply the same rule.

Demo flow: open `/sell` → submit an application → `/admin/sellers` → **Review** → **Approve** → assign products to the new
seller in `/admin/products` → their shop appears at `/sellers/<slug>`.

**Next phase (needs the backend):** seller login and a seller panel (their own products, stock and orders), payouts
and settlement reports, per-seller shipping and returns, product approval queue, reviews and ratings.

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

Only `src/services/*` needs to change (`productService`, `orderService`, `categoryService`, `sellerService`, auth). Each service file lists the REST endpoint each method maps to
(e.g. `POST /api/orders`). Replace the `db.*` calls with `fetch` calls returning the same types, then
delete `mockDb.ts`. Stock validation and reservation on order placement must move server-side.
Replace `authService` with real authentication (JWT/cookie) and protect admin endpoints on the API.

## Assets

Product photos are in `Public/images/products/` (copies of the supplied images with clean names).
`vite.config.ts` sets `publicDir: 'Public'` to match the folder's actual casing.
