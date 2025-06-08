// Animation Functions - Optimized for Performance

// Track active elements for cleanup
let activeExplosions = [];
let activeStars = [];
let maxBackgroundStars = 30; // Limit background stars for performance

// Create animated stars background - optimized
function createStars() {
    const starsContainer = document.getElementById('stars');
    const numStars = Math.min(maxBackgroundStars, window.innerWidth < 768 ? 20 : 30);
    
    for (let i = 0; i < numStars; i++) {
        const star = DOM.create('div', {
            className: 'star',
            style: {
                left: Random.between(0, 100) + '%',
                top: Random.between(0, 100) + '%',
                width: Random.between(1, 4) + 'px',
                height: Random.between(1, 4) + 'px',
                animationDelay: Random.between(0, 2) + 's'
            }
        });
        
        starsContainer.appendChild(star);
    }
}

// Create floating confetti - optimized
function createConfetti() {
    const confettiContainer = document.getElementById('confetti');
    const numConfetti = window.innerWidth < 768 ? 15 : 20;
    
    for (let i = 0; i < numConfetti; i++) {
        const confetti = DOM.create('div', {
            className: 'confetti',
            style: {
                left: Random.between(0, 100) + '%',
                animationDelay: Random.between(0, 3) + 's',
                animationDuration: Random.between(2, 4) + 's'
            }
        });
        
        confettiContainer.appendChild(confetti);
    }
}

// Clean up old explosions
function cleanupExplosions() {
    activeExplosions = activeExplosions.filter(explosion => {
        if (!explosion.parentNode) {
            return false;
        }
        return true;
    });
}

// Create explosion effect when ball is hit - optimized
function createExplosion(x, y, isGolden = false) {
    // Clean up old explosions if too many
    if (activeExplosions.length > 10) {
        cleanupExplosions();
    }
    
    const sparkCount = isGolden ? 15 : 8; // Reduced spark count
    const sparkColor = isGolden ? '#ffdd44' : '#ffff00';
    
    // Create a container for all sparks
    const explosionContainer = DOM.create('div', {
        style: {
            position: 'fixed',
            left: x + 'px',
            top: y + 'px',
            width: '1px',
            height: '1px',
            pointerEvents: 'none',
            zIndex: '10000'
        }
    });
    
    for (let i = 0; i < sparkCount; i++) {
        const angle = (i / sparkCount) * 2 * Math.PI;
        const distance = Random.between(50, 80);
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;
        
        const spark = DOM.create('div', {
            style: {
                position: 'absolute',
                left: '0',
                top: '0',
                width: isGolden ? '6px' : '4px',
                height: isGolden ? '6px' : '4px',
                background: sparkColor,
                borderRadius: '50%',
                boxShadow: `0 0 ${isGolden ? '10px' : '5px'} ${sparkColor}`,
                '--endX': endX + 'px',
                '--endY': endY + 'px',
                animation: 'sparkFly 0.6s ease-out forwards'
            }
        });
        
        explosionContainer.appendChild(spark);
    }
    
    document.body.appendChild(explosionContainer);
    activeExplosions.push(explosionContainer);
    
    // Clean up after animation
    setTimeout(() => {
        DOM.remove(explosionContainer);
        const index = activeExplosions.indexOf(explosionContainer);
        if (index > -1) {
            activeExplosions.splice(index, 1);
        }
    }, 600);
}

// Create a new star where the home run was hit - optimized
function createNewStar(x, y) {
    // Limit total stars for performance
    if (activeStars.length > 50) {
        // Remove oldest star
        const oldestStar = activeStars.shift();
        DOM.remove(oldestStar);
    }
    
    const star = DOM.create('div', {
        className: 'new-star',
        style: {
            left: x + 'px',
            top: y + 'px'
        }
    });
    
    // Add to stars container
    document.getElementById('stars').appendChild(star);
    activeStars.push(star);
    
    // After birth animation, make it twinkle
    setTimeout(() => {
        star.style.animation = 'twinkle 2s infinite alternate';
        star.style.animationDelay = Random.between(0, 2) + 's';
    }, 2000);
}

// Create victory confetti for special celebrations - optimized
let confettiTimeout = null;
function createVictoryConfetti() {
    // Throttle confetti creation
    if (confettiTimeout) return;
    
    const colors = ['#ff6600', '#0066cc', '#ffffff', '#ffff00'];
    
    const confetti = DOM.create('div', {
        className: 'confetti',
        style: {
            background: Random.choice(colors),
            left: Random.between(20, 80) + '%',
            width: Random.between(10, 20) + 'px',
            height: Random.between(10, 20) + 'px',
            animationDuration: Random.between(1, 3) + 's',
            zIndex: '1000'
        }
    });
    
    document.body.appendChild(confetti);
    
    // Remove after animation
    setTimeout(() => {
        DOM.remove(confetti);
    }, 3000);
    
    // Throttle next confetti
    confettiTimeout = setTimeout(() => {
        confettiTimeout = null;
    }, 50);
}

// Add sparkle effect on clicks - optimized
let sparkleTimeout = null;
function createSparkle(x, y) {
    // Throttle sparkles
    if (sparkleTimeout) return;
    
    const sparkle = DOM.create('div', {
        style: {
            position: 'fixed',
            left: x + 'px',
            top: y + 'px',
            width: '20px',
            height: '20px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: '1000',
            animation: 'pulse 0.5s ease-out forwards'
        }
    });
    
    document.body.appendChild(sparkle);
    
    setTimeout(() => {
        DOM.remove(sparkle);
    }, 500);
    
    // Throttle next sparkle
    sparkleTimeout = setTimeout(() => {
        sparkleTimeout = null;
    }, 100);
}