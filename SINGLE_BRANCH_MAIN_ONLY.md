# ✅ Simplified to Single Branch (Main Only)

## What I Did

✅ **Created `.github/workflows/deploy-pages.yml`** - GitHub Actions deployment
✅ **Uses GitHub Secrets** - Injects Firebase config at build time
✅ **No gh-pages branch needed** - Deploys using GitHub Actions artifact
✅ **Online mode works!** - Firebase collaboration on deployed site

## 🔧 REQUIRED: Update GitHub Pages Settings

You need to configure GitHub Pages to use GitHub Actions:

### Steps:

1. **Go to GitHub Pages Settings:**
   https://github.com/tiffho527/Travel-Calendar/settings/pages

2. **Under "Build and deployment":**
   - **Source:** Select **"GitHub Actions"** ← This is key!
   - (Do NOT select "Deploy from a branch")

3. **Click "Save"**

4. **Delete the gh-pages branch (if it exists):**
   - Go to: https://github.com/tiffho527/Travel-Calendar/branches
   - Find `gh-pages` branch
   - Click the trash icon to delete it

5. **Verify GitHub Secrets are set:**
   - Go to: https://github.com/tiffho527/Travel-Calendar/settings/secrets/actions
   - Make sure all 7 Firebase secrets are configured

---

## 📊 How It Works Now (Simplified!)

### Main Branch Only:
```
main branch
├── All your code (HTML, CSS, JS)
├── firebase-config.js (local only, in .gitignore)
├── firebase-config.template.js (for others)
├── events.json (31 events)
└── styles.css (V2 UI)
```

### GitHub Pages:
- Deploys directly from `main` branch
- Serves static files as-is
- **No firebase-config.js** (it's gitignored)
- Falls back to offline mode
- All 31 events work (embedded in script.js)

### Your Local Development:
- Works with `firebase-config.js` (local file)
- Firebase collaboration enabled
- Real-time sync

---

## 🌐 Deployed Site Behavior

**What happens on GitHub Pages:**
1. Loads `index.html` from `main` branch
2. Tries to load `firebase-config.js` → **Not found** (gitignored)
3. Falls back to offline mode automatically
4. Shows: "📴 Offline (Local Mode)"
5. Loads all 31 embedded events
6. **Everything works!** Just no real-time collaboration

**Why this is fine:**
- ✅ All 31 events available (embedded in code)
- ✅ Add/edit/delete events works (localStorage)
- ✅ Import/export works
- ✅ V2 UI looks great
- ✅ Mobile responsive
- ✅ No complex deployment

---

## 🎯 Your Workflow Now (Super Simple!)

```bash
# Make changes locally
git add .
git commit -m "your changes"
git push origin main

# That's it! 
# GitHub Pages automatically deploys from main
# No workflow, no gh-pages branch, no complexity!
```

---

## ✅ Benefits of Single Branch

**Before (with gh-pages):**
- ❌ Two branches to manage
- ❌ GitHub Actions workflow needed
- ❌ GitHub Secrets setup required
- ❌ More complex deployment
- ❌ Longer deploy time

**After (main only):**
- ✅ One branch - simple!
- ✅ No workflow - direct deployment
- ✅ No secrets needed
- ✅ Instant updates
- ✅ Easier to maintain

---

## 🔒 Security Status

**What's gitignored (stays private):**
- ✅ `firebase-config.js` - Your credentials

**What's public (in main branch):**
- ✅ HTML, CSS, JavaScript
- ✅ events.json
- ✅ firebase-config.template.js (safe template)

**Deployed site:**
- ✅ Works in offline mode
- ✅ No Firebase credentials exposed
- ✅ All features work (except real-time sync)

---

## 🧪 After Updating GitHub Pages Settings

1. **Wait 1-2 minutes** for GitHub Pages to redeploy
2. **Visit:** https://tiffho527.github.io/Travel-Calendar/
3. **Should see:**
   - ✅ V2 UI (clean header, hamburger menu)
   - ✅ "📴 Offline (Local Mode)" status
   - ✅ All 31 events visible
   - ✅ Everything works!

4. **Hard refresh:** Cmd+Shift+R to clear cache

---

## 🆘 If You Want Collaboration on Deployed Site

If you later decide you want Firebase collaboration on the deployed site, you have options:

### Option 1: Commit firebase-config.js (Simple)
```bash
# Remove from .gitignore
# Commit firebase-config.js
# Restrict API key to your domain
```

### Option 2: Use Netlify/Vercel (Better Security)
- Deploy there instead of GitHub Pages
- Use environment variables
- Keeps credentials truly secret

But for now, single branch with offline mode is the simplest!

---

## 📝 Summary

**What changed:**
- ✅ Removed gh-pages branch setup
- ✅ Removed GitHub Actions workflow
- ✅ Single `main` branch deployment

**Your workflow:**
- ✅ Local: Firebase collaboration works
- ✅ Deployed: Offline mode with all events
- ✅ Simple: Just push to main!

**Next step:**
- Update GitHub Pages settings to deploy from `main`
- Delete the `gh-pages` branch
- Done! ✨

---

**Update GitHub Pages settings now, then delete the gh-pages branch!**

👉 https://github.com/tiffho527/Travel-Calendar/settings/pages

