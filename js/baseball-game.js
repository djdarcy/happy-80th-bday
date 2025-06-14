// Baseball Game Logic

// Game state variables
let score = 0;
let totalHomeRuns = 0;
let hasShownStreakVideo = false; // This resets on page refresh
let streak = 0;
let bestStreak = 0;
let lastStreakMilestone = 0; // Track which milestone we last showed

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

// Reset streak with optional message
function resetStreak(showMessage = true) {
    if (streak > 0) {
        if (showMessage) {
            console.log(`Streak ended at ${streak}`);
        }
        streak = 0;
        lastStreakMilestone = 0; // Reset milestone tracker
        updateScoreDisplay();
    }
}

// Baseball mini-game with improved click detection
function createBaseball() {
    const gameContainer = document.getElementById('gameContainer');
    
    // Occasionally create a special golden baseball
    const isGolden = Random.between(0, 100) < 5; // 5% chance
    
    // Randomly choose left or right side
    const fromLeft = Random.between(0, 100) < 50; // 50/50 chance
    
    // Create wrapper div that will handle clicks
    // Golden baseballs have smaller hitbox and move faster
    const hitboxSize = isGolden ? 
        Math.round(window.gameSettings.clickTargetSize * 0.7) : // 30% smaller hitbox for golden
        window.gameSettings.clickTargetSize;
    
    const animationDuration = isGolden ?
        (window.gameSettings.slowMotion ? '6.9s' : '2.3s') : // 1.75x faster for golden (4/1.75 = 2.3)
        (window.gameSettings.slowMotion ? '12s' : '4s');
    
    // Choose animation based on direction
    const animationName = fromLeft ? 'baseballThrow' : 'baseballThrowReverse';
    
    const wrapper = DOM.create('div', {
        className: 'baseball-wrapper' + (isGolden ? ' golden-baseball' : ''),
        style: {
            width: hitboxSize + 'px',
            height: hitboxSize + 'px',
            top: Random.between(40, 70) + '%',
            left: fromLeft ? '-150px' : 'calc(100% + 50px)',
            animation: `${animationName} ${animationDuration} linear forwards`
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
        streak++;  // Both regular and golden baseballs count as 1 toward streak
        
        console.log(`Current streak: ${streak}, Total score: ${score}`);
        
        if (streak > bestStreak) {
            bestStreak = streak;
            Storage.setNumber('bestStreak', bestStreak);
        }
        
        // Check for streak milestones
        checkStreakMilestones();
        
        updateScoreDisplay();
        Storage.setNumber('totalHomeRuns', totalHomeRuns);
        
        // Get current position for effects
        const rect = wrapper.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Add home run class for special animation
        DOM.addClass(wrapper, 'home-run');
        
        // Create explosion effect - ENSURE THIS IS CALLED
        createExplosion(centerX, centerY, isGolden);
        
        // Create new star at the peak of the animation
        setTimeout(() => {
            const newRect = wrapper.getBoundingClientRect();
            const starX = newRect.left + newRect.width / 2;
            const starY = newRect.top + newRect.height / 2;
            createNewStar(starX, starY);
        }, 800);
        
        // Remove after animation
        setTimeout(() => {
            DOM.remove(wrapper);
        }, 2000);
    };
    
    // Add event listeners
    wrapper.addEventListener('click', handleHit);
    wrapper.addEventListener('touchstart', handleHit);
    wrapper.addEventListener('pointerdown', handleHit);
    
    // Debug logging
    if (window.gameSettings.debugMode) {
        console.log(`Baseball created ${isGolden ? '(GOLDEN!)' : ''} from ${fromLeft ? 'LEFT' : 'RIGHT'}`);
    }
    
    gameContainer.appendChild(wrapper);
    
    // Remove baseball after it crosses screen (if not clicked)
    const removalDelay = isGolden ?
        (window.gameSettings.slowMotion ? 6900 : 2300) : // Match the faster animation
        (window.gameSettings.slowMotion ? 12000 : 4000);
        
    setTimeout(() => {
        if (wrapper.parentNode && !isClicked) {
            DOM.remove(wrapper);
            // Reset streak if missed (ball went off screen)
            resetStreak();
        }
    }, removalDelay);
}

// Check for streak milestones
function checkStreakMilestones() {
    // Only check milestones if we have a valid streak
    if (streak <= 0) return;
    
    // Find the highest milestone we've reached
    let currentMilestone = 0;
    for (let milestone in streakMilestones) {
        if (streak >= parseInt(milestone) && parseInt(milestone) > currentMilestone) {
            currentMilestone = parseInt(milestone);
        }
    }
    
    // Only show message if this is a new milestone we haven't shown yet for this streak
    if (currentMilestone > lastStreakMilestone) {
        lastStreakMilestone = currentMilestone;
        createStarMessage(streakMilestones[currentMilestone], true);
        
        // Check for 10-hit streak video celebration
        if (currentMilestone === 10 && !hasShownStreakVideo) {
            console.log('10-hit streak achieved! Showing celebration video...');
            hasShownStreakVideo = true; // Set flag to prevent showing again this page load
            setTimeout(() => {
                showCelebrationVideo();
            }, 1000);
        }
        
        // Extra celebration for big streaks
        if (currentMilestone >= 20) {
            for (let i = 0; i < 20; i++) {
                setTimeout(() => {
                    createVictoryConfetti();
                }, i * 50);
            }
        }
    }
}

// Update score display
function updateScoreDisplay() {
    const scoreDisplay = document.getElementById('scoreDisplay');
    let streakText = streak > 2 ? `<div class="streak">Streak: ${streak}! 🔥</div>` : '';
    scoreDisplay.innerHTML = `Home Runs: ${score}${streakText}<div class="total-score">Total: <span id="totalHomeRuns">${totalHomeRuns}</span></div>`;
}

// Show celebration video
function showCelebrationVideo() {
    const overlay = document.getElementById('videoOverlay');
    const video = document.getElementById('celebrationVideo');
    
    DOM.addClass(overlay, 'active');
    video.play();
    
    // Create extra celebration effects
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

// Handle misclicks (clicking but missing the ball)
function handleMissClick(e) {
    // Check if click was on a baseball or interactive element
    const clickedElement = e.target;
    
    // Don't count as miss if clicking on UI elements
    if (clickedElement.closest('.baseball-wrapper') || 
        clickedElement.tagName === 'IFRAME' ||
        clickedElement.closest('.music-container') ||
        clickedElement.closest('.video-overlay') ||
        clickedElement.closest('button') ||
        clickedElement.id === 'musicPrompt' ||
        clickedElement.closest('.score-display') ||
        clickedElement.closest('.neon-text') ||
        clickedElement.closest('.mets-info')) {
        return;
    }
    
    // Check if there are any baseballs on screen
    const baseballs = document.querySelectorAll('.baseball-wrapper');
    if (baseballs.length === 0) {
        // No baseballs on screen, so this isn't really a miss
        return;
    }
    
    // This was a swing and a miss!
    console.log('Swing and a miss! Streak broken.');
    resetStreak();
    
    // Show miss location in debug mode
    if (window.gameSettings.showClickLocations) {
        showClickLocation(e.clientX, e.clientY, false);
    }
}

// Initialize game
function initializeGame() {
    // Load saved values
    totalHomeRuns = Storage.getNumber('totalHomeRuns', 0);
    bestStreak = Storage.getNumber('bestStreak', 0);
    
    // hasShownStreakVideo starts as false and will be set to true after first 10-streak
    
    updateScoreDisplay();
    
    // Add global click handler for miss detection
    document.addEventListener('click', handleMissClick);
    document.addEventListener('touchstart', handleMissClick);
    
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
    
    // Make closeVideo available globally
    window.closeVideo = closeVideo;
}