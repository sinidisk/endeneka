
// Clock
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

// Window Management
let zIndexCounter = 100;
let draggedWindow = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let resizingWindow = null;
let resizeStartX = 0;
let resizeStartY = 0;
let resizeStartWidth = 0;
let resizeStartHeight = 0;

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

document.addEventListener('mousedown', (e) => {
    const titleBar = e.target.closest('.window-title-bar');
    if (titleBar && !e.target.classList.contains('window-button')) {
        draggedWindow = titleBar.parentElement;
        focusWindow(draggedWindow);
        dragOffsetX = e.clientX - draggedWindow.offsetLeft;
        dragOffsetY = e.clientY - draggedWindow.offsetTop;
        e.preventDefault();
    }

    const resizeHandle = e.target.closest('.window-resize-handle');
    if (resizeHandle) {
        resizingWindow = resizeHandle.parentElement;
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

// Music Player with Real Audio Support
const songs = [
    // REPLACE THIS ARRAY WITH YOUR ACTUAL SONGS
    // Example format:
    // { 
    //     title: 'Feel Good Inc.', 
    //     artist: 'Gorillaz', 
    //     album: 'Demon Days', 
    //     icon: '🎸', 
    //     file: 'music/feelgoodinc.mp3'  // Path to your MP3 file
    // },
    
    // Demo songs (these won't play actual audio):
    { title: 'Add Your Songs', artist: 'Update the songs array', album: 'See instructions', icon: '📁', file: null },
    { title: 'Example Song 1', artist: 'Artist Name', album: 'Album Name', icon: '🎵', file: null },
    { title: 'Example Song 2', artist: 'Another Artist', album: 'Another Album', icon: '🎶', file: null }
];

let currentTrack = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;

// Create HTML5 Audio element
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
        alert('No audio file specified for this track. Please update the songs array with your MP3 files.');
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
        alert('Could not play file. Make sure the path is correct and the file format is supported.');
    });
}

