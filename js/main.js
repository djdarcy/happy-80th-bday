// Main Initialization

// Initialize animations when page loads
window.addEventListener('load', function() {
    // Create background elements
    createStars();
    createConfetti();
    
    // Initialize Mets stats
    initializeMetsStats();
    
    // Check for MOTD (only once on load)
    fetchMOTD();
    
    // Initialize SoundCloud
    initializeSoundCloud();
    
    // Initialize game
    initializeGame();
    
    // Initialize debug
    initializeDebug();
    
    // Add sparkle effect on background clicks
    document.addEventListener('click', function(e) {
        // Show click location in debug mode
        if (window.gameSettings.showClickLocations && !e.target.closest('.baseball-wrapper')) {
            showClickLocation(e.clientX, e.clientY, false);
        }
        
        // Debug: Log what was clicked
        if (window.gameSettings.debugMode) {
            console.log('Click detected on:', {
                target: e.target,
                className: e.target.className,
                tagName: e.target.tagName
            });
        }
        
        // Don't create sparkles on interactive elements
        if (e.target.closest('.baseball-wrapper') || 
            e.target.tagName === 'IFRAME' ||
            e.target.closest('.music-container')) {
            return;
        }
        
        createSparkle(e.clientX, e.clientY);
    });
});