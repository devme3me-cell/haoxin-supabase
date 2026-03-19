# Zeabur + Neon Deployment Notes

## ⚠️ Important: Do NOT Externalize @neondatabase/serverless

If Zeabur suggests adding `build.rollupOptions.external` for `@neondatabase/serverless`, **do NOT do it** for a static site deployment.

### Why?

1. **Static Site Deployment**: This project deploys as a static site (HTML/CSS/JS)
2. **Browser-Compatible**: The `@neondatabase/serverless` package works in browsers via HTTP
3. **Must Be Bundled**: For static sites, all dependencies must be included in the bundle
4. **No Server-Side Code**: There's no Node.js server to provide external modules

### How Neon Works in This Project

```
Browser (Static Site)
  ↓ HTTP Request
Neon Database (PostgreSQL via HTTP)
```

The Neon serverless driver uses `fetch()` to communicate with Neon's database over HTTPS, so it works perfectly in browsers without Node.js.

## ✅ Correct Configuration

**vite.config.ts** should NOT have external configuration:

```typescript
export default defineConfig(({ mode }) => ({
  // ... other config
  // NO build.rollupOptions.external needed!
}));
```

## 🚀 Zeabur Deployment Steps

### Option 1: Static Site (Recommended)

This is what `zeabur.json` is configured for:

```json
{
  "build": {
    "command": "bun install && bun run build"
  },
  "output": {
    "type": "static",
    "dir": "dist"
  }
}
```

**Steps:**
1. Deploy as static site
2. Add environment variables in Zeabur dashboard:
   - `VITE_DATABASE_URL`
   - `VITE_CLOUDINARY_CLOUD_NAME` (optional)
   - `VITE_CLOUDINARY_UPLOAD_PRESET` (optional)
3. Redeploy

**This works because:**
- Neon serverless driver is bundled in the JavaScript
- Database calls happen from the browser via HTTPS
- No server-side code needed

### Option 2: Alternative - Use Serverless Function (Not Needed)

If you really wanted to use serverless functions (which is NOT necessary for this project):

1. You'd need to create API routes
2. Move database logic to the backend
3. The frontend would call your API instead of Neon directly

**But this is overkill for this project!**

## 🔍 If You See Build Warnings

### "Module @neondatabase/serverless is not found"

**Solution**: Make sure the package is installed
```bash
bun install
```

### "Cannot resolve @neondatabase/serverless"

**Solution**: The package is installed correctly, this is just a warning. The build will work.

### Zeabur Says "Add to external"

**Solution**: Ignore this suggestion for static site deployments. The package needs to be bundled.

## ✅ Verify Your Build

Test the build locally:

```bash
bun run build
```

You should see:
```
 built in ~15s
```

The `dist/` folder should contain all bundled JavaScript including the Neon driver.

## 📊 Build Output

Your build should look like this:

```
dist/
  ├── index.html
  ├── assets/
  │   ├── index-[hash].js  ← Neon driver is bundled here!
  │   ├── index-[hash].css
  │   └── ... other chunks
  └── ... static assets
```

## 🆘 Troubleshooting

### Issue: "Database not connecting"

**Check:**
1. ✅ Environment variable `VITE_DATABASE_URL` is set in Zeabur
2. ✅ Neon database is accessible (test in Neon console)
3. ✅ Connection string includes `?sslmode=require`
4. ✅ Redeployed after adding environment variables

### Issue: "Build fails on Zeabur"

**Check:**
1. ✅ Build works locally: `bun run build`
2. ✅ No `build.rollupOptions.external` in `vite.config.ts`
3. ✅ `zeabur.json` has correct configuration
4. ✅ All dependencies in `package.json`

## 📚 Additional Resources

- [Neon Serverless Driver Docs](https://neon.tech/docs/serverless/serverless-driver)
- [Zeabur Static Site Docs](https://zeabur.com/docs/deploy/static)
- Project Deployment Guide: `ZEABUR_DEPLOYMENT.md`

## ✅ TL;DR

- ✅ Deploy as **static site**
- ✅ **DO NOT** add `rollupOptions.external`
- ✅ Neon driver works in browsers via HTTP
- ✅ All code is bundled into `dist/`
- ✅ Add environment variables in Zeabur dashboard
- ✅ Everything just works! 🎉
