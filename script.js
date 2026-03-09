// Mac OS 9 Desktop - Main JavaScript File

// ============================================
// CLOCK
// ============================================
function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    document.getElementById('menuTime').textContent = `${displayHours}:${minutes} ${ampm}`;
}
setInterval(updateClock, 1000);
updateClock();

// ============================================
// ADVANCED WINDOW MANAGEMENT
// ============================================
let zIndexCounter = 100;
let draggedWindow = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let resizingWindow = null;
let resizeStartX = 0;
let resizeStartY = 0;
let resizeStartWidth = 0;
let resizeStartHeight = 0;
const windowStates = {};

function openWindow(windowId) {
    const win = document.getElementById(windowId);
    win.classList.add('active');
    focusWindow(win);
}

function closeWindow(windowId) {
    document.getElementById(windowId).classList.remove('active');
}

function focusWindow(win) {
    document.querySelectorAll('.window').forEach(w => w.classList.remove('focused'));
    win.classList.add('focused');
    win.style.zIndex = ++zIndexCounter;
}

function toggleMaximize(windowId) {
    const win = document.getElementById(windowId);
    
    if (win.classList.contains('maximized')) {
        // Restore to previous size and position
        win.classList.remove('maximized');
        if (windowStates[windowId]) {
            win.style.width = windowStates[windowId].width;
            win.style.height = windowStates[windowId].height;
            win.style.left = windowStates[windowId].left;
            win.style.top = windowStates[windowId].top;
        }
    } else {
        // Save current state before maximizing
        windowStates[windowId] = {
            width: win.style.width,
            height: win.style.height,
            left: win.style.left,
            top: win.style.top
        };
        win.classList.add('maximized');
    }
}

// Drag and drop for windows
document.addEventListener('mousedown', (e) => {
    const titleBar = e.target.closest('.window-title-bar');
    if (titleBar && !e.target.classList.contains('window-button')) {
        const windowId = titleBar.dataset.window;
        draggedWindow = document.getElementById(windowId);
        
        // Don't drag if maximized
        if (draggedWindow.classList.contains('maximized')) return;
        
        focusWindow(draggedWindow);
        dragOffsetX = e.clientX - draggedWindow.offsetLeft;
        dragOffsetY = e.clientY - draggedWindow.offsetTop;
        e.preventDefault();
    }

    const resizeHandle = e.target.closest('.window-resize-handle');
    if (resizeHandle) {
        const windowId = resizeHandle.dataset.window;
        resizingWindow = document.getElementById(windowId);
        focusWindow(resizingWindow);
        resizeStartX = e.clientX;
        resizeStartY = e.clientY;
        resizeStartWidth = resizingWindow.offsetWidth;
        resizeStartHeight = resizingWindow.offsetHeight;
        e.preventDefault();
    }

    const win = e.target.closest('.window');
    if (win) focusWindow(win);
});

document.addEventListener('mousemove', (e) => {
    if (draggedWindow) {
        draggedWindow.style.left = (e.clientX - dragOffsetX) + 'px';
        draggedWindow.style.top = (e.clientY - dragOffsetY) + 'px';
    }

    if (resizingWindow) {
        const newWidth = resizeStartWidth + (e.clientX - resizeStartX);
        const newHeight = resizeStartHeight + (e.clientY - resizeStartY);
        if (newWidth > 300) resizingWindow.style.width = newWidth + 'px';
        if (newHeight > 200) resizingWindow.style.height = newHeight + 'px';
    }
});

document.addEventListener('mouseup', () => {
    draggedWindow = null;
    resizingWindow = null;
});

// ============================================
// MUSIC PLAYER
// ============================================
const songs = [
    // EDIT THIS ARRAY WITH YOUR SONGS
    { 
        title: 'Celebration Acapella', 
        artist: 'endeNeka', 
        album: 'covers', 
        icon: '🎵',
        file: 'music/celebration.mp3',
        cover: 'music/late_registration.png'
    },
    { 
        title: 'Surf', 
        artist: 'endeNeka', 
        album: 'single', 
        icon: '🎶',
        file: 'music/Surf.wav',
        cover : 'music/launchpad.png'
    },
    { 
        title: 'Coupure', 
        artist: 'endeNeka', 
        album: 'single', 
        icon: '🎶',
        file: 'music/Coupure.wav',
        cover : 'music/launchpad.png'
    }
    
];

let currentTrack = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
const audio = new Audio();
audio.volume = 1.0;

// Audio event listeners
audio.addEventListener('ended', () => {
    if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
    } else {
        nextTrack();
    }
});

audio.addEventListener('timeupdate', () => {
    updateProgress();
});

audio.addEventListener('loadedmetadata', () => {
    updateProgress();
});

audio.addEventListener('error', (e) => {
    console.error('Audio error:', e);
    alert('Error loading audio file. Check the file path and format.');
});

function initMusicPlayer() {
    const playlist = document.getElementById('playlist');
    playlist.innerHTML = songs.map((song, i) => `
        <div class="playlist-item" onclick="playTrack(${i})">
            <div style="font-weight: bold;">${song.title}</div>
            <div style="font-size: 10px; color: #606060;">${song.artist} - ${song.album}</div>
        </div>
    `).join('');
    updatePlayerInfo();
}

function playTrack(index) {
    currentTrack = index;
    const song = songs[currentTrack];
    
    if (!song.file) {
        alert('No audio file specified for this track.');
        return;
    }
    
    audio.src = song.file;
    audio.load();
    audio.play().then(() => {
        isPlaying = true;
        updatePlayerInfo();
        updatePlayButton();
    }).catch(err => {
        console.error('Playback error:', err);
        alert('Could not play file. Make sure the path is correct.');
    });
}

