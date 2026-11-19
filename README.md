# EventLink Web Application

Smart In-Person Networking and Relationship CRM powered by Google Gemini API.
Built with React, TypeScript, Vite, and Tailwind CSS in a Playful Memphis Neo-Brutalism design system.

---

## Overview

EventLink is an event-driven, privacy-first mobile and web companion designed to solve the breakdown of in-person networking at hackathons, conferences, and summits. It eliminates manual data entry, physical business card loss, and post-event relationship decay through multimodal capture, semantic search, and an actionable follow-up pipeline.

All user contacts, event logs, and card images are stored strictly on-device in browser local storage. Cloud calls to the Gemini API operate statelessly as ephemeral processing pipelines with zero persistent cloud tracking.

---

## Core Capabilities

### 1. Mandatory User Registration and Digital Profile
* First-time users register their digital profile (Name, Role, Company, Phone, LinkedIn URL, and Bio) before accessing the dashboard.
* Creates a dynamic, shareable peer-to-peer business card accessible from the header at any time.

### 2. Context-First Event Spaces
* Organize contacts by where you actually met them.
* Create dedicated event containers (such as Google Buildathon 2026) with dates, venues, and attendee counters.
* Built-in deduplication prevents creating duplicate event titles.

### 3. Gemini Voice Auto-Scribing (with On-Device Fallback)
* Tap the microphone and speak naturally for 5 seconds (for example: "Met Hari from DeepTech Labs, an AI engineer building LLMs, phone 9876543210").
* Gemini 1.5 Flash extracts the person's Name, Role, Company, Phone Number, Skills, and Contextual Notes directly into form fields with zero manual typing.
* Features a built-in offline NLP parser fallback so voice entry never fails even during network disruptions or API quota limits.

### 4. Direct LinkedIn QR Code Camera Scanner
* While adding a contact or editing your profile, tap "Scan LinkedIn QR".
* Utilizes the device camera to scan another attendee's LinkedIn profile QR code or upload an image of a QR code, automatically extracting and populating the profile URL.

### 5. Conversational Semantic Search Engine
* Query your network using everyday natural language (for example: "Who knows about LLMs?", "Find Flutter developers", or "Did I meet a chef?").
* Gemini and the built-in multi-domain knowledge graph reason conceptually across attendee notes, matching Dart experts when searching for Flutter, or food entrepreneurs when searching for culinary specialists.
* Operates with instant local semantic fallback to guarantee search always delivers results.

### 6. Inbound vs. Outbound Relationship Pipeline (Anti-Decay CRM)
* Inbound Column: Tracks active, reciprocal relationships you frequently interact with post-event.
* Outbound Column: Flags dormant or neglected contacts who have had zero recent touchpoints.
* AI Re-engagement Pitch: Click "AI Pitch" on any outbound contact to have Gemini synthesize original conversation notes into a personalized 2-sentence message ready for WhatsApp or LinkedIn.

### 7. Peer-to-Peer QR Profile Beam
* Display your personal digital business card as an encrypted, scannable QR code.
* Use the built-in attendee scanner to scan another EventLink user's screen and instantly import their profile.

### 8. One-Tap Actions
* WhatsApp Direct: Launches WhatsApp chats with pre-filled event follow-up templates.
* Phone Dialer: One-tap cellular dialing via telephone protocols.
* LinkedIn: Direct links to verified profiles.
* Card Photo Preview: Attaches visual photos of paper business cards for permanent memory recall.

### 9. Duplicate Prevention
* Real-time validation prevents adding the same person twice to an event or creating duplicate event hubs.

### 10. Data Sovereignty and 100% Local Storage
* Zero cloud database tracking. All contacts, card images, and event rosters persist exclusively in the browser's encrypted local storage.
* Includes full JSON backup export and restore capabilities in the Settings menu.

---

## Technology Stack

* Frontend Framework: React 18, TypeScript, Vite
* Styling: Tailwind CSS (Custom Memphis Neo-Brutalism theme tokens: 3px solid black borders, 4px zero-blur hard shadows, cream canvas, sunshine yellow, and brand purple accents)
* Icons: Lucide React (Clean vector iconography, zero emojis)
* Vision & QR Processing: html5-qrcode, qrcode
* Voice Recognition: Web Speech API (SpeechRecognition / webkitSpeechRecognition)
* Generative AI Engine: Google Gemini API (Gemini 1.5 Flash, Gemini 2.0 Flash) with on-device NLP fallback engines

---

## Local Development Setup

```bash
# 1. Navigate to the project directory
cd eventlink-web

# 2. Install dependencies
pnpm install
# or: npm install

# 3. Start local development server
pnpm run dev
# or: npm run dev
```

Open your browser at:
`http://localhost:3000`

---

## Deploying to Vercel

EventLink Web is configured for deployment on Vercel:

1. Push your repository to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/eventlink-web.git
   git branch -M main
   git push -u origin main
   ```

2. Open Vercel (https://vercel.com) and click "Add New Project".
3. Import your `eventlink-web` repository.
4. Vercel automatically detects the Vite build preset:
   * Build Command: `npm run build`
   * Output Directory: `dist`
5. (Optional) In Project Settings under Environment Variables, add:
   * `VITE_GEMINI_API_KEY`: Your Google Gemini API Key.
   * Note: Users can also input their own Gemini API key directly in the web app's Settings modal.
6. Click Deploy.

---

## Gemini API Configuration

To configure your Google Gemini API key:
1. Click the Settings icon in the top right header.
2. Enter your API key (starts with AIzaSy...).
3. Click "Save Key". The key is saved exclusively in your browser's local storage and used directly for real-time inference.

---

## Automated Testing & Quality Assurance

EventLink includes an enterprise-grade automated test suite powered by Vitest, React Testing Library, and Happy-DOM, ensuring regression-free reliability across all core features.

### Test Suites (43 Automated Tests across 9 Suites):

1. `authService.test.ts`: Verifies user registration, duplicate email/phone prevention, credential verification, and session logout.
2. `localContactParser.test.ts`: Validates natural conversational voice note extraction, multi-skill parsing, phone number formats (+91 and 10-digit), and title case normalization.
3. `localSemanticSearch.test.ts`: Verifies cross-domain concept bridges (Dart to Flutter, LLMs to AI, Figma to UI/UX, Chef to Culinary) and keyword match scoring.
4. `storageService.test.ts`: Tests on-device offline persistence, full JSON data export and import, user profile registration, and duplicate prevention for events and contacts.
5. `geminiService.test.ts`: Tests Gemini API integration, custom API key storage, and zero-latency graceful fallback to local NLP engines when offline.
6. `ContactCard.test.tsx`: Tests rendering of contact data, communication links, relationship toggles (Inbound vs. Outbound), and contact deletion.
7. `PipelineTab.test.tsx`: Validates lead pipeline rendering, dormant contact tracking, and 1-tap AI pitch generation.
8. `SemanticSearchTab.test.tsx`: Verifies search bar queries, natural language sample pills, and result rendering.
9. `RegistrationModal.test.tsx`: Tests attendee onboarding form validation, required field checks, and local profile creation.

### Running Tests Locally:

```bash
# Run all automated tests
pnpm test

# Run tests in interactive watch mode
pnpm run test:watch

# Generate full code coverage report
pnpm run test:coverage
```

### Continuous Integration (CI/CD):

Automated GitHub Actions workflow configured in `.github/workflows/ci.yml` verifies TypeScript type safety, runs all unit tests, generates coverage reports, and tests production builds on every push and pull request.

