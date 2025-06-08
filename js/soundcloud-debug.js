// SoundCloud Integration with Enhanced Debug

let songPlays = 0;
let widgetReady = false;
let autoplayAttempted = false;

// Track song plays
function trackSongPlay() {
    songPlays++;
    Storage.setNumber('songPlays', songPlays);
    updateSongPlaysDisplay();
    console.log('[SoundCloud] Song play tracked. Total plays:', songPlays);
}

// Update song plays display
function updateSongPlaysDisplay() {
    const songPlaysElement = document.getElementById('songPlays');
    if (songPlaysElement) {
        songPlaysElement.textContent = songPlays;
    }
}

// Debug function to check widget state
function debugWidgetState() {
    const scWidget = document.querySelector('iframe');
    if (!scWidget) {
        console.error('[SoundCloud] No iframe found!');
        return;
    }
    
    console.log('[SoundCloud] Widget iframe found:', scWidget);
    console.log('[SoundCloud] Widget src:', scWidget.src);
    
    if (window.SC) {
        const widget = SC.Widget(scWidget);
        
        // Get current sound info
        widget.getCurrentSound(function(sound) {
            console.log('[SoundCloud] Current sound:', sound);
        });
        
        // Get position
        widget.getPosition(function(position) {
            console.log('[SoundCloud] Current position:', position);
        });
        
        // Check if playing
        widget.isPaused(function(paused) {
            console.log('[SoundCloud] Is paused:', paused);
        });
        
        // Get volume
        widget.getVolume(function(volume) {
            console.log('[SoundCloud] Volume:', volume);
        });
    }
}

// Set up SoundCloud widget for looping with enhanced debug
function setupSoundCloudLoop() {
    console.log('[SoundCloud] Setting up widget...');
    
    const scWidget = document.querySelector('iframe');
    if (!scWidget) {
        console.error('[SoundCloud] No iframe found! Retrying in 1 second...');
        setTimeout(setupSoundCloudLoop, 1000);
        return;
    }
    
    if (!window.SC) {
        console.error('[SoundCloud] SC API not loaded! Make sure script is loaded.');
        return;
    }
    
    const widget = SC.Widget(scWidget);
    console.log('[SoundCloud] Widget object created');
    
    // Bind all events for debugging
    widget.bind(SC.Widget.Events.READY, function() {
        console.log('[SoundCloud] ✓ Widget READY event fired');
        widgetReady = true;
        
        // Log widget info
        widget.getCurrentSound(function(sound) {
            console.log('[SoundCloud] Sound loaded:', sound ? sound.title : 'No sound');
        });
        
        // Set volume
        widget.setVolume(50);
        console.log('[SoundCloud] Volume set to 50%');
        
        // Try multiple autoplay strategies
        if (!autoplayAttempted) {
            autoplayAttempted = true;
            console.log('[SoundCloud] Attempting autoplay...');
            
            // Strategy 1: Direct play call
            widget.play();
            console.log('[SoundCloud] Strategy 1: Direct play() called');
            
            // Strategy 2: Delayed play
            setTimeout(() => {
                widget.isPaused(function(paused) {
                    if (paused) {
                        console.log('[SoundCloud] Still paused after 500ms, trying play() again');
                        widget.play();
                    } else {
                        console.log('[SoundCloud] ✓ Playing successfully!');
                    }
                });
            }, 500);
            
            // Strategy 3: User interaction fallback
            const playOnInteraction = function() {
                widget.isPaused(function(paused) {
                    if (paused) {
                        console.log('[SoundCloud] Playing on user interaction...');
                        widget.play();
                        document.removeEventListener('click', playOnInteraction);
                        document.removeEventListener('touchstart', playOnInteraction);
                    }
                });
            };
            
            document.addEventListener('click', playOnInteraction);
            document.addEventListener('touchstart', playOnInteraction);
            console.log('[SoundCloud] User interaction listeners added for autoplay fallback');
        }
    });
    
    // Bind play event
    widget.bind(SC.Widget.Events.PLAY, function() {
        console.log('[SoundCloud] ▶️ PLAY event fired');
        trackSongPlay();
    });
    
    // Bind pause event
    widget.bind(SC.Widget.Events.PAUSE, function() {
        console.log('[SoundCloud] ⏸️ PAUSE event fired');
    });
    
    // Bind finish event for looping
    widget.bind(SC.Widget.Events.FINISH, function() {
        console.log('[SoundCloud] ✓ FINISH event fired, restarting...');
        widget.seekTo(0);
        widget.play();
    });
    
    // Bind play progress for debug
    widget.bind(SC.Widget.Events.PLAY_PROGRESS, function(data) {
        if (Math.floor(data.currentPosition / 1000) % 30 === 0) {
            console.log('[SoundCloud] Progress:', Math.floor(data.currentPosition / 1000) + 's');
        }
    });
    
    // Bind error event
    widget.bind(SC.Widget.Events.ERROR, function(error) {
        console.error('[SoundCloud] ERROR event:', error);
    });
    
    console.log('[SoundCloud] All event listeners bound');
}

// Alternative autoplay method using widget URL manipulation
function tryUrlAutoplay() {
    console.log('[SoundCloud] Trying URL-based autoplay...');
    
    const scWidget = document.querySelector('iframe');
    if (!scWidget) return;
    
    const currentSrc = scWidget.src;
    if (!currentSrc.includes('auto_play=true')) {
        console.log('[SoundCloud] auto_play=true not found in URL, updating...');
        
        // Ensure auto_play=true is in the URL
        let newSrc = currentSrc;
        if (currentSrc.includes('auto_play=false')) {
            newSrc = currentSrc.replace('auto_play=false', 'auto_play=true');
        } else if (!currentSrc.includes('auto_play=')) {
            newSrc = currentSrc + '&auto_play=true';
        }
        
        if (newSrc !== currentSrc) {
            console.log('[SoundCloud] Updating iframe src to:', newSrc);
            scWidget.src = newSrc;
        }
    }
}

// Initialize SoundCloud with debug
function initializeSoundCloud() {
    console.log('[SoundCloud] Initializing...');
    
    // Load saved song plays
    songPlays = Storage.getNumber('songPlays', 0);
    updateSongPlaysDisplay();
    console.log('[SoundCloud] Loaded song plays from storage:', songPlays);
    
    // Try URL autoplay first
    tryUrlAutoplay();
    
    // Load SoundCloud API if not already loaded
    if (!window.SC) {
        console.log('[SoundCloud] Loading SoundCloud Widget API...');
        const script = document.createElement('script');
        script.src = 'https://w.soundcloud.com/player/api.js';
        script.onload = function() {
            console.log('[SoundCloud] ✓ Widget API loaded successfully');
            setupSoundCloudLoop();
        };
        script.onerror = function() {
            console.error('[SoundCloud] ✗ Failed to load Widget API');
        };
        document.head.appendChild(script);
    } else {
        console.log('[SoundCloud] Widget API already loaded');
        setupSoundCloudLoop();
    }
}

// Add debug command
if (window.gameSettings) {
    // Add SoundCloud debug to keyboard shortcuts
    const originalKeyHandler = document.onkeydown;
    document.addEventListener('keydown', function(e) {
        // CTRL+ALT+SHIFT+U: Debug SoundCloud widget
        if (e.ctrlKey && e.altKey && e.shiftKey && e.key === 'U') {
            e.preventDefault();
            console.log('=== SoundCloud Widget Debug ===');
            debugWidgetState();
        }
    });
}

// Export debug function globally
window.debugSoundCloud = debugWidgetState;