# 🚀 Daemo AI Service — Node.js / TypeScript Agent

> A deterministic, production-grade AI service built with **Daemo AI** that safely connects LLMs to real code, APIs, and data — without hallucinations or unsafe execution.

This repository contains a **Daemo-powered Node.js service** that exposes strongly-typed, auditable tools for AI agents using decorators and deterministic execution.

---

## What This Project Does

This service:

- Defines **type-safe AI tools** using TypeScript decorators  
- Registers those tools with the **Daemo Engine**  
- Runs locally or in production with a secure, outbound-only connection  
- Allows an LLM to call **real functions** without touching databases or business logic directly  

Unlike traditional AI “agents,” this project enforces **deterministic execution**, **schema validation**, and **explicit permissions**.

---

## Why Daemo?

Traditional LLM agents are often:

- ❌ Unpredictable  
- ❌ Prone to hallucinated actions  
- ❌ Dangerous when connected directly to APIs or databases  

Daemo acts as a **governance and execution layer** between the LLM and your code:

- ✅ Type-safe execution  
- ✅ Explicitly allowed actions only  
- ✅ Full audit logs  
- ✅ No inbound ports required  
- ✅ Runs inside your existing Node.js app  

---

## Project Structure

```txt

├── src/
│   ├── index.ts              # Entry point (Daemo startup)
│   ├── services/             # AI-callable tools
│   │   └── *.ts
│   └── types/                # Shared schemas (optional)
│
├── .env.example              # Environment variable template
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md


