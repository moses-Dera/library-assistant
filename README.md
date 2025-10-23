# 📚 Library Assistant

> AI-powered smart library for discovering and reading books that match user interests, moods, and needs.

<div align="center">

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-4.0-646CFF.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

</div>

## 🌟 Overview
Library Assistant helps users find books tailored to their interests or moods using AI and multiple book APIs.  
It supports real-time streaming results, mood-based recommendations, and AI-powered summaries.

### ✨ Core Features
- 🔍 Multi-source search (Google Books, Open Library, Project Gutenberg)
- 🧠 Mood & interest-based recommendations
- ⚡ Real-time results + deduplication
- 📘 Read online or download soft copies
- 🤖 AI summarization (Google Gemini)
- 🌍 Location-aware results
- 📱 Responsive, mobile-first design

## ⚙️ Stack
**Frontend:** React 18 + TypeScript + TailwindCSS  
**Build:** Vite + SWC  
**APIs:** Google Books, Open Library, Project Gutenberg  
**AI:** Google Gemini for summaries  
**Optional:** Google Maps for location

## 🚀 Quick Start
```bash
git clone https://github.com/yourusername/library-assistant.git
cd library-assistant
npm install
cp .env.example .env
npm run dev
