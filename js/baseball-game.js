// Baseball Game Logic - Optimized for Performance

// Game state variables
let score = 0;
let totalHomeRuns = 0;
let hasShownTenHomeRunVideo = false;
let streak = 0;
let bestStreak = 0;

// Baseball tracking
let activeBaseballs = [];
let maxActiveBaseballs = 5; // Limit concurrent baseballs

// Milestone messages for streaks
const streakMilestones = {
    3: "3 in a row! Nice streak! 🔥",
    5: "5 hit streak! You're on fire! 🔥🔥",
    10: "10 hit streak! Incredible! ⚾🔥",
    15: "15 hit streak! Unstoppable! 🌟🔥",
    20: "20 hit streak! Hall of Fame! 🏆🔥",
    25: "25 hit streak! Legend! 👑🔥",
    30: "30 hit streak! GOAT! 🐐🔥"
};

// Clean up inactive baseballs
function cleanupBaseballs() {
    activeBaseballs = activeBaseballs.filter(baseball => {
        if (!baseball.parentNode) {
            return false;
        }
        const rect = baseball.getBoundingClientRect();
        // Remove if off screen
        if (rect.left > window.innerWidth + 100) {
            DOM.remove(baseball);
            return false;
        }
        return true;
    });
}

// Baseball mini-game with improved click detection
function createBaseball() {
    // Clean up old baseballs
    cleanupBaseballs();
    
    // Limit active baseballs for performance
    if (activeBaseballs.length >= maxActiveBaseballs) {
        return;
    }
    
    const gameContainer = document.getElementById('gameContainer');
    
    // Occasionally create a special golden baseball
    const isGolden = Random.between(0, 100) < 5; // 5% chance
    
    // Create wrapper div that will handle clicks
    const wrapper = DOM.create('div', {
        className: 'baseball-wrapper' + (isGolden ? ' golden-baseball' : ''),
        style: {
            width: window.gameSettings.clickTargetSize + 'px',
            height: window.gameSettings.clickTargetSize + 'px',
            top: Random.between(40, 70) + '%',
            left: '-150px',
            animation: `baseballThrow ${window.gameSettings.slowMotion ? '12s' : '4s'} linear forwards`
        }
    });
    
    // Create the baseball container
    const baseball = DOM.create('div', {
        className: 'baseball'
    });
    
    // Create the visual emoji
    const baseballVisual = DOM.create('div', {
        className: 'baseball-visual',
        textContent: isGolden ? '⭐' : '⚾'
    });
    
    // Assemble the structure
    baseball.appendChild(baseballVisual);
    wrapper.appendChild(baseball);
    
    let isClicked = false;
    
    // Handle click/touch events
    const handleHit = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (isClicked) return;
        isClicked = true;
        
        // Show successful hit location
        if (window.gameSettings.showClickLocations) {
            showClickLocation(e.clientX, e.clientY, true);
        }
        
        // Points for hit
        const points = isGolden ? 5 : 1;
        console.log(isGolden ? 'Golden star hit! +5 points!' : 'Home run! Baseball clicked');
        
        // Update scores
        score += points;
        totalHomeRuns += points;
        streak++;
        if (streak > bestStreak) {
            bestStreak = streak;
            Storage.setNumber('bestStreak', bestStreak);
        }
        
        // Check for streak milestones
        checkStreakMilestones();
        
        updateScoreDisplay();
        Storage.setNumber('totalHomeRuns', totalHomeRuns);
        
        // Check for 10 home runs celebration
        if (score >= 10 && !hasShownTenHomeRunVideo) {
            hasShownTenHomeRunVideo = true;
            setTimeout(() => {
                showCelebrationVideo();
            }, 1000);
        }
        
        // Get current position for effects
        const rect = wrapper.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Add home run class for special animation
        DOM.addClass(wrapper, 'home-run');
        
        // Create explosion effect
        createExplosion(centerX, centerY, isGolden);
        
        // Create new star at the peak of the animation
        setTimeout(() => {
            const newRect = wrapper.getBoundingClientRect();
            const starX = newRect.left + newRect.width / 2;
            const starY = newRect.top + newRect.height / 2;
            createNewStar(starX, starY);
        }, 800);
        
        // Remove from active list
        const index = activeBaseballs.indexOf(wrapper);
        if (index > -1) {
            activeBaseballs.splice(index, 1);
        }
        
        // Remove after animation
        setTimeout(() => {
            DOM.remove(wrapper);
        }, 2000);
    };
    
    // Add event listeners
    wrapper.addEventListener('click', handleHit);
    wrapper.addEventListener('touchstart', handleHit, { passive: false });
    wrapper.addEventListener('pointerdown', handleHit);
    
    // Debug logging
    if (window.gameSettings.debugMode) {
        console.log('Baseball created' + (isGolden ? ' (GOLDEN!)' : ''));
    }
    
    gameContainer.appendChild(wrapper);
    activeBaseballs.push(wrapper);
    
    // Remove baseball after it crosses screen (if not clicked)
    setTimeout(() => {
        if (wrapper.parentNode && !isClicked) {
            DOM.remove(wrapper);
            // Remove from active list
            const index = activeBaseballs.indexOf(wrapper);
            if (index > -1) {
                activeBaseballs.splice(index, 1);
            }
            // Reset streak if missed
            if (streak > 0) {
                console.log(`Streak ended at ${streak}`);
                streak = 0;
            }
        }
    }, window.gameSettings.slowMotion ? 12000 : 4000);
}