function togglePlay() {
    if (!songs[currentTrack].file) {
        alert('No audio file specified.');
        return;
    }

    if (isPlaying) {
        audio.pause();
        isPlaying = false;
    } else {
        if (!audio.src) {
            playTrack(currentTrack);
            return;
        }
        audio.play();
        isPlaying = true;
    }
    updatePlayButton();
}

function stopTrack() {
    audio.pause();
    audio.currentTime = 0;
    isPlaying = false;
    updatePlayButton();
    updateProgress();
}

function nextTrack() {
    if (isShuffle) {
        currentTrack = Math.floor(Math.random() * songs.length);
    } else {
        currentTrack = (currentTrack + 1) % songs.length;
    }
    playTrack(currentTrack);
}

function previousTrack() {
    currentTrack = (currentTrack - 1 + songs.length) % songs.length;
    playTrack(currentTrack);
}

function toggleShuffle() {
    isShuffle = !isShuffle;
    document.getElementById('shuffleBtn').style.background = isShuffle ? 
        'linear-gradient(180deg, #8080ff 0%, #6060d0 100%)' : 
        'linear-gradient(180deg, #f0f0f0 0%, #c0c0c0 100%)';
}

function toggleRepeat() {
    isRepeat = !isRepeat;
    document.getElementById('repeatBtn').style.background = isRepeat ? 
        'linear-gradient(180deg, #8080ff 0%, #6060d0 100%)' : 
        'linear-gradient(180deg, #f0f0f0 0%, #c0c0c0 100%)';
}

function updatePlayerInfo() {
    const song = songs[currentTrack];
    
    // Display album art (image or emoji icon)
    const albumArtEl = document.getElementById('albumArt');
    if (song.cover) {
        albumArtEl.innerHTML = `<img src="${song.cover}" alt="Album Cover">`;
    } else {
        albumArtEl.innerHTML = song.icon;
    }
    
    document.getElementById('playerInfo').innerHTML = `
        <div style="font-weight: bold; margin-bottom: 4px;">${song.title}</div>
        <div style="font-size: 10px; color: #606060;">${song.artist}</div>
        <div style="font-size: 10px; color: #606060;">${song.album}</div>
    `;
    
    document.querySelectorAll('.playlist-item').forEach((item, i) => {
        item.classList.toggle('active', i === currentTrack);
    });
}

function updatePlayButton() {
    document.getElementById('playBtn').innerHTML = isPlaying ? '⏸️ Pause' : '▶️ Play';
}

function updateProgress() {
    const currentTime = audio.currentTime || 0;
    const duration = audio.duration || 0;
    
    if (duration > 0) {
        const percent = (currentTime / duration) * 100;
        document.getElementById('progressFill').style.width = percent + '%';
    }
    
    document.getElementById('progressTime').textContent = 
        `${formatTime(currentTime)} / ${formatTime(duration)}`;
}

function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Progress bar seek
document.getElementById('progressBar').addEventListener('click', (e) => {
    if (!audio.duration) return;
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = audio.duration * percent;
});

// Volume control
document.getElementById('volumeSlider').addEventListener('click', (e) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.volume = Math.max(0, Math.min(1, percent));
    document.getElementById('volumeFill').style.width = (percent * 100) + '%';
});

// ============================================
// GALLERY
// ============================================
const photoImages = [
    // EDIT THIS ARRAY WITH YOUR PHOTOS
    { name: 'DSC00119', file: 'photos/DSC00119.JPG' },
    { name: 'DSC00120', file: 'photos/DSC00120.JPG' },
    { name: 'DSC00121', file: 'photos/DSC00121.JPG' },
    { name: 'DSC00122', file: 'photos/DSC00122.JPG' },
    
  { name: '20241204_072451.jpg', file: 'photos/20241204_072451.jpg' },
  { name: '20250103_191001.jpg', file: 'photos/20250103_191001.jpg' },
  { name: '20250103_195111.jpg', file: 'photos/20250103_195111.jpg' },
  { name: '20250128_164847.jpg', file: 'photos/20250128_164847.jpg' },
  { name: '20250201_220601.jpg', file: 'photos/20250201_220601.jpg' },
  { name: 'DSC00119.JPG', file: 'photos/DSC00119.JPG' },
  { name: 'DSC00120.JPG', file: 'photos/DSC00120.JPG' },
  { name: 'DSC00121.JPG', file: 'photos/DSC00121.JPG' },
  { name: 'DSC00122.JPG', file: 'photos/DSC00122.JPG' },
  { name: 'IMG_20250314_011138903.jpg', file: 'photos/IMG_20250314_011138903.jpg' },
  { name: 'IMG_20250321_145040684.jpg', file: 'photos/IMG_20250321_145040684.jpg' },
  { name: 'IMG_20250424_154545420.jpg', file: 'photos/IMG_20250424_154545420.jpg' },
  { name: 'IMG_20250504_120028248.jpg', file: 'photos/IMG_20250504_120028248.jpg' },
  { name: 'IMG_20250504_122652310.jpg', file: 'photos/IMG_20250504_122652310.jpg' },
  { name: 'IMG_20250528_211132490.jpg', file: 'photos/IMG_20250528_211132490.jpg' },

  { name: 'IMG_20250602_133812888.jpg', file: 'photos/IMG_20250602_133812888.jpg' },
  { name: 'IMG_20250604_155420251.jpg', file: 'photos/IMG_20250604_155420251.jpg' },
  { name: 'IMG_20250610_135702126.jpg', file: 'photos/IMG_20250610_135702126.jpg' },
  { name: 'IMG_20250610_202638075.jpg', file: 'photos/IMG_20250610_202638075.jpg' },
  { name: 'IMG_20250614_214038422.jpg', file: 'photos/IMG_20250614_214038422.jpg' },
  { name: 'IMG_20250617_212247263.jpg', file: 'photos/IMG_20250617_212247263.jpg' },
  { name: 'IMG_20250621_212416870.jpg', file: 'photos/IMG_20250621_212416870.jpg' },
  { name: 'IMG_20250622_170139769.jpg', file: 'photos/IMG_20250622_170139769.jpg' },
  { name: 'IMG_20250709_155718883.jpg', file: 'photos/IMG_20250709_155718883.jpg' },
  { name: 'IMG_20250709_164233913.jpg', file: 'photos/IMG_20250709_164233913.jpg' },
  { name: 'IMG_20250711_090119296.jpg', file: 'photos/IMG_20250711_090119296.jpg' },
  { name: 'IMG_20250711_222045932.jpg', file: 'photos/IMG_20250711_222045932.jpg' },
  { name: 'IMG_20250712_080153391.jpg', file: 'photos/IMG_20250712_080153391.jpg' },
  { name: 'IMG_20250712_092733178.jpg', file: 'photos/IMG_20250712_092733178.jpg' },
  { name: 'IMG_20250712_102046625.jpg', file: 'photos/IMG_20250712_102046625.jpg' },
  { name: 'IMG_20250712_183734057.jpg', file: 'photos/IMG_20250712_183734057.jpg' },
  { name: 'IMG_20250713_015757045.jpg', file: 'photos/IMG_20250713_015757045.jpg' },
  { name: 'IMG_20250713_122347630.jpg', file: 'photos/IMG_20250713_122347630.jpg' },
  { name: 'IMG_20250718_193235424.jpg', file: 'photos/IMG_20250718_193235424.jpg' },

  { name: 'IMG_20250804_152618003.jpg', file: 'photos/IMG_20250804_152618003.jpg' },
  { name: 'IMG_20250804_152816313.jpg', file: 'photos/IMG_20250804_152816313.jpg' },
  { name: 'IMG_20250804_160336364.jpg', file: 'photos/IMG_20250804_160336364.jpg' },
  { name: 'IMG_20250804_161051599.jpg', file: 'photos/IMG_20250804_161051599.jpg' },
  { name: 'IMG_20250804_161601197.jpg', file: 'photos/IMG_20250804_161601197.jpg' },
  { name: 'IMG_20250804_161841222.jpg', file: 'photos/IMG_20250804_161841222.jpg' },
  { name: 'IMG_20250804_162009418.jpg', file: 'photos/IMG_20250804_162009418.jpg' },
  { name: 'IMG_20250804_162052568.jpg', file: 'photos/IMG_20250804_162052568.jpg' },
  { name: 'IMG_20250804_162706328.jpg', file: 'photos/IMG_20250804_162706328.jpg' },

  { name: 'IMG_20250917_212741069.jpg', file: 'photos/IMG_20250917_212741069.jpg' },
  { name: 'IMG_20251004_210136932.jpg', file: 'photos/IMG_20251004_210136932.jpg' },
  { name: 'IMG_20251005_141823611.jpg', file: 'photos/IMG_20251005_141823611.jpg' },
  { name: 'IMG_20251017_001325611.jpg', file: 'photos/IMG_20251017_001325611.jpg' },
  { name: 'IMG_20251017_225151115.jpg', file: 'photos/IMG_20251017_225151115.jpg' },
  { name: 'IMG_20251021_191421688.jpg', file: 'photos/IMG_20251021_191421688.jpg' },
  { name: 'IMG_20251114_170054711.jpg', file: 'photos/IMG_20251114_170054711.jpg' },
  { name: 'IMG_20251216_124218406 (1) (1).jpg', file: 'photos/IMG_20251216_124218406 (1) (1).jpg' },
  { name: 'IMG_20251229_143914694.jpg', file: 'photos/IMG_20251229_143914694.jpg' },
  { name: 'IMG_20260122_171253837.jpg', file: 'photos/IMG_20260122_171253837.jpg' },
  { name: 'IMG_20260124_110615538.jpg', file: 'photos/IMG_20260124_110615538.jpg' },
  { name: 'IMG_20260210_195411247.jpg', file: 'photos/IMG_20260210_195411247.jpg' },

  { name: 'Screenshot_20250202_173628_Instagram.jpg', file: 'photos/Screenshot_20250202_173628_Instagram.jpg' },


];

const drawingImages = [
    // EDIT THIS ARRAY WITH YOUR DRAWINGS
  {
    "name": "20210920_012934.jpg",
    "file": "drawings/20210920_012934.jpg"
  },
  {
    "name": "20211117_011538.png",
    "file": "drawings/20211117_011538.png"
  },
  {
    "name": "20240120_092406.jpg",
    "file": "drawings/20240120_092406.jpg"
  },
  {
    "name": "512 - tagme.jpg",
    "file": "drawings/512 - tagme.jpg"
  },
  {
    "name": "antihimeko.jpg",
    "file": "drawings/antihimeko.jpg"
  },
  {
    "name": "augustneka.png",
    "file": "drawings/augustneka.png"
  },
  {
    "name": "boules.png",
    "file": "drawings/boules.png"
  },
  {
    "name": "bowbow et moi.png",
    "file": "drawings/bowbow et moi.png"
  },
  {
    "name": "broke.png",
    "file": "drawings/broke.png"
  },
  {
    "name": "card.png",
    "file": "drawings/card.png"
  },
  {
    "name": "evolution neka.png",
    "file": "drawings/evolution neka.png"
  },
  {
    "name": "fitfeb.png",
    "file": "drawings/fitfeb.png"
  },
  {
    "name": "gamefillette.png",
    "file": "drawings/gamefillette.png"
  },
  {
    "name": "gamingfeb.png",
    "file": "drawings/gamingfeb.png"
  },
  {
    "name": "HiPaint_1706064240788.png",
    "file": "drawings/HiPaint_1706064240788.png"
  },
  {
    "name": "HiPaint_1714380504535.png",
    "file": "drawings/HiPaint_1714380504535.png"
  },
  {
    "name": "HiPaint_1716225138895.png",
    "file": "drawings/HiPaint_1716225138895.png"
  },
  {
    "name": "HiPaint_1716323112807.png",
    "file": "drawings/HiPaint_1716323112807.png"
  },
  {
    "name": "HiPaint_1716324749787.png",
    "file": "drawings/HiPaint_1716324749787.png"
  },
  {
    "name": "HiPaint_1716328082546.png",
    "file": "drawings/HiPaint_1716328082546.png"
  },
  {
    "name": "HiPaint_1716393625110.png",
    "file": "drawings/HiPaint_1716393625110.png"
  },
  {
    "name": "HiPaint_1716496607809.png",
    "file": "drawings/HiPaint_1716496607809.png"
  },
  {
    "name": "HiPaint_1716504969060.png",
    "file": "drawings/HiPaint_1716504969060.png"
  },
  {
    "name": "HiPaint_1716731711825.png",
    "file": "drawings/HiPaint_1716731711825.png"
  },
  {
    "name": "HiPaint_1716735020258.png",
    "file": "drawings/HiPaint_1716735020258.png"
  },
  {
    "name": "HiPaint_1719243875951.png",
    "file": "drawings/HiPaint_1719243875951.png"
  },
  {
    "name": "HiPaint_1719316785245.png",
    "file": "drawings/HiPaint_1719316785245.png"
  },
  {
    "name": "HiPaint_1720612431283.png",
    "file": "drawings/HiPaint_1720612431283.png"
  },
  {
    "name": "HiPaint_1720614107617.png",
    "file": "drawings/HiPaint_1720614107617.png"
  },
  {
    "name": "HiPaint_1720694944825.png",
    "file": "drawings/HiPaint_1720694944825.png"
  },
  {
    "name": "HiPaint_1721681967022.png",
    "file": "drawings/HiPaint_1721681967022.png"
  },
  {
    "name": "HiPaint_1722085130436.png",
    "file": "drawings/HiPaint_1722085130436.png"
  },
  {
    "name": "HiPaint_1722382939999.png",
    "file": "drawings/HiPaint_1722382939999.png"
  },
  {
    "name": "HiPaint_1722463970922.png",
    "file": "drawings/HiPaint_1722463970922.png"
  },
  {
    "name": "HiPaint_1722473334822.png",
    "file": "drawings/HiPaint_1722473334822.png"
  },
  {
    "name": "HiPaint_1722477195831.png",
    "file": "drawings/HiPaint_1722477195831.png"
  },
  {
    "name": "HiPaint_1722560140536.png",
    "file": "drawings/HiPaint_1722560140536.png"
  },
  {
    "name": "HiPaint_1723148668018.png",
    "file": "drawings/HiPaint_1723148668018.png"
  },
  {
    "name": "HiPaint_1723161089323.png",
    "file": "drawings/HiPaint_1723161089323.png"
  },
  {
    "name": "HiPaint_1723220305399.png",
    "file": "drawings/HiPaint_1723220305399.png"
  },
  {
    "name": "HiPaint_1723241417940.png",
    "file": "drawings/HiPaint_1723241417940.png"
  },
  {
    "name": "HiPaint_1723250641516.png",
    "file": "drawings/HiPaint_1723250641516.png"
  },
  {
    "name": "HiPaint_1723740820528.png",
    "file": "drawings/HiPaint_1723740820528.png"
  },
  {
    "name": "HiPaint_1724120184154.png",
    "file": "drawings/HiPaint_1724120184154.png"
  },
  {
    "name": "HiPaint_1724356036203.png",
    "file": "drawings/HiPaint_1724356036203.png"
  },
  {
    "name": "HiPaint_1724380586141.png",
    "file": "drawings/HiPaint_1724380586141.png"
  },
  {
    "name": "HiPaint_1724842561751.png",
    "file": "drawings/HiPaint_1724842561751.png"
  },
  {
    "name": "HiPaint_1724854959830.png",
    "file": "drawings/HiPaint_1724854959830.png"
  },
  {
    "name": "HiPaint_1724894602672.png",
    "file": "drawings/HiPaint_1724894602672.png"
  },
  {
    "name": "HiPaint_1725040555068.png",
    "file": "drawings/HiPaint_1725040555068.png"
  },
  {
    "name": "HiPaint_1725411448626.png",
    "file": "drawings/HiPaint_1725411448626.png"
  },
  {
    "name": "HiPaint_1725490975139.png",
    "file": "drawings/HiPaint_1725490975139.png"
  },
  {
    "name": "HiPaint_1725492513530.png",
    "file": "drawings/HiPaint_1725492513530.png"
  },
  {
    "name": "HiPaint_1725538465780.png",
    "file": "drawings/HiPaint_1725538465780.png"
  },
  {
    "name": "HiPaint_1725583374663.png",
    "file": "drawings/HiPaint_1725583374663.png"
  },
  {
    "name": "HiPaint_1725821932421.png",
    "file": "drawings/HiPaint_1725821932421.png"
  },
  {
    "name": "HiPaint_1725967691021.png",
    "file": "drawings/HiPaint_1725967691021.png"
  },
  {
    "name": "HiPaint_1726044035263.png",
    "file": "drawings/HiPaint_1726044035263.png"
  },
  {
    "name": "HiPaint_1729446860798.png",
    "file": "drawings/HiPaint_1729446860798.png"
  },
  {
    "name": "HiPaint_1730147376033.png",
    "file": "drawings/HiPaint_1730147376033.png"
  },
  {
    "name": "HiPaint_1733694002675.png",
    "file": "drawings/HiPaint_1733694002675.png"
  },
  {
    "name": "HiPaint_1733857165701.png",
    "file": "drawings/HiPaint_1733857165701.png"
  },
  {
    "name": "HiPaint_1734265094673.png",
    "file": "drawings/HiPaint_1734265094673.png"
  },
  {
    "name": "HiPaint_1734267650972.png",
    "file": "drawings/HiPaint_1734267650972.png"
  },
  {
    "name": "HiPaint_1734895845924.png",
    "file": "drawings/HiPaint_1734895845924.png"
  },
  {
    "name": "HiPaint_1741865805665.png",
    "file": "drawings/HiPaint_1741865805665.png"
  },
  {
    "name": "HiPaint_1770395809216 (1).png",
    "file": "drawings/HiPaint_1770395809216 (1).png"
  },
  {
    "name": "history.png",
    "file": "drawings/history.png"
  },
  {
    "name": "ilrevient.png",
    "file": "drawings/ilrevient.png"
  },
  {
    "name": "image-11.png",
    "file": "drawings/image-11.png"
  },
  {
    "name": "image-20.png",
    "file": "drawings/image-20.png"
  },
  {
    "name": "italianhomework.jpg",
    "file": "drawings/italianhomework.jpg"
  },
  {
    "name": "logo.png",
    "file": "drawings/logo.png"
  },
  {
    "name": "lovefeb.png",
    "file": "drawings/lovefeb.png"
  },
  {
    "name": "marchbandoctobert.png",
    "file": "drawings/marchbandoctobert.png"
  },
  {
    "name": "New Drawing2 (3).png",
    "file": "drawings/New Drawing2 (3).png"
  },
  {
    "name": "New_Drawing.png",
    "file": "drawings/New_Drawing.png"
  },
  {
    "name": "New_Drawing2-6.png",
    "file": "drawings/New_Drawing2-6.png"
  },
  {
    "name": "New_Drawing3-4.png",
    "file": "drawings/New_Drawing3-4.png"
  },
  {
    "name": "New_Drawing3.png",
    "file": "drawings/New_Drawing3.png"
  },
  {
    "name": "Projet (20250820021902).jpg",
    "file": "drawings/Projet (20250820021902).jpg"
  },
  {
    "name": "Projet (20250908094609).jpg",
    "file": "drawings/Projet (20250908094609).jpg"
  },
  {
    "name": "Projet (20250908115436).jpg",
    "file": "drawings/Projet (20250908115436).jpg"
  },
  {
    "name": "Projet (20250911112940).jpg",
    "file": "drawings/Projet (20250911112940).jpg"
  },
  {
    "name": "Projet (20250919060233).jpg",
    "file": "drawings/Projet (20250919060233).jpg"
  },
  {
    "name": "Projet (20250919063519).jpg",
    "file": "drawings/Projet (20250919063519).jpg"
  },
  {
    "name": "Projet (20250929041729).jpg",
    "file": "drawings/Projet (20250929041729).jpg"
  },
  {
    "name": "Projet (20251111013405).jpg",
    "file": "drawings/Projet (20251111013405).jpg"
  },
  {
    "name": "Projet (20251111022530).jpg",
    "file": "drawings/Projet (20251111022530).jpg"
  },
  {
    "name": "Projet (20251112065625).jpg",
    "file": "drawings/Projet (20251112065625).jpg"
  },
  {
    "name": "Projet (20251115054456).jpg",
    "file": "drawings/Projet (20251115054456).jpg"
  },
  {
    "name": "Projet (20251125123913).jpg",
    "file": "drawings/Projet (20251125123913).jpg"
  },
  {
    "name": "Projet (20251127011343).jpg",
    "file": "drawings/Projet (20251127011343).jpg"
  },
  {
    "name": "Projet (20251127014013).jpg",
    "file": "drawings/Projet (20251127014013).jpg"
  },
  {
    "name": "Projet (20251127015303).jpg",
    "file": "drawings/Projet (20251127015303).jpg"
  },
  {
    "name": "Projet (20251127125531).jpg",
    "file": "drawings/Projet (20251127125531).jpg"
  },
  {
    "name": "Projet (20251130042859).jpg",
    "file": "drawings/Projet (20251130042859).jpg"
  },
  {
    "name": "Projet (20251130045810).jpg",
    "file": "drawings/Projet (20251130045810).jpg"
  },
  {
    "name": "Projet (20251209054952).jpg",
    "file": "drawings/Projet (20251209054952).jpg"
  },
  {
    "name": "Projet (20251211024027)_024357.jpg",
    "file": "drawings/Projet (20251211024027)_024357.jpg"
  },
  {
    "name": "Projet (20251211032648).jpg",
    "file": "drawings/Projet (20251211032648).jpg"
  },
  {
    "name": "Projet (20251211082550).jpg",
    "file": "drawings/Projet (20251211082550).jpg"
  },
  {
    "name": "Projet (20251212114102)_114127.jpg",
    "file": "drawings/Projet (20251212114102)_114127.jpg"
  },
  {
    "name": "Projet (20251213112515).jpg",
    "file": "drawings/Projet (20251213112515).jpg"
  },
  {
    "name": "Projet (20251213115033).jpg",
    "file": "drawings/Projet (20251213115033).jpg"
  },
  {
    "name": "Projet (20251214121722).jpg",
    "file": "drawings/Projet (20251214121722).jpg"
  },
  {
    "name": "Projet (20251215105846)_105858.jpg",
    "file": "drawings/Projet (20251215105846)_105858.jpg"
  },
  {
    "name": "Projet (20251216070331)_070341.jpg",
    "file": "drawings/Projet (20251216070331)_070341.jpg"
  },
  {
    "name": "Projet (20251218014709).jpg",
    "file": "drawings/Projet (20251218014709).jpg"
  },
  {
    "name": "Projet (20251218111956).jpg",
    "file": "drawings/Projet (20251218111956).jpg"
  },
  {
    "name": "Projet (20251218113137).jpg",
    "file": "drawings/Projet (20251218113137).jpg"
  },
  {
    "name": "Projet (20251219043906).jpg",
    "file": "drawings/Projet (20251219043906).jpg"
  },
  {
    "name": "Projet (20251219050606).jpg",
    "file": "drawings/Projet (20251219050606).jpg"
  },
  {
    "name": "Projet (20251220041651).jpg",
    "file": "drawings/Projet (20251220041651).jpg"
  },
  {
    "name": "Projet (20251220045428).jpg",
    "file": "drawings/Projet (20251220045428).jpg"
  },
  {
    "name": "Projet (20251221035943)_040031.jpg",
    "file": "drawings/Projet (20251221035943)_040031.jpg"
  },
  {
    "name": "Projet (20251221095715).jpg",
    "file": "drawings/Projet (20251221095715).jpg"
  },
  {
    "name": "Projet (20251221111810).jpg",
    "file": "drawings/Projet (20251221111810).jpg"
  },
  {
    "name": "Projet (20251221113122).jpg",
    "file": "drawings/Projet (20251221113122).jpg"
  },
  {
    "name": "Projet (20251222051108)_051139.jpg",
    "file": "drawings/Projet (20251222051108)_051139.jpg"
  },
  {
    "name": "Projet (20251222054522)_054529.jpg",
    "file": "drawings/Projet (20251222054522)_054529.jpg"
  },
  {
    "name": "Projet (20251222064745)_064752.jpg",
    "file": "drawings/Projet (20251222064745)_064752.jpg"
  },
  {
    "name": "Projet (20251222120233).jpg",
    "file": "drawings/Projet (20251222120233).jpg"
  },
  {
    "name": "Projet (20251223065037)_065047.jpg",
    "file": "drawings/Projet (20251223065037)_065047.jpg"
  },
  {
    "name": "Projet (20251224014426).jpg",
    "file": "drawings/Projet (20251224014426).jpg"
  },
  {
    "name": "Projet (20251226044956).jpg",
    "file": "drawings/Projet (20251226044956).jpg"
  },
  {
    "name": "Projet (20251226050530).jpg",
    "file": "drawings/Projet (20251226050530).jpg"
  },
  {
    "name": "Projet (20251226120223).jpg",
    "file": "drawings/Projet (20251226120223).jpg"
  },
  {
    "name": "Projet (20251227035526)_035600.jpg",
    "file": "drawings/Projet (20251227035526)_035600.jpg"
  },
  {
    "name": "Projet (20251228043528)_043547.jpg",
    "file": "drawings/Projet (20251228043528)_043547.jpg"
  },
  {
    "name": "Projet (20251228055410)_055419.jpg",
    "file": "drawings/Projet (20251228055410)_055419.jpg"
  },
  {
    "name": "Projet (20251229102810).jpg",
    "file": "drawings/Projet (20251229102810).jpg"
  },
  {
    "name": "Projet (20260102014308)_014317.jpg",
    "file": "drawings/Projet (20260102014308)_014317.jpg"
  },
  {
    "name": "Projet (20260102021008).jpg",
    "file": "drawings/Projet (20260102021008).jpg"
  },
  {
    "name": "Projet (20260104051850)_051910.jpg",
    "file": "drawings/Projet (20260104051850)_051910.jpg"
  },
  {
    "name": "Projet (20260104113722)_113736.jpg",
    "file": "drawings/Projet (20260104113722)_113736.jpg"
  },
  {
    "name": "Projet (20260206125743).jpg",
    "file": "drawings/Projet (20260206125743).jpg"
  },
  {
    "name": "Projet (20260211013757)_013805.png",
    "file": "drawings/Projet (20260211013757)_013805.png"
  },
  {
    "name": "Projet (20260212051013)_051038.png",
    "file": "drawings/Projet (20260212051013)_051038.png"
  },
  {
    "name": "Projet (20260212054803)_054813.png",
    "file": "drawings/Projet (20260212054803)_054813.png"
  },
  {
    "name": "Projet (20260214121248)_121305.png",
    "file": "drawings/Projet (20260214121248)_121305.png"
  },
  {
    "name": "sketch-1759872071832.png",
    "file": "drawings/sketch-1759872071832.png"
  },
  {
    "name": "sketch-1760296373022.png",
    "file": "drawings/sketch-1760296373022.png"
  },
  {
    "name": "sketch-1767452238949_035726.png",
    "file": "drawings/sketch-1767452238949_035726.png"
  },
  {
    "name": "sketch-1767453757964_042245.png",
    "file": "drawings/sketch-1767453757964_042245.png"
  },
  {
    "name": "sketch-1767455477116_045132.png",
    "file": "drawings/sketch-1767455477116_045132.png"
  },
  {
    "name": "sketch-1767475398244_102323.png",
    "file": "drawings/sketch-1767475398244_102323.png"
  },
  {
    "name": "sketch-1767963806071_020334.png",
    "file": "drawings/sketch-1767963806071_020334.png"
  },
  {
    "name": "sketch-1767966417477_024707.png",
    "file": "drawings/sketch-1767966417477_024707.png"
  },
  {
    "name": "sketch-1767968194872_031644.png",
    "file": "drawings/sketch-1767968194872_031644.png"
  },
  {
    "name": "sketch-1767970200418_035021.png",
    "file": "drawings/sketch-1767970200418_035021.png"
  },
  {
    "name": "sketch-1767971377184_040944.png",
    "file": "drawings/sketch-1767971377184_040944.png"
  },
  {
    "name": "sketch-1767973115003_043840.png",
    "file": "drawings/sketch-1767973115003_043840.png"
  },
  {
    "name": "sketch-1768062263870_052430.png",
    "file": "drawings/sketch-1768062263870_052430.png"
  },
  {
    "name": "sketch-1768063990105_055315.png",
    "file": "drawings/sketch-1768063990105_055315.png"
  },
  {
    "name": "sketch-1768155324160_071531.png",
    "file": "drawings/sketch-1768155324160_071531.png"
  },
  {
    "name": "sketch-1768157388996_075001.png",
    "file": "drawings/sketch-1768157388996_075001.png"
  },
  {
    "name": "sketch-1768158295871_080510.png",
    "file": "drawings/sketch-1768158295871_080510.png"
  },
  {
    "name": "sketch-1768159394385_082321.png",
    "file": "drawings/sketch-1768159394385_082321.png"
  },
  {
    "name": "sketch-1768239961005_064609.png",
    "file": "drawings/sketch-1768239961005_064609.png"
  },
  {
    "name": "sketch-1769382322689_120546.png",
    "file": "drawings/sketch-1769382322689_120546.png"
  },
  {
    "name": "sketch-1769473002650_011655.png",
    "file": "drawings/sketch-1769473002650_011655.png"
  },
  {
    "name": "sketch-1769814533980_120903.png",
    "file": "drawings/sketch-1769814533980_120903.png"
  },
  {
    "name": "sketch-1770070397642_113044.png",
    "file": "drawings/sketch-1770070397642_113044.png"
  },
  {
    "name": "sketch-1770422693499_010503.png",
    "file": "drawings/sketch-1770422693499_010503.png"
  },
  {
    "name": "sketch-1770426448432_020738.png",
    "file": "drawings/sketch-1770426448432_020738.png"
  },
  {
    "name": "sketch-1770481028491_051721.png",
    "file": "drawings/sketch-1770481028491_051721.png"
  },
  {
    "name": "sketch-1770980685227_120450.png",
    "file": "drawings/sketch-1770980685227_120450.png"
  },
  {
    "name": "spaceneka.png",
    "file": "drawings/spaceneka.png"
  },
  {
    "name": "thefirst.jpg",
    "file": "drawings/thefirst.jpg"
  },
  {
    "name": "wantlovefeb.png",
    "file": "drawings/wantlovefeb.png"
  },
  {
    "name": "word.png",
    "file": "drawings/word.png"
  }

];

