import * as THREE from 'three';

let scene, camera, renderer;
let panoMesh, panoMaterial;
let textureLoader = new THREE.TextureLoader();
textureLoader.setCrossOrigin('anonymous');

// Panorama State variables
let isUserInteracting = false;
let isRotationPaused = false;
let rotationResumeTimeout = null;

let onPointerDownMouseX = 0, onPointerDownMouseY = 0;
let lon = 0, onPointerDownLon = 0;
let lat = 0, onPointerDownLat = 0;
let phi = 0, theta = 0;
let targetFov = 75;
let currentRoom = 'living';
let autoRotate = true;

// Hotspots state
let hotspots = [];
const hotspotConfig = {
  living: [
    { target: 'pool', pos: new THREE.Vector3(-4.0, 0.2, -3.0).normalize().multiplyScalar(10), label: 'Pool Deck' },
    { target: 'bedroom', pos: new THREE.Vector3(-1.0, 3.5, -4.5).normalize().multiplyScalar(10), label: 'Master Bedroom' }
  ],
  bedroom: [
    { target: 'terrace', pos: new THREE.Vector3(-2.5, -0.6, -4.0).normalize().multiplyScalar(10), label: 'Roof Terrace' },
    { target: 'living', pos: new THREE.Vector3(2.0, -2.5, 4.5).normalize().multiplyScalar(10), label: 'Living Room' }
  ],
  kitchen: [
    { target: 'pool', pos: new THREE.Vector3(-4.0, -0.4, 3.5).normalize().multiplyScalar(10), label: 'Pool Deck' }
  ],
  terrace: [
    { target: 'pool', pos: new THREE.Vector3(4.5, -0.5, -2.5).normalize().multiplyScalar(10), label: 'Pool Deck' },
    { target: 'bedroom', pos: new THREE.Vector3(2.5, 0.6, 4.0).normalize().multiplyScalar(10), label: 'Master Bedroom' }
  ],
  pool: [
    { target: 'terrace', pos: new THREE.Vector3(-4, -0.4, 3.5).normalize().multiplyScalar(10), label: 'Roof Terrace' },
    { target: 'kitchen', pos: new THREE.Vector3(4, -0.6, -2.5).normalize().multiplyScalar(10), label: 'Kitchen' },
    { target: 'living', pos: new THREE.Vector3(3.5, -0.5, 3.5).normalize().multiplyScalar(10), label: 'Living Room' }
  ]
};

// Relative paths to local default images in 360Images directory
const defaultUrls = {
  living: '360Images/360 Interior images (5).png',
  bedroom: '360Images/360 Interior images (4).png',
  kitchen: '360Images/360 Interior images (3).png',
  terrace: '360Images/360 Interior images (2).png',
  pool: '360Images/360 Interior images (1).png'
};

// Procedural Canvas Gradients for fallback textures (if local images fail to load)
function createDefaultPanoTexture(room) {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  let grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  if (room === 'living') {
    grad.addColorStop(0, '#f8fafc');
    grad.addColorStop(0.5, '#cbd5e1');
    grad.addColorStop(1, '#f8fafc');
  } else if (room === 'bedroom') {
    grad.addColorStop(0, '#faf5ff');
    grad.addColorStop(0.5, '#e9d5ff');
    grad.addColorStop(1, '#faf5ff');
  } else if (room === 'kitchen') {
    grad.addColorStop(0, '#f0fdf4');
    grad.addColorStop(0.5, '#bbf7d0');
    grad.addColorStop(1, '#f0fdf4');
  } else if (room === 'terrace') {
    grad.addColorStop(0, '#fff7ed');
    grad.addColorStop(0.5, '#fed7aa');
    grad.addColorStop(1, '#fff7ed');
  } else if (room === 'pool') {
    grad.addColorStop(0, '#f0f9ff');
    grad.addColorStop(0.5, '#bae6fd');
    grad.addColorStop(1, '#f0f9ff');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw Grid Lines
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.05)';
  ctx.lineWidth = 1;
  const cols = 32;
  const rows = 16;
  const colWidth = canvas.width / cols;
  const rowHeight = canvas.height / rows;

  for (let i = 0; i <= cols; i++) {
    ctx.beginPath();
    ctx.moveTo(i * colWidth, 0);
    ctx.lineTo(i * colWidth, canvas.height);
    ctx.stroke();
  }
  for (let j = 0; j <= rows; j++) {
    ctx.beginPath();
    ctx.moveTo(0, j * rowHeight);
    ctx.lineTo(canvas.width, j * rowHeight);
    ctx.stroke();
  }

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 44px Outfit, Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let title = room.toUpperCase() + ' SPACE';
  if (room === 'living') title = 'GROUND FLOOR LIVING ROOM';
  if (room === 'bedroom') title = 'FIRST FLOOR MASTER BEDROOM';
  if (room === 'kitchen') title = 'MODERN KITCHEN AREA';
  if (room === 'terrace') title = 'ROOF PENTHOUSE TERRACE';
  if (room === 'pool') title = 'SUNKEN INFINITY POOL DECK';
  ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 50);

  ctx.fillStyle = 'rgba(8, 145, 178, 0.9)';
  ctx.font = '28px Outfit, sans-serif';
  ctx.fillText('360° INTERACTIVE PANORAMA DEMO', canvas.width / 2, canvas.height / 2 + 10);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

