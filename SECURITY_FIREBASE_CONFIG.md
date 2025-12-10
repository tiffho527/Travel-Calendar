# 🔐 Securing Firebase API Keys in Public Repository

## ⚠️ Problem

Your Firebase API key was exposed in a public GitHub repository, triggering GitHub's secret scanning alert.

## ✅ Solution Implemented

I've set up a secure configuration system:

### 1. Created `.gitignore`
- Excludes `firebase-config.js` from git
- Your actual credentials stay local and on GitHub Pages
- Never committed to the repository

### 2. Created `firebase-config.template.js`
- Template file with placeholder values
- Safe to commit to public repo
- Instructions for others to set up their own Firebase

### 3. Your Actual Config
- `firebase-config.js` remains on your machine
- Used for local development
- Will be used on GitHub Pages (see deployment steps below)

---

## 🚀 Immediate Steps to Fix GitHub Alert

### Step 1: Remove Exposed Key from Git History

```bash
cd /Users/tho4/Desktop/TripCalendar/Travel-Calendar

# Add .gitignore and template
git add .gitignore firebase-config.template.js

# Remove firebase-config.js from tracking (but keep local file)
git rm --cached firebase-config.js

# Commit the changes
git commit -m "Secure Firebase config - use template and gitignore"

# Push to GitHub
git push origin main
```

### Step 2: Rotate Your Firebase API Key

**IMPORTANT:** The exposed key should be rotated even after removing it from git!

1. Go to: https://console.firebase.google.com/project/trip-calendar-4f14e/settings/general
2. Click **"Web API Key"** section
3. Click **"Regenerate Key"** (or restrict the key - see below)
4. Copy the new API key
5. Update your local `firebase-config.js` with the new key

### Step 3: Restrict the API Key (Recommended)

Instead of regenerating, you can restrict the key to only your domain:

1. Go to: https://console.cloud.google.com/apis/credentials?project=trip-calendar-4f14e
2. Find your API key (starts with `AIzaSyC...`)
3. Click the key to edit it
4. Under **"Application restrictions"**:
   - Select **"HTTP referrers (web sites)"**
   - Add: `https://YOUR-USERNAME.github.io/*`
   - Add: `http://localhost:*` (for local testing)
5. Under **"API restrictions"**:
   - Select **"Restrict key"**
   - Enable only:
     - Firebase Realtime Database API
     - Identity Toolkit API (if using auth)
6. Click **"Save"**

---

## 📋 GitHub Pages Deployment (Keeping Secrets Safe)

### Option A: Use GitHub Secrets (Recommended)

1. **Add your API key as a GitHub Secret:**
   - Go to your repo → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `FIREBASE_API_KEY`
   - Value: Your actual API key
   - Click "Add secret"

2. **Add other Firebase config as secrets:**
   ```
   FIREBASE_AUTH_DOMAIN
   FIREBASE_DATABASE_URL
   FIREBASE_PROJECT_ID
   FIREBASE_STORAGE_BUCKET
   FIREBASE_MESSAGING_SENDER_ID
   FIREBASE_APP_ID
   ```

3. **Create GitHub Action** (I'll create this file for you)

### Option B: Manual Deployment (Quick Fix)

Since GitHub Pages serves static files, you can:

1. Keep `firebase-config.js` out of git (already done)
2. Manually add it to your gh-pages branch:

```bash
# Switch to gh-pages branch
git checkout gh-pages

# Copy your firebase-config.js 
cp /path/to/your/firebase-config.js .

# Add ONLY to gh-pages
git add firebase-config.js
git commit -m "Add Firebase config to gh-pages only"
git push origin gh-pages

# Switch back to main
git checkout main
```

---

## 🔒 Best Practices Going Forward

### For Public Repos:

1. ✅ **Never commit** `firebase-config.js`
2. ✅ **Always use** `.gitignore`
3. ✅ **Provide** `firebase-config.template.js` for others
4. ✅ **Restrict** API keys to your domain
5. ✅ **Use** GitHub Secrets for CI/CD

### Firebase Security:

Even though Firebase API keys are "public" (they're meant to be in client-side code), you should:

1. **Restrict by domain** (as shown above)
2. **Use Firebase Security Rules** to protect your data:

```json
{
  "rules": {
    "events": {
      ".read": true,
      ".write": true
    }
  }
}
```

For better security, add authentication:

```json
{
  "rules": {
    "events": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

---

## 📝 For Collaborators (README Section)

Add this to your README.md:

```markdown
## Firebase Setup for Developers

1. Copy the template:
   \`\`\`bash
   cp firebase-config.template.js firebase-config.js
   \`\`\`

2. Get Firebase credentials from project admin

3. Update `firebase-config.js` with your credentials

4. Never commit `firebase-config.js`!
```

---

## ✅ Checklist

- [ ] Run Step 1 commands (remove from git)
- [ ] Rotate or restrict your API key (Step 2 or 3)
- [ ] Deploy to GitHub Pages (Option A or B)
- [ ] Close GitHub security alert
- [ ] Update README with setup instructions

---

## 🆘 If You Need More Help

Let me know if you want me to:
- Create the GitHub Actions workflow for automatic deployment
- Set up Firebase Authentication
- Add more restrictive security rules
- Help with any of the steps above

---

**Next: Run the Step 1 commands to remove the exposed key from your repository!**

