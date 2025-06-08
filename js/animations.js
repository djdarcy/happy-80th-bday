// Animation Functions

// Create animated stars background
function createStars() {
    const starsContainer = document.getElementById('stars');
    const numStars = 50;
    
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

// Create floating confetti
function createConfetti() {
    const confettiContainer = document.getElementById('confetti');
    const numConfetti = 30;
    
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

// Create explosion effect when ball is hit
function createExplosion(x, y) {
    const sparks = [];
    
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * 2 * Math.PI;
        const distance = Random.between(50, 80);
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;
        
        const spark = DOM.create('div', {
            style: {
                position: 'fixed',
                left: x + 'px',
                top: y + 'px',
                width: '4px',
                height: '4px',
                background: '#ffff00',
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: '10000',
                '--endX': endX + 'px',
                '--endY': endY + 'px',
                animation: 'sparkFly 0.6s ease-out forwards'
            }
        });
        
        document.body.appendChild(spark);
        sparks.push(spark);
    }
    
    // Clean up after animation
    setTimeout(() => {
        sparks.forEach(spark => DOM.remove(spark));
    }, 600);
}

// Create a new star where the home run was hit
function createNewStar(x, y) {
    const star = DOM.create('div', {
        className: 'new-star',
        style: {
            left: x + 'px',
            top: y + 'px'
        }
    });
    
    // Add to stars container
    document.getElementById('stars').appendChild(star);
    
    // After birth animation, make it twinkle
    setTimeout(() => {
        star.style.animation = 'twinkle 2s infinite alternate';
        star.style.animationDelay = Random.between(0, 2) + 's';
    }, 2000);
}

// Create victory confetti for special celebrations
function createVictoryConfetti() {
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
}

// Add sparkle effect on clicks
function createSparkle(x, y) {
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
}