import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

interface TokenTradingData {
  id: string;
  symbol: string;
  name: string;
  current_price_usd: number | null;
  price_change_percentage_1h: number | null;
  price_change_percentage_24h: number | null;
  price_change_percentage_7d: number | null;
  price_change_percentage_14d?: number | null;
  price_change_percentage_30d?: number | null;
  price_change_percentage_1y?: number | null;
  market_cap_usd: number | null;
  total_volume_24h_usd: number | null;
  high_24h_usd: number | null;
  low_24h_usd: number | null;
  ath_usd?: number | null;
  ath_date?: string | null;
  atl_usd?: number | null;
  atl_date?: string | null;
  last_updated: string;
  // OHLC data
  ohlc_1d?: Array<[number, number, number, number, number]>;
  ohlc_7d?: Array<[number, number, number, number, number]>;
  ohlc_14d?: Array<[number, number, number, number, number]>;
  ohlc_30d?: Array<[number, number, number, number, number]>;
  ohlc_90d?: Array<[number, number, number, number, number]>;
  ohlc_180d?: Array<[number, number, number, number, number]>;
  ohlc_365d?: Array<[number, number, number, number, number]>;
  // Price data
  prices_1d?: Array<[number, number]>;
  prices_7d?: Array<[number, number]>;
  prices_30d?: Array<[number, number]>;
  prices_90d?: Array<[number, number]>;
  prices_365d?: Array<[number, number]>;
}

interface TradingChartProps {
  data: TokenTradingData | null;
  loading?: boolean;
  onClose?: () => void;
}

