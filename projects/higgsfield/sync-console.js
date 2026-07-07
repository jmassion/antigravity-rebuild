/**
 * Higgsfield Full-Sync — Console Script
 * 
 * Paste this ENTIRE script into the browser console on higgsfield.ai/assets.
 * It will fetch ALL assets using the page's own Clerk session for auth,
 * then download parsed_data.json with the complete dataset.
 * 
 * Steps:
 *   1. Open https://higgsfield.ai/assets in Chrome
 *   2. Open DevTools (F12) → Console tab
 *   3. Paste this entire script and press Enter
 *   4. Wait for the sync to complete (~30 seconds)
 *   5. The parsed_data.json file will auto-download
 *   6. Move it to the Higgsfield scraper folder
 */

(async () => {
  const API = 'https://fnf.higgsfield.ai';
  const SIZE = 1001;

  // Get token from Clerk SDK
  async function getToken() {
    if (window.Clerk?.session) return await window.Clerk.session.getToken();
    const c = document.cookie.split(';').find(c => c.trim().startsWith('__session='));
    if (c) return c.split('=').slice(1).join('=');
    throw new Error('No auth - make sure you are logged in');
  }

  function categorize(item) {
    const j = (item.job_set_type || '').toLowerCase();
    const u = (item.raw_url || '').toLowerCase();
    if (j.includes('video') || j.includes('cinema') || u.endsWith('.mp4')) return 'video';
    if (j.includes('audio') || j.includes('lipsync') || u.endsWith('.mp3')) return 'audio';
    return 'image';
  }

  console.log('%c⚡ Higgsfield Sync Starting...', 'color:#a78bfa;font-size:16px;font-weight:bold');
  
  const all = new Map();
  let cursor = null, more = true, page = 0;

  while (more) {
    page++;
    const token = await getToken();
    let url = `${API}/assets?size=${SIZE}&category=all`;
    if (cursor) url += `&cursor=${cursor}`;

    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) { console.error(`❌ API ${r.status} on page ${page}`); break; }
    
    const d = await r.json();
    const items = d.items || [];
    if (!items.length) break;

    for (const i of items) {
      if (!all.has(i.id)) all.set(i.id, {
        id: i.id,
        type: categorize(i),
        job_set_type: i.job_set_type || '',
        created_at: i.created_at,
        raw_url: i.raw_url || '',
        min_url: i.min_url || '',
        thumbnail_url: i.thumbnail_url || i.min_url || '',
        folder_ids: i.folder_ids || [],
        is_favourite: i.is_favourite || false,
      });
    }

    cursor = items[items.length - 1]?.created_at;
    more = d.has_more ?? items.length >= SIZE;
    console.log(`   Page ${page}: +${items.length} → ${all.size} total`);
    if (more) await new Promise(r => setTimeout(r, 150));
  }

  const sorted = [...all.values()].sort((a, b) => b.created_at - a.created_at);
  const stats = {
    total: sorted.length,
    images: sorted.filter(i => i.type === 'image').length,
    videos: sorted.filter(i => i.type === 'video').length,
    audio: sorted.filter(i => i.type === 'audio').length,
  };

  const output = {
    workspace_id: 'ee0b8cf8-1163-450e-8687-0e1cbfc3611e',
    synced_at: new Date().toISOString(),
    total_items: sorted.length,
    stats,
    items: sorted,
  };

  // Auto-download
  const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'parsed_data.json';
  document.body.appendChild(a);
  a.click();
  a.remove();

  console.log(`%c✅ Sync complete! ${stats.total} items (${stats.images} images, ${stats.videos} videos, ${stats.audio} audio)`, 'color:#34d399;font-size:14px;font-weight:bold');
  console.log('📄 parsed_data.json downloaded!');
})();