let currentFolder = 'photos';
let currentImageIndex = 0;
let currentImages = [];

function switchFolder(folder) {
    currentFolder = folder;
    loadGallery();
}

function loadGallery() {
    const images = currentFolder === 'photos' ? photoImages : drawingImages;
    currentImages = images;
    const grid = document.getElementById('galleryGrid');
    grid.innerHTML = images.map((img, i) => {
        const thumbContent = img.file ? 
            `<img src="${img.file}">` : 
            img.icon;
        
        return `
            <div class="gallery-item" onclick="openImage(${i})">
                <div class="gallery-thumbnail">${thumbContent}</div>
                <div class="gallery-label">${img.name}</div>
            </div>
        `;
    }).join('');
}

function openImage(index) {
    currentImageIndex = index;
    displayImage();
    openWindow('imageWindow');
}

function displayImage() {
    const img = currentImages[currentImageIndex];
    document.getElementById('imageTitle').textContent = img.name;
    
    const imageContent = img.file ?
        `<img src="${img.file}" style="max-width: 100%; max-height: 400px; border: 2px solid #808080;">` :
        `<div class="image-display">${img.icon}</div>`;
    
    document.getElementById('imageViewer').innerHTML = `
        ${imageContent}
        <div style="font-weight: bold;">${img.name}</div>
        <div style="font-size: 11px; color: #606060; margin-bottom: 8px;">
            Image ${currentImageIndex + 1} of ${currentImages.length}
        </div>
        <div class="image-controls">
            <button class="mac-button" onclick="prevImage()">⬅️ Previous</button>
            <button class="mac-button" onclick="nextImage()">Next ➡️</button>
            ${img.file ? '<button class="mac-button" onclick="window.open(currentImages[currentImageIndex].file)">🔍 Full Size</button>' : ''}
        </div>
    `;
}

