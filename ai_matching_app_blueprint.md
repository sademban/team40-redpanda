# AI Matching App Blueprint

## Overview

This application is an **AI-powered semantic matching platform** where users can:

- post their stories
- submit a search query or need
- get matched with other users discussing similar topics
- discover related stories and communities

The goal is to build a system that understands the **meaning** of a user’s story, not just keywords, and then connects them with relevant people and content.

---

## Core Product Idea

A user submits:

- a story
- a query
- optional tags or preferences

The system then:

1. understands the story/query
2. extracts topics and intent
3. searches a vector database or semantic index
4. finds similar users and similar stories
5. ranks results
6. explains why the match was suggested

---

## What Kind of Application This Is

This is best described as a:

- **semantic matching platform**
- **community matching app**
- **AI-powered knowledge discovery app**
- **social + search hybrid**

The app is not only a chat app or forum.  
Its core value is the **matching engine**.

---

## Main Components You Need to Build

### 1. User App

This is the frontend where users interact with the system.

Features:

- sign up / login
- submit story
- submit query
- view matched users
- view similar stories
- request connection
- chat or message later
- manage privacy settings

Suggested frontend stack:

- Next.js for web
- React Native or Flutter later for mobile

---

### 2. Backend API

This is the central server for your app.

Responsibilities:

- authentication
- save stories and queries
- trigger AI matching
- store match results
- return results to frontend
- manage user connections
- manage notifications later

Suggested backend stack:

- FastAPI

Example endpoints:

- `POST /stories`
- `POST /queries`
- `POST /agent/match`
- `GET /matches/{user_id}`
- `POST /connections/request`

---

### 3. Agent Layer

This is the AI part of the application.

The agent should **not** control the whole app.  
It should only help with:

- understanding the story
- extracting topics
- deciding which tool to call
- searching similar users
- searching similar stories
- explaining matches

The recommended design is:

- one **tool-calling agent**
- deterministic backend logic
- matching/search done by your own code

Recommended tools:

- `extract_topics_from_story`
- `search_similar_users`
- `search_similar_stories`
- `generate_match_preview`

---

### 4. Data Layer

You need two kinds of storage.

#### A. Relational Database

Use this for structured app data.

Store:

- users
- profiles
- stories
- queries
- matches
- preferences
- privacy settings
- chat sessions
- reports / moderation flags

Recommended choice:

- PostgreSQL

#### B. Vector Database

Use this for semantic search and similarity matching.

Store embeddings for:

- user stories
- user queries
- knowledge base entries
- topic summaries

Recommended choices:

- PostgreSQL + pgvector for MVP
- Qdrant later for scale

---

### 5. Matching Pipeline

This is the core engine of the product.

When a user submits a story:

1. save the story in the database
2. pass it to the agent
3. extract topics and intent
4. generate embedding
5. search for similar users
6. search for similar stories
7. rank results
8. store match results
9. show recommendations to the user

---

## Recommended Architecture

### MVP Architecture

- **Frontend:** Next.js
- **Backend API:** FastAPI
- **Database:** PostgreSQL
- **Vector Search:** pgvector
- **Queue/Jobs:** optional later
- **AI Model:** tool-calling LLM through Responses API

### Why This Is Best

This gives you:

- simple MVP
- structured backend
- semantic search support
- clear separation between AI and app logic
- room to scale later

---

## High-Level System Diagram

```text
[Frontend: Web/Mobile]
        |
        v
   [Backend API]
        |
   -----------------------------
   |             |             |
   v             v             v
[PostgreSQL] [Vector DB]   [Auth Service]
   |
   v
[AI Agent + Matching Engine]
   |
   |-- extract topics
   |-- classify intent
   |-- search similar users
   |-- search similar stories
   |-- rank matches
   |-- generate explanations
   |
   v
[Recommendations / Matches / Chat]