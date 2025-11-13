# Railway Deployment Guide

## Quick Setup (Recommended)

### 1. Deploy via Railway Dashboard

1. **Go to Railway**: https://railway.app
2. **Sign in** with your GitHub account
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose this repository**: `mylist_assignment`
6. Railway will automatically:
   - Detect the `Dockerfile`
   - Build your application
   - Deploy it with a public URL

### 2. Access Your Application

Once deployed, Railway provides:

- **Public URL**: `https://your-app-name.up.railway.app`
- **API Documentation**: `https://your-app-name.up.railway.app/api`

### 3. Environment Variables (Optional)

In Railway Dashboard > Variables, you can set:

```
SERVICE_PORT=3000  (Railway sets PORT automatically)
NODE_ENV=production
```

---

## Alternative: Deploy via Railway CLI

### 1. Install Railway CLI

```bash
# macOS
brew install railway

# Or using npm
npm install -g @railway/cli
```

### 2. Login to Railway

```bash
railway login
```

### 3. Initialize Project

```bash
# In your project directory
railway init
```

### 4. Deploy

```bash
railway up
```

### 5. Get Public URL

```bash
railway domain
```

---

## GitHub Actions Auto-Deployment (Optional)

To enable automatic deployment on every push to `main`:

### 1. Get Railway Token

```bash
railway login
railway token
```

### 2. Add Secret to GitHub

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Name: `RAILWAY_TOKEN`
4. Value: Paste your Railway token

### 3. Enable Deployment

The deployment step is already in `.github/workflows/ci-cd.yml` (currently commented out).
Uncomment the deploy job to enable auto-deployment.

---

## Monitoring

After deployment, you can monitor your app in Railway Dashboard:

- **Logs**: Real-time application logs
- **Metrics**: CPU, Memory, Network usage
- **Deployments**: History of all deployments

---

## Costs

- **Free Tier**: $5 credit/month (no credit card required)
- **Hobby Plan**: $5/month + usage
- Your app should stay within free tier limits for development/testing

---

## Public URLs

Once deployed, your endpoints will be available at:

- **Base API**: `https://your-app.up.railway.app`
- **Swagger UI**: `https://your-app.up.railway.app/api`
- **Health Check**: `https://your-app.up.railway.app/mylist`

### Example Endpoints:

```
POST   https://your-app.up.railway.app/mylist
GET    https://your-app.up.railway.app/mylist?userId=user123
DELETE https://your-app.up.railway.app/mylist
```

---

## Troubleshooting

### Build Fails

- Check Railway logs in the dashboard
- Ensure all dependencies are in `package.json`
- Verify `Dockerfile` builds locally: `docker build -t test .`

### App Not Starting

- Check if PORT environment variable is set
- Railway automatically sets `PORT` - your app listens on it
- View logs: Railway Dashboard → Deployments → View Logs

### Database Issues

- Railway uses in-memory SQLite by default
- For persistent storage, add Railway's Volume or use Railway's PostgreSQL

---

## Next Steps

1. **Deploy to Railway** using the dashboard method above
2. **Copy your public URL** and share it
3. **Test your API** using the Swagger UI
4. **(Optional)** Set up GitHub Actions auto-deployment
