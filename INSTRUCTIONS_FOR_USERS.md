# SVG Studio - User Guide

Simple instructions for using SVG Studio Figma plugin.

## 📋 What You Need

1. **Figma Desktop App** - Download from [figma.com/downloads](https://www.figma.com/downloads/)
2. **Node.js** - Download from [nodejs.org](https://nodejs.org/) (get the LTS version)

## 🚀 First Time Setup (Do this once)

### Step 1: Install Node.js
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the **LTS version** (recommended for most users)
3. Run the installer
4. Restart your computer

### Step 2: Setup the Plugin
1. Open Terminal (Mac) or Command Prompt (Windows)
2. Navigate to this folder:
   - **Mac**: Drag the folder onto Terminal
   - **Windows**: Type `cd ` and drag the folder
3. Type: `./setup.sh` and press Enter (Mac) or `setup.sh` (Windows)
4. Wait for it to finish (about 1-2 minutes)

### Step 3: Add Plugin to Figma
1. Open **Figma Desktop App** (not browser!)
2. Click **Plugins** → **Development** → **Import plugin from manifest**
3. Select the `manifest.json` file from this folder
4. Done! The plugin is now installed

## 💻 Daily Usage

### Every time you want to use the plugin:

**Step 1: Start the Backend Server**
- **Mac**: Double-click `start-server.command`
- **Windows**: Double-click `start-server.bat`
- Keep this window open!

**Step 2: Use the Plugin in Figma**
1. Open Figma
2. Go to **Plugins** → **SVG Studio**
3. The plugin will open and connect automatically

**Step 3: When Done**
- Close the plugin in Figma
- Go back to the server window and press `Ctrl+C` to stop it

## ✨ What You Can Do

### Browse Shapes
- 80 pre-loaded SVG shapes organized by category:
  - Waves (10)
  - Blobs (10)
  - Shapes (40)
  - Dividers (8)
  - Frames (6)
  - Borders (6)

### Search
- Type in the search box to find shapes by name or tags
- Example: search "wave", "blob", "heart", etc.

### Filter by Category
- Click on any category in the left sidebar
- Click "All" to see everything

### Insert Shapes
1. Click on any shape card
2. Click the "Insert" button
3. The shape appears in your Figma canvas!

### Upload Custom SVGs
1. Click the "Upload" button in the top right
2. Drag & drop your SVG file or click to browse
3. Preview your SVG
4. Give it a name and choose a category
5. Add tags (optional) like "icon, ui, custom"
6. Click "Upload & Save"
7. Your shape is now in the library!

### Delete Custom Shapes
- Custom shapes have a 🗑️ delete button
- Click it to remove shapes you uploaded
- Pre-loaded shapes cannot be deleted

## 🐛 Troubleshooting

### "Backend Not Running" Error
- Make sure you double-clicked `start-server.command`
- The server window must stay open
- Click "Retry Connection" in the plugin

### Plugin Not Loading
- Make sure you're using **Figma Desktop App** (not browser)
- Close and re-open the plugin
- Try restarting Figma

### Shapes Not Appearing
- Wait a few seconds for loading
- Check your internet connection
- Make sure the server is running

### "Port Already in Use" Error
- Close any other instance of the server
- Restart your computer if needed

## 📞 Need Help?

If something doesn't work:
1. Close the plugin
2. Stop the server (Ctrl+C)
3. Restart the server
4. Open the plugin again

Still stuck? Contact: [Your Email/Support]

---

**Version**: 0.0.3
**Made with**: Node.js, Prisma, SQLite, Figma Plugin API
