# GDC Brazil | Onboarding Portal

A local, clickable **prototype** that lets managers follow employee onboarding: IDC access requests, approval status and device assignment.

> **Demo only.** All people, IDs, devices and requests are fictional (emails use the reserved `example.test` domain). Authentication is simulated. Nothing connects to a corporate system.

Stack: React 18 · TypeScript · Vite 5 · Tailwind CSS 3 · React Router 6 · Recharts · Lucide icons.

---

## 1. Run it locally (macOS)

### 1.1 Make `node` and `npm` available in your terminal

Node.js **v22.11.0** is already installed on this Mac in `~/node`, but that folder is not on the terminal's `PATH`, which is why `npm` printed *"command not found"*.

Run this **once** in Terminal (or the VS Code terminal) to fix it permanently for your user:

```bash
echo 'export PATH="$HOME/node/bin:$PATH"' >> ~/.zprofile
source ~/.zprofile
node -v   # should print v22.11.0
npm -v    # should print a version number
```

Open a **new** terminal window afterwards if VS Code still says "command not found".

> Don't have Node at all on another Mac? Install the **LTS** version from <https://nodejs.org> ("macOS Installer (.pkg)"). It works on both Intel and Apple Silicon Macs.

### 1.2 Install and start

```bash
cd ~/gdc-onboarding-portal
npm install        # first time only
npm run dev        # starts the dev server
```

Open **<http://localhost:5173>** in your browser. Stop the server with `Ctrl + C`.

| Command | What it does |
|---|---|
| `npm run dev` | Development server with live reload |
| `npm run build` | Type-checks (TypeScript) and builds a production bundle to `dist/` |
| `npm run typecheck` | Type-check only |
| `npm run preview` | Serves the production build locally |

Tip: add `?simulateError=1` to the URL to preview the error state.

---

## 2. What the demo shows

### Pages
- **Overview**: greeting, 4 KPI cards, onboarding-status donut, business-unit bars, an *Attention Required* strip, and an *Upcoming Employees* table (search and sort).
- **Employees**: search (name / LAN ID / email), filters (status, business unit, device, start), sorting, pagination, CSV export, and a details drawer with **View Employee Accesses**.
- **Accesses**: search (employee / request ID / access), filters (status, employee, business unit, pending approver), sorting, pagination, CSV export, and a traceability drawer.

### Demo users (mock authentication)
Use the amber **DEMO · Switch Demo User** control in the top bar.

| User | Experience |
|---|---|
| **Alex Moreno · Admin** | Sees everything. A **Manager** dropdown under the top bar narrows *all three pages* to one manager or *All Managers*. The choice is kept while navigating and after a refresh. |
| **Any manager** (6 fictional managers) | Automatically scoped to their own team, with a personalized greeting and a read-only **Your Team — Name** badge. No manager dropdown. On the Overview, the "Total Managers" KPI is replaced by "Upcoming Starts". |

Switching users clears page filters that may no longer apply (selected employee, approver, open drawer). The demo session is saved in the browser's `localStorage`.

### Cross-page links
- *Pending Accesses* KPI → Accesses filtered to items that are not completed.
- Donut / legend status → Employees filtered by that onboarding status.
- Business unit bar → Employees filtered by that BU.
- Attention items → pending approvals / pending onboardings / upcoming starters without a device.
- Employee drawer → **View Employee Accesses** → Accesses filtered to that employee (by stable `employeeId`).
- Page filters live in the URL, so they survive a refresh and can be shared. *Clear filters* never changes the manager scope.

---

## 3. Business rules (to be aligned with Power BI)

All rules live in **`src/domain/status.ts`**. No component re-implements them.

### Access status (one IDC request item)

| Raw status | Counts as completed? |
|---|---|
| Finished | ✅ Yes |
| Committed | ✅ **Only if** `availabilityConfirmed = true`; otherwise ❌ |
| Pending, Pending Approval, Provisioning | ❌ In progress |
| Failed, Rejected | ❌ Blocked (never treated as provisioned) |
| Unverifiable | ❌ Unresolved until confirmed |