const CHART_HTML = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <script src="https://unpkg.com/lightweight-charts@4.1.0/dist/lightweight-charts.standalone.production.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body {
            width: 100%; height: 100%;
            background-color: #1a1a2e;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            overflow: hidden;
        }
        #container { width: 100%; height: 100%; display: flex; flex-direction: column; }
        #header {
            padding: 10px 16px;
            background: #16213e;
            border-bottom: 1px solid #2a2a4a;
        }
        #token-info {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 6px;
        }
        #token-name { font-size: 16px; font-weight: 700; color: #fff; }
        #token-symbol { font-size: 12px; color: #888; margin-left: 6px; }
        #current-price { font-size: 20px; font-weight: 700; color: #fff; }
        #price-change { font-size: 12px; margin-left: 6px; }
        .positive { color: #26a69a; }
        .negative { color: #ef5350; }
        #timeframe-buttons { display: flex; gap: 4px; padding: 6px 0; flex-wrap: wrap; }
        .timeframe-btn {
            padding: 5px 8px;
            border: none;
            border-radius: 6px;
            background: #2a2a4a;
            color: #888;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
        }
        .timeframe-btn.active { background: #007AFF; color: #fff; }
        #chart-type-buttons { display: flex; gap: 4px; padding: 6px 0; }
        .chart-type-btn {
            padding: 5px 8px;
            border: none;
            border-radius: 6px;
            background: #2a2a4a;
            color: #888;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
        }
        .chart-type-btn.active { background: #34C759; color: #fff; }
        
        /* Indicators section */
        #indicators-section {
            padding: 6px 0;
            border-top: 1px solid #2a2a4a;
        }
        #indicators-toggle {
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            padding: 4px 0;
        }
        #indicators-toggle span { color: #888; font-size: 11px; font-weight: 600; }
        #indicators-toggle .arrow { color: #007AFF; font-size: 10px; transition: transform 0.2s; }
        #indicators-toggle.open .arrow { transform: rotate(180deg); }
        #indicators-list {
            display: none;
            flex-wrap: wrap;
            gap: 4px;
            padding-top: 6px;
        }
        #indicators-list.show { display: flex; }
        .indicator-btn {
            padding: 4px 8px;
            border: 1px solid #3a3a5a;
            border-radius: 4px;
            background: transparent;
            color: #888;
            font-size: 10px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }
        .indicator-btn.active { background: #FF9500; border-color: #FF9500; color: #fff; }
        .indicator-btn:hover { border-color: #FF9500; }
        
        #charts-wrapper { flex: 1; display: flex; flex-direction: column; min-height: 0; }
        #chart { flex: 3; width: 100%; min-height: 150px; }
        #rsi-chart { height: 80px; width: 100%; display: none; border-top: 1px solid #2a2a4a; }
        #macd-chart { height: 80px; width: 100%; display: none; border-top: 1px solid #2a2a4a; }
        
        #stats {
            padding: 10px 16px;
            background: #16213e;
            border-top: 1px solid #2a2a4a;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
        }
        .stat-item { text-align: center; }
        .stat-label { font-size: 9px; color: #888; margin-bottom: 2px; }
        .stat-value { font-size: 11px; color: #fff; font-weight: 600; }
        #loading {
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            color: #fff;
            font-size: 14px;
            text-align: center;
        }
        .spinner {
            width: 30px; height: 30px;
            border: 3px solid #2a2a4a;
            border-top-color: #007AFF;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 8px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        /* Indicator legend */
        #indicator-legend {
            position: absolute;
            top: 4px;
            left: 8px;
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            z-index: 5;
        }
        .legend-item {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 9px;
            color: #888;
        }
        .legend-color {
            width: 10px;
            height: 3px;
            border-radius: 1px;
        }
    </style>
</head>
<body>
    <div id="container">
        <div id="header">
            <div id="token-info">
                <div>
                    <span id="token-name">Loading...</span>
                    <span id="token-symbol"></span>
                </div>
                <div>
                    <span id="current-price">$0.00</span>
                    <span id="price-change" class="positive">+0.00%</span>
                </div>
            </div>
            <div id="timeframe-buttons">
                <button class="timeframe-btn active" data-timeframe="1d">1D</button>
                <button class="timeframe-btn" data-timeframe="7d">7D</button>
                <button class="timeframe-btn" data-timeframe="14d">14D</button>
                <button class="timeframe-btn" data-timeframe="30d">1M</button>
                <button class="timeframe-btn" data-timeframe="90d">3M</button>
                <button class="timeframe-btn" data-timeframe="365d">1Y</button>
            </div>
            <div id="chart-type-buttons">
                <button class="chart-type-btn active" data-type="candlestick">Candles</button>
                <button class="chart-type-btn" data-type="line">Line</button>
                <button class="chart-type-btn" data-type="area">Area</button>
            </div>
            <div id="indicators-section">
                <div id="indicators-toggle" onclick="toggleIndicators()">
                    <span>▦ Indicators</span>
                    <span class="arrow">▼</span>
                </div>
                <div id="indicators-list">
                    <button class="indicator-btn" data-indicator="sma7">SMA 7</button>
                    <button class="indicator-btn" data-indicator="sma25">SMA 25</button>
                    <button class="indicator-btn" data-indicator="sma99">SMA 99</button>
                    <button class="indicator-btn" data-indicator="ema12">EMA 12</button>
                    <button class="indicator-btn" data-indicator="ema26">EMA 26</button>
                    <button class="indicator-btn" data-indicator="bb">BB 20</button>
                    <button class="indicator-btn" data-indicator="rsi">RSI 14</button>
                    <button class="indicator-btn" data-indicator="macd">MACD</button>
                </div>
            </div>
        </div>
        <div id="charts-wrapper">
            <div id="chart" style="position: relative;">
                <div id="indicator-legend"></div>
            </div>
            <div id="rsi-chart"></div>
            <div id="macd-chart"></div>
        </div>
        <div id="stats">
            <div class="stat-item">
                <div class="stat-label">24h High</div>
                <div class="stat-value" id="stat-high">$0.00</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">24h Low</div>
                <div class="stat-value" id="stat-low">$0.00</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">24h Volume</div>
                <div class="stat-value" id="stat-volume">$0</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Market Cap</div>
                <div class="stat-value" id="stat-mcap">$0</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">ATH</div>
                <div class="stat-value" id="stat-ath">$0.00</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">ATL</div>
                <div class="stat-value" id="stat-atl">$0.00</div>
            </div>
        </div>
    </div>
    <div id="loading">
        <div class="spinner"></div>
        Loading chart...
    </div>
    <script>
        let chart = null;
        let rsiChart = null;
        let macdChart = null;
        let currentSeries = null;
        let indicatorSeries = {};
        let rsiSeries = null;
        let macdLineSeries = null;
        let macdSignalSeries = null;
        let macdHistogramSeries = null;
        let currentData = null;
        let currentTimeframe = '1d';
        let currentChartType = 'candlestick';
        let activeIndicators = new Set();

        const indicatorColors = {
            sma7: '#FF6B6B',
            sma25: '#4ECDC4',
            sma99: '#45B7D1',
            ema12: '#F7DC6F',
            ema26: '#BB8FCE',
            bbUpper: '#3498DB',
            bbMiddle: '#9B59B6',
            bbLower: '#3498DB',
        };

        const chartOptions = {
            layout: {
                background: { type: 'solid', color: '#1a1a2e' },
                textColor: '#d1d4dc',
            },
            grid: {
                vertLines: { color: '#2a2a4a' },
                horzLines: { color: '#2a2a4a' },
            },
            crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
            rightPriceScale: { borderColor: '#2a2a4a' },
            timeScale: { borderColor: '#2a2a4a', timeVisible: true, secondsVisible: false },
            handleScroll: { vertTouchDrag: false },
        };

        function toggleIndicators() {
            const toggle = document.getElementById('indicators-toggle');
            const list = document.getElementById('indicators-list');
            toggle.classList.toggle('open');
            list.classList.toggle('show');
        }

        // === INDICATOR CALCULATIONS ===
        function calculateSMA(data, period) {
            const result = [];
            for (let i = period - 1; i < data.length; i++) {
                let sum = 0;
                for (let j = 0; j < period; j++) {
                    sum += data[i - j].value;
                }
                result.push({ time: data[i].time, value: sum / period });
            }
            return result;
        }

        function calculateEMA(data, period) {
            const result = [];
            const multiplier = 2 / (period + 1);
            let ema = data[0].value;
            result.push({ time: data[0].time, value: ema });
            
            for (let i = 1; i < data.length; i++) {
                ema = (data[i].value - ema) * multiplier + ema;
                result.push({ time: data[i].time, value: ema });
            }
            return result.slice(period - 1);
        }

        function calculateBollingerBands(data, period = 20, stdDev = 2) {
            const upper = [], middle = [], lower = [];
            
            for (let i = period - 1; i < data.length; i++) {
                let sum = 0;
                for (let j = 0; j < period; j++) {
                    sum += data[i - j].value;
                }
                const sma = sum / period;
                
                let squaredDiffSum = 0;
                for (let j = 0; j < period; j++) {
                    squaredDiffSum += Math.pow(data[i - j].value - sma, 2);
                }
                const std = Math.sqrt(squaredDiffSum / period);
                
                middle.push({ time: data[i].time, value: sma });
                upper.push({ time: data[i].time, value: sma + stdDev * std });
                lower.push({ time: data[i].time, value: sma - stdDev * std });
            }
            return { upper, middle, lower };
        }

        function calculateRSI(data, period = 14) {
            const result = [];
            let gains = 0, losses = 0;
            
            for (let i = 1; i <= period; i++) {
                const change = data[i].value - data[i - 1].value;
                if (change > 0) gains += change;
                else losses -= change;
            }
            
            let avgGain = gains / period;
            let avgLoss = losses / period;
            
            for (let i = period; i < data.length; i++) {
                if (i > period) {
                    const change = data[i].value - data[i - 1].value;
                    avgGain = (avgGain * (period - 1) + (change > 0 ? change : 0)) / period;
                    avgLoss = (avgLoss * (period - 1) + (change < 0 ? -change : 0)) / period;
                }
                const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
                const rsi = 100 - (100 / (1 + rs));
                result.push({ time: data[i].time, value: rsi });
            }
            return result;
        }

        function calculateMACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
            const emaFast = calculateEMA(data, fastPeriod);
            const emaSlow = calculateEMA(data, slowPeriod);
            
            const macdLine = [];
            const startIdx = slowPeriod - fastPeriod;
            
            for (let i = 0; i < emaSlow.length; i++) {
                const fastIdx = i + startIdx;
                if (fastIdx >= 0 && fastIdx < emaFast.length) {
                    macdLine.push({
                        time: emaSlow[i].time,
                        value: emaFast[fastIdx].value - emaSlow[i].value
                    });
                }
            }
            
            const signalLine = calculateEMA(macdLine, signalPeriod);
            const histogram = [];
            const signalStart = macdLine.length - signalLine.length;
            
            for (let i = 0; i < signalLine.length; i++) {
                const macdIdx = signalStart + i;
                const value = macdLine[macdIdx].value - signalLine[i].value;
                histogram.push({
                    time: signalLine[i].time,
                    value: value,
                    color: value >= 0 ? '#26a69a' : '#ef5350'
                });
            }
            
            return { macdLine: macdLine.slice(signalStart), signalLine, histogram };
        }

        function initChart() {
            const container = document.getElementById('chart');
            chart = LightweightCharts.createChart(container, {
                ...chartOptions,
                width: container.clientWidth,
                height: container.clientHeight,
            });
            
            window.addEventListener('resize', resizeCharts);
        }

        function initRSIChart() {
            const container = document.getElementById('rsi-chart');
            rsiChart = LightweightCharts.createChart(container, {
                ...chartOptions,
                width: container.clientWidth,
                height: 80,
                rightPriceScale: { 
                    borderColor: '#2a2a4a',
                    scaleMargins: { top: 0.1, bottom: 0.1 }
                },
            });
        }

        function initMACDChart() {
            const container = document.getElementById('macd-chart');
            macdChart = LightweightCharts.createChart(container, {
                ...chartOptions,
                width: container.clientWidth,
                height: 80,
                rightPriceScale: { 
                    borderColor: '#2a2a4a',
                    scaleMargins: { top: 0.1, bottom: 0.1 }
                },
            });
        }

        function resizeCharts() {
            const mainContainer = document.getElementById('chart');
            if (chart) chart.applyOptions({ width: mainContainer.clientWidth, height: mainContainer.clientHeight });
            
            const rsiContainer = document.getElementById('rsi-chart');
            if (rsiChart) rsiChart.applyOptions({ width: rsiContainer.clientWidth });
            
            const macdContainer = document.getElementById('macd-chart');
            if (macdChart) macdChart.applyOptions({ width: macdContainer.clientWidth });
        }

        function formatNumber(num, decimals = 2) {
            if (num === null || num === undefined) return 'N/A';
            if (num >= 1e12) return '$' + (num / 1e12).toFixed(2) + 'T';
            if (num >= 1e9) return '$' + (num / 1e9).toFixed(2) + 'B';
            if (num >= 1e6) return '$' + (num / 1e6).toFixed(2) + 'M';
            if (num >= 1e3) return '$' + (num / 1e3).toFixed(2) + 'K';
            return '$' + num.toFixed(decimals);
        }

        function formatPrice(num) {
            if (num === null || num === undefined) return '$0.00';
            if (num < 0.01) return '$' + num.toFixed(6);
            if (num < 1) return '$' + num.toFixed(4);
            return '$' + num.toFixed(2);
        }

        function updateHeader(data) {
            document.getElementById('token-name').textContent = data.name || 'Unknown';
            document.getElementById('token-symbol').textContent = data.symbol ? '(' + data.symbol.toUpperCase() + ')' : '';
            document.getElementById('current-price').textContent = formatPrice(data.current_price_usd);
            const change = data.price_change_percentage_24h || 0;
            const changeEl = document.getElementById('price-change');
            changeEl.textContent = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
            changeEl.className = change >= 0 ? 'positive' : 'negative';
        }

        function updateStats(data) {
            document.getElementById('stat-high').textContent = formatPrice(data.high_24h_usd);
            document.getElementById('stat-low').textContent = formatPrice(data.low_24h_usd);
            document.getElementById('stat-volume').textContent = formatNumber(data.total_volume_24h_usd);
            document.getElementById('stat-mcap').textContent = formatNumber(data.market_cap_usd);
            document.getElementById('stat-ath').textContent = formatPrice(data.ath_usd);
            document.getElementById('stat-atl').textContent = formatPrice(data.atl_usd);
        }

        function updateLegend() {
            const legend = document.getElementById('indicator-legend');
            legend.innerHTML = '';
            
            activeIndicators.forEach(ind => {
                if (ind === 'rsi' || ind === 'macd') return;
                
                const item = document.createElement('div');
                item.className = 'legend-item';
                
                let color, label;
                if (ind === 'sma7') { color = indicatorColors.sma7; label = 'SMA 7'; }
                else if (ind === 'sma25') { color = indicatorColors.sma25; label = 'SMA 25'; }
                else if (ind === 'sma99') { color = indicatorColors.sma99; label = 'SMA 99'; }
                else if (ind === 'ema12') { color = indicatorColors.ema12; label = 'EMA 12'; }
                else if (ind === 'ema26') { color = indicatorColors.ema26; label = 'EMA 26'; }
                else if (ind === 'bb') { color = indicatorColors.bbMiddle; label = 'BB 20'; }
                
                item.innerHTML = '<div class="legend-color" style="background:' + color + '"></div><span>' + label + '</span>';
                legend.appendChild(item);
            });
        }

        function getOHLCData(data, timeframe) {
            const key = 'ohlc_' + timeframe;
            const ohlcData = data[key] || data.ohlc_1d || [];
            return ohlcData.map(candle => ({
                time: Math.floor(candle[0] / 1000),
                open: candle[1],
                high: candle[2],
                low: candle[3],
                close: candle[4],
            })).sort((a, b) => a.time - b.time);
        }

        function getPriceData(data, timeframe) {
            const key = 'prices_' + timeframe;
            const priceData = data[key] || data.prices_1d || [];
            return priceData.map(point => ({
                time: Math.floor(point[0] / 1000),
                value: point[1],
            })).sort((a, b) => a.time - b.time);
        }

        function clearIndicators() {
            Object.values(indicatorSeries).forEach(series => {
                try { chart.removeSeries(series); } catch(e) {}
            });
            indicatorSeries = {};
            
            if (rsiSeries) { try { rsiChart.removeSeries(rsiSeries); } catch(e) {} rsiSeries = null; }
            if (macdLineSeries) { try { macdChart.removeSeries(macdLineSeries); } catch(e) {} macdLineSeries = null; }
            if (macdSignalSeries) { try { macdChart.removeSeries(macdSignalSeries); } catch(e) {} macdSignalSeries = null; }
            if (macdHistogramSeries) { try { macdChart.removeSeries(macdHistogramSeries); } catch(e) {} macdHistogramSeries = null; }
        }

        function renderIndicators() {
            if (!currentData || !chart) return;
            
            clearIndicators();
            
            const priceData = getPriceData(currentData, currentTimeframe);
            if (priceData.length < 30) return;
            
            // Show/hide RSI chart
            const rsiContainer = document.getElementById('rsi-chart');
            if (activeIndicators.has('rsi')) {
                rsiContainer.style.display = 'block';
                if (!rsiChart) initRSIChart();
                const rsiData = calculateRSI(priceData);
                rsiSeries = rsiChart.addLineSeries({ color: '#BB8FCE', lineWidth: 1 });
                rsiSeries.setData(rsiData);
                
                // Add RSI levels
                rsiChart.addLineSeries({ color: '#444', lineWidth: 1, lineStyle: 2 })
                    .setData(rsiData.map(d => ({ time: d.time, value: 70 })));
                rsiChart.addLineSeries({ color: '#444', lineWidth: 1, lineStyle: 2 })
                    .setData(rsiData.map(d => ({ time: d.time, value: 30 })));
                
                rsiChart.timeScale().fitContent();
            } else {
                rsiContainer.style.display = 'none';
            }
            
            // Show/hide MACD chart
            const macdContainer = document.getElementById('macd-chart');
            if (activeIndicators.has('macd')) {
                macdContainer.style.display = 'block';
                if (!macdChart) initMACDChart();
                const macdData = calculateMACD(priceData);
                
                macdHistogramSeries = macdChart.addHistogramSeries({ priceLineVisible: false });
                macdHistogramSeries.setData(macdData.histogram);
                
                macdLineSeries = macdChart.addLineSeries({ color: '#007AFF', lineWidth: 1 });
                macdLineSeries.setData(macdData.macdLine);
                
                macdSignalSeries = macdChart.addLineSeries({ color: '#FF9500', lineWidth: 1 });
                macdSignalSeries.setData(macdData.signalLine);
                
                macdChart.timeScale().fitContent();
            } else {
                macdContainer.style.display = 'none';
            }
            
            // Overlay indicators on main chart
            if (activeIndicators.has('sma7')) {
                const smaData = calculateSMA(priceData, 7);
                indicatorSeries.sma7 = chart.addLineSeries({ color: indicatorColors.sma7, lineWidth: 1 });
                indicatorSeries.sma7.setData(smaData);
            }
            
            if (activeIndicators.has('sma25')) {
                const smaData = calculateSMA(priceData, 25);
                indicatorSeries.sma25 = chart.addLineSeries({ color: indicatorColors.sma25, lineWidth: 1 });
                indicatorSeries.sma25.setData(smaData);
            }
            
            if (activeIndicators.has('sma99') && priceData.length >= 99) {
                const smaData = calculateSMA(priceData, 99);
                indicatorSeries.sma99 = chart.addLineSeries({ color: indicatorColors.sma99, lineWidth: 1 });
                indicatorSeries.sma99.setData(smaData);
            }
            
            if (activeIndicators.has('ema12')) {
                const emaData = calculateEMA(priceData, 12);
                indicatorSeries.ema12 = chart.addLineSeries({ color: indicatorColors.ema12, lineWidth: 1 });
                indicatorSeries.ema12.setData(emaData);
            }
            
            if (activeIndicators.has('ema26')) {
                const emaData = calculateEMA(priceData, 26);
                indicatorSeries.ema26 = chart.addLineSeries({ color: indicatorColors.ema26, lineWidth: 1 });
                indicatorSeries.ema26.setData(emaData);
            }
            
            if (activeIndicators.has('bb')) {
                const bbData = calculateBollingerBands(priceData, 20, 2);
                indicatorSeries.bbUpper = chart.addLineSeries({ color: indicatorColors.bbUpper, lineWidth: 1, lineStyle: 2 });
                indicatorSeries.bbUpper.setData(bbData.upper);
                indicatorSeries.bbMiddle = chart.addLineSeries({ color: indicatorColors.bbMiddle, lineWidth: 1 });
                indicatorSeries.bbMiddle.setData(bbData.middle);
                indicatorSeries.bbLower = chart.addLineSeries({ color: indicatorColors.bbLower, lineWidth: 1, lineStyle: 2 });
                indicatorSeries.bbLower.setData(bbData.lower);
            }
            
            updateLegend();
            resizeCharts();
        }

        function renderChart() {
            if (!currentData || !chart) return;
            if (currentSeries) {
                chart.removeSeries(currentSeries);
                currentSeries = null;
            }

            if (currentChartType === 'candlestick') {
                const ohlcData = getOHLCData(currentData, currentTimeframe);
                if (ohlcData.length > 0) {
                    currentSeries = chart.addCandlestickSeries({
                        upColor: '#26a69a', downColor: '#ef5350',
                        borderDownColor: '#ef5350', borderUpColor: '#26a69a',
                        wickDownColor: '#ef5350', wickUpColor: '#26a69a',
                    });
                    currentSeries.setData(ohlcData);
                }
            } else if (currentChartType === 'line') {
                const priceData = getPriceData(currentData, currentTimeframe);
                if (priceData.length > 0) {
                    currentSeries = chart.addLineSeries({ color: '#007AFF', lineWidth: 2 });
                    currentSeries.setData(priceData);
                }
            } else if (currentChartType === 'area') {
                const priceData = getPriceData(currentData, currentTimeframe);
                if (priceData.length > 0) {
                    currentSeries = chart.addAreaSeries({
                        topColor: 'rgba(0, 122, 255, 0.4)',
                        bottomColor: 'rgba(0, 122, 255, 0.0)',
                        lineColor: '#007AFF', lineWidth: 2,
                    });
                    currentSeries.setData(priceData);
                }
            }
            
            renderIndicators();
            chart.timeScale().fitContent();
        }

        document.querySelectorAll('.timeframe-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.timeframe-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentTimeframe = btn.dataset.timeframe;
                renderChart();
            });
        });

        document.querySelectorAll('.chart-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.chart-type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentChartType = btn.dataset.type;
                renderChart();
            });
        });

        document.querySelectorAll('.indicator-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const indicator = btn.dataset.indicator;
                if (activeIndicators.has(indicator)) {
                    activeIndicators.delete(indicator);
                    btn.classList.remove('active');
                } else {
                    activeIndicators.add(indicator);
                    btn.classList.add('active');
                }
                renderIndicators();
            });
        });

        function receiveData(data) {
            document.getElementById('loading').style.display = 'none';
            currentData = data;
            updateHeader(data);
            updateStats(data);
            renderChart();
        }

        initChart();

        window.addEventListener('message', (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'tradingData') receiveData(data.payload);
            } catch (e) {}
        });

        document.addEventListener('message', (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'tradingData') receiveData(data.payload);
            } catch (e) {}
        });

        if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'chartReady' }));
        }
    </script>
</body>
</html>
`;

export default function TradingChart({ data, loading, onClose }: TradingChartProps) {
  const webViewRef = useRef<WebView>(null);
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    if (chartReady && data && webViewRef.current) {
      const message = JSON.stringify({
        type: 'tradingData',
        payload: data,
      });
      webViewRef.current.postMessage(message);
    }
  }, [chartReady, data]);

  const handleMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === 'chartReady') {
        setChartReady(true);
      }
    } catch (e) {
      console.warn('Error parsing WebView message:', e);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading trading data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      )}
      <WebView
        ref={webViewRef}
        source={{ html: CHART_HTML }}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleMessage}
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        originWhitelist={['*']}
        mixedContentMode="compatibility"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  webView: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    marginTop: 12,
    color: '#fff',
    fontSize: 14,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});
