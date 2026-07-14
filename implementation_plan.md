# Simplified Implementation Plan: Admin & Reports (Export Hub)

This plan details the implementation of **Module 6: Admin & Reports (Export Hub)** using a lightweight, dependency-free mock header approach to fulfill the requirements (CSV generation, date-range filtering, role-based guardrails, and admin-only routes).

---

## Proposed Changes

### 1. Backend Server & Mock Auth Middleware

#### [MODIFY] [server.js](file:///c:/Users/Amaan/OneDrive/Desktop/clgWork/5th_sem/FleetOps/backend/server.js)
- Add a lightweight `verifyRole(allowedRoles)` middleware that:
  - Inspects the `x-user-role` header from incoming requests.
  - Returns a `403 Forbidden` JSON response if the role is not allowed.
- Create a `GET /api/reports/export-csv` route:
  - Protected by `verifyRole(['Admin', 'FleetManager'])`.
  - Expects query parameter `range` (`today`, `current_week`, `last_30_days`).
  - Generates custom formatted CSV text (columns: `VEH ID,ASSIGNED DRIVER,STATUS,SHIFT(UTC),NOTES`).
  - Sends the CSV file as an attachment with appropriate headers:
    - `Content-Type: text/csv`
    - `Content-Disposition: attachment; filename="fleet-report.csv"`

---

### 2. Frontend Integration & UI Pages

#### [NEW] [ExportHub.jsx](file:///c:/Users/Amaan/OneDrive/Desktop/clgWork/5th_sem/FleetOps/frontend/src/pages/ExportHub.jsx)
- Implement the Export Hub page using premium Tailwind CSS v4 styling matching your layout diagram:
  - **Date Range Selector**: Dropdown showing `Current Week (All Drivers)`, `Today`, `Last 30 Days`.
  - **Export Format**: Dropdown showing `CSV Spreadsheet (.csv)`.
  - **Action Button**: "Generate Excel / CSV Report" button with a loading state.
  - **Access Check**:
    - If the user's role is `'driver'` (header: `Driver`), render the **"Security Guardrail - 403 Forbidden"** card.
    - If user is `'manager'` or `'admin'`, render the full generator.
- Trigger browser file download by calling `/api/reports/export-csv` with the `x-user-role` header matching the user's role.

#### [MODIFY] [App.jsx](file:///c:/Users/Amaan/OneDrive/Desktop/clgWork/5th_sem/FleetOps/frontend/src/App.jsx)
- Support routing to the Export Hub view via `#/export-hub`.
- Pass the logged-in user state (`{ email, role }`) to pages.
- Handle role mapping:
  - Email with `admin` -> role: `'admin'` (headers send `'Admin'`)
  - Email with `manager` -> role: `'manager'` (headers send `'FleetManager'`)
  - Email with `driver` -> role: `'driver'` (headers send `'Driver'`)

#### [MODIFY] [Login.jsx](file:///c:/Users/Amaan/OneDrive/Desktop/clgWork/5th_sem/FleetOps/frontend/src/pages/Login.jsx)
- In the "Quick Demo Access" section, add a shortcut button to log in as **Admin** (`admin@fleetops.com`) and **Driver** (`driver@fleetops.com`) to make testing role permissions extremely easy.
- Set the user role dynamically based on the email input.

#### [MODIFY] [Navbar.jsx](file:///c:/Users/Amaan/OneDrive/Desktop/clgWork/5th_sem/FleetOps/frontend/src/components/Navbar.jsx)
- Render the "Export Hub" link for authenticated managers or admins.

---

## Verification Plan

### Manual Verification
1. Login as `admin@fleetops.com` or `manager@fleetops.com`. Navigate to "Export Hub" and verify you can generate and download the `.csv` file.
2. Login as `driver@fleetops.com`. Force navigate to the Export Hub by modifying the URL hash to `#/export-hub`. Verify the page renders the **403 Forbidden** security guardrail.
3. Test direct API access: query `http://localhost:5000/api/reports/export-csv` from another client without headers or with role `Driver` and verify you receive `403 Forbidden`.
