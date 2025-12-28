# Oguz Name Panel

**Developer:** Oguz Yildirim  
**Student ID:** 2022502129  
**Course:** MIS 233 – Final Project  
**Plugin Type:** Grafana Panel Plugin  
**Term:** Fall 2025  

---

## Overview

**Oguz Name Panel** is a custom Grafana panel plugin developed as a final project for MIS 233.  
The plugin demonstrates how to build a fully functional Grafana panel that:

- Loads successfully inside Grafana
- Displays the developer’s name in the panel UI
- Renders and analyzes real Grafana query data
- Provides configurable UI options, interactivity, and AI-inspired insights

The project goes beyond the minimum requirements by adding advanced bonus features such as data quality analysis, explainable AI logic, and responsive behavior.

---

## Key Features

### Core Requirements
- ✅ Plugin builds successfully
- ✅ Plugin loads inside Grafana
- ✅ Developer name is visible in the panel UI

### Panel Features
- 🎨 Configurable background color
- 🧭 Display modes (Centered / Compact)
- 🔢 Series counter with size options
- 🖱️ Hover and click interactivity
- 📐 Responsive behavior (panel reacts to resizing)
- ⚠️ Graceful error handling when no data is available

---

## AI-Inspired Insight Engine (Bonus)

The panel includes an **AI-inspired insight engine** that analyzes incoming Grafana query data and produces contextual feedback.

### AI Capabilities
- Trend detection (up / down / flat)
- Volatility analysis using standard deviation
- Anomaly (spike) detection via z-score thresholding
- Risk score generation (0–100)

### AI Configuration Options
- **Mode:** Safe / Balanced / Aggressive  
- **Sensitivity:** Adjustable threshold (0–100)

> This implementation is rule-based and data-driven, providing explainable and transparent “AI-like” behavior without external APIs.

---

## Extra Quality Bonuses (Beyond the List)

### Data Quality Indicator
- Displays **GOOD / MEDIUM / LOW** data quality badges
- Evaluates number of datapoints and signal volatility
- Includes tooltip explanations for transparency

### AI Explainability Layer
- Optional explainability section in the panel
- Clearly describes:
  - How trends are calculated
  - How volatility is measured
  - How anomalies are detected
  - How the final risk score is formed

These additions improve interpretability and align with real-world BI and monitoring best practices.

---

## Getting Started

### Prerequisites
- Node.js & npm
- Docker / Docker Desktop
- Grafana (running with plugin loading enabled)

### Install & Build
```bash
npm install
npm run dev