### Onboarding status (one employee, derived from all of their items)

| Status | Rule |
|---|---|
| **Not Requested in IDC** | The employee has no IDC request items |
| **Finished** | At least one item, and **every** item counts as completed |
| **Pending** | At least one item does not count as completed |

### Device assignment
A non-empty device name shows **Device Assigned**; an empty or null one shows **Not Assigned**. A device name means a device *record* exists. It does **not** prove physical delivery.

### Pending approver
Shown only for *Pending Approval* items. If the source has no approver, the UI shows *Not available* and never guesses a name. For other statuses it shows *Not applicable*.

---

## 4. Project structure

```
src/
  types/models.ts                 Data contracts shared by UI and data layer
  services/
    OnboardingDataService.ts      Interface the UI depends on
    MockOnboardingDataService.ts  Fictional in-memory implementation (today)
    index.ts                      Single switch point for the data source
  data/mock/                      Seed + deterministic dataset builder (26 employees, 6 managers, 116 requests)
  domain/
    status.ts                     Centralized status / onboarding / device rules
    enrich.ts                     Joins records and computes every KPI dynamically
    filters.ts                    URL filter slugs shared by cross-page links
  context/
    SessionContext.tsx            Mock sign-in + admin manager filter (→ Okta later)
    DataContext.tsx               Loads authorized data; applies the manager scope
  components/                     Layout, tables, drawers, badges, UI primitives
  pages/                          Overview, Employees, Accesses
```

---

## 5. Future production architecture

```
 Browser (this React app)
     │  Okta OIDC (Authorization Code + PKCE) → ID/access token
     ▼
 Approved backend API / BFF  ── validates token, resolves role & authorized employees
     │   server-side authorization (row-level: manager → own team; admin → all)
     ├── Oracle / SailPoint IDC  → access requests, status, approvals, entitlements
     ├── ServiceNow REST API     → desktop / device assignments
     ├── Authorized HR source    → employee, manager, position, BU, start date
     └── Okta                    → identity & group/role claims
```

### Authentication: Okta (not implemented yet)
1. **Okta authenticates the user** (OIDC SSO). Replace `SessionContext` with an Okta provider such as `@okta/okta-react`. The *Switch Demo User* control is removed.
2. **The backend determines the role and the authorized employees** from the validated token and HR/IAM data. Never trust a role or manager ID sent by the browser.
3. **Authorization must be enforced server-side.** The API returns only the rows the caller may see.
4. **Frontend filtering is not a security boundary.** Everything the browser receives can be read by the user. The manager scope in this prototype is a UX simulation only.

### Data integration
- Add an `HttpOnboardingDataService` that implements `OnboardingDataService` and calls the backend. Swap it in `src/services/index.ts`. **No UI component needs to change.**
- The backend **normalizes** each source into the shapes in `src/types/models.ts` (for example, mapping IDC status codes to `AccessStatus` and setting `availabilityConfirmed`).
- **Credentials** (Oracle, ServiceNow, API tokens) live only on the server, in a secrets manager or vault. Never put them in frontend code, `.env` files shipped to the browser, or the repository.
- **Error handling:** the UI already has loading, empty and error states with *Try again*. The backend should return clear error codes and partial-data indicators per source.
- **Controlled refresh:** cache source data server-side and refresh on a schedule (e.g. every 15–60 min, aligned with Power BI). Expose `lastUpdatedAt` (already displayed in the header). Avoid one live enterprise query per page view.
- **Privacy:** return only the fields the dashboard needs, log access, and restrict CSV export on the server if required by policy.

---

## 6. Known limitations
- Mock authentication only; there is no real security boundary.
- Data is generated in memory at page load. Start dates are relative to "today", so the demo always has upcoming employees.
- CSV export is client-side and contains only the rows currently visible under the active scope and filters.