function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
    displayImage();
}

function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % currentImages.length;
    displayImage();
}

// ============================================
// VIDEOS APPLICATION
// ============================================
const videos = [
    // EDIT THIS ARRAY WITH YOUR VIDEOS
    { title: 'endeNeka - the day of reckoning', file: 'videos/endeneka! - the day of reckoning.mp4', thumbnail: null },
    { title: 'endeNeka - the day of struggling', file: 'videos/the_day_of_struggling.mp4', thumbnail: null },
    { title: 'endeNeka - the day of boringing', file: 'videos/endeneka! - the day of boringning.mp4', thumbnail: null },
    { title: 'endeNeka - hey now', file: 'videos/endeneka! - hey now!.mp4', thumbnail: null },

];

let currentVideo = 0;
const videoPlayer = document.getElementById('videoPlayer');

function initVideos() {
    const videoList = document.getElementById('videoList');
    videoList.innerHTML = videos.map((video, i) => `
        <div class="video-item" onclick="playVideo(${i})">
            <div style="font-weight: bold;">${video.title}</div>
            <div style="font-size: 10px; color: #606060;">${video.file ? 'Ready to play' : 'No file specified'}</div>
        </div>
    `).join('');
}

function playVideo(index) {
    currentVideo = index;
    const video = videos[currentVideo];
    
    if (!video.file) {
        alert('No video file specified.');
        return;
    }
    
    videoPlayer.src = video.file;
    videoPlayer.load();
    
    document.querySelectorAll('.video-item').forEach((item, i) => {
        item.classList.toggle('active', i === currentVideo);
    });
}

