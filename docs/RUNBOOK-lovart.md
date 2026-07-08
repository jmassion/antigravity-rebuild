# Runbook: LovArt data & media (lovart-explorer, air-ui-study)

Two portfolio apps depend on LovArt: **lovart-explorer** (baked data snapshot + CDN media)
and **air-ui-study** (its own assets.json + CDN media). Match the symptom below.

## Symptom: images/videos broken in either app

**Cause A — Referer blocking (most likely).** `a.lovart.ai` returns **403** to any request
whose `Referer` isn't lovart.ai. Both apps carry `<meta name="referrer" content="no-referrer">`
in their `index.html` to prevent this. If media breaks after a re-migration or rebuild,
first check that the meta tag survived:

```bash
grep referrer projects/lovart-explorer/index.html projects/air-ui-study/index.html
```

`scripts/migrate.sh` re-applies it for air-ui-study; the explorer has it in its source copy
(`scratchpad build dir` / see below). Diagnose from a terminal — these should behave differently:

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://a.lovart.ai/artifacts/agent/O0FGGAHJuEGqVXYI.png            # 200 = CDN alive
curl -s -o /dev/null -w '%{http_code}\n' -e https://example.com https://a.lovart.ai/artifacts/agent/O0FGGAHJuEGqVXYI.png  # 403 = referer block working as known
```

**Cause B — CDN actually dead** (first curl above also fails). Nothing client-side will fix
it; the media is gone unless re-uploaded somewhere. The explorer's *data* (names, chats,
text) still works — only media tiles go dark.

## Symptom: explorer loads but projects/chats missing

The baked snapshot files are missing from `projects/lovart-explorer/data/`
(projects.json, threads.json, chats/*.json). Restore from git history, or re-snapshot (below).

## Refreshing the snapshot (new LovArt work, ~10 min)

The live API needs a logged-in browser; the capture runs **inside the page** so no token
handling is required.

1. User logs into **lovart.ai** in Chrome with the Claude extension connected.
2. Run the snapshot script in the page (full script in the 2026-07-07 session transcript;
   the shape is: fetch `lovartProjectList` pages → `agentThreadList` per project →
   `chatHistoryV2?threadId=<agentThreadId>` per thread → download blob as JSON).
3. Bake: split into `public/data/projects.json`, `threads.json`, `chats/<agentThreadId>.json`
   in the explorer build dir, `vite build --base=./`, rsync dist → `projects/lovart-explorer/`.

### API gotchas (cost hours — don't rediscover)

| Gotcha | Detail |
|---|---|
| Thread id | `chatHistoryV2` requires the **UUID `agentThreadId`**. The numeric `id` returns `{code:0,"message":"Successfully got history view"}` **with no data** — a silent failure. |
| Referer | `a.lovart.ai` 403s on foreign Referer. CORS is open (`ACAO: *`); only the Referer header matters. |
| Auth | JWT lives in the `usertoken` cookie on www.lovart.ai (7-day life). The old refresh-token flow in `AntiGravity/Scraper/LovArt/.../api/index.js` is dead (401). |
| Endpoints | POST `api.lovart.ai/api/canva/project/lovartProjectList` `{page,pageSize}` · POST `api.lovart.ai/api/canva/agent/agentThreadList` `{projectId,page,pageSize,cid}` · POST `www.lovart.ai/api/canva/agent/chatHistoryV2?threadId=<uuid>` |
