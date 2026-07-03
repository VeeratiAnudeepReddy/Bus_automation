# Production Checklist

- Rotate all development secrets.
- Set production Clerk keys and allowed domains.
- Configure production MongoDB backups.
- Configure Razorpay live credentials and webhook URL.
- Configure email provider.
- Configure push provider.
- Configure Redis/pub-sub for realtime scaling.
- Protect `/metrics` at network or reverse proxy level.
- Run backend tests, frontend lint, frontend build, Docker build, and smoke script.
