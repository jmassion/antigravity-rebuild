/* ═══════════════════════════════════════════════════════════════
   Data Layer — Real assets from Higgsfield CDN + Lovart
   Loads from assets.json (built by build-assets.cjs), falls
   back to inline mock data if the JSON isn't available.
   ═══════════════════════════════════════════════════════════════ */

// ─── Board Hierarchy ───
const BOARDS = [
  { id: 'root', title: 'Lovart Higgsfield Library', parentId: null, children: ['lovart', 'higgsfield'] },
  { id: 'lovart', title: 'Lovart Assets', parentId: 'root', children: ['lovart_3d', 'lovart_videos', 'lovart_images'] },
  { id: 'higgsfield', title: 'Higgsfield Assets', parentId: 'root', children: ['higgsfield_images', 'higgsfield_videos', 'higgsfield_audio'] },
  { id: 'lovart_3d', title: 'Lovart 3D Models', parentId: 'lovart', children: [] },
  { id: 'lovart_videos', title: 'Lovart Videos', parentId: 'lovart', children: [] },
  { id: 'lovart_images', title: 'Lovart Images', parentId: 'lovart', children: [] },
  { id: 'higgsfield_images', title: 'Higgsfield Images', parentId: 'higgsfield', children: [] },
  { id: 'higgsfield_videos', title: 'Higgsfield Videos', parentId: 'higgsfield', children: [] },
  { id: 'higgsfield_audio', title: 'Higgsfield Audio', parentId: 'higgsfield', children: [] },
];

const CUSTOM_FIELD_DEFS = [
  { key: 'source', name: 'Source', type: 'select', icon: '▼' },
  { key: 'mediaType', name: 'Media Type', type: 'select', icon: '▼' },
  { key: 'projectName', name: 'Project Name', type: 'text', icon: 'T¡' },
  { key: 'threadTitle', name: 'Thread Title', type: 'text', icon: 'T¡' },
  { key: 'prompt', name: 'Prompt', type: 'text', icon: 'T¡' },
  { key: 'generationMethod', name: 'Generation Method', type: 'select', icon: '▼' },
  { key: 'category', name: 'Category', type: 'select', icon: '▼' },
  { key: 'toolName', name: 'Tool Name', type: 'select', icon: '▼' },
  { key: 'subAgent', name: 'Sub Agent', type: 'select', icon: '▼' },
  { key: 'taskType', name: 'Task Type', type: 'select', icon: '▼' },
  { key: 'artifactType', name: 'Artifact Type', type: 'select', icon: '▼' },
  { key: 'isFavourite', name: 'Is Favourite', type: 'select', icon: '▼' },
  { key: 'modelId', name: 'Model ID', type: 'text', icon: 'T¡' },
  { key: 'inferenceDuration', name: 'Inference Duration', type: 'text', icon: 'T¡' },
  { key: 'orientation', name: 'Orientation', type: 'select', icon: '▼' },
  { key: 'artifactId', name: 'Artifact ID', type: 'text', icon: 'T¡' },
  { key: 'seed', name: 'Seed', type: 'text', icon: 'T¡' },
  { key: 'coverUrl', name: 'Cover URL', type: 'text', icon: 'T¡' },
  { key: 'folderIds', name: 'Folder IDs', type: 'text', icon: 'T¡' },
  { key: 'thumbnailUrl', name: 'Thumbnail URL', type: 'text', icon: 'T¡' },
];

const TABLE_COLUMNS = [
  { key: 'name', label: 'Name', visible: true, fixed: true },
  { key: 'extension', label: 'Extension', visible: true },
  { key: 'type', label: 'Type', visible: true },
  { key: 'source', label: 'Source', visible: true },
  { key: 'projectName', label: 'Project', visible: true },
  { key: 'category', label: 'Category', visible: true },
  { key: 'toolName', label: 'Tool', visible: false },
  { key: 'prompt', label: 'Prompt', visible: false },
  { key: 'createdAt', label: 'Created', visible: true },
  { key: 'resolution', label: 'Resolution', visible: false },
  { key: 'duration', label: 'Duration', visible: false },
];

const PILL_COLORS = {
  Lovart: 'pill-purple', Higgsfield: 'pill-blue',
  image: 'pill-pink', video: 'pill-blue', audio: 'pill-yellow', '3d-model': 'pill-green',
  generated: 'pill-green', researched: 'pill-blue', reference: 'pill-yellow',
};

// ─── Load assets: try JSON first, fall back to mock ───
let ALL_ASSETS = [];
let _assetsReady = false;

