import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls;
let isInitialized = false;
let animationId;
let cards = [];
let raycaster, mouse;

const projects = window.AG_PROJECTS || [];
const container = document.getElementById('three-canvas-target');
const infoPanel = document.getElementById('three-project-info');

window.addEventListener('ag:enter-3d', () => {
    if (!isInitialized) {
        init3D();
    } else {
        resume3D();
    }
});

window.addEventListener('ag:exit-3d', () => {
    pause3D();
});

function init3D() {
    // 1. Scene Setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05050a, 0.001);

    // 2. Camera Setup
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 2000);
    camera.position.set(0, 300, 800);

    // 3. Renderer Setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 4. Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 1500;
    controls.minDistance = 100;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(200, 500, 300);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x5e6ad2, 2, 1000);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // 6. Raycaster for Interaction
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // 7. Generate Environment & Content
    createStarfield();
    createProjectNodes();

    // 8. Event Listeners
    window.addEventListener('resize', onWindowResize);
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('click', onClick);

    document.getElementById('three-loader').classList.add('hidden');
    isInitialized = true;
    resume3D();
}

function createTextTexture(text, subtitle, colors) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Background Gradient based on project string
    const grd = ctx.createLinearGradient(0, 0, 512, 256);
    // Parse CSS linear gradient roughly or fallback to a standard dark glow
    grd.addColorStop(0, 'rgba(20,20,30,0.9)');
    grd.addColorStop(1, 'rgba(40,40,60,0.9)');

    // Draw Glass Box
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.roundRect(10, 10, 492, 236, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Top Glowing Bar
    ctx.fillStyle = '#5e6ad2';
    ctx.beginPath();
    ctx.roundRect(10, 10, 492, 10, { tl: 16, tr: 16, bl: 0, br: 0 });
    ctx.fill();

    // Draw Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 100);

    // Subtitle
    ctx.fillStyle = '#a0a0b0';
    ctx.font = '24px sans-serif';
    ctx.fillText(subtitle, 256, 150);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return texture;
}

function createProjectNodes() {
    const radius = 400;
    const phiOffset = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    const textureLoader = new THREE.TextureLoader();

    projects.forEach((proj, idx) => {
        // Spiral layout mechanics
        const y = 1 - (idx / (projects.length - 1)) * 2; // y goes from 1 to -1
        const r = Math.sqrt(1 - y * y);
        const theta = phiOffset * idx;

        const posX = Math.cos(theta) * r * radius;
        const posY = y * radius;
        const posZ = Math.sin(theta) * r * radius;

        // Create the physical card
        const geometry = new THREE.PlaneGeometry(160, 80);

        // Initial fallback texture
        const fallbackTexture = createTextTexture(proj.name, proj.category, proj.color);
        const material = new THREE.MeshStandardMaterial({
            map: fallbackTexture,
            transparent: true,
            side: THREE.DoubleSide,
            emissive: 0x111122,
            emissiveIntensity: 0.5
        });

        // Async load the thumbnail
        const thumbPath = `ag-assets/thumbnails/${proj.id}.jpg`;
        textureLoader.load(thumbPath,
            (tex) => {
                tex.colorSpace = THREE.SRGBColorSpace;
                material.map = tex;
                // Emit slight white glow based on the image instead of default dark blue
                material.emissiveMap = tex;
                material.emissive = new THREE.Color(0xffffff);
                material.emissiveIntensity = 0.2;
                material.needsUpdate = true;
            },
            undefined,
            () => { /* silent fail, keeps fallback texture */ }
        );

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(posX, posY, posZ);

        // Orient towards center initially, then flip outwards
        mesh.lookAt(0, 0, 0);
        mesh.rotateY(Math.PI);

        // Store data for raycaster
        mesh.userData = { project: proj, originalPosition: mesh.position.clone() };

        scene.add(mesh);
        cards.push(mesh);
    });
}

function createStarfield() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 3000; i++) {
        vertices.push(
            THREE.MathUtils.randFloatSpread(2500),
            THREE.MathUtils.randFloatSpread(2500),
            THREE.MathUtils.randFloatSpread(2500)
        );
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial({ color: 0x8888aa, size: 2, sizeAttenuation: true, transparent: true, opacity: 0.6 });
    const points = new THREE.Points(geometry, material);
    scene.add(points);
}

function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function onMouseMove(event) {
    const rect = container.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
}

function onClick() {
    if (!raycaster || !mouse) return;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cards);

    if (intersects.length > 0) {
        const proj = intersects[0].object.userData.project;
        // Float out the card slightly
        const obj = intersects[0].object;
        obj.scale.set(1.2, 1.2, 1.2);
        setTimeout(() => obj.scale.set(1, 1, 1), 300);

        // Open Link depending on what's available
        if (proj.localPath) {
            window.open(proj.localPath, '_blank');
        }
    }
}

let hoveredObject = null;

function render() {
    animationId = requestAnimationFrame(render);

    controls.update();

    // Floating animation
    const time = Date.now() * 0.001;
    cards.forEach((card, i) => {
        card.position.y = card.userData.originalPosition.y + Math.sin(time + i) * 15;
        // Make cards face camera
        card.lookAt(camera.position);
    });

    // Raycasting
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cards);

    if (intersects.length > 0) {
        const object = intersects[0].object;
        if (hoveredObject !== object) {
            // New hover
            if (hoveredObject) hoveredObject.material.emissiveIntensity = 0.5;
            hoveredObject = object;
            hoveredObject.material.emissiveIntensity = 1.0;
            document.body.style.cursor = 'pointer';

            // Show Info Panel
            const p = hoveredObject.userData.project;
            infoPanel.innerHTML = `
                <div style="font-size:0.8rem;color:#5e6ad2;margin-bottom:0.5rem;text-transform:uppercase;">${p.category}</div>
                <h3 style="margin-bottom:0.5rem;font-size:1.5rem">${p.name}</h3>
                <p style="color:#a0a0b0;font-size:0.9rem;margin-bottom:1rem">${p.description}</p>
                <div style="font-size:0.75rem;color:#888;">Click to open ${p.localPath}</div>
            `;
            infoPanel.classList.remove('hidden');
        }
    } else {
        if (hoveredObject) {
            hoveredObject.material.emissiveIntensity = 0.5;
            hoveredObject = null;
            document.body.style.cursor = 'auto';
            infoPanel.classList.add('hidden');
        }
    }

    renderer.render(scene, camera);
}

function resume3D() {
    if (!animationId) {
        render();
    }
}

function pause3D() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}
