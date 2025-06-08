// SoundCloud Integration

let songPlays = 0;
let musicStarted = false;
let widget = null;

// Track song plays
function trackSongPlay() {
    songPlays++;
    Storage.setNumber('songPlays', songPlays);
    updateSongPlaysDisplay();
}

// Update song plays display
function updateSongPlaysDisplay() {
    const songPlaysElement = document.getElementById('songPlays');
    if (songPlaysElement) {
        songPlaysElement.textContent = songPlays;
    }
}

// Hide the music prompt
function hideMusicPrompt() {
    const prompt = document.getElementById('musicPrompt');
    if (prompt) {
        prompt.classList.add('hidden');
    }
}

// Show the music prompt
function showMusicPrompt() {
    const prompt = document.getElementById('musicPrompt');
    if (prompt) {
        prompt.classList.remove('hidden');
    }
}

// Set up SoundCloud widget for looping
function setupSoundCloudLoop() {
    const scWidget = document.querySelector('iframe');
    if (window.SC && scWidget) {
        widget = SC.Widget(scWidget);
        
        // Wait for widget to be ready
        widget.bind(SC.Widget.Events.READY, function() {
            console.log('SoundCloud widget ready');
            
            // Set volume
            widget.setVolume(50);
            
            // Bind event handlers
            widget.bind(SC.Widget.Events.PLAY, function() {
                console.log('Music started playing');
                musicStarted = true;
                hideMusicPrompt();
                trackSongPlay();
            });
            
            widget.bind(SC.Widget.Events.PAUSE, function() {
                console.log('Music paused');
                if (!musicStarted) {
                    showMusicPrompt();
                }
            });
            
            // Loop the track
            widget.bind(SC.Widget.Events.FINISH, function() {
                console.log('Song finished, restarting...');
                widget.seekTo(0);
                widget.play();
            });
            
            // Try to auto-play (will likely fail in modern browsers)
            widget.play().catch(e => {
                console.log('Autoplay blocked - waiting for user interaction');
            });
            
            // Check if playing after a short delay
            setTimeout(() => {
                widget.isPaused(function(paused) {
                    if (paused && !musicStarted) {
                        console.log('Music not playing - showing prompt');
                        showMusicPrompt();
                    }
                });
            }, 500);
        });
    } else {
        // Fallback: try again in a second
        setTimeout(setupSoundCloudLoop, 1000);
    }
}

// Start music on user interaction
function startMusic() {
    if (widget && !musicStarted) {
        widget.play();
        hideMusicPrompt();
    }
}

// Initialize SoundCloud
function initializeSoundCloud() {
    // Load saved song plays
    songPlays = Storage.getNumber('songPlays', 0);
    updateSongPlaysDisplay();
    
    // Load SoundCloud API if not already loaded
    if (!window.SC) {
        const script = document.createElement('script');
        script.src = 'https://w.soundcloud.com/player/api.js';
        script.onload = setupSoundCloudLoop;
        document.head.appendChild(script);
    } else {
        setupSoundCloudLoop();
    }
    
    // Add click handlers for music prompt and first interaction
    document.addEventListener('DOMContentLoaded', function() {
        // Click on the prompt itself
        const prompt = document.getElementById('musicPrompt');
        if (prompt) {
            prompt.addEventListener('click', function(e) {
                e.stopPropagation();
                startMusic();
            });
        }
        
        // First click anywhere starts music
        document.addEventListener('click', function firstClick() {
            if (!musicStarted && widget) {
                startMusic();
            }
        });
        
        // First touch anywhere starts music (mobile)
        document.addEventListener('touchstart', function firstTouch() {
            if (!musicStarted && widget) {
                startMusic();
            }
        }, { once: true });
    });
}