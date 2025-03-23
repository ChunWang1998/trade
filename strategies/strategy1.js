// get price from fetch-price.js
// take low and high from price
// 價格頂頂高, macd 頂頂低 => 上升趨勢
// 價格底底低, macd 底底高 => 上升趨勢
// 價格底底高, macd 底底低 => 上升趨勢
// 價格頂頂低, macd 頂頂高 => 下降趨勢
// video: https://www.youtube.com/watch?v=kBnAQwLtAKc&list=PLiYHbKvQ_FEx591pf3O1WKOPMTtD2YvgF

const { findLocalPoints, fetchBitcoinPrice } = require('../utils/fetch-price');


const price_top_top_high = [];
const price_top_top_low = [];
const price_bottom_bottom_high = [];
const price_bottom_bottom_low = [];

const macd_top_top_high = [];
const macd_top_top_low = [];
const macd_bottom_bottom_high = [];
const macd_bottom_bottom_low = [];

async function set_price_range() {
    const priceData = await fetchBitcoinPrice();
    const highPoints = findLocalPoints(priceData, 'high');

    for (let i = 0; i < highPoints.length - 1; i++) {
      const currentPoint = highPoints[i];
      const nextPoint = highPoints[i + 1];
      
      if (nextPoint.high > currentPoint.high) {
        // If next high point is higher than current, it's a top_top_high pattern
        price_top_top_high.push({
          start: currentPoint.timestamp,
          end: nextPoint.timestamp,
          startPrice: currentPoint.high,
          endPrice: nextPoint.high
        });
      } else {
        // If next high point is lower than current, it's a top_top_low pattern
        price_top_top_low.push({
          start: currentPoint.timestamp,
          end: nextPoint.timestamp,
          startPrice: currentPoint.high,
          endPrice: nextPoint.high
        });
      }
    }

    const lowPoints = findLocalPoints(priceData, 'low');

    // Process lowPoints to find bottom_bottom_high and bottom_bottom_low patterns
    for (let i = 0; i < lowPoints.length - 1; i++) {
      const currentPoint = lowPoints[i];
      const nextPoint = lowPoints[i + 1];
      
      if (nextPoint.low > currentPoint.low) {
        // If next low point is higher than current, it's a bottom_bottom_high pattern
        price_bottom_bottom_high.push({
          start: currentPoint.timestamp,
          end: nextPoint.timestamp,
          startPrice: currentPoint.low,
          endPrice: nextPoint.low
        });
      } else {
        // If next low point is lower than current, it's a bottom_bottom_low pattern
        price_bottom_bottom_low.push({
          start: currentPoint.timestamp,
          end: nextPoint.timestamp,
          startPrice: currentPoint.low,
          endPrice: nextPoint.low
        });
      }
    }
}

async function set_macd_range() {

}

async function main() {
  try {  
    await set_price_range();
        
    console.log('Price-Top-Top-High patterns:', price_top_top_high);
    console.log('Price-Top-Top-Low patterns:', price_top_top_low);
    console.log('Price-Bottom-Bottom-High patterns:', price_bottom_bottom_high);
    console.log('Price-Bottom-Bottom-Low patterns:', price_bottom_bottom_low);

    await set_macd_range();
   
  } catch (error) {
    console.error('Error in strategy execution:', error);
  }
}

// Execute the main function if this file is run directly
if (require.main === module) {
  main();
}



//function get_price_local_low
//function get_macd_local_hight
//function get_macd_local_low