// ============================================
// NOTES APPLICATION WITH DYNAMIC FILE LOADING
// ============================================
let noteFiles = [];
let currentNote = 0;

async function initNotes() {
    try {
        // Try to load notes index file first
        const response = await fetch('notes/index.txt');
        if (response.ok) {
            const indexText = await response.text();
            noteFiles = indexText.split('\n').filter(f => f.trim());
        } else {
            // Fallback to predefined list
            noteFiles = [
                'welcome.txt',
                'how-to-add-music.txt',
                'setup-guide.txt'
            ];
        }
        
        loadNotesList();
        if (noteFiles.length > 0) {
            loadNote(0);
        }
    } catch (error) {
        console.error('Error loading notes:', error);
        showNotesError();
    }
}

function loadNotesList() {
    const sidebar = document.getElementById('notesSidebar');
    sidebar.innerHTML = noteFiles.map((file, i) => {
        const name = file.replace('.txt', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return `
            <div class="note-item ${i === 0 ? 'active' : ''}" onclick="loadNote(${i})">
                <div class="note-title">${name}</div>
            </div>
        `;
    }).join('');
}

async function loadNote(index) {
    currentNote = index;
    document.querySelectorAll('.note-item').forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });
    
    const content = document.getElementById('notesContent');
    content.textContent = 'Loading...';
    
    try {
        const response = await fetch(`notes/${noteFiles[index]}`);
        if (response.ok) {
            const text = await response.text();
            content.textContent = text;
        } else {
            content.textContent = `Error: Could not load ${noteFiles[index]}\n\nMake sure the file exists in the notes/ folder.`;
        }
    } catch (error) {
        content.textContent = `Error loading note: ${error.message}\n\nCreate a 'notes' folder and add .txt files to use this feature.`;
    }
}

