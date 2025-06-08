// Utility Functions

// Storage utilities
const Storage = {
    get: function(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value !== null ? JSON.parse(value) : defaultValue;
        } catch (e) {
            console.error('Storage get error:', e);
            return defaultValue;
        }
    },
    
    set: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    },
    
    getNumber: function(key, defaultValue = 0) {
        const value = this.get(key);
        return value !== null ? parseInt(value) : defaultValue;
    },
    
    setNumber: function(key, value) {
        return this.set(key, value.toString());
    }
};

// Random number utilities
const Random = {
    between: function(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    int: function(min, max) {
        return Math.floor(this.between(min, max + 1));
    },
    
    choice: function(array) {
        return array[this.int(0, array.length - 1)];
    }
};

// DOM utilities
const DOM = {
    create: function(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else if (key.startsWith('data-')) {
                element.setAttribute(key, value);
            } else {
                element[key] = value;
            }
        });
        
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });
        
        return element;
    },
    
    remove: function(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    },
    
    addClass: function(element, className) {
        element.classList.add(className);
    },
    
    removeClass: function(element, className) {
        element.classList.remove(className);
    },
    
    hasClass: function(element, className) {
        return element.classList.contains(className);
    }
};

// Animation utilities
const Animation = {
    delay: function(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    sequence: async function(animations, delay = 0) {
        for (const animation of animations) {
            await animation();
            if (delay > 0) {
                await this.delay(delay);
            }
        }
    },
    
    parallel: function(animations) {
        return Promise.all(animations.map(animation => animation()));
    }
};

// Event utilities
const Events = {
    throttle: function(func, wait) {
        let timeout;
        let lastTime = 0;
        
        return function(...args) {
            const now = Date.now();
            const remaining = wait - (now - lastTime);
            
            if (remaining <= 0) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                lastTime = now;
                func.apply(this, args);
            } else if (!timeout) {
                timeout = setTimeout(() => {
                    lastTime = Date.now();
                    timeout = null;
                    func.apply(this, args);
                }, remaining);
            }
        };
    },
    
    debounce: function(func, wait) {
        let timeout;
        
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
};