// Check for streak milestones
function checkStreakMilestones() {
    if (streakMilestones[streak]) {
        createStarMessage(streakMilestones[streak], true);
        
        // Extra celebration for big streaks
        if (streak >= 20) {
            // Limit confetti for performance
            const confettiCount = Math.min(20, streak);
            for (let i = 0; i < confettiCount; i++) {
                setTimeout(() => {
                    createVictoryConfetti();
                }, i * 50);
            }
        }
    }
}

// Update score display - optimized to avoid reflow
let scoreUpdateTimeout = null;
function updateScoreDisplay() {
    // Debounce score updates
    if (scoreUpdateTimeout) {
        clearTimeout(scoreUpdateTimeout);
    }
    
    scoreUpdateTimeout = setTimeout(() => {
        const scoreDisplay = document.getElementById('scoreDisplay');
        let streakText = streak > 2 ? `<div class="streak">Streak: ${streak}! 🔥</div>` : '';
        scoreDisplay.innerHTML = `Home Runs: ${score}${streakText}<div class="total-score">Total: <span id="totalHomeRuns">${totalHomeRuns}</span></div>`;
    }, 50);
}

// Show celebration video
function showCelebrationVideo() {
    const overlay = document.getElementById('videoOverlay');
    const video = document.getElementById('celebrationVideo');
    
    DOM.addClass(overlay, 'active');
    video.play();
    
    // Create extra celebration effects - limited for performance
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            createVictoryConfetti();
        }, i * 100);
    }
}

// Close video
function closeVideo() {
    const overlay = document.getElementById('videoOverlay');
    const video = document.getElementById('celebrationVideo');
    
    DOM.removeClass(overlay, 'active');
    video.pause();
    video.currentTime = 0;
}

// Show click location for debugging
function showClickLocation(x, y, hit) {
    if (!window.gameSettings.showClickLocations) return;
    
    const marker = DOM.create('div', {
        className: 'click-marker ' + (hit ? 'hit' : 'miss'),
        style: {
            left: x + 'px',
            top: y + 'px'
        }
    });
    
    document.body.appendChild(marker);
    setTimeout(() => DOM.remove(marker), 2000);
}

// Initialize game
function initializeGame() {
    // Load saved values
    totalHomeRuns = Storage.getNumber('totalHomeRuns', 0);
    bestStreak = Storage.getNumber('bestStreak', 0);
    updateScoreDisplay();
    
    // Start baseball game with staggered timing
    let baseballInterval;
    setTimeout(() => {
        createBaseball();
        baseballInterval = setInterval(() => {
            if (!window.gameSettings.pauseBaseballs) {
                createBaseball();
            }
        }, 2500 + Random.between(0, 1000));
    }, 1000);
    
    // Periodic cleanup
    setInterval(cleanupBaseballs, 5000);
    
    // Make closeVideo available globally
    window.closeVideo = closeVideo;
}