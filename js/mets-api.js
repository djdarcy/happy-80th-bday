// Mets API Integration

let lastMetsRecord = '';

// Initialize with loading state
function initializeMetsDisplay() {
    const metsInfo = document.getElementById('metsInfo');
    metsInfo.innerHTML = '🧡💙 Let\'s Go Mets! Loading stats... 💙🧡';
}

// Try to fetch live Mets stats with multiple approaches
async function updateMetsStats() {
    const metsInfo = document.getElementById('metsInfo');
    
    try {
        // Try multiple endpoints
        const endpoints = [
            'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams/21',
            'https://site.web.api.espn.com/apis/site/v2/sports/baseball/mlb/teams/21/schedule',
            'https://statsapi.mlb.com/api/v1/teams/121' // MLB's official API (Mets team ID is 121)
        ];
        
        // Try ESPN endpoint first
        try {
            const response = await fetch(endpoints[0], {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                
                if (data && data.team && data.team.record && data.team.record.items) {
                    const overallRecord = data.team.record.items.find(item => item.type === 'total' || item.type === 'overall');
                    if (overallRecord && overallRecord.summary) {
                        const currentRecord = overallRecord.summary;
                        
                        // Check if Mets won a new game before updating display
                        const winLossChange = checkForMetsWin(currentRecord);
                        
                        // Format the record with styled numbers
                        const [wins, losses] = currentRecord.split('-');
                        let formattedRecord = currentRecord;
                        
                        if (winLossChange === 'win') {
                            formattedRecord = `<span class="mets-win-number">${wins}</span>-${losses}`;
                        } else if (winLossChange === 'loss') {
                            formattedRecord = `${wins}-<span class="mets-loss-number">${losses}</span>`;
                        }
                        
                        metsInfo.innerHTML = `🧡💙 Let's Go Mets! Currently ${formattedRecord}! 💙🧡`;
                        
                        console.log('Successfully fetched Mets stats from ESPN:', currentRecord);
                        return;
                    }
                }
            }
        } catch (espnError) {
            console.log('ESPN API failed:', espnError);
        }
        
        // Try MLB Stats API as fallback
        try {
            const mlbResponse = await fetch(endpoints[2]);
            if (mlbResponse.ok) {
                const mlbData = await mlbResponse.json();
                console.log('MLB API response received but needs additional processing');
                // TODO: Parse MLB API data format when CORS is resolved
            }
        } catch (mlbError) {
            console.log('MLB API also failed:', mlbError);
        }
        
        // If all APIs fail, try a JSONP approach (last resort)
        const script = document.createElement('script');
        script.src = 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams/21?callback=handleMetsData';
        window.handleMetsData = function(data) {
            if (data && data.team && data.team.displayName) {
                console.log('JSONP approach worked for basic data');
            }
            document.body.removeChild(script);
            delete window.handleMetsData;
        };
        script.onerror = function() {
            console.log('JSONP approach also failed');
            document.body.removeChild(script);
            // Use fallback after all attempts fail
            useFallbackRecord();
        };
        document.body.appendChild(script);
        
    } catch (error) {
        console.log('All API attempts failed:', error);
        useFallbackRecord();
    }
}

// Use fallback record when API fails
function useFallbackRecord() {
    const metsInfo = document.getElementById('metsInfo');
    const fallbackRecord = lastMetsRecord || '41-24';
    
    console.log('Using fallback Mets record:', fallbackRecord);
    
    // Format the fallback record
    const [wins, losses] = fallbackRecord.split('-');
    metsInfo.innerHTML = `🧡💙 Let's Go Mets! Currently ${wins}-${losses}! 💙🧡`;
}

// Check if Mets won a new game
function checkForMetsWin(currentRecord) {
    // If no last record, just save current
    if (!lastMetsRecord) {
        lastMetsRecord = currentRecord;
        Storage.set('lastMetsRecord', currentRecord);
        return null;
    }
    
    const [currentWins, currentLosses] = currentRecord.split('-').map(n => parseInt(n));
    const [lastWins, lastLosses] = lastMetsRecord.split('-').map(n => parseInt(n));
    
    let changeType = null;
    
    if (currentWins > lastWins) {
        // Mets won a game!
        changeType = 'win';
        celebrateMetsWin();
        Storage.set('lastMetsRecord', currentRecord);
        lastMetsRecord = currentRecord;
    } else if (currentLosses > lastLosses) {
        // Mets lost a game
        changeType = 'loss';
        Storage.set('lastMetsRecord', currentRecord);
        lastMetsRecord = currentRecord;
    } else if (currentWins !== lastWins || currentLosses !== lastLosses) {
        // Record changed but not a simple win/loss
        Storage.set('lastMetsRecord', currentRecord);
        lastMetsRecord = currentRecord;
    }
    
    return changeType;
}

// Celebrate when Mets win
function celebrateMetsWin() {
    const metsInfo = document.getElementById('metsInfo');
    DOM.addClass(metsInfo, 'mets-win-celebration');
    
    // Create special confetti burst
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            createVictoryConfetti();
        }, i * 50);
    }
    
    // Show star message (marked as event for shorter display)
    createStarMessage('METS WIN!', true);
    
    setTimeout(() => {
        DOM.removeClass(metsInfo, 'mets-win-celebration');
    }, 3000);
}

// Fetch Mets news headlines (example implementation)
async function fetchMetsNews() {
    try {
        // This is a placeholder - you'd need a news API or RSS feed
        // For example, you could use NewsAPI or parse an RSS feed
        // const newsUrl = 'https://your-news-api.com/mets';
        // const response = await fetch(newsUrl);
        // const data = await response.json();
        // if (data.headline) {
        //     createStarMessage(data.headline.toUpperCase());
        // }
        
        console.log('News fetching would go here with proper API');
    } catch (error) {
        console.log('Failed to fetch Mets news:', error);
    }
}

// Initialize Mets stats
function initializeMetsStats() {
    // Load last known record
    lastMetsRecord = Storage.get('lastMetsRecord', '41-24');
    
    // Show loading state
    initializeMetsDisplay();
    
    // Try to get live Mets stats immediately
    updateMetsStats();
    
    // Check for updates periodically
    setInterval(updateMetsStats, 300000); // Check every 5 minutes
    
    // Optional: Check for news periodically
    // setInterval(fetchMetsNews, 600000); // Check every 10 minutes
}