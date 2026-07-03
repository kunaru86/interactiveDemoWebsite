import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls;
let groundFloor, firstFloor, roofFloor;
let villaElements = []; // Store elements for raycasting
let currentStyle = 'shaded';
let currentHighlight = null;

// DOM Elements
let infoTextEl;

// Detailed descriptions for the 14 structural parts of the state-of-the-art villa
const structureDescriptions = {
  'foundation-slab': {
    name: 'Foundation Deck, Piles & Grade Beams',
    desc: 'Monolithic concrete foundation slab (450mm thickness) resting on a 150mm compacted gravel sub-base, supported by 10 heavy reinforced concrete friction piles (6m depth), concrete pile caps, and an interlocking perimeter grid of structural grade beams. Includes the deep reinforced pool vault and PVC drainage conduits.'
  },
  'ground-glazing': {
    name: 'Ground Floor Glazing & Steel Frames',
    desc: 'Double-height high-performance glass facade featuring Low-E glazing panels wrapped in matte-black structural steel window mullions. Optimizes natural daylight while providing structural stability.'
  },
  'exoskeleton-frame': {
    name: 'Monolithic Concrete Exoskeleton Cage',
    desc: 'Cast-in-place raw architectural concrete frame wrapping the rear, left, and right facades. Acts as a structural skeleton that anchors cantilevered upper slabs and frames scenic views.'
  },
  'infinity-pool': {
    name: 'Infinity Pool & Stepping Stone Paths',
    desc: 'Sunken monolithic concrete pool containing an active filtration edge. Intersected by floating slate concrete stepping stone pathways that cross the pool water to link the terraces.'
  },
  'facade-louvers': {
    name: 'Teak Wood Shading Louvers',
    desc: 'Decorative row of 11 vertical slats constructed from treated marine teak wood. Placed next to the main entrance lobby to filter morning sunlight and provide thermal mass protection.'
  },
  'floating-staircase': {
    name: 'Cantilevered Architectural Staircase',
    desc: 'Floating interior staircase featuring solid white-oak treads cantilevered directly out from a load-bearing concrete shear wall, supported by a central black steel spine stringer.'
  },
  'intermediate-slab': {
    name: 'Cantilevered First Floor Slab & Balconies',
    desc: 'Post-tensioned intermediate concrete floor slab with a dedicated staircase opening cutout. Features a luxury wooden balcony deck overlay, glass balustrades, and structural edge columns.'
  },
  'master-glazing': {
    name: 'Master Suite Glazing & Sliders',
    desc: 'Minimalist sliding glass door system made of tempered safety glass. Outlined with sleek matte-black aluminum window frames to connect the master bedroom directly to the balcony.'
  },
  'privacy-walls': {
    name: 'Acoustic Partition Walls',
    desc: 'Drywall assemblies insulated with high-density acoustic rockwool fibers. Inset from slab borders to prevent co-planar overlap and finished in sand-textured white stucco.'
  },
  'balcony-railing': {
    name: 'Minimalist Glass Balustrade',
    desc: 'Balcony safety barrier consisting of 12mm optical-grade tempered glass panels, anchored into the slab edge and capped with a thin graphite steel handrail.'
  },
  'roof-slab': {
    name: 'Insulated Roof Slab & Lounge Deck',
    desc: 'Flat roof concrete slab finished with tapered insulation layers, a waterproofing membrane, and a raised teak wood plank floor overlay forming a spacious sunset lounge deck.'
  },
  'solar-array': {
    name: 'Rooftop Photovoltaic Solar Grid',
    desc: 'Smart clean-energy grid containing 6 monocrystalline solar panels mounted on an angled steel support rack to supply sustainable electricity directly to the villa\'s cooling system.'
  },
  'rooftop-pergola': {
    name: 'Cantilevered Steel Pergola Frame',
    desc: 'Architectural open steel canopy projecting over the roof deck. Composed of black steel girders and horizontal slats that cast linear geometric shadow patterns across the lounge area.'
  },
  'interior-furniture': {
    name: 'Architectural Interior Furnishings & Props',
    desc: 'Custom interior blocks including a modular living room sofa, dining table set with center vase, kitchen island, master bed suite layout, poolside loungers, umbrella, and roof couches.'
  }
};

export function initThreeViewer(containerId, infoTextId) {
  const container = document.getElementById(containerId);
  infoTextEl = document.getElementById(infoTextId);
  if (!container) return;

  // 1. Scene Setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#f8fafc'); // Matching bright theme
  scene.fog = new THREE.FogExp2('#f8fafc', 0.012);

  // 2. Camera Setup
  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(38, 26, 48);

  // 3. Renderer Setup
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // 4. Controls Setup
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2 - 0.05;
  controls.minDistance = 10;
  controls.maxDistance = 140;

  // 5. Lights Setup
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
  dirLight.position.set(30, 50, 20);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 120;
  const d = 35;
  dirLight.shadow.camera.left = -d;
  dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d;
  dirLight.shadow.camera.bottom = -d;
  dirLight.shadow.bias = -0.0003;
  scene.add(dirLight);

  const fillLight = new THREE.DirectionalLight(0x2563eb, 0.25); // Subtle royal blue fill
  fillLight.position.set(-30, 20, -30);
  scene.add(fillLight);

  // 6. Build Villa (Renders the updated, state-of-the-art model)
  buildVillaModel();

  // 7. Raycasting click handler
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  container.addEventListener('pointerdown', (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(villaElements, true);

    if (intersects.length > 0) {
      let hitObj = intersects[0].object;
      while (hitObj && hitObj.parent && !hitObj.userData.partId) {
        hitObj = hitObj.parent;
      }

      if (hitObj && hitObj.userData.partId) {
        highlightPart(hitObj);
      }
    } else {
      clearHighlight();
    }
  });

  // 8. Animation loop
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  const loadingScreen = document.getElementById('explorer-loading');
  if (loadingScreen) {
    loadingScreen.classList.add('fade-out');
  }
}

