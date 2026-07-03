# CI/CD Guide

GitHub Actions workflow: `.github/workflows/ci.yml`

Pipeline:
1. Install backend dependencies.
2. Run backend tests.
3. Install frontend dependencies.
4. Run frontend lint.
5. Run frontend build.

Production deployments should add Docker build/push and environment-specific rollout steps.
