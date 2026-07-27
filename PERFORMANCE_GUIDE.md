# Performance Guide

Implemented foundations:
- request latency metrics
- lean queries in existing controllers where already used
- pagination in enterprise list APIs
- compound indexes across major models
- request size limits

Recommended next steps:
- slow query logging with MongoDB profiler
- explain plan review for high-volume reports
- Redis caching for dashboard aggregates
