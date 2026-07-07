const fs = require('fs');
const path = require('path');

const jsCode = fs.readFileSync('wiki-data.js', 'utf-8');
const context = {};
const safeCode = jsCode.replace('const WIKI_DATA', 'context.WIKI_DATA');
eval(safeCode);

const pages = context.WIKI_DATA.pages;

const getTemplate = (title, bannerImage, content, tag) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — HolodeckOS Docs</title>
  <link rel="stylesheet" href="../style.css">
</head>
<body>
  <main class="doc-page">
    <div class="container">
      <div class="doc-hero">
        <img src="../${bannerImage}" alt="${title}">
      </div>
      <span class="doc-tag ${tag}">${tag}</span>
      <h1 class="doc-title">${title}</h1>
      <div class="doc-content">
        ${content}
      </div>
    </div>
  </main>
</body>
</html>`;

pages.forEach(p => {
    const filename = path.join(__dirname, 'pages', `${p.slug}.html`);
    if (!fs.existsSync(filename)) {
        console.log('Generating', filename);
        const tag = p.category ? p.category.toLowerCase().replace(/\s+/g, '-') : 'core';
        const html = getTemplate(p.title, p.image, p.noahContent, tag);
        fs.writeFileSync(filename, html);
    }
});