function togglePlay() {
    if (!songs[currentTrack].file) {
        alert('No audio file specified. Please update the songs array with your MP3 files.');
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
    document.getElementById('albumArt').textContent = song.icon;
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

// Gallery with Real Image Support
const photoImages = [
    // REPLACE THIS ARRAY WITH YOUR ACTUAL PHOTOS
    // Example format:
    // { name: 'Sunset Beach', file: 'photos/sunset.jpg' },
    // { name: 'Mountain Peak', file: 'photos/mountain.jpg' },
    
    // Demo images (showing placeholder icons):
    { name: 'Sunset Beach', icon: '🌅', file: null },
    { name: 'Mountain Peak', icon: '🏔️', file: null },
    { name: 'City Lights', icon: '🌆', file: null },
    { name: 'Forest Path', icon: '🌲', file: null },
    { name: 'Ocean Wave', icon: '🌊', file: null },
    { name: 'Desert Dune', icon: '🏜️', file: null },
    { name: 'Starry Night', icon: '🌃', file: null },
    { name: 'Flower Garden', icon: '🌺', file: null },
    { name: 'Snowy Landscape', icon: '❄️', file: null },
    { name: 'Tropical Paradise', icon: '🏝️', file: null },
    { name: 'Autumn Leaves', icon: '🍂', file: null },
    { name: 'Cherry Blossoms', icon: '🌸', file: null },
    { name: 'Northern Lights', icon: '✨', file: null },
    { name: 'Waterfall', icon: '💦', file: null },
    { name: 'Rainbow', icon: '🌈', file: null }
];

const drawingImages = [
    // REPLACE THIS ARRAY WITH YOUR ACTUAL DRAWINGS
    // Example format:
    // { name: 'Abstract Art', file: 'drawings/abstract.png' },
    // { name: 'Portrait Sketch', file: 'drawings/portrait.jpg' },
    
    // Demo images (showing placeholder icons):
    { name: 'Abstract Art', icon: '🎨', file: null },
    { name: 'Portrait Sketch', icon: '👤', file: null },
    { name: 'Landscape Drawing', icon: '🖼️', file: null },
    { name: 'Still Life', icon: '🍎', file: null },
    { name: 'Animal Study', icon: '🦁', file: null },
    { name: 'Architecture', icon: '🏛️', file: null },
    { name: 'Fantasy Scene', icon: '🐉', file: null },
    { name: 'Comic Strip', icon: '💭', file: null },
    { name: 'Character Design', icon: '🧙', file: null },
    { name: 'Nature Study', icon: '🌿', file: null },
    { name: 'Urban Sketch', icon: '🏙️', file: null },
    { name: 'Digital Painting', icon: '🖌️', file: null },
    { name: 'Manga Art', icon: '📚', file: null },
    { name: 'Pixel Art', icon: '👾', file: null },
    { name: 'Watercolor', icon: '🎭', file: null }
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
        // If image has a file, show thumbnail preview, otherwise show icon
        const thumbContent = img.file ? 
            `<img src="${img.file}" style="width: 100%; height: 100%; object-fit: cover;">` : 
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
    
    // If image has a file, show actual image, otherwise show icon
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

// Notes
const notes = [
    {
        title: 'How to Add Your Images',
        preview: 'Instructions for adding photos and drawings...',
        content: `# How to Add Your Images

Follow these steps to add your own photos and drawings to the gallery:

## Step 1: Update the Image Arrays

In the JavaScript code, find the \`photoImages\` and \`drawingImages\` arrays (around line 570) and replace them:

### Photos Example:
\`\`\`javascript
const photoImages = [
{ name: 'Sunset Beach', file: 'photos/sunset.jpg' },
{ name: 'Mountain View', file: 'photos/mountain.png' },
{ name: 'City Night', file: 'photos/city.jpg' }
];
\`\`\`

### Drawings Example:
\`\`\`javascript
const drawingImages = [
{ name: 'Sketch 1', file: 'drawings/sketch1.png' },
{ name: 'Portrait', file: 'drawings/portrait.jpg' },
{ name: 'Abstract', file: 'drawings/abstract.png' }
];
\`\`\`

## Step 2: File Organization

Create this folder structure:
\`\`\`
your-project/
├── index.html (this file)
├── photos/
│   ├── sunset.jpg
│   ├── mountain.png
│   └── city.jpg
└── drawings/
├── sketch1.png
├── portrait.jpg
└── abstract.png
\`\`\`

## Step 3: Supported Formats

- JPG/JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- SVG (.svg)

## Features

- **Thumbnail Preview**: Images show as thumbnails in grid
- **Full View**: Click to see larger version
- **Navigation**: Previous/Next buttons
- **Full Size**: "Full Size" button opens image in new tab
- **Counter**: Shows "Image X of Y"

Just add as many images as you want - the grid will automatically adjust!`
    },
    {
        title: 'How to Add Your Music',
        preview: 'Instructions for adding MP3 files...',
        content: `# How to Add Your Music Files

Follow these steps to add your own MP3 files to the music player:

## Step 1: Update the Songs Array

In the JavaScript code, find the \`songs\` array (around line 450) and replace it with your music:

\`\`\`javascript
const songs = [
{ 
title: 'Feel Good Inc.', 
artist: 'Gorillaz', 
album: 'Demon Days', 
icon: '🎸', 
file: 'music/feelgoodinc.mp3'
},
{ 
title: 'Your Song Title', 
artist: 'Artist Name', 
album: 'Album Name', 
icon: '🎵', 
file: 'music/yoursong.mp3'
}
];
\`\`\`

## Step 2: File Organization

Create a folder structure:
- Put this HTML file in your main folder
- Create a \`music\` folder next to it
- Add your MP3 files to the \`music\` folder

## Step 3: File Paths

Make sure the \`file\` property points to the correct location:
- Same folder: \`file: 'song.mp3'\`
- Music folder: \`file: 'music/song.mp3'\`
- Subfolder: \`file: 'music/album/song.mp3'\`

## Supported Formats

- MP3 (.mp3)
- WAV (.wav)
- OGG (.ogg)
- M4A (.m4a)

The player will automatically detect the duration once the file loads!`
    },
    {
        title: 'Welcome to Mac OS 9',
        preview: 'A nostalgic journey back to classic computing...',
        content: `# Welcome to Mac OS 9

This is a faithful recreation of the classic Mac OS 9 interface, bringing back the platinum appearance and iconic design that defined Apple computing in the late 1990s.

## Features

- **Authentic Design**: Recreated platinum color scheme and beveled UI elements
- **Window Management**: Drag, resize, and manage multiple windows
- **Real Audio Playback**: Support for MP3, WAV, OGG, and M4A files
- **Volume Control**: Adjustable volume slider
- **Seek Functionality**: Click the progress bar to jump to any position

## The Mac OS 9 Era

Mac OS 9 was released in 1999 and represented the final major release of the classic Mac OS before the transition to Mac OS X. It featured improved performance, better networking capabilities, and the introduction of Sherlock 2.

*Experience the nostalgia of classic computing with modern functionality!*`
    },
    {
        title: 'Music Player Features',
        preview: 'Full audio playback with HTML5...',
        content: `# Music Player Features

The Music Player now includes **real audio playback** using HTML5 Audio API!

## Playback Controls

- **Play/Pause**: Start or pause playback
- **Stop**: Stop playback and reset to beginning
- **Previous/Next**: Navigate through your playlist
- **Shuffle**: Random track order
- **Repeat**: Loop the current track

## New Features

### Volume Control
Adjustable volume slider with visual feedback. Click anywhere on the slider to set volume.

### Progress Bar
- Shows current time and total duration
- Click anywhere to seek to that position
- Updates in real-time during playback

### Automatic Duration
The player automatically detects song duration when files load.

## How It Works

The player uses the HTML5 \`<audio>\` element to play actual audio files. Just add your MP3s to the songs array and you're ready to go!`
    },
    {
        title: 'Gallery Overview',
        preview: 'Browse your photos and drawings...',
        content: `# Gallery Overview

The Gallery application now supports **real images** with automatic thumbnail generation!

## Two Folders

1. **Photos**: Your photography collection
2. **Drawings**: Your artwork and illustrations

## How to Use

- Click folder buttons to switch between collections
- Click any thumbnail to open in detailed viewer
- Use Previous/Next buttons to navigate
- Click "Full Size" to open image in new tab
- Image counter shows your position (e.g., "Image 3 of 15")

## Adding Your Images

Update the image arrays in the code:

\`\`\`javascript
const photoImages = [
{ name: 'My Photo', file: 'photos/photo1.jpg' },
{ name: 'Another Photo', file: 'photos/photo2.png' }
];

const drawingImages = [
{ name: 'My Drawing', file: 'drawings/art1.png' },
{ name: 'Sketch', file: 'drawings/sketch.jpg' }
];
\`\`\`

## Features

- Automatic thumbnail generation
- Grid layout adapts to screen size
- Smooth navigation between images
- Support for JPG, PNG, GIF, WebP, and SVG
- Full-size viewing option

The gallery can handle as many images as you want to add!`
    },
    {
        title: 'Complete Setup Guide',
        preview: 'Full instructions for music and images...',
        content: `# Complete Setup Guide

Here's how to set up your entire Mac OS 9 desktop with your own files!

## File Structure

Create this folder organization:

\`\`\`
my-macos9-desktop/
├── index.html          (this file)
├── music/
│   ├── song1.mp3
│   ├── song2.mp3
│   └── album/
│       └── song3.mp3
├── photos/
│   ├── vacation1.jpg
│   ├── vacation2.jpg
│   └── family.png
└── drawings/
├── sketch1.png
├── painting.jpg
└── digital-art.png
\`\`\`

## 1. Add Your Music

Find the \`songs\` array (line ~450):

\`\`\`javascript
const songs = [
{ 
title: 'Song Name',
artist: 'Artist',
album: 'Album',
icon: '🎵',
file: 'music/song1.mp3'
}
];
\`\`\`

## 2. Add Your Photos

Find the \`photoImages\` array (line ~570):

\`\`\`javascript
const photoImages = [
{ name: 'Vacation', file: 'photos/vacation1.jpg' },
{ name: 'Family', file: 'photos/family.png' }
];
\`\`\`

## 3. Add Your Drawings

Find the \`drawingImages\` array:

\`\`\`javascript
const drawingImages = [
{ name: 'Sketch', file: 'drawings/sketch1.png' },
{ name: 'Painting', file: 'drawings/painting.jpg' }
];
\`\`\`

## Tips

- Use relative paths for portability
- Organize files in subfolders
- Supported: MP3, WAV, OGG for music; JPG, PNG, GIF for images
- Test locally before uploading to a server

Now you have a fully personalized retro desktop!`
    },
    {
        title: 'Gallery Overview - Old',
        preview: 'Browse your photos and drawings...',
        content: `# Gallery Overview

The Gallery application provides an organized way to view your image collections.

## Two Folders

1. **Photos**: Natural scenes and photography (15 images)
2. **Drawings**: Artwork and illustrations (15 images)

## How to Use

- Click folder buttons to switch between collections
- Click any thumbnail to open in detailed view
- Use Previous/Next buttons in viewer to navigate
- All images represented with colorful emoji icons

## Adding Real Images

You can extend the gallery to show real images by updating the image arrays with actual file paths:

\`\`\`javascript
{ name: 'Sunset', icon: '🌅', file: 'photos/sunset.jpg' }
\`\`\`

Then modify the display code to show the actual images instead of emoji icons.`
    },
    {
        title: 'Technical Notes',
        preview: 'How this recreation works...',
        content: `# Technical Implementation

## Audio System

### HTML5 Audio API
The music player uses the native HTML5 \`<audio>\` element:

- \`audio.play()\` - Start playback
- \`audio.pause()\` - Pause playback
- \`audio.currentTime\` - Get/set position
- \`audio.duration\` - Get total length
- \`audio.volume\` - Control volume (0.0 to 1.0)

### Event Listeners
- \`timeupdate\` - Updates progress bar
- \`ended\` - Handles track completion
- \`loadedmetadata\` - Gets duration info
- \`error\` - Handles loading errors

## Window Management

Pure JavaScript implementation:
- Mouse events for dragging
- CSS transforms for positioning
- Z-index for layering
- Event delegation for efficiency

## Performance

- Minimal DOM manipulation
- CSS animations for smooth effects
- Efficient event handling
- No external dependencies

All built with vanilla HTML, CSS, and JavaScript!`
    }
];

let currentNoteIndex = 0;

function initNotes() {
    const sidebar = document.getElementById('notesSidebar');
    sidebar.innerHTML = notes.map((note, i) => `
        <div class="note-item ${i === 0 ? 'active' : ''}" onclick="selectNote(${i})">
            <div class="note-title">${note.title}</div>
            <div class="note-preview">${note.preview}</div>
        </div>
    `).join('');
    selectNote(0);
}

function selectNote(index) {
    currentNoteIndex = index;
    document.querySelectorAll('.note-item').forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });
    displayNote();
}

function displayNote() {
    const note = notes[currentNoteIndex];
    const content = document.getElementById('notesContent');
    content.innerHTML = `<div class="note-full">${parseMarkdown(note.content)}</div>`;
}

function parseMarkdown(text) {
    return text
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/^\- (.*$)/gim, '<ul><li>$1</li></ul>')
        .replace(/^\d+\. (.*$)/gim, '<ol><li>$1</li></ol>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^(?!<[huo])/gim, '<p>')
        .replace(/(<\/[huo]l>)\s*<[uo]l>/g, '$1')
        .replace(/<\/p><p><([hou])/g, '<$1');
}

// Initialize
initMusicPlayer();
loadGallery();
initNotes();
