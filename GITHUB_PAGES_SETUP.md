# GitHub Pages Setup Instructions

Follow these steps to host your privacy policy on GitHub Pages.

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and log in to your account
2. Click the **"+"** icon in the top-right corner and select **"New repository"**
3. Name your repository (e.g., `esl-exercises-privacy-policy`)
4. Make the repository **Public** (required for free GitHub Pages)
5. Check **"Add a README file"** (optional)
6. Click **"Create repository"**

## Step 2: Upload the Privacy Policy HTML File

### Option A: Via GitHub Web Interface (Easiest)

1. In your new repository, click **"Add file"** → **"Upload files"**
2. Drag and drop the `privacy-policy.html` file or click to browse
3. Add a commit message like "Add privacy policy"
4. Click **"Commit changes"**

### Option B: Via Git Command Line

```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/esl-exercises-privacy-policy.git
cd esl-exercises-privacy-policy

# Copy the privacy-policy.html file to the repository folder
cp /path/to/privacy-policy.html .

# Add, commit, and push
git add privacy-policy.html
git commit -m "Add privacy policy"
git push origin main
```

## Step 3: Enable GitHub Pages

1. In your repository, click **"Settings"** (top menu)
2. Scroll down and click **"Pages"** in the left sidebar
3. Under **"Source"**, select **"Deploy from a branch"**
4. Under **"Branch"**, select **"main"** and **"/ (root)"**
5. Click **"Save"**

## Step 4: Access Your Privacy Policy

After a few minutes, your privacy policy will be available at:
