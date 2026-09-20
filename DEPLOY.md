# Deploying Garden Planner to the cloud (free)

This puts the app online at a permanent public link — no visitor login — using
three free accounts (no credit card):

- **GitHub** — stores the code; Render redeploys automatically when you push updates.
- **Turso** — free managed database (SQLite-compatible) that keeps your data safe.
- **Render** — runs the app 24/7 at a public URL.

The app is already committed to a local git repo on the `main` branch.

---

## Part 1 — Put the code on GitHub

1. Create a free account at https://github.com/signup (skip if you have one).
2. Make a new **empty** repo: https://github.com/new
   - Name: `garden-planner` (anything is fine)
   - Public or Private — either works (there are no secrets in the code)
   - **Do NOT** add a README, .gitignore, or license (keep it empty)
   - Click **Create repository**
3. In a terminal, connect and push (replace `<username>`):

   ```
   cd C:\Users\abeem\Documents\garden-planner
   git remote add origin https://github.com/<username>/garden-planner.git
   git push -u origin main
   ```

   The first push opens a browser to sign in to GitHub — approve it once.

---

## Part 2 — Create the database on Turso

1. Sign up (free) at https://turso.tech — "Sign in with GitHub" is easiest.
2. Create a database (e.g. name it `garden-planner`). Pick any region near you.
3. Open the database and find its **connection details**. You need two values:
   - **Database URL** — looks like `libsql://garden-planner-<you>.turso.io`
   - **Auth token** — a long string (create/generate one if prompted)
4. Copy both somewhere handy for Part 3. (Treat the auth token like a password —
   don't paste it into the code or share it publicly; it only goes into Render.)

---

## Part 3 — Deploy on Render

1. Sign up (free) at https://render.com — "Sign in with GitHub" is easiest.
2. Click **New +** → **Blueprint**.
3. Connect your GitHub and select the `garden-planner` repo. Render reads
   `render.yaml` automatically.
4. It will prompt for two environment variables — paste in the values from Part 2:
   - `TURSO_DATABASE_URL` → your Database URL
   - `TURSO_AUTH_TOKEN` → your Auth token
5. Click **Apply** / **Create**. Render installs, builds the UI, and starts the app
   (first build takes a few minutes).
6. When it's live, Render shows a URL like `https://garden-planner.onrender.com` —
   **that's your public link.** Anyone can open it, no login.

### Good to know

- **Free-tier sleep:** after ~15 minutes with no visitors, the app sleeps; the next
  visit takes ~30–60 seconds to wake, then it's fast again. (Upgrading Render's
  plan removes this, but it's not required.)
- **Making changes later:** edit the code, then from the project folder run
  `git add -A && git commit -m "..." && git push`. Render redeploys automatically.
- **Your data** lives in Turso and persists across redeploys. Back it up from the
  Turso dashboard if you like.
- **No login = public.** Anyone with the link can view and edit the garden. If you
  ever want a passcode, that can be added.