// ----------------------------------------------------
// DETAILED PROCEDURAL MODEL GENERATION
// ----------------------------------------------------
function buildVillaModel() {
  groundFloor = new THREE.Group();
  firstFloor = new THREE.Group();
  roofFloor = new THREE.Group();

  scene.add(groundFloor);
  scene.add(firstFloor);
  scene.add(roofFloor);

  // Base Architectural Materials
  const matConcrete = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 }); // Light slate concrete
  const matConcreteDark = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 }); // Dark concrete
  const matGravel = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.95 }); // Compacted gravel sub-base
  const matPipe = new THREE.MeshStandardMaterial({ color: 0x0891b2, roughness: 0.2, metalness: 0.1 }); // PVC blue conduit
  const matWood = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.65 }); // Rich teak deck
  const matParquet = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 }); // Golden oak parquet for indoor floors
  const matMarble = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.2, metalness: 0.1 }); // Polished marble
  const matSteel = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.25 }); // Matte-black frames
  const matGlass = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.3, roughness: 0.05, metalness: 0.95 });
  const matPoolWater = new THREE.MeshStandardMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.65, roughness: 0.1, metalness: 0.5 });
  const matSolar = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.1 });
  const matHedge = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 });
  const matStones = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
  const matCushion = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });

  // Helper function to create framed windows
  function createFramedWindow(width, height, thickness, partId) {
    const group = new THREE.Group();
    group.userData.partId = partId;

    // Glass panel
    const glass = new THREE.Mesh(new THREE.BoxGeometry(width - 0.1, height - 0.1, thickness), matGlass);
    group.add(glass);

    // Steel borders
    const frameTop = new THREE.Mesh(new THREE.BoxGeometry(width, 0.06, thickness + 0.04), matSteel);
    frameTop.position.y = height / 2 - 0.03;
    const frameBottom = new THREE.Mesh(new THREE.BoxGeometry(width, 0.06, thickness + 0.04), matSteel);
    frameBottom.position.y = -height / 2 + 0.03;
    const frameLeft = new THREE.Mesh(new THREE.BoxGeometry(0.06, height - 0.12, thickness + 0.04), matSteel);
    frameLeft.position.x = -width / 2 + 0.03;
    const frameRight = new THREE.Mesh(new THREE.BoxGeometry(0.06, height - 0.12, thickness + 0.04), matSteel);
    frameRight.position.x = width / 2 - 0.03;

    group.add(frameTop, frameBottom, frameLeft, frameRight);
    villaElements.push(glass); // raycasting target
    return group;
  }

  // ----------------------------------------------------
  // ENGINEERING-GRADE FOUNDATION SYSTEM & BEDROCK BASE
  // ----------------------------------------------------
  const foundationGroup = new THREE.Group();
  foundationGroup.userData.partId = 'foundation-slab';

  // 1. Bedrock Stratum Base Layer
  const bedrockBase = new THREE.Mesh(new THREE.BoxGeometry(42.0, 0.8, 28.0), matGravel);
  bedrockBase.position.set(-2.0, -8.1, 0.0); // Spans Y = [-8.5, -7.7]
  bedrockBase.receiveShadow = true;
  foundationGroup.add(bedrockBase);

  // 2. Compacted Gravel Sub-Base Bed
  const gravelBed = new THREE.Mesh(new THREE.BoxGeometry(20.4, 0.3, 18.4), matGravel);
  gravelBed.position.set(-6, -1.05, 0); // Spans Y = [-1.2, -0.9]
  gravelBed.receiveShadow = true;
  foundationGroup.add(gravelBed);

  // 3. Exoskeleton Corner Pile Caps & Friction Piles with Flared Bells
  const cornerCapPositions = [
    [-16.4, -9.4], [16.4, -9.4], [-16.4, 9.4], [16.4, 9.4]
  ];
  cornerCapPositions.forEach(([x, z]) => {
    // Pile Cap block
    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 1.6), matConcrete);
    cap.position.set(x, -1.3, z); // Spans Y = [-1.7, -0.9]
    cap.castShadow = true;
    foundationGroup.add(cap);

    // Friction Pile cylinder extending to bedrock (-7.7)
    const pile = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 6.0, 12), matConcreteDark);
    pile.position.set(x, -4.7, z); // Spans Y = [-7.7, -1.7]
    pile.castShadow = true;
    foundationGroup.add(pile);

    // Flared Pile Bell resting on Bedrock
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.75, 0.6, 12), matConcreteDark);
    bell.position.set(x, -7.4, z); // Spans Y = [-7.7, -7.1]
    bell.castShadow = true;
    foundationGroup.add(bell);
  });

  // 4. Interior Columns Pile Caps & Friction Piles with Bells
  const colPositionsG = [
    [-15.2, 7.7], [-15.2, -7.7], [0.5, 7.7], [0.5, -7.7], [7.5, 7.7], [7.5, -7.7]
  ];
  colPositionsG.forEach(([x, z]) => {
    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.6, 1.0), matConcrete);
    cap.position.set(x, -1.2, z); // Spans Y = [-1.5, -0.9]
    cap.castShadow = true;
    foundationGroup.add(cap);

    // Friction Pile extending down to bedrock
    const pile = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 6.2, 8), matConcreteDark);
    pile.position.set(x, -4.6, z); // Spans Y = [-7.7, -1.5]
    pile.castShadow = true;
    foundationGroup.add(pile);

    // Flared Pile Bell
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 0.6, 8), matConcreteDark);
    bell.position.set(x, -7.4, z); // Spans Y = [-7.7, -7.1]
    bell.castShadow = true;
    foundationGroup.add(bell);
  });

  // 5. Perimeter Grade Beams
  const beamB = new THREE.Mesh(new THREE.BoxGeometry(32.8, 0.6, 0.6), matConcrete); 
  beamB.position.set(0, -1.2, -9.4);
  const beamF = new THREE.Mesh(new THREE.BoxGeometry(32.8, 0.6, 0.6), matConcrete); 
  beamF.position.set(0, -1.2, 9.4);
  const beamL = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 18.8), matConcrete); 
  beamL.position.set(-16.4, -1.2, 0);
  const beamR = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 18.8), matConcrete); 
  beamR.position.set(16.4, -1.2, 0);
  foundationGroup.add(beamB, beamF, beamL, beamR);

  // 6. Pool Foundation Vault Base Slab
  const poolBaseSlab = new THREE.Mesh(new THREE.BoxGeometry(12, 0.4, 12), matConcrete);
  poolBaseSlab.position.set(10, -1.1, 3.0); 
  foundationGroup.add(poolBaseSlab);

  // 4 Support Piles under the pool vault corners (extends to bedrock -7.7)
  const poolPilePositions = [
    [4.5, -2.5], [15.5, -2.5], [4.5, 8.5], [15.5, 8.5]
  ];
  poolPilePositions.forEach(([x, z]) => {
    const pile = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 6.4, 8), matConcreteDark);
    pile.position.set(x, -4.5, z); // Spans Y = [-7.7, -1.3]
    pile.castShadow = true;
    foundationGroup.add(pile);

    // Pool pile bells
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.55, 0.6, 8), matConcreteDark);
    bell.position.set(x, -7.4, z); // Spans Y = [-7.7, -7.1]
    bell.castShadow = true;
    foundationGroup.add(bell);
  });

  // Plumbing Circulation Pipe Conduits
  const drainagePipe = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4.0), matPipe);
  drainagePipe.position.set(10, -1.1, -1.0); 
  drainagePipe.rotation.x = Math.PI / 2;
  foundationGroup.add(drainagePipe);

  groundFloor.add(foundationGroup);
  villaElements.push(gravelBed);


  // ----------------------------------------------------
  // 1. GROUND LEVEL BUILD (Slabs & Columns)
  // ----------------------------------------------------

  // Concrete Foundation Base Slab
  const mainFoundation = new THREE.Mesh(new THREE.BoxGeometry(20, 0.9, 18), matConcrete);
  mainFoundation.position.set(-6, -0.45, 0); // y = -0.9 to 0.0
  mainFoundation.receiveShadow = true;
  mainFoundation.castShadow = true;
  mainFoundation.userData.partId = 'foundation-slab';
  groundFloor.add(mainFoundation);
  villaElements.push(mainFoundation);

  // Patio Wooden Deck (Raised 0.01 to eliminate Z-fighting)
  const woodDeck = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.02, 17.8), matWood);
  woodDeck.position.set(-10, 0.01, 0);
  woodDeck.receiveShadow = true;
  woodDeck.userData.partId = 'foundation-slab';
  groundFloor.add(woodDeck);
  villaElements.push(woodDeck);

  // Ground Floor Polished Marble Floor Cover
  const marbleFloorG = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.02, 16.0), matMarble);
  marbleFloorG.position.set(0.0, 0.01, 0);
  marbleFloorG.receiveShadow = true;
  marbleFloorG.userData.partId = 'foundation-slab';
  groundFloor.add(marbleFloorG);
  villaElements.push(marbleFloorG);

  // Sunken Lounge Pit Seating Area
  const loungeGroup = new THREE.Group();
  loungeGroup.position.set(-10, 0.02, 3);
  loungeGroup.userData.partId = 'foundation-slab';

  const barL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 5.0), matConcreteDark);
  barL.position.set(-2.1, 0.2, 0);
  barL.castShadow = true;
  const barR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 5.0), matConcreteDark);
  barR.position.set(2.1, 0.2, 0);
  barR.castShadow = true;
  const barB = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.4, 0.8), matConcreteDark);
  barB.position.set(0, 0.2, -2.1);
  barB.castShadow = true;
  const barF = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.4, 0.8), matConcreteDark);
  barF.position.set(0, 0.2, 2.1);
  barF.castShadow = true;
  loungeGroup.add(barL, barR, barB, barF);

  const seatBack = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.15, 0.8), matCushion);
  seatBack.position.set(0, 0.075, -1.3);
  seatBack.castShadow = true;
  const seatLeft = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 1.8), matCushion);
  seatLeft.position.set(-1.3, 0.075, 0);
  seatLeft.castShadow = true;
  const seatRight = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 1.8), matCushion);
  seatRight.position.set(1.3, 0.075, 0);
  seatRight.castShadow = true;
  loungeGroup.add(seatBack, seatLeft, seatRight);

  const fireTable = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.2, 1.0), matSteel);
  fireTable.position.set(0, 0.1, 0);
  fireTable.castShadow = true;
  const fireCore = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.3), new THREE.MeshBasicMaterial({ color: 0xea580c }));
  fireCore.position.set(0, 0.21, 0);
  loungeGroup.add(fireTable, fireCore);

  groundFloor.add(loungeGroup);
  villaElements.push(barL);

  // Ground Floor Columns
  colPositionsG.forEach(([x, z]) => {
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.3, 6.88, 0.3), matSteel);
    col.position.set(x, 2.54, z); // Spans Y = [-0.9, 5.98]
    col.castShadow = true;
    col.receiveShadow = true;
    col.userData.partId = 'columns-ground';
    groundFloor.add(col);
    villaElements.push(col);
  });

  // Solid Concrete Walls - Ground Floor
  const backWallG = new THREE.Mesh(new THREE.BoxGeometry(15.6, 5.96, 0.4), matConcrete);
  backWallG.position.set(-8.1, 2.99, -8.3); 
  backWallG.castShadow = true;
  backWallG.receiveShadow = true;
  backWallG.userData.partId = 'foundation-slab';
  groundFloor.add(backWallG);
  villaElements.push(backWallG);

  const leftWallG = new THREE.Mesh(new THREE.BoxGeometry(0.4, 5.96, 7.6), matConcrete);
  leftWallG.position.set(-15.6, 2.99, -4.5); 
  leftWallG.castShadow = true;
  leftWallG.receiveShadow = true;
  leftWallG.userData.partId = 'foundation-slab';
  groundFloor.add(leftWallG);
  villaElements.push(leftWallG);

  // Decorative Shading Louvers next to lobby entry
  const louverGroup = new THREE.Group();
  louverGroup.userData.partId = 'facade-louvers';
  for (let i = 0; i < 11; i++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.12, 5.95, 0.25), matWood);
    slat.position.set(-6.5 + i * 0.3, 2.985, 8.2);
    slat.castShadow = true;
    louverGroup.add(slat);
  }
  groundFloor.add(louverGroup);
  villaElements.push(louverGroup.children[0]);

  // Framed Glazing Facade - Ground Floor
  const groundGlazing = new THREE.Group();
  groundGlazing.position.set(3.0, 2.99, 8.0);
  
  const w1 = createFramedWindow(6.5, 5.94, 0.08, 'ground-glazing');
  w1.position.x = -6.6;
  const w2 = createFramedWindow(6.5, 5.94, 0.08, 'ground-glazing');
  w2.position.x = 0.0;
  const w3 = createFramedWindow(6.5, 5.94, 0.08, 'ground-glazing');
  w3.position.x = 6.6;
  
  groundGlazing.add(w1, w2, w3);
  groundFloor.add(groundGlazing);

  // Floating Staircase
  const stairCore = new THREE.Group();
  stairCore.userData.partId = 'floating-staircase';
  for (let i = 0; i < 12; i++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.08, 1.6), matWood);
    step.position.set(-11.5 + i * 0.42, 0.04 + i * 0.5, -2);
    step.castShadow = true;
    step.receiveShadow = true;
    stairCore.add(step);
  }
  const stringer = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.12, 0.12), matSteel);
  stringer.position.set(-9.5, 2.5, -2);
  stringer.rotation.z = Math.atan(6/5);
  stairCore.add(stringer);
  groundFloor.add(stairCore);
  villaElements.push(stringer);


  // ----------------------------------------------------
  // 2. FIRST FLOOR LEVEL BUILD
  // ----------------------------------------------------
  const firstFloorOffset = 6.0;

  // Intermediate Floor Slab Cutout (Width changed from 36 to 32 to prevent column side-clipping)
  // Extends X: [-16, 16]
  const slabFront = new THREE.Mesh(new THREE.BoxGeometry(32, 0.5, 9), matConcrete);
  slabFront.position.set(0, firstFloorOffset + 0.25, 4.5); // Spans z = [0, 9], X = [-16, 16]
  slabFront.receiveShadow = true;
  slabFront.castShadow = true;
  slabFront.userData.partId = 'intermediate-slab';
  firstFloor.add(slabFront);
  villaElements.push(slabFront);

  const slabBackRight = new THREE.Mesh(new THREE.BoxGeometry(24, 0.5, 9), matConcrete);
  slabBackRight.position.set(4, firstFloorOffset + 0.25, -4.5); // Spans z = [-9, 0], x = [-8, 16]
  slabBackRight.receiveShadow = true;
  slabBackRight.castShadow = true;
  slabBackRight.userData.partId = 'intermediate-slab';
  firstFloor.add(slabBackRight);
  villaElements.push(slabBackRight);

  // Left support slab (Width adjusted from 12 to 8 to fit within X = -16 column envelope)
  const slabBackLeftSupport = new THREE.Mesh(new THREE.BoxGeometry(8, 0.5, 6), matConcrete);
  slabBackLeftSupport.position.set(-12, firstFloorOffset + 0.25, -6.0); // Spans z = [-9, -3], x = [-16, -8]
  slabBackLeftSupport.receiveShadow = true;
  slabBackLeftSupport.userData.partId = 'intermediate-slab';
  firstFloor.add(slabBackLeftSupport);
  villaElements.push(slabBackLeftSupport);

  // First Floor Wood Parquet Floor Cover (Width adjusted from 18 to 16 to sit inside bedroom walls)
  const bedroomFloorF = new THREE.Mesh(new THREE.BoxGeometry(16.0, 0.02, 14.5), matParquet);
  bedroomFloorF.position.set(-8.0, firstFloorOffset + 0.52, -1.0); // Spans X = [-16, 0]
  bedroomFloorF.receiveShadow = true;
  bedroomFloorF.userData.partId = 'intermediate-slab';
  firstFloor.add(bedroomFloorF);
  villaElements.push(bedroomFloorF);

  // Balcony Wooden Deck Overlay
  const balconyDeckF = new THREE.Mesh(new THREE.BoxGeometry(15.8, 0.02, 2.3), matWood);
  balconyDeckF.position.set(7.9, firstFloorOffset + 0.52, 7.55); 
  balconyDeckF.receiveShadow = true;
  balconyDeckF.userData.partId = 'intermediate-slab';
  firstFloor.add(balconyDeckF);
  villaElements.push(balconyDeckF);

  // Balcony Glass Railings with structural frames
  const balconyRailingGroup = new THREE.Group();
  balconyRailingGroup.userData.partId = 'balcony-railing';
  
  const glassPanel = new THREE.Mesh(new THREE.BoxGeometry(15.8, 1.05, 0.04), matGlass);
  glassPanel.position.set(7.9, firstFloorOffset + 1.05, 8.7);
  balconyRailingGroup.add(glassPanel);

  const handrail = new THREE.Mesh(new THREE.BoxGeometry(16.0, 0.04, 0.06), matSteel);
  handrail.position.set(7.9, firstFloorOffset + 1.6, 8.7);
  balconyRailingGroup.add(handrail);

  for (let i = 0; i <= 4; i++) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.1, 0.06), matSteel);
    post.position.set(0.0 + i * 3.95, firstFloorOffset + 1.05, 8.7);
    balconyRailingGroup.add(post);
  }
  firstFloor.add(balconyRailingGroup);
  villaElements.push(glassPanel);

  // First Floor Columns (Positioned at Z = 5.9 inside room bounds)
  const colPositionsF = [
    [-15.2, 5.9], [-15.2, -7.7], [0.5, 5.9], [0.5, -7.7], [7.5, 5.9], [7.5, -7.7]
  ];
  colPositionsF.forEach(([x, z]) => {
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.25, 4.98, 0.25), matSteel);
    col.position.set(x, firstFloorOffset + 3.0, z);
    col.castShadow = true;
    col.userData.partId = 'intermediate-slab';
    firstFloor.add(col);
    villaElements.push(col);
  });

  // Solid Partition Walls - First Floor
  const bedBlockWallBack = new THREE.Mesh(new THREE.BoxGeometry(15.6, 4.96, 0.38), matConcrete);
  bedBlockWallBack.position.set(-6.1, firstFloorOffset + 2.99, -8.3); 
  bedBlockWallBack.castShadow = true;
  bedBlockWallBack.receiveShadow = true;
  bedBlockWallBack.userData.partId = 'privacy-walls';
  firstFloor.add(bedBlockWallBack);
  villaElements.push(bedBlockWallBack);

  const bedBlockWallLeft = new THREE.Mesh(new THREE.BoxGeometry(0.38, 4.96, 11.6), matConcrete);
  bedBlockWallLeft.position.set(-13.7, firstFloorOffset + 2.99, -2.6); 
  bedBlockWallLeft.castShadow = true;
  bedBlockWallLeft.userData.partId = 'privacy-walls';
  firstFloor.add(bedBlockWallLeft);
  villaElements.push(bedBlockWallLeft);

  const bedBlockWallInt = new THREE.Mesh(new THREE.BoxGeometry(0.35, 4.96, 5.6), matConcrete);
  bedBlockWallInt.position.set(-6.1, firstFloorOffset + 2.99, 3.1); 
  bedBlockWallInt.userData.partId = 'privacy-walls';
  firstFloor.add(bedBlockWallInt);
  villaElements.push(bedBlockWallInt);

  // Bedroom Glazing Grids
  const upperGlazing = new THREE.Group();
  upperGlazing.position.set(5.0, firstFloorOffset + 2.99, 6.3);
  
  const uw1 = createFramedWindow(7.3, 4.94, 0.08, 'master-glazing');
  uw1.position.x = -3.7;
  const uw2 = createFramedWindow(7.3, 4.94, 0.08, 'master-glazing');
  uw2.position.x = 3.7;

  upperGlazing.add(uw1, uw2);
  firstFloor.add(upperGlazing);


  // ----------------------------------------------------
  // 3. ROOF LEVEL BUILD
  // ----------------------------------------------------
  const roofFloorOffset = 11.5;

  // Roof Concrete slab (Slab center offset shifted to -3 to fit exactly within columns bounds X: [-16, 10])
  const mainFoundationR = new THREE.Mesh(new THREE.BoxGeometry(26, 0.4, 17), matConcrete);
  mainFoundationR.position.set(-3, roofFloorOffset + 0.2, 0); // y = 11.5 to 11.9
  mainFoundationR.receiveShadow = true;
  mainFoundationR.castShadow = true;
  mainFoundationR.userData.partId = 'roof-slab';
  roofFloor.add(mainFoundationR);
  villaElements.push(mainFoundationR);

  // Wooden Lounge Planks (Shifted to match roof slab offset)
  const roofDeck = new THREE.Mesh(new THREE.BoxGeometry(12, 0.02, 9.8), matWood);
  roofDeck.position.set(-1, roofFloorOffset + 0.41, 2);
  roofDeck.receiveShadow = true;
  roofDeck.userData.partId = 'roof-slab';
  roofFloor.add(roofDeck);
  villaElements.push(roofDeck);

  // Glass safety fence on roof edges (Shifted to match roof slab offset)
  const roofRailingGroup = new THREE.Group();
  roofRailingGroup.userData.partId = 'roof-slab';

  const roofFence = new THREE.Mesh(new THREE.BoxGeometry(25.6, 0.95, 0.04), matGlass);
  roofFence.position.set(-3, roofFloorOffset + 0.9, 8.2);
  roofRailingGroup.add(roofFence);

  const roofFenceCap = new THREE.Mesh(new THREE.BoxGeometry(25.8, 0.04, 0.06), matSteel);
  roofFenceCap.position.set(-3, roofFloorOffset + 1.4, 8.2);
  roofRailingGroup.add(roofFenceCap);

  roofFloor.add(roofRailingGroup);
  villaElements.push(roofFence);

  // Rooftop Solar Panel Grid
  const solarGroup = new THREE.Group();
  solarGroup.position.set(-10.5, roofFloorOffset + 0.6, -3.5); // Shifted slightly right to prevent edge overhang
  solarGroup.userData.partId = 'solar-array';

  const solarRack = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.15, 3.8), matSteel);
  solarRack.rotation.x = -Math.PI / 12;
  solarRack.castShadow = true;
  solarGroup.add(solarRack);

  for (let i = -2.25; i <= 2.25; i += 1.5) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 3.6), matSolar);
    panel.position.set(i, 0.12, 0);
    panel.rotation.x = -Math.PI / 12;
    solarGroup.add(panel);
    villaElements.push(panel);
  }
  roofFloor.add(solarGroup);
  villaElements.push(solarRack);

  // Cantilevered Steel Pergola Frame (Shifted to match roof deck)
  const pergolaGroup = new THREE.Group();
  pergolaGroup.position.set(-1, roofFloorOffset + 0.4, 2);
  pergolaGroup.userData.partId = 'rooftop-pergola';

  const colP1 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 3.2, 0.15), matSteel);
  colP1.position.set(-5.9, 1.6, 4.8);
  colP1.castShadow = true;
  const colP2 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 3.2, 0.15), matSteel);
  colP2.position.set(5.9, 1.6, 4.8);
  colP2.castShadow = true;
  pergolaGroup.add(colP1, colP2);

  const pergolaBeamL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 10.0), matSteel);
  pergolaBeamL.position.set(-5.9, 3.2, 0);
  const pergolaBeamR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 10.0), matSteel);
  pergolaBeamR.position.set(5.9, 3.2, 0);
  pergolaGroup.add(pergolaBeamL, pergolaBeamR);

  for (let i = -4.5; i <= 4.5; i += 1.1) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(12.0, 0.04, 0.15), matSteel);
    slat.position.set(0, 3.2, i);
    slat.castShadow = true;
    pergolaGroup.add(slat);
  }
  roofFloor.add(pergolaGroup);
  villaElements.push(colP1);


  // ----------------------------------------------------
  // 4. WATER FEATURES & LANDSCAPING (Stepping stones moved outside to Z = 9.5 to prevent living room clipping)
  // ----------------------------------------------------
  
  // Concrete Pool Outer Container
  const poolContainer = new THREE.Mesh(new THREE.BoxGeometry(12, 0.9, 12), matConcreteDark);
  poolContainer.position.set(10, -0.45, 3.0); 
  poolContainer.receiveShadow = true;
  poolContainer.castShadow = true;
  poolContainer.userData.partId = 'infinity-pool';
  groundFloor.add(poolContainer);
  villaElements.push(poolContainer);

  // Recessed Water Slab
  const poolWater = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.5, 11.6), matPoolWater);
  poolWater.position.set(10, -0.2, 3.0); 
  poolWater.userData.partId = 'infinity-pool';
  groundFloor.add(poolWater);
  villaElements.push(poolWater);

  // Concrete Pathway Stepping Stones (Moved to Z = 9.5 and raised Y to 0.02 to avoid marble slab Z-fighting)
  const landscapeGroup = new THREE.Group();
  landscapeGroup.userData.partId = 'landscaping';

  for (let i = 0; i < 4; i++) {
    const stone = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.03, 1.2), matStones);
    stone.position.set(-5.5 + i * 2.2, 0.02, 9.5); // Placed outside facade in the front yard
    stone.receiveShadow = true;
    landscapeGroup.add(stone);
    villaElements.push(stone);
  }

  // Concrete planter boxes with vertical hedges
  const planter = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.7, 1.2), matConcreteDark);
  planter.position.set(-10, 0.35, -5.0);
  planter.castShadow = true;
  planter.receiveShadow = true;
  landscapeGroup.add(planter);
  villaElements.push(planter);

  const hedge = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.9, 1.0), matHedge);
  hedge.position.set(-10, 1.0, -5.0);
  hedge.castShadow = true;
  landscapeGroup.add(hedge);
  villaElements.push(hedge);

  // Minimalist Cedar Trees
  for (let i = 0; i < 2; i++) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(-14.0, 0.01, -4.5 + i * 3.5);

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.5), matSteel);
    trunk.position.y = 1.75;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    const foliage = new THREE.Mesh(new THREE.ConeGeometry(0.8, 2.5, 5), matHedge);
    foliage.position.y = 3.0;
    foliage.castShadow = true;
    treeGroup.add(foliage);

    landscapeGroup.add(treeGroup);
    villaElements.push(trunk);
  }
  
  groundFloor.add(landscapeGroup);


  // ----------------------------------------------------
  // 5. INTERIOR FURNITURE & PROPS
  // ----------------------------------------------------
  const furnitureGroup = new THREE.Group();
  furnitureGroup.userData.partId = 'interior-furniture';

  // Ground Floor Couch Lounge
  const couchBase = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.35, 2.2), matSteel);
  couchBase.position.set(0, 0.175, 2);
  couchBase.castShadow = true;
  const couchCushion = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.35, 2.0), new THREE.MeshStandardMaterial({ color: 0x475569 }));
  couchCushion.position.set(0, 0.525, 2);
  couchCushion.castShadow = true;
  const couchBack = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.7, 0.35), new THREE.MeshStandardMaterial({ color: 0x334155 }));
  couchBack.position.set(0, 0.7, 1.075);
  couchBack.castShadow = true;
  furnitureGroup.add(couchBase, couchCushion, couchBack);

  // Minimalist Kitchen Counter Island
  const kitchenIsland = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.9, 1.2), matConcreteDark);
  kitchenIsland.position.set(3, 0.45, -4);
  kitchenIsland.castShadow = true;
  furnitureGroup.add(kitchenIsland);

  // Dining Table set
  const diningTable = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.75, 1.1), matWood);
  diningTable.position.set(-3.5, 0.375, -4);
  diningTable.castShadow = true;
  furnitureGroup.add(diningTable);
  for (let i = 0; i < 4; i++) {
    const chair = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.45, 0.4), matSteel);
    chair.position.set(-4.2 + (i % 2) * 1.4, 0.225, -4.5 + Math.floor(i / 2) * 1.0);
    chair.castShadow = true;
    furnitureGroup.add(chair);
  }
  // PROP: Small black flower vase
  const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.4), matSteel);
  vase.position.set(-3.5, 0.95, -4);
  vase.castShadow = true;
  furnitureGroup.add(vase);

  // First Floor Master Bed
  const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.4, 2.2), matWood);
  bedFrame.position.set(-4, firstFloorOffset + 0.72, -1);
  bedFrame.castShadow = true;
  const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.3, 2.0), matCushion);
  mattress.position.set(-4, firstFloorOffset + 1.07, -1);
  mattress.castShadow = true;
  furnitureGroup.add(bedFrame, mattress);

  // PROPS: Poolside Sun Lounge Chairs
  for (let i = 0; i < 2; i++) {
    const loungeChairGroup = new THREE.Group();
    loungeChairGroup.position.set(-5.5, 0.01, -4.0 + i * 2.0);

    const chairBase = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.15, 0.9), matWood);
    chairBase.castShadow = true;
    loungeChairGroup.add(chairBase);

    const pad = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 0.85), matCushion);
    pad.position.set(-0.1, 0.14, 0);
    pad.castShadow = true;
    loungeChairGroup.add(pad);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.22, 0.85), new THREE.MeshStandardMaterial({ color: 0xe2e8f0 }));
    head.position.set(-0.8, 0.24, 0);
    head.rotation.z = Math.PI / 10;
    head.castShadow = true;
    loungeChairGroup.add(head);

    furnitureGroup.add(loungeChairGroup);
  }

  // PROP: Poolside Canvas Umbrella
  const umbrellaGroup = new THREE.Group();
  umbrellaGroup.position.set(-7.5, 0.01, -3.0);
  
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.2), matSteel);
  pole.position.y = 1.6;
  pole.castShadow = true;
  umbrellaGroup.add(pole);

  const canopy = new THREE.Mesh(new THREE.ConeGeometry(2.2, 0.6, 4), matCushion);
  canopy.position.y = 3.2;
  canopy.rotation.y = Math.PI / 4;
  canopy.castShadow = true;
  umbrellaGroup.add(canopy);
  
  furnitureGroup.add(umbrellaGroup);

  // PROPS: First Floor Balcony Planter Boxes
  const balconyPlanter = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.5, 0.6), matConcreteDark);
  balconyPlanter.position.set(3.5, firstFloorOffset + 0.75, 8.2);
  balconyPlanter.castShadow = true;
  const balconyHedge = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.6, 0.5), matHedge);
  balconyHedge.position.set(3.5, firstFloorOffset + 1.1, 8.2);
  balconyHedge.castShadow = true;
  furnitureGroup.add(balconyPlanter, balconyHedge);

  // PROPS: Rooftop Sunset Lounge couches (Shifted to match roof deck)
  const roofLoungeGroup = new THREE.Group();
  roofLoungeGroup.position.set(-1.0, roofFloorOffset + 0.42, 2.0); 

  const sofaBlock1 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.38, 1.0), matCushion);
  sofaBlock1.position.set(0, 0.19, 3.8);
  sofaBlock1.castShadow = true;
  const sofaBlock2 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.38, 3.2), matCushion);
  sofaBlock2.position.set(-4.2, 0.19, 1.7);
  sofaBlock2.castShadow = true;

  const roofCoffeeTable = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.18, 0.9), matWood);
  roofCoffeeTable.position.set(-1.0, 0.09, 1.5);
  roofCoffeeTable.castShadow = true;

  roofLoungeGroup.add(sofaBlock1, sofaBlock2, roofCoffeeTable);
  furnitureGroup.add(roofLoungeGroup);

  groundFloor.add(furnitureGroup);
  villaElements.push(couchBase, kitchenIsland, diningTable, bedFrame);


  // ----------------------------------------------------
  // 6. EXOSKELETON CONCRETE STRUCTURE CAGE
  // ----------------------------------------------------
  const cageGroup = new THREE.Group();
  cageGroup.userData.partId = 'exoskeleton-frame';

  // 4 Corner Columns (Height extended to 12.9 and Y-pos set to 5.55 to connect directly to the sub-grade pile caps at Y = -0.9)
  const colLB = new THREE.Mesh(new THREE.BoxGeometry(0.8, 12.9, 0.8), matConcreteDark);
  colLB.position.set(-16.4, 5.55, -9.4); // Spans Y = [-0.9, 12.0]
  colLB.castShadow = true;
  colLB.receiveShadow = true;
  cageGroup.add(colLB);

  const colRB = new THREE.Mesh(new THREE.BoxGeometry(0.8, 12.9, 0.8), matConcreteDark);
  colRB.position.set(16.4, 5.55, -9.4); // Spans Y = [-0.9, 12.0]
  colRB.castShadow = true;
  colRB.receiveShadow = true;
  cageGroup.add(colRB);

  const colLF = new THREE.Mesh(new THREE.BoxGeometry(0.8, 12.9, 0.8), matConcreteDark);
  colLF.position.set(-16.4, 5.55, 9.4); // Spans Y = [-0.9, 12.0]
  colLF.castShadow = true;
  colLF.receiveShadow = true;
  cageGroup.add(colLF);

  const colRF = new THREE.Mesh(new THREE.BoxGeometry(0.8, 12.9, 0.8), matConcreteDark);
  colRF.position.set(16.4, 5.55, 9.4); // Spans Y = [-0.9, 12.0]
  colRF.castShadow = true;
  colRF.receiveShadow = true;
  cageGroup.add(colRF);

  // Top Spanning Beams (Forming a fully enclosed upper ring at Y = 12.2)
  const beamTopB = new THREE.Mesh(new THREE.BoxGeometry(33.6, 0.8, 0.8), matConcreteDark); // Rear top beam
  beamTopB.position.set(0, 12.2, -9.4);
  beamTopB.castShadow = true;
  beamTopB.receiveShadow = true;
  cageGroup.add(beamTopB);

  const beamTopF = new THREE.Mesh(new THREE.BoxGeometry(33.6, 0.8, 0.8), matConcreteDark); // Front top beam
  beamTopF.position.set(0, 12.2, 9.4);
  beamTopF.castShadow = true;
  beamTopF.receiveShadow = true;
  cageGroup.add(beamTopF);

  const beamTopL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 19.6), matConcreteDark); // Left top beam
  beamTopL.position.set(-16.4, 12.2, 0);
  beamTopL.castShadow = true;
  beamTopL.receiveShadow = true;
  cageGroup.add(beamTopL);

  const beamTopR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 19.6), matConcreteDark); // Right top beam
  beamTopR.position.set(16.4, 12.2, 0);
  beamTopR.castShadow = true;
  beamTopR.receiveShadow = true;
  cageGroup.add(beamTopR);

  // Mid Spanning Beams (Forming an intermediate floor support ring at Y = 6.25)
  const beamMidB = new THREE.Mesh(new THREE.BoxGeometry(33.6, 0.5, 0.8), matConcreteDark);
  beamMidB.position.set(0, 6.25, -9.4);
  beamMidB.castShadow = true;
  cageGroup.add(beamMidB);

  const beamMidF = new THREE.Mesh(new THREE.BoxGeometry(33.6, 0.5, 0.8), matConcreteDark);
  beamMidF.position.set(0, 6.25, 9.4);
  beamMidF.castShadow = true;
  cageGroup.add(beamMidF);

  const beamMidL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 19.6), matConcreteDark);
  beamMidL.position.set(-16.4, 6.25, 0);
  beamMidL.castShadow = true;
  cageGroup.add(beamMidL);

  const beamMidR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 19.6), matConcreteDark);
  beamMidR.position.set(16.4, 6.25, 0);
  beamMidR.castShadow = true;
  cageGroup.add(beamMidR);

  groundFloor.add(cageGroup);
  villaElements.push(colLB, colRB, beamTopB, colRF, beamTopL, beamTopR);
}

