# Role Routing

## Landing Routes
- `super_admin` -> `/super-admin`
- `org_owner`, `org_admin` -> `/organization`
- `operations_manager`, `fleet_manager`, `dispatcher`, `scheduler`, `bus_manager` -> `/operations`
- `finance_manager` -> `/finance`
- `price_manager` -> `/pricing`
- `driver` -> `/driver`
- `conductor` -> `/conductor`
- `support` -> `/support`
- `customer` -> `/customer`
- guest or unknown -> `/register`

Frontend route access is centralized in `frontend/lib/roles.ts` and applied by `frontend/components/AuthGate.tsx`.
