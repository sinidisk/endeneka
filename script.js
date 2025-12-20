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
        title: 'Celebration', 
        artist: 'Artist Name', 
        album: 'Album Name', 
        icon: '🎵',
        file: 'music/celebration.mp3',
        cover: 'music/late_registration.png'
    },
    { 
        title: 'Guitare 1', 
        artist: 'Artist Name', 
        album: 'Album Name', 
        icon: '🎸',
        file: 'music/guitare1.mp3',
        cover: null
    },
    { 
        title: 'Thank Oliv', 
        artist: 'Artist Name', 
        album: 'Late Registration', 
        icon: '🎶',
        file: 'music/thankoliv.mp3',
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
    { name: 'DSC00122', file: 'photos/DSC00122.JPG' }
];

const drawingImages = [
    // EDIT THIS ARRAY WITH YOUR DRAWINGS
    { name: 'Boules', file: 'drawings/boules.png' },
    { name: 'Bowbow et Moi', file: 'drawings/bowbow et moi.png' },
    { name: 'Broke', file: 'drawings/broke.png' },
    { name: 'Card', file: 'drawings/card.png' },
    { name: 'Logo', file: 'drawings/logo.png' }
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
    { title: 'Everybody Neka', file: 'videos/everybody_neka.mp4', thumbnail: null },
    { title: 'Into You All Night', file: 'videos/into you all night.mp4', thumbnail: null }
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
// INITIALIZE ALL APPLICATIONS
// ============================================
initMusicPlayer();
loadGallery();
initVideos();
initNotes();