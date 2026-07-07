/**
 * Higgsfield Full-Sync Script with Auto Token Refresh
 * 
 * Uses the Clerk __client cookie to auto-refresh JWT tokens before each API call,
 * bypassing the 60-second token expiry limitation.
 * 
 * Setup:
 *   1. Open https://higgsfield.ai/assets in Chrome
 *   2. Open DevTools (F12) → Network tab  
 *   3. Find a request to clerk.higgsfield.ai
 *   4. Copy the Cookie header value
 *   5. Paste into .env as CLERK_COOKIES
 *   6. Run: npm run sync
 */

import 'dotenv/config';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const API_BASE = 'https://fnf.higgsfield.ai';
const CLERK_BASE = 'https://clerk.higgsfield.ai';
const SESSION_ID = 'sess_3BPXu3ocU2Wpf6wIKyEEHNk1dBU';
const PAGE_SIZE = 1001;
const OUTPUT_FILE = join(__dirname, 'parsed_data.json');

// Cookies from browser session
const COOKIES = process.env.CLERK_COOKIES || process.argv[2] || '';

if (!COOKIES) {
  console.error(`
╔══════════════════════════════════════════════════════════╗
║  ⚠  No Clerk cookies provided!                          ║
║                                                          ║
║  1. Open https://higgsfield.ai/assets in Chrome          ║
║  2. Open DevTools (F12) → Network tab                    ║
║  3. Find a request to clerk.higgsfield.ai                ║
║  4. Copy the Cookie header value                         ║
║  5. Set in .env: CLERK_COOKIES=<paste here>              ║
║     Or run: node sync.js "<cookie string>"               ║
╚══════════════════════════════════════════════════════════╝
  `);
  process.exit(1);
}

async function refreshToken() {
  const url = `${CLERK_BASE}/v1/client/sessions/${SESSION_ID}/tokens?__clerk_api_version=2025-11-10&_clerk_js_version=5.125.7`;
  
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Cookie': COOKIES,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': 'https://higgsfield.ai',
      'Referer': 'https://higgsfield.ai/',
    },
  });
  
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Token refresh failed ${resp.status}: ${text.slice(0, 300)}`);
  }
  
  const data = await resp.json();
  return data.jwt;
}

async function fetchPage(token, cursor = null) {
  let url = `${API_BASE}/assets?size=${PAGE_SIZE}&category=all`;
  if (cursor) url += `&cursor=${cursor}`;
  
  const resp = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`API ${resp.status}: ${text.slice(0, 200)}`);
  }
  
  return resp.json();
}

function categorizeType(item) {
  const jst = (item.job_set_type || '').toLowerCase();
  const rawUrl = (item.raw_url || '').toLowerCase();
  
  if (jst.includes('video') || jst.includes('cinema') || rawUrl.endsWith('.mp4')) return 'video';
  if (jst.includes('audio') || jst.includes('lipsync') || rawUrl.endsWith('.mp3') || rawUrl.endsWith('.wav')) return 'audio';
  if (jst.includes('image') || jst.includes('text2image') || jst.includes('soul') || jst.includes('upscale') || rawUrl.endsWith('.png') || rawUrl.endsWith('.jpg') || rawUrl.endsWith('.webp')) return 'image';
  return 'other';
}

async function syncAll() {
  console.log('🚀 Starting Higgsfield full sync with auto-refresh...\n');
  
  // Test token refresh
  console.log('🔑 Testing token refresh...');
  let token;
  try {
    token = await refreshToken();
    console.log(`   ✓ Got fresh token: ${token.slice(0, 30)}...`);
  } catch (err) {
    console.error(`   ✗ Token refresh failed: ${err.message}`);
    console.error('\n   Cookies may have expired. Get fresh cookies from the browser.');
    process.exit(1);
  }
  
  const allItems = new Map();
  let cursor = null;
  let hasMore = true;
  let pageNum = 0;
  
  while (hasMore) {
    pageNum++;
    
    // Refresh token before each page (they expire in ~60s)
    try {
      token = await refreshToken();
    } catch (err) {
      console.error(`\n❌ Token refresh failed on page ${pageNum}: ${err.message}`);
      break;
    }
    
    try {
      const start = Date.now();
      const data = await fetchPage(token, cursor);
      const elapsed = Date.now() - start;
      
      const items = data.items || [];
      
      if (items.length === 0) {
        hasMore = false;
        break;
      }

      for (const raw of items) {
        if (!allItems.has(raw.id)) {
          allItems.set(raw.id, {
            id: raw.id,
            type: categorizeType(raw),
            job_set_type: raw.job_set_type || '',
            created_at: raw.created_at,
            raw_url: raw.raw_url || '',
            min_url: raw.min_url || '',
            thumbnail_url: raw.thumbnail_url || raw.min_url || '',
            status: raw.status || 'completed',
            folder_ids: raw.folder_ids || [],
            is_favourite: raw.is_favourite || false,
            published_at: raw.published_at || null,
            comments_count: raw.comments_count || 0,
          });
        }
      }

      cursor = items[items.length - 1]?.created_at;
      hasMore = data.has_more !== undefined ? data.has_more : items.length >= PAGE_SIZE;
      
      console.log(`   Page ${pageNum}: +${items.length} items → ${allItems.size} total (${elapsed}ms)`);
      
      if (hasMore) await new Promise(r => setTimeout(r, 200));
      
    } catch (err) {
      console.error(`\n❌ Error on page ${pageNum}: ${err.message}`);
      break;
    }
  }

  if (allItems.size === 0) {
    console.error('\n❌ No items fetched. Check cookies and try again.');
    process.exit(1);
  }

  // Sort newest first
  const sortedItems = [...allItems.values()].sort((a, b) => b.created_at - a.created_at);
  
  // Compute stats
  const stats = {
    total: sortedItems.length,
    images: sortedItems.filter(i => i.type === 'image').length,
    videos: sortedItems.filter(i => i.type === 'video').length,
    audio: sortedItems.filter(i => i.type === 'audio').length,
    other: sortedItems.filter(i => i.type === 'other').length,
  };

  // Write output
  const output = {
    workspace_id: 'ee0b8cf8-1163-450e-8687-0e1cbfc3611e',
    synced_at: new Date().toISOString(),
    total_items: sortedItems.length,
    stats,
    items: sortedItems,
  };

  writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  
  console.log(`
╔══════════════════════════════════════════════════════════╗
║  ✅ Sync complete!                                       ║
║                                                          ║
║  Total:  ${String(stats.total).padEnd(46)} ║
║  Images: ${String(stats.images).padEnd(46)} ║
║  Videos: ${String(stats.videos).padEnd(46)} ║
║  Audio:  ${String(stats.audio).padEnd(46)} ║
║  Other:  ${String(stats.other).padEnd(46)} ║
║                                                          ║
║  📄 Written to: parsed_data.json                         ║
╚══════════════════════════════════════════════════════════╝
  `);
}

syncAll().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