// ----------------------------------------------------
// INTERACTIVE HIGHLIGHT & VIEWPORTS
// ----------------------------------------------------

// Highlight clicked component
function highlightPart(partObj) {
  clearHighlight();

  const partId = partObj.userData.partId;
  const detail = structureDescriptions[partId];
  if (!detail) return;

  currentHighlight = partObj;
  
  if (currentStyle === 'shaded' || currentStyle === 'xray') {
    partObj.material.emissive = new THREE.Color(0x0891b2);
    partObj.material.emissiveIntensity = 0.25;
  } else {
    partObj.material.color.setHex(0x0891b2);
  }

  if (infoTextEl) {
    infoTextEl.innerHTML = `
      <h4 style="color: var(--accent-cyan); font-family: var(--font-display); font-size: 0.95rem; margin-bottom: 0.5rem; font-weight:600;">${detail.name}</h4>
      <p style="color: var(--text-primary); font-size: 0.8rem; line-height: 1.5;">${detail.desc}</p>
    `;
  }
}

// Reset highlight
function clearHighlight() {
  if (currentHighlight) {
    if (currentHighlight.material) {
      if (currentHighlight.material.emissive) {
        currentHighlight.material.emissive.setHex(0x000000);
      }
      if (currentStyle === 'wireframe') {
        currentHighlight.material.color.setHex(0x0891b2);
      } else {
        currentHighlight.material.color.setHex(getOriginalColorHex(currentHighlight.userData.partId));
      }
    }
    currentHighlight = null;
  }

  if (infoTextEl) {
    infoTextEl.innerHTML = '<p style="color:var(--text-muted); font-size:0.8rem;">Select an architectural element or use controls to dissect the modern minimalist villa.</p>';
  }
}

