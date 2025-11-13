# Chess Game

A web-based chess application built with React, TypeScript, and Vite.

## 🎮 Live Demo

[Play Chess Game Online](https://naijoug.github.io/chess/)

## Features

- Human vs AI mode
- Player vs Player mode
- Full chess rules implementation
- Responsive design

## Tech Stack

- **Frontend Framework**: React 18+
- **Type System**: TypeScript 5+
- **Build Tool**: Vite 5+
- **State Management**: React Context API + useReducer
- **Styling**: CSS Modules

## Project Structure

```
src/
├── components/     # React UI components
├── context/        # State management (Context API)
├── engine/         # Chess game logic
├── types/          # TypeScript type definitions
└── styles/         # Global styles and CSS modules
```

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Testing

```bash
npm run test
```

## Deployment

This project is automatically deployed to GitHub Pages using GitHub Actions.

### Automatic Deployment

- **Trigger**: Pushes to the `main` branch automatically trigger deployment
- **Workflow**: The deployment workflow builds the project and publishes it to GitHub Pages
- **Status**: Check the Actions tab in your repository to monitor deployment status

### Manual Deployment

You can also trigger deployment manually:

1. Go to the **Actions** tab in your GitHub repository
2. Select the **Deploy to GitHub Pages** workflow
3. Click **Run workflow** and select the `main` branch

### Local Production Preview

To test the production build locally before deploying:

```bash
# Build the project
npm run build

# Preview the production build
npm run preview
```

This will start a local server (typically at `http://localhost:4173`) that serves the production build, allowing you to verify everything works correctly before deployment.

### Deployment Configuration

The deployment is configured in:
- **Vite Config**: `vite.config.ts` - Sets the base path for GitHub Pages
- **GitHub Actions**: `.github/workflows/deploy.yml` - Defines the deployment workflow

### Troubleshooting

#### Assets Not Loading (404 Errors)

**Problem**: After deployment, images, CSS, or JavaScript files fail to load.

**Solution**:
1. Verify the `base` path in `vite.config.ts` matches your repository name:
   ```typescript
   export default defineConfig({
     base: '/your-repo-name/',
     // ...
   })
   ```
2. Ensure all asset imports use relative paths or Vite's import syntax
3. Rebuild and redeploy after making changes

#### Deployment Workflow Fails

**Problem**: The GitHub Actions workflow fails during build or deployment.

**Solution**:
1. Check the **Actions** tab for detailed error logs
2. Common issues:
   - **Build errors**: Fix TypeScript or linting errors in your code
   - **Permission errors**: Ensure GitHub Pages is enabled in repository settings
   - **Node version**: Verify the workflow uses a compatible Node.js version
3. Test the build locally with `npm run build` to catch errors early

#### GitHub Pages Not Enabled

**Problem**: Deployment succeeds but the site is not accessible.

**Solution**:
1. Go to **Settings** → **Pages** in your repository
2. Under **Source**, select **GitHub Actions**
3. Wait a few minutes for GitHub to provision the site
4. The URL will be displayed once ready: `https://username.github.io/repo-name/`

#### Blank Page After Deployment

**Problem**: The site loads but shows a blank page.

**Solution**:
1. Check browser console for errors (F12 → Console tab)
2. Verify the `base` path in `vite.config.ts` is correct
3. Ensure your router configuration (if using React Router) accounts for the base path
4. Test locally with `npm run preview` to reproduce the issue

#### Changes Not Reflecting

**Problem**: Pushed changes don't appear on the deployed site.

**Solution**:
1. Check if the workflow completed successfully in the **Actions** tab
2. Clear your browser cache or try in an incognito window
3. Wait a few minutes for GitHub's CDN to update
4. Verify you pushed to the correct branch (`main`)

## Development

This project follows a spec-driven development approach. See `.kiro/specs/chess-game/` for detailed requirements, design, and implementation tasks.
