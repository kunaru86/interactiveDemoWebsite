// Rush Viewer - Main Application Coordinator
import { 
  initThreeViewer, 
  setExplodeValue, 
  setFloorIsolation, 
  setVisualizationStyle, 
  setCameraPreset, 
  handleResize 
} from './three-viewer.js';

import { 
  initPanoViewer, 
  switchRoom, 
  setAutoRotation, 
  handlePanoResize 
} from './pano-viewer.js';

import { 
  initVideoPlayer, 
  startVideoPlayback,
  stopVideoPlayback 
} from './video-player.js';

// DOM Selections
const navButtons = document.querySelectorAll('.mode-navigation .nav-btn');
const stages = document.querySelectorAll('.workspace .stage-section');

// 3D Explorer Controls
const explodeSlider = document.getElementById('explode-slider');
const explodeVal = document.getElementById('explode-val');
const floorButtons = document.querySelectorAll('.floor-btn');
const styleButtons = document.querySelectorAll('.style-btn');
const presetButtons = document.querySelectorAll('.preset-btn');

// Panorama Controls
const panoButtons = document.querySelectorAll('.pano-btn');
const autoRotateToggle = document.getElementById('auto-rotate-toggle');

// ----------------------------------------------------
// INITIALIZATION
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Icon Libraries
  if (window.lucide) {
    window.lucide.createIcons({
      attrs: {
        'stroke-width': 2,
        'width': 18,
        'height': 18
      }
    });
  }

  // 2. Initialize Core Sub-viewers
  initThreeViewer('three-canvas-container', 'explorer-info-text');
  initPanoViewer('pano-canvas-container');
  initVideoPlayer();

  // 3. Navigation Controls
  setupNavigation();

  // 4. Sub-viewer Event Listeners
  setupExplorerEvents();
  setupPanoramaEvents();

  // 5. Global Window Events
  window.addEventListener('resize', () => {
    handleResize();
    handlePanoResize();
  });
});

// ----------------------------------------------------
// NAVIGATION SYSTEM
// ----------------------------------------------------

function setupNavigation() {
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetMode = btn.getAttribute('data-mode');

      // Stop video playback if navigating away from video tab, otherwise start playback
      if (targetMode !== 'video') {
        stopVideoPlayback();
      } else {
        startVideoPlayback();
      }

      // Update Navigation styling
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Toggle stage display
      stages.forEach(stage => {
        const stageId = stage.getAttribute('id');
        if (stageId === `stage-${targetMode}`) {
          stage.classList.add('active');
        } else {
          stage.classList.remove('active');
        }
      });

      // Reflow WebGL canvases to fit updated flex sizing
      setTimeout(() => {
        handleResize();
        handlePanoResize();
      }, 50);
    });
  });
}

// ----------------------------------------------------
// 3D EXPLORER EVENT WIREUP
// ----------------------------------------------------

function setupExplorerEvents() {
  // Structure Explode slider
  if (explodeSlider) {
    explodeSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      explodeVal.textContent = `${val}%`;
      setExplodeValue(parseInt(val, 10));
    });
  }

  // Floor Selection isolation
  floorButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      floorButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setFloorIsolation(btn.getAttribute('data-floor'));
    });
  });

  // Visualization Style buttons (shaded, xray, wireframe)
  styleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      styleButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setVisualizationStyle(btn.getAttribute('data-style'));
    });
  });

  // Viewpoint Preset buttons
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setCameraPreset(btn.getAttribute('data-view'));
      
      // Auto deselect preset styling after animation completes
      setTimeout(() => {
        btn.classList.remove('active');
      }, 1000);
    });
  });
}

// ----------------------------------------------------
// PANORAMA EVENT WIREUP
// ----------------------------------------------------

function setupPanoramaEvents() {
  // Sidebar Room selection list
  panoButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      panoButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      switchRoom(btn.getAttribute('data-room'));
    });
  });

  // Auto rotation toggle checkbox
  if (autoRotateToggle) {
    autoRotateToggle.addEventListener('change', (e) => {
      setAutoRotation(e.target.checked);
    });
  }
}