// Exploded view animation
export function setExplodeValue(value) {
  const factor = value / 100;
  
  // Ground floor remains static
  groundFloor.position.y = 0;
  
  // First floor moves up (max 8.5 units)
  firstFloor.position.y = factor * 8.5;
  
  // Roof floor moves up (max 17 units)
  roofFloor.position.y = factor * 17;
}

// Toggle floor isolation
export function setFloorIsolation(floor) {
  setExplodeValue(0);
  const slider = document.getElementById('explode-slider');
  const sliderVal = document.getElementById('explode-val');
  if (slider) slider.value = 0;
  if (sliderVal) sliderVal.innerText = '0%';

  if (floor === 'all') {
    groundFloor.visible = true;
    firstFloor.visible = true;
    roofFloor.visible = true;
  } else if (floor === 'ground') {
    groundFloor.visible = true;
    firstFloor.visible = false;
    roofFloor.visible = false;
  } else if (floor === 'first') {
    groundFloor.visible = false;
    firstFloor.visible = true;
    roofFloor.visible = false;
  } else if (floor === 'roof') {
    groundFloor.visible = false;
    firstFloor.visible = false;
    roofFloor.visible = true;
  }
}

// Style rendering toggle
export function setVisualizationStyle(style) {
  currentStyle = style;
  clearHighlight();

  scene.traverse((obj) => {
    if (obj.isMesh) {
      const partId = obj.userData.partId;
      
      if (style === 'shaded') {
        obj.material.wireframe = false;
        
        if (partId === 'master-glazing' || partId === 'ground-glazing' || partId === 'balcony-railing') {
          obj.material.transparent = true;
          obj.material.opacity = 0.3;
        } else if (partId === 'infinity-pool') {
          obj.material.transparent = true;
          obj.material.opacity = 0.65;
        } else {
          obj.material.transparent = false;
          obj.material.opacity = 1.0;
        }
        obj.material.color.setHex(getOriginalColorHex(partId));
      } 
      else if (style === 'xray') {
        obj.material.wireframe = false;
        obj.material.transparent = true;
        
        if (partId === 'master-glazing' || partId === 'ground-glazing' || partId === 'balcony-railing') {
          obj.material.opacity = 0.05;
          obj.material.color.setHex(0x0891b2);
        } else if (partId === 'columns-ground' || partId === 'floating-staircase' || partId === 'rooftop-pergola') {
          obj.material.opacity = 0.45;
          obj.material.color.setHex(0x2563eb);
        } else {
          obj.material.opacity = 0.18;
          obj.material.color.setHex(0xe2e8f0);
        }
      } 
      else if (style === 'wireframe') {
        obj.material.wireframe = true;
        obj.material.transparent = true;
        obj.material.opacity = 0.85;
        obj.material.color.setHex(0x0891b2); // Cyan grid lines
      }
    }
  });
}

