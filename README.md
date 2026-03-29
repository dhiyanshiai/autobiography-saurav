# My Story — Saurav's Autobiography Capture App

A mobile-first web app to capture voice and text memories, organized by life chapter, and saved directly to this GitHub repository. Entries are compiled by Claude into a book.

## Live App

Once deployed to GitHub Pages:
```
https://dhiyanshiai.github.io/autobiography-saurav
```

---

## The 8 Life Chapters

| # | Chapter |
|---|---------|
| 1 | Childhood |
| 2 | College Days — Engineering |
| 3 | Early Career — Work after Engineering |
| 4 | The MBA Pivot — Engineering to Finance |
| 5 | Post-MBA Work — Struggles & Growth |
| 6 | Corporate Journey — Companies & Roles |
| 7 | Family Life — Parents, Ancestors, Wife |
| 8 | Flipkart & the AI Awakening |

---

## First-Time Setup

### Step 1: Create a GitHub Personal Access Token

1. Go to **GitHub → Settings → Developer Settings → Personal Access Tokens → Fine-grained tokens**
2. Click **Generate new token**
3. Set token name: `autobiography-app`
4. Set expiration: 1 year (or no expiration)
5. Under **Repository access** → select only `autobiography-saurav`
6. Under **Permissions → Repository permissions → Contents** → set to **Read and write**
7. Click **Generate token** and copy it (you only see it once)

### Step 2: Enable GitHub Pages

1. Push this repo to GitHub (see below)
2. Go to your repo → **Settings → Pages**
3. Under **Source**: select `Deploy from a branch`
4. Branch: `main`, Folder: `/ (root)`
5. Click **Save** — your app will be live in ~1 minute

### Step 3: Open on iPhone

1. Open Safari on iPhone
2. Go to `https://[username].github.io/autobiography-saurav`
3. Tap **Share → Add to Home Screen** for easy access
4. Enter your GitHub username, repo name, and token on first open

---

## How to Capture Entries

1. Open the app on your iPhone
2. **Select the chapter** your memory belongs to
3. **Record voice** (tap the mic button) or **type** in the text area
4. Add optional keywords to help with search later
5. Tap **Save to GitHub** — the entry is committed immediately

---

## Siri Shortcut (Hands-Free Capture)

Create a shortcut to dictate and send entries without opening the app:

1. Open the **Shortcuts** app on iPhone
2. Tap **+** to create a new shortcut
3. Add these actions:
   - **Dictate Text** (set language to English)
   - **Choose from Menu** → options: *Childhood, College, Early Career, MBA Pivot, Post-MBA, Corporate, Family Life, Flipkart & AI*
   - **Open URLs**: `https://[username].github.io/autobiography-saurav?text=[Dictated Text]&chapter=[Chosen Item]`
4. Name it **"My Story"**
5. Say: **"Hey Siri, My Story"** to trigger it

> **Chapter URL values:** `01-childhood` | `02-college-engineering` | `03-early-career` | `04-mba-pivot` | `05-post-mba-growth` | `06-corporate-journey` | `07-family-life` | `08-flipkart-ai`

---

## Entry Format

Each entry is saved as:
```
entries/[chapter]/YYYY-MM-DD_HH-MM_raw.md
```

Example: `entries/08-flipkart-ai/2026-03-29_20-15_raw.md`

```markdown
---
date: 2026-03-29
time: 20:15
chapter: 08-flipkart-ai
tags: [Flipkart, AI, learning]
---

Your captured memory text here...
```

---

## Pushing to GitHub (First Time)

```bash
cd f:/autobiography-saurav
git init
git add .
git commit -m "Initial commit: autobiography app"
git remote add origin https://github.com/dhiyanshiai/autobiography-saurav.git
git push -u origin main
```

---

## Sharing with Claude

Share this repo URL with Claude to compile entries into chapter drafts:
```
https://github.com/dhiyanshiai/autobiography-saurav
```

Claude will read all entries under `entries/`, group them by chapter, and help write the book.

---

## Security Note

Your GitHub Personal Access Token is stored only in your browser's `localStorage` — it is never sent to any server other than `api.github.com`. Use a fine-grained token scoped to this repo only for maximum safety.
