# EventLink — Web Application

> **Smart In-Person Networking & Relationship CRM powered by Google Gemini API**  
> Built with React, TypeScript, Tailwind CSS (Playful Memphis Neo-Brutalism Theme), and Vite.

---

## 🌟 Key Features

1. **Context-First Event Hubs:** Create dedicated spaces for each hackathon, summit, or conference (e.g. Google Buildathon 2026).
2. **Gemini Voice Auto-Scribe:** Speak naturally for 5 seconds; Gemini extracts Name, Role, Skills, Phone, and Notes with zero manual typing.
3. **Conversational Semantic Search:** Query your network conceptually (e.g., *"Who knows about LLMs?"* or *"Did I meet a chef?"*) with Gemini reasoning across all saved notes and context.
4. **Inbound vs. Outbound Relationship Pipeline (CRM):**
   - **Inbound Column:** Active connections with regular touchpoints.
   - **Outbound Column:** Dormant contacts with 1-tap **AI Re-engagement Pitch** generation powered by Gemini!
5. **P2P QR Code Contact Beam:**
   - **My Profile QR:** Dynamic QR code of your digital business card.
   - **Scan Attendee QR:** Live camera QR scanner using `html5-qrcode` to instantly import attendee contacts.
6. **1-Tap Actions:** Direct WhatsApp follow-up with pre-drafted event templates, direct phone dialer links, and LinkedIn links.
7. **100% Local Storage & Data Privacy:** All contacts, images, and notes are stored strictly in browser `localStorage`. Cloud calls to Gemini are ephemeral with zero external tracking.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
pnpm install
# or
npm install

# 2. Start local development server
pnpm run dev
# or
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 🚢 Deploy to Vercel in 1 Minute

1. Push this folder to your GitHub repository:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/eventlink-web.git
   git branch -M main
   git push -u origin main
   ```
2. Go to **[vercel.com](https://vercel.com)** and click **"Add New Project"**.
3. Import your `eventlink-web` repository.
4. Vercel automatically detects Vite:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. (Optional) In **Environment Variables**, add:
   - `VITE_GEMINI_API_KEY`: *Your Google Gemini API Key*
6. Click **Deploy**! 🚀

---

## 🔑 Gemini API Configuration

You can configure the Gemini API key in two ways:
* **In-App:** Click the **Settings** icon in the top right header to paste your API key directly (persists in your browser).
* **Environment Variable:** Set `VITE_GEMINI_API_KEY` in `.env.local` or in your Vercel Project Settings.
