// SoundCloud Integration

let songPlays = 0;

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

// Set up SoundCloud widget for looping
function setupSoundCloudLoop() {
    const scWidget = document.querySelector('iframe');
    if (window.SC && scWidget) {
        const widget = SC.Widget(scWidget);
        
        // Track plays
        widget.bind(SC.Widget.Events.PLAY, trackSongPlay);
        
        // Loop the track
        widget.bind(SC.Widget.Events.FINISH, function() {
            widget.play();
        });
        
        // Auto-play on load
        widget.bind(SC.Widget.Events.READY, function() {
            widget.play();
        });
    } else {
        // Fallback: try again in a second
        setTimeout(setupSoundCloudLoop, 1000);
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
}