// Loads room texture with visual loading overlays and direct procedural fallbacks
function loadRoomTexture(room, callback) {
  const localUrl = defaultUrls[room];

  // Show loading indicator
  const loadingScreen = document.getElementById('panorama-loading');
  if (loadingScreen) {
    loadingScreen.classList.remove('fade-out');
  }

  textureLoader.load(
    localUrl,
    (tex) => {
      // Success: Apply linear filters and return
      tex.minFilter = THREE.LinearFilter;
      callback(tex);
      
      // Hide loading indicator
      if (loadingScreen) {
        loadingScreen.classList.add('fade-out');
      }
    },
    undefined,
    (err) => {
      // Error Fallback: Generate canvas texture immediately
      console.warn(`Local texture 360Images/ failed to load for ${room}. Loading procedural grid fallback.`, err);
      const canvasTex = createDefaultPanoTexture(room);
      callback(canvasTex);

      // Hide loading indicator
      if (loadingScreen) {
        loadingScreen.classList.add('fade-out');
      }
    }
  );
}

export function initPanoViewer(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // 1. Scene & Camera Setup
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(targetFov, container.clientWidth / container.clientHeight, 1, 1100);
  camera.target = new THREE.Vector3(0, 0, 0);

  // 2. Spherical Geometry (Inverted scale for viewing from center)
  const geometry = new THREE.SphereGeometry(500, 60, 40);
  geometry.scale(-1, 1, 1);

  // Create material with transparent placeholder until image loads
  panoMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  panoMesh = new THREE.Mesh(geometry, panoMaterial);
  scene.add(panoMesh);

  // 3. Load High-res Local Image first, then assign and display
  loadRoomTexture(currentRoom, (tex) => {
    panoMaterial.map = tex;
    panoMaterial.color.setHex(0xffffff); // reset black color overlay
    panoMaterial.needsUpdate = true;
  });

  // 4. Renderer Setup
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // 5. User Interaction Listeners
  container.addEventListener('pointerdown', onPointerDown);
  container.addEventListener('wheel', onDocumentMouseWheel);

  // 6. Build Navigation Hotspots
  updateHotspots();

  // 7. Animation Loop
  function animate() {
    requestAnimationFrame(animate);

    if (autoRotate && !isUserInteracting && !isRotationPaused) {
      lon += 0.04;
    }

    lat = Math.max(-85, Math.min(85, lat));
    phi = THREE.MathUtils.degToRad(90 - lat);
    theta = THREE.MathUtils.degToRad(lon);

    camera.target.x = 500 * Math.sin(phi) * Math.sin(theta);
    camera.target.y = 500 * Math.cos(phi);
    camera.target.z = 500 * Math.sin(phi) * Math.cos(theta);

    camera.lookAt(camera.target);

    if (camera.fov !== targetFov) {
      camera.fov += (targetFov - camera.fov) * 0.1;
      camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);
    renderHotspots(container);
  }
  
  animate();
}