function getOriginalColorHex(partId) {
  if (partId === 'master-glazing' || partId === 'ground-glazing' || partId === 'balcony-railing') return 0xe0f2fe; // Glass
  if (partId === 'columns-ground' || partId === 'floating-staircase' || partId === 'rooftop-pergola') return 0x1e293b; // Matte Steel
  if (partId === 'infinity-pool') return 0x06b6d4; // Pool water
  if (partId === 'solar-array') return 0x0f172a;
  if (partId === 'interior-furniture') return 0x475569;
  if (partId === 'facade-louvers') return 0xb45309; // Wood
  if (partId === 'exoskeleton-frame') return 0x475569; // Dark Concrete
  if (partId === 'landscaping') return 0x64748b; // Slate stones
  return 0xe2e8f0; // Light Concrete base
}

// Camera presets
export function setCameraPreset(view) {
  if (view === 'isometric') {
    animateCameraPosition(38, 26, 48, 0, 5, 0);
  } else if (view === 'front') {
    animateCameraPosition(0, 5, 48, 0, 5, 0);
  } else if (view === 'top') {
    animateCameraPosition(0, 64, 0.1, 0, 0, 0);
  } else if (view === 'interior') {
    animateCameraPosition(0, 2.5, 9, 0, 2.5, -20);
  }
}

function animateCameraPosition(tx, ty, tz, lx, ly, lz) {
  const duration = 1000;
  const startPos = camera.position.clone();
  const startLook = controls.target.clone();
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

    camera.position.lerpVectors(startPos, new THREE.Vector3(tx, ty, tz), ease);
    controls.target.lerpVectors(startLook, new THREE.Vector3(lx, ly, lz), ease);
    controls.update();

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}

// Resize handler
export function handleResize() {
  if (!camera || !renderer || !controls) return;
  const container = renderer.domElement.parentElement;
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}
