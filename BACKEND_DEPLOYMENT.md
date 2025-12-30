# 🚀 DEPLOY BACKEND TO RAILWAY

## Quick Deployment Steps

### **Option 1: Deploy via Railway CLI (Recommended)**

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```
   This will open your browser to authenticate.

3. **Navigate to backend folder:**
   ```bash
   cd /Users/apple/Downloads/jariflow-dashboard-main/backend
   ```

4. **Initialize and Deploy:**
   ```bash
   railway init
   railway up
   ```

5. **Get Your Public URL:**
   ```bash
   railway domain
   ```
   Example output: `https://mirotec-scraper.up.railway.app`

---

### **Option 2: Deploy via GitHub (Automatic Deployments)**

1. **Push Backend to GitHub:**
   ```bash
   cd /Users/apple/Downloads/jariflow-dashboard-main
   git add backend/
   git commit -m "Add backend scraper service"
   git push
   ```

2. **Connect to Railway:**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Set root directory: `/backend`
   - Deploy!

---

### **Option 3: Deploy to Render.com (Alternative)**

1. **Go to [render.com](https://render.com)**

2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Settings:
     - **Name:** `mirotec-erp-backend`
     - **Root Directory:** `backend`
     - **Environment:** `Node`
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Instance Type:** Free

3. **Environment Variables:**
   - Add `NODE_ENV=production`

4. **Deploy!**
   - Get your URL: `https://mirotec-erp-backend.onrender.com`

---

## ⚡ **FASTEST METHOD: Railway via Browser**

1. **Visit:** https://railway.app/new

2. **Deploy from GitHub:**
   - Authorize GitHub
   - Select repository
   - Set root directory: `backend`
   - Click "Deploy Now"

3. **Add Domain:**
   - Go to Settings → Networking
   - Click "Generate Domain"
   - Copy the URL (e.g., `mirotec-scraper-production.up.railway.app`)

4. **Monitor Deployment:**
   - Watch the deployment logs
   - Wait for "✅ Deployment successful"

---

## 📝 **After Backend Deploys:**

### **Update Frontend Environment Variable:**

1. Create/Update `.env` in frontend root:
   ```bash
   cd /Users/apple/Downloads/jariflow-dashboard-main
   echo "VITE_SCRAPER_API_URL=https://your-backend-url.railway.app" > .env
   ```
   Replace `your-backend-url` with actual Railway URL

2. **Rebuild Frontend:**
   ```bash
   npm run build
   ```

3. **Redeploy to Cloudflare:**
   ```bash
   npx wrangler pages deploy dist --project-name=jariflow-erp-dashboard
   ```

---

## 🔧 **Backend Configuration:**

Your backend is already configured with:
- ✅ PORT environment variable support
- ✅ CORS enabled for all origins
- ✅ Data caching system
- ✅ Auto-scraping every 6 hours
- ✅ Error handling with fallbacks

---

## 🌍 **Expected Result:**

After deployment:
- **Backend URL:** `https://mirotec-scraper.railway.app`
- **API Health:** `https://mirotec-scraper.railway.app/api/health`
- **Competitors:** `https://mirotec-scraper.railway.app/api/competitors`
- **Shipping Rates:** `https://mirotec-scraper.railway.app/api/shipping/quotes`

Your Cloudflare frontend will connect to this public backend and show real-time data!

---

## ⚠️ **Important Notes:**

1. **Railway Free Tier:**
   - $5 free credit monthly
   - More than enough for this project
   - No credit card required to start

2. **Render Free Tier:**
   - Spins down after 15 minutes of inactivity
   - First request takes 30-60 seconds to wake up
   - Good for demos, not production

3. **Puppeteer on Railway:**
   - Railway includes Chrome dependencies
   - Scraping will work out of the box

---

## 🚀 **Let's Deploy Now:**

Which method do you prefer?
1. Railway CLI (fastest for testing)
2. Railway via GitHub (best for continuous deployment)
3. Render.com (alternative free option)

Once you choose, I'll guide you through the exact steps!
