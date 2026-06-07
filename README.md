# <img src="/public/favicon.png" alt="Study Monitor Logo" height="30"> Dutch Writing Lab 🇳🇱
*Made by Soheil Solhjoo (2026)*

**Dutch Writing Lab** is an open-source, client-side React application designed to help language learners practice and perfect their Dutch writing. By leveraging the power of Google's Gemini API and the CEFR framework, it acts as your personal, strict, and highly accurate Dutch language tutor.

## Features

*   **📝 Phase 1: Generate Master Text**
    *   Input a TOEFL-style topic and a target CEFR level (A1-C2).
    *   The app generates a perfectly tailored 5-paragraph Dutch essay.
    *   **Text Analysis:** Automatically highlights transition words (connectors), verbs, and idioms for structural study.
    *   **Side-by-Side Translation:** View the Dutch text alongside paragraph-by-paragraph Farsi (Persian) translations.
    *   **Active Recall:** Generates a "Dismantled Text" where key Dutch words are replaced with their Farsi translations for fill-in-the-blank practice.
    *   **Pronunciation:** Uses the browser's native Web Speech API to read the text and vocabulary words out loud in a Dutch accent.
*   **🔍 Phase 2: Review & Audit**
    *   Paste your own Dutch writing.
    *   The AI acts as a strict auditor, reviewing your text sentence-by-sentence against your target CEFR level.
    *   Provides clear, jargon-free explanations for grammatical fixes and stylistic improvements, leaving correct sentences untouched.
*   **📚 Cloud History & Sync**
    *   Save generated texts locally to your browser.
    *   **Cross-Device Sync:** Link a GitHub Personal Access Token (PAT) to automatically back up your saved history to a Secret GitHub Gist. Pull your history onto your phone or another computer seamlessly!
*   **🌙 Dark Mode & Responsive Design**
    *   Fully optimized for both desktop and mobile web browsers.

---

## How to Set Up and Use

Because this is a completely serverless application, all API calls are made directly from your browser. This means you need to supply your own free API keys to use the app.

### 1. Get a Free Gemini API Key
To generate texts and audit your writing, the app needs access to the Gemini AI models.
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account.
3. Click **"Create API Key"**.
4. Open the Dutch Writing Lab, click on **⚙️ Cloud Settings** in the top right corner, and paste your key into the "Gemini API Key" field.

*(Your key is saved securely in your browser's local storage and is never sent anywhere except directly to Google's API).*

### 2. (Optional) Set up Cross-Device History Sync
If you want to save your generated texts and access them on your phone:
1. Go to your [GitHub Developer Settings](https://github.com/settings/tokens).
2. Click **"Generate new token (classic)"**.
3. Give it a name (e.g., "Dutch Lab Sync") and check the box next to **`gist`** (Create gists).
4. Generate the token and copy it.
5. In the Dutch Writing Lab, open **⚙️ Cloud Settings** and paste the token into the "GitHub PAT" field. Leave the "Gist ID" blank.
6. Now, whenever you click **💾 Save to History** in Phase 1, the app will automatically create a secret backup in your GitHub account. 
7. On your phone, enter the same PAT and the newly generated Gist ID (which will populate automatically on your PC) into the settings, and hit **☁️ Pull** to download your texts!

---

## Running the App Locally

If you want to run the code on your own machine or contribute to the project:

1. Clone the repository:
   ```bash
   git clone https://github.com/YourGitHubUsername/Dutch.git
   cd Dutch/lab-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

## Tech Stack
*   **Frontend:** React 18, TypeScript, Vite
*   **Styling:** Vanilla CSS (CSS Variables for Dark Mode)
*   **AI Backend:** Google Gemini (several models available) via REST API
*   **Cloud Storage:** GitHub Gists API

---
*Veel succes met het leren van het Nederlands!*
