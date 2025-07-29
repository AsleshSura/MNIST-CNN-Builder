# 🚀 Deployment Guide

This guide will help you deploy the MNIST CNN Builder to various platforms.

## 📋 Prerequisites

- **Node.js** 16+ and **npm** 8+
- **Git** (for GitHub Pages)
- A GitHub account (for GitHub Pages)

## 🛠️ Quick Deployment

### Option 1: Using PowerShell Script (Windows)
```powershell
# Local development
.\deploy.ps1 -Local

# GitHub Pages deployment
.\deploy.ps1 -Pages
```

### Option 2: Using Shell Script (Mac/Linux)
```bash
# Local development
./deploy.sh local

# GitHub Pages deployment
./deploy.sh pages
```

### Option 3: Using npm Scripts
```bash
# Install dependencies
npm run install-deps

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy:pages

# Start local development
npm start
```

## 🌐 Platform-Specific Deployment

### GitHub Pages (Recommended)

#### Automatic Deployment (GitHub Actions)
1. **Push to main branch** - The project is already configured with GitHub Actions
2. **Enable GitHub Pages** in repository settings:
   - Go to `Settings` → `Pages`
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
3. **Access your site** at: `https://yourusername.github.io/MNIST-CNN-Builder/docs/`

#### Manual Deployment
1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Copy to docs folder**:
   ```bash
   npm run copy-build
   ```

3. **Commit and push**:
   ```bash
   git add docs/cnn-builder
   git commit -m "🚀 Update React build"
   git push origin main
   ```

### Netlify

1. **Drag and Drop**:
   - Run `npm run build`
   - Drag the `docs/` folder to [netlify.app/drop](https://app.netlify.com/drop)

2. **Git Integration**:
   - Connect your GitHub repository
   - Build command: `cd cnn-builder && npm run build`
   - Publish directory: `docs`

### Vercel

1. **Import from GitHub**:
   - Connect your repository at [vercel.com](https://vercel.com)
   - Framework: `Other`
   - Root Directory: `cnn-builder`
   - Build Command: `npm run build`
   - Output Directory: `build`

### Firebase Hosting

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase**:
   ```bash
   firebase init hosting
   ```

3. **Configure firebase.json**:
   ```json
   {
     "hosting": {
       "public": "docs",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
     }
   }
   ```

4. **Deploy**:
   ```bash
   npm run build
   firebase deploy
   ```

### Docker Deployment

1. **Create Dockerfile**:
   ```dockerfile
   FROM node:16-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and run**:
   ```bash
   docker build -t mnist-cnn-builder .
   docker run -p 3000:3000 mnist-cnn-builder
   ```

## 🔧 Environment Configuration

### Environment Variables

Create `.env` files for different environments:

**`.env.development`** (local development):
```env
REACT_APP_ENV=development
PUBLIC_URL=/
```

**`.env.production`** (GitHub Pages):
```env
REACT_APP_ENV=production
PUBLIC_URL=/MNIST-CNN-Builder/docs/cnn-builder
```

### Build Optimization

The project is already optimized for production with:
- **Code splitting** and lazy loading
- **Bundle analysis** with webpack-bundle-analyzer
- **Service worker** for offline functionality
- **Compression** and minification
- **Tree shaking** for smaller bundles

## 📊 Performance Monitoring

### Web Vitals
The app includes Web Vitals monitoring. Check performance in:
- Browser DevTools → Lighthouse
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Web.dev Measure](https://web.dev/measure/)

### Bundle Analysis
Analyze bundle size:
```bash
cd cnn-builder
npm run build
npx webpack-bundle-analyzer build/static/js/*.js
```

## 🛡️ Security Considerations

- **HTTPS only** - All deployment platforms use HTTPS
- **Content Security Policy** - Configured in `public/index.html`
- **Dependencies** - Regularly updated and scanned
- **No server-side secrets** - Client-side only application

## 🔍 Troubleshooting

### Common Issues

**Build Fails**:
- Check Node.js version (requires 16+)
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and reinstall

**GitHub Pages 404**:
- Ensure `homepage` in `package.json` matches repository name
- Check if GitHub Pages is enabled in repository settings
- Wait a few minutes for deployment to propagate

**Memory Issues During Build**:
- Increase Node.js memory: `NODE_OPTIONS=--max_old_space_size=4096 npm run build`
- Close other applications during build

**CORS Issues in Development**:
- Use the development server: `npm start`
- Check proxy configuration in `package.json`

### Build Verification

Verify your build works locally:
```bash
# Build the project
npm run build

# Serve the build locally
cd cnn-builder
npx serve -s build -l 3000
```

## 📚 Additional Resources

- [React Deployment Documentation](https://create-react-app.dev/docs/deployment/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [TensorFlow.js Deployment Guide](https://www.tensorflow.org/js/guide/platform_environment)

## 🆘 Support

If you encounter issues:
1. Check the [README.md](README.md) for detailed documentation
2. Review the [Issues page](https://github.com/AsleshSura/MNIST-CNN-Builder/issues)
3. Create a new issue with deployment logs

---

**🎉 Your MNIST CNN Builder is now ready for deployment!**

Visit the [live demo](https://asleshsura.github.io/MNIST-CNN-Builder/docs/) to see it in action.
