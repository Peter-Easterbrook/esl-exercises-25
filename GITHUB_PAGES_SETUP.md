# GitHub Pages Setup Instructions

Follow these steps to host your privacy policy on GitHub Pages using your existing app repository.

## Step 1: Add the HTML File to Your Repository

### Option A: Via Git Command Line (Recommended)

```bash
# Navigate to your app repository
cd c:\Users\peter\Documents\2024\esl-exercises-25

# Create a docs folder (common convention for GitHub Pages)
mkdir docs

# Move the privacy-policy.html file to the docs folder
move privacy-policy.html docs\

# Add, commit, and push
git add docs/privacy-policy.html
git commit -m "Add privacy policy for GitHub Pages"
git push origin main
```

### Option B: Via GitHub Web Interface

1. Go to your repository on GitHub: `https://github.com/YOUR_USERNAME/esl-exercises-25`
2. Click **"Add file"** → **"Create new file"**
3. Name it `docs/privacy-policy.html` (this creates the docs folder automatically)
4. Copy and paste the contents of `privacy-policy.html` into the editor
5. Click **"Commit changes"**

## Step 2: Enable GitHub Pages

1. In your repository, click **"Settings"** (top menu)
2. Scroll down and click **"Pages"** in the left sidebar
3. Under **"Source"**, select **"Deploy from a branch"**
4. Under **"Branch"**, select:
   - Branch: **"main"** (or **"master"** if that's your default)
   - Folder: **"/docs"**
5. Click **"Save"**

## Step 3: Access Your Privacy Policy

After 1-2 minutes, your privacy policy will be available at:
