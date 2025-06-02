# Deployment Steps for Smart Timetable & Substitution Manager

This document outlines the steps to deploy your application on Render (backend) and Vercel (frontend).

## Backend Deployment on Render

1. **Create a Render Account**:
   - Sign up at [render.com](https://render.com)

2. **Deploy the Backend**:
   - Go to Render Dashboard and click "New Web Service"
   - Connect your GitHub repository
   - Configure the service:
     - Name: `smart-timetable-backend`
     - Runtime Environment: Node
     - Root Directory: `backend`
     - Build Command: `npm install`
     - Start Command: `npm start`
   
3. **Set Environment Variables**:
   - MONGO_URI: Your MongoDB Atlas connection string
   - JWT_SECRET: A secure random string for authentication
   - NODE_ENV: `production`
   - PORT: `10000` (Render will override this, but it's good to set)

4. **Deploy and Check Health**:
   - Deploy the service
   - Once deployed, check the health endpoint: `https://your-render-service.onrender.com/api/health`

## Frontend Deployment on Vercel

1. **Create a Vercel Account**:
   - Sign up at [vercel.com](https://vercel.com)

2. **Deploy the Frontend**:
   - Go to Vercel Dashboard and click "Import Project"
   - Connect your GitHub repository
   - Configure the project:
     - Framework Preset: Vite
     - Root Directory: `frontend`
     - Build Command: `npm run build`
     - Output Directory: `dist`

3. **Set Environment Variables** (if needed):
   - VITE_API_URL: Your Render backend URL (e.g., `https://smart-timetable-backend.onrender.com/api`)

4. **Deploy and Test**:
   - Deploy the project
   - Once deployed, test the application flow from login to dashboard

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure:
1. The backend CORS configuration includes your Vercel domain
2. The `vercel.json` file is correctly configured

### API Connection Issues
If the frontend can't connect to the backend:
1. Check the API URL configuration
2. Verify the backend is running on Render
3. Test the API health endpoint directly

### 404 Errors on Refresh
If you get 404 errors when refreshing on specific routes:
1. Ensure the `vercel.json` file has the correct SPA routing configuration:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## Updating the Deployment

To update your deployment:
1. Push changes to your GitHub repository
2. Render and Vercel will automatically redeploy if configured for auto-deploy
3. Monitor the build logs for any errors

## Monitoring

- **Render Dashboard**: View logs, metrics, and manage your backend service
- **Vercel Dashboard**: View deployments, domains, and analytics for your frontend 