function showNotesError() {
    const sidebar = document.getElementById('notesSidebar');
    const content = document.getElementById('notesContent');
    
    sidebar.innerHTML = '<div style="padding: 8px; color: #606060; font-size: 10px;">No notes found</div>';
    content.textContent = `Notes folder not found.

Create a folder called "notes" next to this HTML file and add .txt files.

Optional: Create an index.txt file listing all note files (one per line).

Example structure:
macos9-desktop/
├── index.html
└── notes/
    ├── index.txt
    ├── note1.txt
    └── note2.txt`;
}

// ============================================
// GAMES APPLICATION
// ============================================
const games = [
    { name: 'Game 1', poster: 'games/posters/game1.png', file: 'games/game1.html' },
    { name: 'Game 2', poster: 'games/posters/game2.png', file: 'games/game2.html' },
    { name: 'Game 3', poster: 'games/posters/game3.png', file: 'games/game3.html' },
    { name: 'Game 4', poster: 'games/posters/game4.png', file: 'games/game4.html' },
    // Add more games as needed
];

function initGames() {
    const grid = document.getElementById('gamesGrid');
    grid.innerHTML = games.map((game, i) => {
        const posterContent = game.poster ? 
            `<img src="${game.poster}">` : 
            '🎮';
        
        return `
            <div class="gallery-item" onclick="openGame(${i})">
                <div class="gallery-thumbnail">${posterContent}</div>
                <div class="gallery-label">${game.name}</div>
            </div>
        `;
    }).join('');
}

function openGame(index) {
    const game = games[index];
    if (game.file) {
        window.open(game.file, '_blank', 'noopener,noreferrer');
    } else {
        alert('Game file not found.');
    }
}

// ============================================
// CONTACT APPLICATION
// ============================================
const contactLinks = [
    { 
        name: 'Instagram', 
        icon: 'icons/contact/instagram.png',  // Changed from emoji to image path
        url: 'https://www.instagram.com/yourusername'
    },
    { 
        name: 'YouTube', 
        icon: 'icons/contact/youtube.png',    // Changed from emoji to image path
        url: 'https://www.youtube.com/@yourchannel'
    },
    { 
        name: 'TikTok', 
        icon: 'icons/contact/tiktok.png',      // Changed from emoji to image path
        url: 'https://www.tiktok.com/@yourusername'
    }
];

function initContact() {
    const grid = document.getElementById('contactGrid');
    grid.innerHTML = contactLinks.map(link => `
        <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="contact-link">
            <div class="contact-icon">
                <img src="${link.icon}" alt="${link.name}">
            </div>
            <div class="contact-label">${link.name}</div>
        </a>
    `).join('');
}
// ============================================
// INITIALIZE ALL APPLICATIONS
// ============================================
initMusicPlayer();
loadGallery();
initVideos();
initGames();
initContact();  
initNotes();