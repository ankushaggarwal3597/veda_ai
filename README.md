# VedaAI Full Stack Assessment Creator

This repository contains the complete implementation of the VedaAI Assessment Creator assignment. It is built as a highly scalable monorepo comprising a Next.js (App Router) frontend and a Node.js (Express + BullMQ) backend.

## 🏗️ Architecture Overview

The system architecture is designed for scalability and asynchronous processing guarantees:

1. **Frontend**: Next.js 14 utilizing the App Router. Interface elements are heavily customized via Vanilla Tailwind CSS to mimic the exact aesthetic provided in the Figma designs. State tracking and real-time updates are handled through **Zustand** and **Socket.io-client**.
2. **Backend**: Express + TypeScript server connecting to a **MongoDB** database to persist assignment settings and results.
3. **Queue Mechanism**: Utilizing **BullMQ** & **Redis** to offload the heavy LLM API parsing to a background worker. This ensures the main server event loop is never blocked during long Groq LLM queries.
4. **AI Generation**: Implemented via the `groq-sdk` requesting structured `json_object` responses.
5. **Real-time UX**: Upon task completion by the background worker, a WebSocket event (`assignment_completed`) is dispatched down to the specific connected clients to instantly refresh the Next.js UI without polling.

## ✨ Approach & Features

- **Dynamic Forms**: The create form dynamically builds the array of Question Types using `react-hook-form` and validates total marks using `zod`.
- **Intelligent Print Layouts**: The "Download as PDF" bonus feature handles rendering flawlessly. Instead of heavy backend PDF libraries, CSS `@media print` directives are dynamically applied to the rendered React components allowing native browser PDF exports that perfectly emulate A4 test papers.
- **Fail-Safe Generation**: BullMQ isolates failures. If the API key is invalid or Groq fails, the system safely isolates the error, logs it, and pushes a websocket rejection allowing the user to click "Regenerate".

## 🚀 Setup Instructions

### 1. Requirements
- Node.js (v18+)
- Docker (for local instances of Redis and MongoDB)

### 2. Infrastructure Initialization
Spin up the local Redis and MongoDB utilizing the included compose file:
```bash
docker-compose up -d
```

### 3. Backend Setup
```bash
cd backend
npm install
```
Next, rename `.env.example` to `.env` and assign your Groq API Key:
```env
GROQ_API_KEY="gsk_yourkeyhere..."
```
Start the backend server:
```bash
npm run dev
```

### 4. Frontend Setup
Open a new terminal session and navigate to the frontend:
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## 💯 Completed Bonus Features
- Download as PDF styling.
- Real-time job status syncing via Zustand.
- Highlighted difficulty visual badges.
- Background worker error processing & UI regeneration handling.
- Integrated UI Assignment deletion.
