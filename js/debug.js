// Debug Functions

// Debug settings
window.gameSettings = {
    debugMode: false,
    clickTargetSize: 110,
    showClickLocations: false,
    pauseBaseballs: false,
    slowMotion: false
};

// Debug functions
function toggleDebug() {
    window.gameSettings.debugMode = !window.gameSettings.debugMode;
    document.body.classList.toggle('debug-mode', window.gameSettings.debugMode);
    console.log('Debug mode:', window.gameSettings.debugMode ? 'ON' : 'OFF');
}

function adjustClickTargetSize(delta) {
    window.gameSettings.clickTargetSize += delta;
    window.gameSettings.clickTargetSize = Math.max(50, Math.min(300, window.gameSettings.clickTargetSize));
    document.querySelectorAll('.baseball-wrapper').forEach(wrapper => {
        wrapper.style.width = window.gameSettings.clickTargetSize + 'px';
        wrapper.style.height = window.gameSettings.clickTargetSize + 'px';
    });
    console.log('Click target size:', window.gameSettings.clickTargetSize);
}

// Test function to simulate a click on a baseball
function testClickBaseball() {
    const baseballs = document.querySelectorAll('.baseball-wrapper');
    if (baseballs.length === 0) {
        console.log('No baseballs on screen to test!');
        return;
    }
    
    const baseball = baseballs[0];
    const rect = baseball.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    console.log('Testing click on baseball at:', { x: centerX, y: centerY });
    
    const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: centerX,
        clientY: centerY
    });
    
    baseball.dispatchEvent(clickEvent);
}

// Function to check what element is at a specific point
function checkElementAtPoint(x, y) {
    const element = document.elementFromPoint(x, y);
    console.log('Element at point', {x, y}, ':', element);
    if (element) {
        console.log('Element details:', {
            tagName: element.tagName,
            className: element.className,
            id: element.id,
            zIndex: window.getComputedStyle(element).zIndex,
            pointerEvents: window.getComputedStyle(element).pointerEvents,
            parent: element.parentElement ? element.parentElement.className : 'none'
        });
    }
}

// Initialize debug keyboard shortcuts
function initializeDebug() {
    document.addEventListener('keydown', function(e) {
        // CTRL+ALT+SHIFT+D: Toggle debug mode
        if (e.ctrlKey && e.altKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            toggleDebug();
        }
        // CTRL+ALT+SHIFT+J: Make click target bigger
        else if (e.ctrlKey && e.altKey && e.shiftKey && e.key === 'J') {
            e.preventDefault();
            adjustClickTargetSize(20);
        }
        // CTRL+ALT+SHIFT+K: Make click target smaller
        else if (e.ctrlKey && e.altKey && e.shiftKey && e.key === 'K') {
            e.preventDefault();
            adjustClickTargetSize(-20);
        }
        // CTRL+ALT+SHIFT+C: Show click locations
        else if (e.ctrlKey && e.altKey && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            window.gameSettings.showClickLocations = !window.gameSettings.showClickLocations;
            console.log('Show click locations:', window.gameSettings.showClickLocations ? 'ON' : 'OFF');
        }
        // CTRL+ALT+SHIFT+P: Pause baseball generation
        else if (e.ctrlKey && e.altKey && e.shiftKey && e.key === 'P') {
            e.preventDefault();
            window.gameSettings.pauseBaseballs = !window.gameSettings.pauseBaseballs;
            console.log('Baseball generation:', window.gameSettings.pauseBaseballs ? 'PAUSED' : 'RUNNING');
        }
        // CTRL+ALT+SHIFT+S: Slow motion mode
        else if (e.ctrlKey && e.altKey && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            window.gameSettings.slowMotion = !window.gameSettings.slowMotion;
            console.log('Slow motion:', window.gameSettings.slowMotion ? 'ON' : 'OFF');
        }
        // CTRL+ALT+SHIFT+L: Log all active baseballs
        else if (e.ctrlKey && e.altKey && e.shiftKey && e.key === 'L') {
            e.preventDefault();
            const baseballs = document.querySelectorAll('.baseball-wrapper');
            console.log('Active baseballs:', baseballs.length);
            baseballs.forEach((b, i) => {
                const rect = b.getBoundingClientRect();
                console.log(`Baseball ${i}:`, {
                    left: rect.left,
                    top: rect.top,
                    width: rect.width,
                    height: rect.height
                });
            });
        }
        // CTRL+ALT+SHIFT+Z: Check z-index stacking
        else if (e.ctrlKey && e.altKey && e.shiftKey && e.key === 'Z') {
            e.preventDefault();
            console.log('Z-index analysis:');
            const elements = document.querySelectorAll('*');
            const zIndexed = Array.from(elements)
                .map(el => ({
                    element: el,
                    className: el.className,
                    zIndex: window.getComputedStyle(el).zIndex
                }))
                .filter(item => item.zIndex !== 'auto' && item.zIndex !== '0')
                .sort((a, b) => parseInt(b.zIndex) - parseInt(a.zIndex));
            
            console.table(zIndexed.slice(0, 20));
        }
        // CTRL+ALT+SHIFT+T: Test click on first baseball
        else if (e.ctrlKey && e.altKey && e.shiftKey && e.key === 'T') {
            e.preventDefault();
            testClickBaseball();
        }
        // CTRL+ALT+SHIFT+W: Check element at mouse position
        else if (e.ctrlKey && e.altKey && e.shiftKey && e.key === 'W') {
            e.preventDefault();
            document.addEventListener('click', function checkElement(e) {
                checkElementAtPoint(e.clientX, e.clientY);
            }, { once: true });
            console.log('Click anywhere to check what element is at that point...');
        }
        // CTRL+ALT+SHIFT+M: Test Mets Win celebration
        else if (e.ctrlKey && e.altKey && e.shiftKey && e.key === 'M') {
            e.preventDefault();
            console.log('Testing Mets Win celebration...');
            celebrateMetsWin();
        }
        // CTRL+ALT+SHIFT+R: Test star message
        else if (e.ctrlKey && e.altKey && e.shiftKey && e.key === 'R') {
            e.preventDefault();
            const testMessage = prompt('Enter message to display in stars:', 'HAPPY 80TH!');
            if (testMessage) {
                createStarMessage(testMessage);
            }
        }
    });
    
    // Log debug instructions
    console.log('Debug shortcuts available:');
    console.log('CTRL+ALT+SHIFT+D - Toggle debug mode (show click targets)');
    console.log('CTRL+ALT+SHIFT+J - Make click targets bigger');
    console.log('CTRL+ALT+SHIFT+K - Make click targets smaller');
    console.log('CTRL+ALT+SHIFT+C - Show click locations');
    console.log('CTRL+ALT+SHIFT+P - Pause baseball generation');
    console.log('CTRL+ALT+SHIFT+S - Slow motion mode');
    console.log('CTRL+ALT+SHIFT+L - Log all active baseballs');
    console.log('CTRL+ALT+SHIFT+Z - Analyze z-index stacking');
    console.log('CTRL+ALT+SHIFT+T - Test click on first baseball');
    console.log('CTRL+ALT+SHIFT+W - Check element at click point');
    console.log('CTRL+ALT+SHIFT+M - Test Mets Win celebration');
    console.log('CTRL+ALT+SHIFT+R - Test star message');
}