# Session & Identity Strategy (Login Constraints)

Session classes:
A) Personal sessions: on user's desktop host; share pixels only
B) Shared service sessions: managed host with stable region/IP
C) Disposable sessions: non-auth, can churn

Avoid re-login storms:
- warm containers, minimize region changes, use control handoff instead of new logins per viewer

Plan UX for MFA:
- owner-only control during auth steps
- privacy mode while authenticating

