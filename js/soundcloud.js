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
        
        // Wait for widget to be ready
        widget.bind(SC.Widget.Events.READY, function() {
            console.log('SoundCloud widget ready');
            
            // Set volume
            widget.setVolume(50);
            
            // Bind event handlers
            widget.bind(SC.Widget.Events.PLAY, trackSongPlay);
            
            // Loop the track
            widget.bind(SC.Widget.Events.FINISH, function() {
                console.log('Song finished, restarting...');
                widget.seekTo(0);
                widget.play();
            });
            
            // Try to auto-play
            widget.play().catch(e => {
                console.log('Autoplay was blocked. User interaction required.');
                // Add a one-time click handler to start playback
                document.addEventListener('click', function startPlayback() {
                    widget.play();
                    document.removeEventListener('click', startPlayback);
                }, { once: true });
            });
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