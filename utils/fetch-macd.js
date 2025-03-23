// node fetch-macd.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const API_SECRET = process.env.TAAPI_SECRET;
const EXCHANGE = 'binance';
const SYMBOL = 'BTC/USDT';
const INTERVAL = '15m';
const DATA_FILE = path.join(__dirname, 'macd_history.json');

const requestData = {
  secret: API_SECRET,
  exchange: EXCHANGE,
  symbol: SYMBOL,
  interval: INTERVAL
};

const ensureHistoryFileExists = () => {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
};

const readHistoryData = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取历史数据时出错:', error.message);
    return [];
  }
};

// 添加新数据并保存
const saveHistoryData = (historyData, newData) => {
  try {
    newData.timestamp = Date.now();
    newData.formattedTime = new Date().toISOString();
    
    const dataToSave = {
      timestamp: newData.timestamp,
      formattedTime: newData.formattedTime,
      valueMACD: newData.valueMACD,
      valueMACDSignal: newData.valueMACDSignal,
      valueMACDHist: newData.valueMACDHist
    };
    
    historyData.push(dataToSave);
    
    // 只保留最近的1000条记录（可以根据需要调整）
    if (historyData.length > 1000) {
      historyData = historyData.slice(historyData.length - 1000);
    }
    
    fs.writeFileSync(DATA_FILE, JSON.stringify(historyData, null, 2));
  } catch (error) {
    console.error('保存历史数据时出错:', error.message);
  }
};

async function fetchLatestMACDData() {
  try {
    ensureHistoryFileExists();
    const historyData = readHistoryData();
    
    const now = new Date();
    console.log(`[${now.toISOString()}] 正在获取最新MACD数据...`);
    
    const response = await axios.get('https://api.taapi.io/macd', {
      params: requestData
    });
    
    if (!response.data || typeof response.data !== 'object') {
      throw new Error('API响应格式不正确');
    }
    
    const macdData = response.data;
    
    saveHistoryData(historyData, macdData);
    
    console.log(macdData)
    
    return macdData;
  } catch (error) {
    console.error('获取MACD数据时出错:', error.message);
    if (error.response) {
      console.error('API响应:', error.response.data);
    }
  }
}

async function main() {
  while (true) {
    await fetchLatestMACDData();
    console.log(`[${new Date().toISOString()}] 等待30秒后再次获取数据...`);
    // 等待30秒
    await new Promise(resolve => setTimeout(resolve, 30000));
  }
}

main().catch(err => {
  console.error('程序运行出错:', err);
  process.exit(1);
});