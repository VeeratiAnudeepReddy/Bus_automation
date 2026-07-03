# Map Integration

## Implemented
Restored modules include Google Maps embed cards where location context applies:
- Finance collection geography.
- Payments location context.
- Pricing fare zone and route heatmap context.
- Fleet GPS and depot map.
- Super-admin platform coverage map.
- Customer booking/dashboard/detail maps from the prior restoration pass.

## Pattern
`MapCard` in `frontend/components/RestoredEnterpriseModules.tsx`.

## Future Upgrade
If a Google Maps API key is present and the app adds a Maps SDK dependency, the embed card can be upgraded to route polylines, live markers, stop layers, and ETA overlays.