async function loadAssets() {
  // Try loading the pre-built JSON with real Higgsfield CDN data
  try {
    const resp = await fetch('./assets.json');
    if (resp.ok) {
      ALL_ASSETS = await resp.json();
      // Update loading overlay with real count
      const loadMsg = document.querySelector('#loadingOverlay div:nth-child(2)');
      if (loadMsg) loadMsg.textContent = `Loaded ${ALL_ASSETS.length.toLocaleString()} assets`;
      console.log(`✓ Loaded ${ALL_ASSETS.length} real assets from assets.json`);
      _assetsReady = true;
      tryInit();
      return;
    }
  } catch (e) {
    console.warn('assets.json not available, generating mock data:', e.message);
  }

  // Fallback: generate mock data so the UI still works
  console.log('Using mock data fallback...');
  ALL_ASSETS = generateMockAssets();
  _assetsReady = true;
  tryInit();
}

function tryInit() {
  if (_assetsReady && typeof initApp === 'function') {
    initApp();
  } else {
    setTimeout(() => {
      if (_assetsReady && typeof initApp === 'function') initApp();
    }, 200);
  }
}

// ─── Mock Data Generator (fallback only) ───
function generateMockAssets() {
  const assets = [];
  const rng = (n) => Math.floor(Math.random() * n);
  const pick = (arr) => arr[rng(arr.length)];
  const uuid = () => 'xxxxxxxx-xxxx-4xxx'.replace(/x/g, () => '0123456789abcdef'[rng(16)]);
  const imgUrl = (id, w = 400, h = 300) => `https://picsum.photos/seed/${id}/${w}/${h}`;
  const nouns = ['Observatory', 'Butterfly', 'Cityscape', 'Forest', 'Kingdom', 'Garden', 'Landscape', 'Interface', 'Portrait', 'Sculpture'];
  const adjs = ['Steampunk', 'Neon', 'Crystal', 'Mechanical', 'Ancient', 'Cosmic', 'Volcanic', 'Ethereal', 'Holographic', 'Bioluminescent'];

  for (let i = 0; i < 100; i++) {
    const source = i < 67 ? 'Lovart' : 'Higgsfield';
    const isLovart = source === 'Lovart';
    const typeRoll = Math.random();
    let type, extension, boardId;
    if (isLovart) {
      if (typeRoll < 0.6) { type = 'image'; extension = 'png'; boardId = 'lovart_images'; }
      else if (typeRoll < 0.85) { type = 'video'; extension = 'mp4'; boardId = 'lovart_videos'; }
      else { type = '3d-model'; extension = 'glb'; boardId = 'lovart_3d'; }
    } else {
      if (typeRoll < 0.5) { type = 'image'; extension = 'png'; boardId = 'higgsfield_images'; }
      else if (typeRoll < 0.85) { type = 'video'; extension = 'mp4'; boardId = 'higgsfield_videos'; }
      else { type = 'audio'; extension = 'mp3'; boardId = 'higgsfield_audio'; }
    }
    const name = `${pick(adjs)} ${pick(nouns)} ${type === 'video' ? 'Clip' : 'V' + (rng(3) + 1)}`;
    assets.push({
      id: `mock_${i}`, name, type, extension,
      size: 500000 + rng(5000000),
      sizeFormatted: ((500000 + rng(5000000)) / 1048576).toFixed(1) + ' MB',
      resolution: { width: 1024, height: 768 },
      duration: type === 'video' ? 5 + rng(60) : null,
      durationFormatted: type === 'video' ? `0:${String(5 + rng(60)).padStart(2, '0')}` : null,
      createdAt: new Date(2025, rng(12), 1 + rng(28)).toISOString(),
      modifiedAt: new Date().toISOString(),
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Justin Massion',
      boards: [{ id: boardId, title: BOARDS.find(b => b.id === boardId).title, path: `Library / ${BOARDS.find(b => b.id === boardId).title}` }],
      thumbnailUrl: imgUrl(i, 400, 300),
      customFields: { source, mediaType: type, category: 'generated', isFavourite: 'No' },
      provenance: null, higgsfield: null,
      smartSummary: `Mock ${type} asset`, smartTags: [type],
      description: null, tags: [], chapters: [], transcript: [],
      versions: [{ id: `v_${i}`, number: 1 }],
      apiAssetId: uuid(), apiVersionId: uuid(),
    });
  }
  return assets;
}

// Start loading
loadAssets();
