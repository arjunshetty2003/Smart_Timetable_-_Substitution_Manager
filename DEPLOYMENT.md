# Smart Timetable & Substitution Manager Deployment Guide

This guide explains how to deploy the Smart Timetable & Substitution Manager application using Vercel for the frontend and Render for the backend.

## Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Render account (sign up at [render.com](https://render.com))
- MongoDB Atlas account (sign up at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas))

## Part 1: Set Up MongoDB Atlas

1. **Create a MongoDB Atlas Cluster**:
   - Sign in to MongoDB Atlasw
   - Create a new project
   - Create a new cluster (the free tier is sufficient for starting)
   - Set up a database user with password authentication
   - Add your IP to the IP Access List (or use 0.0.0.0/0 for public access)

2. **Get your MongoDB Connection String**:
   - Go to "Connect" > "Connect your application"
   - Copy the connection string (it should look like: `mongodb+srv://username:<password>@cluster0.mongodb.net/database?retryWrites=true&w=majority`)
   - Replace `<password>` with your database user's password
   - You'll need this URI for both Render deployment and local development

## Part 2: Deploy Backend to Render

1. **Connect your GitHub repository**:
   - Sign in to Render
   - Click "New" > "Web Service"
   - Connect your GitHub repository
   - Select the repository

2. **Configure the Web Service**:
   - Name: `smart-timetable-backend` (or your preferred name)
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Root Directory: `backend` (important: specify this subfolder)

3. **Add Environment Variables**:
   - MONGO_URI: Your MongoDB Atlas connection string
   - JWT_SECRET: A secure random string for JWT authentication
   - NODE_ENV: `production`
   - PORT: `10000` (Render will override this, but it's good to set)

4. **Advanced Settings** (optional):
   - Set Auto-Deploy to "Yes" if you want automatic deployments on git pushes
   - Configure health check path: `/api/health`

5. **Click "Create Web Service"**

6. **Wait for Deployment**:
   - Render will build and deploy your backend
   - Note the URL provided by Render (e.g., `https://smart-timetable-backend.onrender.com`)
   - This is your API URL that the frontend will use

## Part 3: Prepare Frontend for Vercel

1. **Create a Production API URL Configuration**:

   Create a new file in your frontend directory:

   ```
   frontend/.env.production
   ```

   Add the following content (replace with your actual Render backend URL):

   ```
   VITE_API_URL=https://smart-timetable-backend.onrender.com/api
   ```

2. **Update Frontend Configuration**:

   Update your `frontend/vite.config.js` to use environment variables:

   ```javascript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     server: {
       port: 5173,
       proxy: {
         '/api': {
           target: 'http://localhost:3001',
           changeOrigin: true,
           secure: false
         }
       }
     },
     build: {
       outDir: 'dist',
       sourcemap: true
     },
     define: {
       'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL)
     }
   })
   ```

3. **Update API Service**:

   Make sure your frontend API service uses the environment variable:

   ```javascript
   // In your API service file (frontend/src/services/api.js or similar)
   const API_URL = import.meta.env.VITE_API_URL || '/api';

   // Example axios setup
   import axios from 'axios';

   const apiClient = axios.create({
     baseURL: API_URL,
     headers: {
       'Content-Type': 'application/json'
     }
   });
   ```

## Part 4: Deploy Frontend to Vercel

1. **Connect your GitHub repository**:
   - Sign in to Vercel
   - Click "Add New" > "Project"
   - Import your GitHub repository
   - Select the repository

2. **Configure the Project**:
   - Framework Preset: Vite
   - Root Directory: `frontend` (important: specify this subfolder)
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Add Environment Variables**:
   - VITE_API_URL: Your Render backend URL with `/api` (e.g., `https://smart-timetable-backend.onrender.com/api`)

4. **Click "Deploy"**

5. **Wait for Deployment**:
   - Vercel will build and deploy your frontend
   - You'll get a production URL (e.g., `https://smart-timetable.vercel.app`)

## Part 5: Update CORS Settings on Backend

Update your backend CORS configuration in `server.js` to allow requests from your Vercel domain:

```javascript
// In backend/server.js
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-vercel-app-url.vercel.app', 'https://your-custom-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
```

Redeploy your backend after making this change.

## Part 6: Setup Custom Domain (Optional)

1. **For Vercel**:
   - Go to your project settings
   - Navigate to "Domains"
   - Add your custom domain and follow the verification steps

2. **For Render**:
   - Go to your web service
   - Navigate to "Settings" > "Custom Domain"
   - Add your custom domain and follow the verification steps

3. **Update CORS Settings** if you added custom domains

## Part 7: Continuous Deployment

Both Vercel and Render support automatic deployments when you push to your GitHub repository. This should be enabled by default.

## Troubleshooting

- **CORS Issues**: Make sure your backend CORS settings include the frontend domain
- **API Connection Problems**: Check environment variables and network rules
- **Database Connection**: Verify MongoDB Atlas network access settings
- **Build Failures**: Check build logs in Vercel or Render dashboards

## Local Development After Deployment

You can still use your local development setup with:

```bash
# In backend directory
npm run dev

# In frontend directory
npm run dev
```

Your local frontend will still connect to your local backend via the proxy configuration in `vite.config.js`. 