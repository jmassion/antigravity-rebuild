/* =========================================================================
   APP.JS - Logic for The Living Canvas Wiki
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    const state = {
        currentFile: 'MASTER_PLAN.md',
        files: [],
        currentIndex: -1
    };

    // --- DOM Elements ---
    const elements = {
        content: document.getElementById('markdown-content'),
        links: document.querySelectorAll('.nav-link'),
        breadcrumb: document.getElementById('current-phase-breadcrumb'),
        themeToggle: document.getElementById('theme-toggle'),
        prevBtn: document.getElementById('prev-btn'),
        nextBtn: document.getElementById('next-btn')
    };

    // --- Initialization ---
    init();

    function init() {
        // Collect all navigable files based on sidebar links
        elements.links.forEach((link, index) => {
            const file = link.getAttribute('data-file');
            state.files.push({ file, title: link.textContent, el: link });
            
            // Add click listener
            link.addEventListener('click', (e) => {
                e.preventDefault();
                loadFile(file);
            });
        });

        // Setup Theme Toggle
        const savedTheme = localStorage.getItem('lc-wiki-theme');
        if (savedTheme === 'light') toggleTheme(true);
        
        elements.themeToggle.addEventListener('click', () => toggleTheme());

        // Setup Footer Navigation
        elements.prevBtn.addEventListener('click', navigatePrev);
        elements.nextBtn.addEventListener('click', navigateNext);

        // Configure Marked.js options
        marked.setOptions({
            gfm: true,
            breaks: true,
            highlight: function (code, lang) {
                const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                return hljs.highlight(code, { language }).value;
            }
        });

        // Load initial content (URL Fragment or default)
        const hashFile = window.location.hash.replace('#', '');
        if (hashFile && state.files.find(f => f.file === hashFile)) {
            loadFile(hashFile);
        } else {
            loadFile(state.currentFile);
        }
    }

    // --- Core Logic ---
    
    async function loadFile(filename) {
        if (!filename) return;

        // Visual feedback
        elements.content.classList.add('fade-out');
        
        // Find index for navigation
        state.currentIndex = state.files.findIndex(f => f.file === filename);
        state.currentFile = filename;

        try {
            // Fetch content
            const response = await fetch(filename);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const text = await response.text();
            
            // Process and Render
            setTimeout(() => {
                renderMarkdown(text);
                updateUIState();
                elements.content.classList.remove('fade-out');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                window.location.hash = filename;
            }, 300); // Allow fade out

        } catch (error) {
            console.error('Error loading markdown file:', error);
            setTimeout(() => {
                elements.content.innerHTML = `
                    <div class="error-state">
                        <h2>Cannot load content</h2>
                        <p>File: <code>${filename}</code></p>
                        <p>Error details: ${error.message}</p>
                        <p><br><em>Make sure you are running a local server (e.g., <code>python3 -m http.server</code>) to fetch files correctly.</em></p>
                    </div>
                `;
                updateUIState();
                elements.content.classList.remove('fade-out');
            }, 300);
        }
    }

    function renderMarkdown(markdownString) {
        // Parse raw markdown to HTML
        const rawHtml = marked.parse(markdownString);
        
        // Sanitize
        const cleanHtml = DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } });
        
        // Inject
        elements.content.innerHTML = cleanHtml;
    }

    function updateUIState() {
        // Update Sidebar Active Class
        elements.links.forEach(link => link.classList.remove('active'));
        
        const currentData = state.files[state.currentIndex];
        if (currentData) {
            currentData.el.classList.add('active');
            elements.breadcrumb.textContent = currentData.title;
        }

        // Update Prev/Next Buttons
        elements.prevBtn.disabled = state.currentIndex <= 0;
        elements.nextBtn.disabled = state.currentIndex >= state.files.length - 1;
    }

    // --- Navigation Helpers ---

    function navigatePrev() {
        if (state.currentIndex > 0) {
            loadFile(state.files[state.currentIndex - 1].file);
        }
    }

    function navigateNext() {
        if (state.currentIndex < state.files.length - 1) {
            loadFile(state.files[state.currentIndex + 1].file);
        }
    }

    // --- Theme Helper ---
    
    function toggleTheme(forceLight = false) {
        const isLight = forceLight || !document.body.classList.contains('light-theme');
        if (isLight) {
            document.body.classList.add('light-theme');
            localStorage.setItem('lc-wiki-theme', 'light');
        } else {
            document.body.classList.remove('light-theme');
            localStorage.setItem('lc-wiki-theme', 'dark');
        }
    }
});