// ----------------------------------------------------
// EVENT HANDLERS
// ----------------------------------------------------

function onPointerDown(event) {
  if (event.isPrimary === false) return;

  isUserInteracting = true;
  isRotationPaused = true;
  clearTimeout(rotationResumeTimeout);

  onPointerDownMouseX = event.clientX;
  onPointerDownMouseY = event.clientY;

  onPointerDownLon = lon;
  onPointerDownLat = lat;

  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup', onPointerUp);
}

function onPointerMove(event) {
  if (event.isPrimary === false) return;

  const clientX = event.clientX;
  const clientY = event.clientY;

  lon = (onPointerDownMouseX - clientX) * 0.15 + onPointerDownLon;
  lat = (clientY - onPointerDownMouseY) * 0.15 + onPointerDownLat;
}

function onPointerUp(event) {
  if (event.isPrimary === false) return;

  isUserInteracting = false;

  document.removeEventListener('pointermove', onPointerMove);
  document.removeEventListener('pointerup', onPointerUp);

  // Resume rotation after 10 seconds of no interaction
  clearTimeout(rotationResumeTimeout);
  rotationResumeTimeout = setTimeout(() => {
    isRotationPaused = false;
  }, 10000);
}

function onDocumentMouseWheel(event) {
  const fov = camera.fov + event.deltaY * 0.05;
  targetFov = Math.max(30, Math.min(90, fov));
}

// ----------------------------------------------------
// HOTSPOTS SYSTEM
// ----------------------------------------------------

function updateHotspots() {
  hotspots.forEach(h => {
    if (h.element && h.element.parentElement) {
      h.element.parentElement.removeChild(h.element);
    }
  });
  hotspots = [];

  const config = hotspotConfig[currentRoom] || [];
  const container = document.getElementById('pano-canvas-container');
  if (!container) return;

  config.forEach(cfg => {
    const el = document.createElement('button');
    el.className = 'pano-hotspot';
    el.innerHTML = '<i data-lucide="arrow-up-right"></i>';
    el.title = `Go to ${cfg.label}`;
    
    el.addEventListener('click', () => {
      switchRoom(cfg.target);
    });

    container.appendChild(el);
    
    if (window.lucide) {
      window.lucide.createIcons({
        attrs: {
          'stroke-width': 2.5,
          'width': 12,
          'height': 12
        }
      });
    }

    hotspots.push({
      position: cfg.pos,
      element: el,
      label: cfg.label
    });
  });
}

function renderHotspots(container) {
  if (!camera) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  hotspots.forEach(h => {
    const wp = h.position.clone();
    wp.project(camera);

    if (wp.z > 1.0) {
      h.element.style.display = 'none';
      return;
    }

    h.element.style.display = 'flex';
    const x = (wp.x * 0.5 + 0.5) * width;
    const y = (-wp.y * 0.5 + 0.5) * height;

    h.element.style.left = `${x}px`;
    h.element.style.top = `${y}px`;
  });
}

// ----------------------------------------------------
// PUBLIC API
// ----------------------------------------------------

export function switchRoom(room) {
  if (currentRoom === room) return;
  currentRoom = room;

  // Update active state in sidebar
  const buttons = document.querySelectorAll('#pano-locations-list .pano-btn');
  buttons.forEach(btn => {
    if (btn.getAttribute('data-room') === room) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Load and apply texture
  if (panoMesh && panoMaterial) {
    loadRoomTexture(room, (tex) => {
      // Clean up old map to release GPU memory
      if (panoMaterial.map) {
        panoMaterial.map.dispose();
      }
      panoMaterial.map = tex;
      panoMaterial.needsUpdate = true;
    });
  }

  // Align camera toward first hotspot
  const config = hotspotConfig[room] || [];
  if (config.length > 0) {
    const targetDir = config[0].pos.clone().normalize();
    const theta = Math.atan2(targetDir.x, targetDir.z);
    lon = THREE.MathUtils.radToDeg(theta);
    lat = 0;
  }

  updateHotspots();
}

export function setAutoRotation(enable) {
  autoRotate = enable;
}

export function handlePanoResize() {
  if (!camera || !renderer) return;
  const container = renderer.domElement.parentElement;
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}
