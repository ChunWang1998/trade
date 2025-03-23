// Fetch Bitcoin price data from Coinbase API
async function fetchBitcoinPrice(config = {}) {
  // Default configuration
  const defaultConfig = {
    product: 'BTC-USD',
    granularity: 900, // 15 minutes in seconds
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
    endDate: new Date(), // now
  };

  // Merge default config with provided config
  const mergedConfig = { ...defaultConfig, ...config };
  
  // Format dates for API
  const start = mergedConfig.startDate.toISOString();
  const end = mergedConfig.endDate.toISOString();
  
  // Construct API URL
  const url = `https://api.exchange.coinbase.com/products/${mergedConfig.product}/candles?granularity=${mergedConfig.granularity}&start=${start}&end=${end}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Coinbase returns data in reverse chronological order (newest first)
    // Reverse the array to get chronological order (oldest first)
    const chronologicalData = [...data].reverse();
    
    // Transform to more readable format
    return chronologicalData.map(candle => ({
      timestamp: new Date(candle[0] * 1000), // Convert Unix timestamp to Date
      low: candle[1],
      high: candle[2],
      open: candle[3],
      close: candle[4],
      volume: candle[5]
    }));
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);
    throw error;
  }
}

/**
 * Identifies local high or low points using the N-point method
 * @param {Array} priceData - Array of price data objects
 * @param {string} priceType - Which price to use (default: 'low')
 * @returns {Array} - Array of local points (highs or lows depending on priceType)
 */
function findLocalPoints(priceData, priceType = 'low') {
  const localPoints = [];
  const n = 5;
  
  // We need at least 2*n+1 data points to find local points
  if (priceData.length < 2 * n + 1) {
    return localPoints;
  }
  
  // Check each point (skipping first n and last n points)
  for (let i = n; i < priceData.length - n; i++) {
    const currentPrice = priceData[i][priceType];
    let isLocalPoint = true;
    
    // For 'low' priceType, we're looking for local minimums
    // For other priceTypes (like 'high'), we're looking for local maximums
    const compareFn = priceType === 'low' 
      ? (a, b) => a <= b  // For lows: neighboring point should be higher
      : (a, b) => a >= b; // For highs: neighboring point should be lower
    
    // Check n points before
    for (let j = i - n; j < i; j++) {
      if (compareFn(priceData[j][priceType], currentPrice)) {
        isLocalPoint = false;
        break;
      }
    }
    
    // If still a local point, check n points after
    if (isLocalPoint) {
      for (let j = i + 1; j <= i + n; j++) {
        if (compareFn(priceData[j][priceType], currentPrice)) {
          isLocalPoint = false;
          break;
        }
      }
    }
    
    // If it's a local point, add to results
    if (isLocalPoint) {
      localPoints.push({
        ...priceData[i],
        index: i
      });
    }
  }
  
  return localPoints;
}



// Example usage
async function main() {
  try {
    const defaultData = await fetchBitcoinPrice();
    
    // Find local high points using 5-point method
    const highPoints = findLocalPoints(defaultData, 'low');
    
    // Add 8 hours to each timestamp for display
    const highPointsAdjusted = highPoints.map(point => ({
      ...point,
      timestamp: new Date(point.timestamp.getTime() + 8 * 60 * 60 * 1000)
    }));
    
    console.log('Local high points (5-point method):', highPointsAdjusted);
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  main();
}

// Export the function for use in other modules
module.exports = { fetchBitcoinPrice, findLocalPoints };