// Star Message System
// Requires: ascii-font.js to be loaded first

// Global variables for star messages
let messageStars = [];
let currentMessage = '';
let messageTimeout = null;
let hasShownMOTD = false;

// Create star message with mobile-responsive positioning and scrolling
function createStarMessage(message, isEvent = false) {
    // Clear existing message stars
    clearMessageTimeout();
    messageStars.forEach(star => DOM.remove(star));
    messageStars = [];
    currentMessage = message.toUpperCase();
    
    const container = document.getElementById('starMessageContainer');
    const charWidth = 5;
    const charHeight = 8;
    const scale = window.innerWidth < 768 ? 2 : 2.5;
    const spaceWidth = 3;
    
    // Calculate total width needed with variable spacing
    let totalWidth = 0;
    for (let i = 0; i < message.length; i++) {
        if (message[i] === ' ') {
            totalWidth += spaceWidth * scale;
        } else {
            totalWidth += charWidth * scale;
        }
    }
    
    const containerRect = container.getBoundingClientRect();
    const needsScrolling = totalWidth > window.innerWidth * 0.9;
    
    // Starting position
    let startX;
    const startY = containerRect.top + (containerRect.height - (charHeight * scale)) / 2;
    
    if (needsScrolling) {
        // For scrolling messages, start with the beginning of the message visible
        startX = 20; // Start 20px from the left edge
    } else {
        // Center non-scrolling messages
        startX = (window.innerWidth - totalWidth) / 2;
    }
    
    // Create a container div for all stars if scrolling
    let scrollContainer = null;
    if (needsScrolling) {
        scrollContainer = DOM.create('div', {
            id: 'starScrollContainer',
            style: {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: '1000'
            }
        });
        document.body.appendChild(scrollContainer);
    }
    
    // Create stars for each character with fade-in animation
    let currentX = startX;
    for (let charIndex = 0; charIndex < message.length; charIndex++) {
        const char = message[charIndex].toUpperCase();
        const charPattern = asciiFont[char];
        
        if (charPattern) {
            for (let row = 0; row < charPattern.length; row++) {
                for (let col = 0; col < charPattern[row].length; col++) {
                    if (charPattern[row][col] === 1) {
                        const star = DOM.create('div', {
                            className: 'message-star',
                            style: {
                                left: (currentX + col * scale) + 'px',
                                top: (startY + row * scale) + 'px',
                                animationDelay: (charIndex * 0.05 + (row + col) * 0.01) + 's',
                                opacity: '0',
                                width: '2px',
                                height: '2px'
                            }
                        });
                        
                        if (needsScrolling) {
                            scrollContainer.appendChild(star);
                        } else {
                            document.body.appendChild(star);
                        }
                        messageStars.push(star);
                        
                        // Fade in with twinkle
                        setTimeout(() => {
                            star.style.opacity = '1';
                            star.style.animation = 'starMessageAppear 1s forwards, messagePulse 1.5s ease-in-out infinite';
                            star.style.animationDelay = (charIndex * 0.02 + (row + col) * 0.005) + 's, 0s';
                        }, 10);
                    }
                }
            }
        }
        
        // Move to next character position
        if (char === ' ') {
            currentX += spaceWidth * scale;
        } else {
            currentX += charWidth * scale;
        }
    }
    
    // If scrolling is needed, animate the container
    if (needsScrolling && scrollContainer) {
        let scrollAnimation = null;
        let startTime = null;
        
        // Calculate scroll parameters
        const visibleWidth = window.innerWidth;
        const scrollDistance = totalWidth + visibleWidth + 100; // Total distance to scroll
        const scrollDuration = Math.max(10000, totalWidth * 10); // Adjust speed based on length
        
        // Wait for fade-in to complete before starting scroll
        setTimeout(() => {
            function animateScroll(timestamp) {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
                const progress = (elapsed / scrollDuration) % 1;
                
                // Calculate position for seamless loop
                // Start at 20px, move left until completely off screen, then loop
                const currentPosition = 20 - (progress * scrollDistance);
                
                // If message has scrolled completely off screen, reset to start from right
                let translateX = currentPosition;
                if (currentPosition < -totalWidth - 50) {
                    // Reset to start from right side
                    const loopProgress = (currentPosition + totalWidth + 50) / scrollDistance;
                    translateX = visibleWidth + (loopProgress * scrollDistance);
                }
                
                scrollContainer.style.transform = `translateX(${translateX}px)`;
                
                // Continue animation
                scrollAnimation = requestAnimationFrame(animateScroll);
            }
            
            scrollAnimation = requestAnimationFrame(animateScroll);
        }, 1500); // Start scrolling after 1.5 seconds (fade-in time)
        
        // Store animation reference for cleanup
        scrollContainer.scrollAnimation = scrollAnimation;
    }
    
    // Remove message after duration
    const displayDuration = isEvent ? 30000 : 45000;
    messageTimeout = setTimeout(() => {
        // Cancel scroll animation if exists
        const existingContainer = document.getElementById('starScrollContainer');
        if (existingContainer && existingContainer.scrollAnimation) {
            cancelAnimationFrame(existingContainer.scrollAnimation);
        }
        
        // Fade out stars
        messageStars.forEach((star, index) => {
            star.style.animation = 'fadeOut 2s forwards';
            star.style.animationDelay = (index * 0.005) + 's';
        });
        
        // Clean up after fade out
        setTimeout(() => {
            messageStars.forEach(star => DOM.remove(star));
            if (document.getElementById('starScrollContainer')) {
                DOM.remove(document.getElementById('starScrollContainer'));
            }
            messageStars = [];
            currentMessage = '';
        }, 2000);
    }, displayDuration);
}

// Clear message timeout
function clearMessageTimeout() {
    if (messageTimeout) {
        clearTimeout(messageTimeout);
        messageTimeout = null;
    }
    
    // Also clean up any existing scroll container
    const existingContainer = document.getElementById('starScrollContainer');
    if (existingContainer && existingContainer.scrollAnimation) {
        cancelAnimationFrame(existingContainer.scrollAnimation);
    }
}

// Fetch and display MOTD (only once)
async function fetchMOTD() {
    if (hasShownMOTD) return; // Only show MOTD once
    
    try {
        const response = await fetch('https://djdarcy.github.io/happy-80th-bday/motd.json');
        if (response.ok) {
            const data = await response.json();
            if (data.message && data.message !== currentMessage) {
                createStarMessage(data.message, false);
                hasShownMOTD = true; // Mark as shown
            }
        }
    } catch (error) {
        console.log('No MOTD available');
    }
}