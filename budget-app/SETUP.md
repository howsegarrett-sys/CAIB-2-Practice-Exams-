# Howse Budget App — Setup Guide

## Prerequisites
- Node.js 18+ and npm
- A Google account that owns the "2026 Howse Budget" spreadsheet

---

## Step 1 — Google Cloud Console setup

### 1a. Create a project
1. Go to https://console.cloud.google.com
2. Click **Select a project → New Project**. Name it (e.g. "Howse Budget").
3. Select the new project.

### 1b. Enable the Google Sheets API
1. Go to **APIs & Services → Library**
2. Search for **Google Sheets API** and click **Enable**

### 1c. Create OAuth 2.0 credentials
1. Go to **APIs & Services → Credentials**
2. Click **+ Create Credentials → OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Name: anything (e.g. "Howse Budget Web")
5. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5173` (for local dev)
   - Your Vercel/Netlify URL when you deploy (e.g. `https://howse-budget.vercel.app`)
6. **Authorized redirect URIs** — leave blank (implicit flow uses origins only)
7. Click **Create** and copy the **Client ID**

### 1d. Configure OAuth consent screen
1. Go to **APIs & Services → OAuth consent screen**
2. User type: **External** (unless your Google account is Workspace)
3. Fill in app name, support email, developer email
4. Scopes: add `https://www.googleapis.com/auth/spreadsheets` and `openid email`
5. Add your own Google email as a **Test user** (required while the app is in "Testing" mode)
6. Save

---

## Step 2 — Get your Spreadsheet ID

Open your "2026 Howse Budget" sheet in a browser. The URL looks like:

```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit
```

The long string between `/d/` and `/edit` is your **Spreadsheet ID**.

---

## Step 3 — Configure the app

```bash
cd budget-app
cp .env.example .env.local
```

Edit `.env.local`:

```
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
VITE_SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
```

---

## Step 4 — Adjust sheet layout config (if needed)

Open `src/config.ts`. The `SHEET_LAYOUT` block documents what the app assumes about your sheet structure:

```
Row 1: month name headers (January, February, …)
Row 2: Budget / Actuals / Variance sub-headers
Row 3+: category rows
Column A: category names
Column B onward: monthly data in blocks of 3 (Budget, Actuals, Variance)
```

If your sheet differs (e.g. headers start on row 2, or months start in column C), update `SHEET_LAYOUT` accordingly.

The app auto-detects the January column by scanning row 1 for the text "January". If your month headers are in a different row, change `monthHeaderRow`.

**Category matching** is done by searching column A for keywords. If a category shows "Not found in sheet", check the `searchTerms` array in `CATEGORIES` (also in `src/config.ts`) and add the exact text from your sheet.

---

## Step 5 — Run locally

```bash
cd budget-app
npm install
npm run dev
```

Open http://localhost:5173 in your browser (or on your iPhone if on the same Wi-Fi — use your laptop's local IP, e.g. http://192.168.1.x:5173).

---

## Step 6 — Deploy to Vercel (free, iPhone-accessible)

```bash
npm install -g vercel
vercel
```

Follow the prompts. When asked for environment variables, add:
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_SPREADSHEET_ID`

Then go back to Google Cloud Console and add the Vercel URL to your OAuth credential's **Authorized JavaScript origins**.

### Alternative: Netlify

```bash
npm run build
# Drag and drop the dist/ folder at https://app.netlify.com/drop
```

Set environment variables in Netlify → Site settings → Environment variables.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| "Sheets API 403" | Make sure you added your Google account as a Test user in the OAuth consent screen |
| "Sheets API 400" | Check the spreadsheet ID and sheet tab name ("2026 Howse Budget") |
| Categories show "Not found in sheet" | Open `src/config.ts`, find the category's `searchTerms`, and add the exact text from column A of your sheet |
| Sign-in popup blocked | Allow popups for localhost in your browser settings |
| Data doesn't reflect current month | The app uses the current system date to pick the month column. If your sheet has a different column layout, update `SHEET_LAYOUT.firstMonthCol` |
