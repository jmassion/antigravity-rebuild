# Threat Model (Practical)

## Top Risks
1) Unauthorized viewing of a private Surface
2) Unauthorized control (input injection)
3) Replay attacks with old capability tokens
4) Malicious client spamming input or requests
5) Host compromise / leakage

## Mitigations
- Authoritative server gates actions
- Short-lived signed capabilities + revoke
- Locks with timeouts
- Rate limits (add in production)
- Never share cookies/tokens; share pixels + controlled input only

