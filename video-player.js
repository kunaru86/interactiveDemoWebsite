// Custom Video Player Controller (Minimized Options & Autoplay Loop)

let video, videoWrapper, playOverlay;
let btnPlayPause, btnMuteUnmute;
let currentTimeEl, durationTimeEl;
let progressSlider, progressFill, bufferBar, hoverTimeEl;
let btnFullscreen;

export function initVideoPlayer() {
  video = document.getElementById('walkthrough-video');
  videoWrapper = document.getElementById('video-wrapper');
  playOverlay = document.getElementById('video-play-overlay');
  
  // Controls Buttons
  btnPlayPause = document.getElementById('btn-play-pause');
  btnMuteUnmute = document.getElementById('btn-mute-unmute');
  currentTimeEl = document.getElementById('current-time');
  durationTimeEl = document.getElementById('duration-time');
  
  // Progress Bar
  progressSlider = document.getElementById('progress-slider');
  progressFill = document.getElementById('video-progress-fill');
  bufferBar = document.getElementById('video-buffer-bar');
  hoverTimeEl = document.getElementById('progress-hover-time');

  // Secondary Controls
  btnFullscreen = document.getElementById('btn-fullscreen');

  if (!video) return;

  // Set default architectural video URL (Local rendering MP4)
  const defaultVideoUrl = "VideoFiles/villa%20render0001-0472.mp4";
  setVideoSource(defaultVideoUrl);

  // Configure autoplay loop
  video.loop = true;
  video.autoplay = true;
  video.muted = true; // Start muted to satisfy browser autoplay security policies

  // Initialize event listeners
  setupPlayerEvents();
}

function setVideoSource(url) {
  const source = document.getElementById('video-source');
  if (source && video) {
    source.src = url;
    video.load();
    resetPlayerUI();
  }
}

function resetPlayerUI() {
  if (progressFill) progressFill.style.width = '0%';
  if (bufferBar) bufferBar.style.width = '0%';
  if (progressSlider) progressSlider.value = 0;
  if (currentTimeEl) currentTimeEl.textContent = '0:00';
  updatePlayButtonIcon(false);
  if (playOverlay) playOverlay.classList.add('active');

  // Sync mute state icon
  if (video) {
    video.muted = true;
    if (btnMuteUnmute) {
      btnMuteUnmute.innerHTML = '<i data-lucide="volume-x"></i>';
    }
  }
  if (window.lucide) window.lucide.createIcons();
}

function setupPlayerEvents() {
  // 1. Play / Pause Actions
  const togglePlay = () => {
    if (video.paused) {
      video.play().catch(err => console.log("Video play interrupted:", err));
      updatePlayButtonIcon(true);
      playOverlay.classList.remove('active');
    } else {
      video.pause();
      updatePlayButtonIcon(false);
      playOverlay.classList.add('active');
    }
  };

  btnPlayPause.addEventListener('click', togglePlay);
  playOverlay.addEventListener('click', togglePlay);
  video.addEventListener('click', togglePlay);

  // 2. Video Time Updates
  video.addEventListener('timeupdate', () => {
    const curTime = video.currentTime;
    const duration = video.duration || 0;

    // Update Slider & Fill
    if (duration > 0) {
      const percentage = (curTime / duration) * 100;
      progressSlider.value = percentage;
      progressFill.style.width = `${percentage}%`;
    }

    // Time Display
    currentTimeEl.textContent = formatTime(curTime);
  });

  video.addEventListener('durationchange', () => {
    durationTimeEl.textContent = formatTime(video.duration);
  });

  // 3. Buffer Progress Bar
  video.addEventListener('progress', () => {
    if (video.buffered.length > 0 && video.duration > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const duration = video.duration;
      bufferBar.style.width = `${(bufferedEnd / duration) * 100}%`;
    }
  });

  // 4. Manual Progress Scrubbing
  progressSlider.addEventListener('input', () => {
    const pct = parseFloat(progressSlider.value);
    progressFill.style.width = `${pct}%`;
    if (video.duration) {
      video.currentTime = (pct / 100) * video.duration;
    }
  });

  // 5. Hover Time calculation on Progress container
  const progressContainer = progressSlider.parentElement;
  progressContainer.addEventListener('mousemove', (e) => {
    const rect = progressContainer.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const duration = video.duration || 0;
    
    if (duration > 0) {
      const hoverSec = pos * duration;
      hoverTimeEl.textContent = formatTime(hoverSec);
      hoverTimeEl.style.left = `${pos * 100}%`;
    }
  });

  // 6. Volume / Mute controls
  btnMuteUnmute.addEventListener('click', () => {
    if (video.muted) {
      video.muted = false;
      btnMuteUnmute.innerHTML = '<i data-lucide="volume-2"></i>';
    } else {
      video.muted = true;
      btnMuteUnmute.innerHTML = '<i data-lucide="volume-x"></i>';
    }
    if (window.lucide) window.lucide.createIcons();
  });

  // 7. Fullscreen Mode
  btnFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      videoWrapper.requestFullscreen().catch(err => {
        console.warn(`Error enabling fullscreen: ${err.message}`);
      });
      btnFullscreen.innerHTML = '<i data-lucide="minimize"></i>';
    } else {
      document.exitFullscreen();
      btnFullscreen.innerHTML = '<i data-lucide="maximize"></i>';
    }
    if (window.lucide) window.lucide.createIcons();
  });

  // Watch for escaping fullscreen via ESC key
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      btnFullscreen.innerHTML = '<i data-lucide="maximize"></i>';
      if (window.lucide) window.lucide.createIcons();
    }
  });

  // 8. Custom Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'BUTTON') return;
    
    const videoSection = document.getElementById('stage-video');
    if (!videoSection || !videoSection.classList.contains('active')) return;

    if (e.code === 'Space') {
      e.preventDefault();
      togglePlay();
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      video.currentTime = Math.min(video.duration, video.currentTime + 5);
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      video.currentTime = Math.max(0, video.currentTime - 5);
    } else if (e.code === 'KeyF') {
      e.preventDefault();
      btnFullscreen.click();
    }
  });

  // Hide/Show Controls bar on inactivity
  let controlsTimeout;
  const hideControls = () => {
    videoWrapper.classList.remove('controls-active');
  };
  const showControls = () => {
    videoWrapper.classList.add('controls-active');
    clearTimeout(controlsTimeout);
    if (!video.paused) {
      controlsTimeout = setTimeout(hideControls, 2500);
    }
  };

  videoWrapper.addEventListener('mousemove', showControls);
  videoWrapper.addEventListener('touchstart', showControls, { passive: true });
  videoWrapper.addEventListener('click', showControls);
  video.addEventListener('play', showControls);
  video.addEventListener('pause', () => {
    clearTimeout(controlsTimeout);
    videoWrapper.classList.add('controls-active');
  });
}

function updatePlayButtonIcon(isPlaying) {
  const icon = isPlaying ? 'pause' : 'play';
  btnPlayPause.innerHTML = `<i data-lucide="${icon}"></i>`;
  if (playOverlay) {
    playOverlay.innerHTML = `<div class="big-play-btn"><i data-lucide="${icon}"></i></div>`;
  }
  if (window.lucide) window.lucide.createIcons();
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// PUBLIC API FOR COORDINATOR
export function startVideoPlayback() {
  if (video) {
    video.play().then(() => {
      updatePlayButtonIcon(true);
      if (playOverlay) playOverlay.classList.remove('active');
    }).catch(err => console.log("Video autoplay failed:", err));
  }
}

export function stopVideoPlayback() {
  if (video && !video.paused) {
    video.pause();
    updatePlayButtonIcon(false);
    if (playOverlay) playOverlay.classList.add('active');
  }
}
