# Development Authentication Bypass

This document explains how authentication is bypassed during development.

## How It Works

The authentication system automatically detects development mode and bypasses all auth checks when:

1. `NODE_ENV` is set to `'development'` (default in Next.js dev mode)
2. `NEXT_PUBLIC_DEVELOPMENT_MODE` is set to `'true'`
3. `NEXT_PUBLIC_BYPASS_AUTH` is set to `'true'`

## What Happens in Development Mode

- **Mock User**: A development user is automatically created with:
  - ID: `dev-user-123`
  - Email: `dev@example.com`
  - Name: `Development User`
  - Role: `user`

- **No Auth Checks**: All authentication guards and checks are bypassed
- **No Supabase Calls**: No actual authentication API calls are made
- **Console Logging**: Development mode is logged to console for visibility

## Files Modified

- `app/contexts/AuthContext.tsx` - Added development mode detection and mock user
- `app/components/auth/AuthGuard.tsx` - Added development mode bypass for auth guards

## Environment Variables

To explicitly enable development mode bypass, you can set these environment variables:

```bash
# In your .env.local file (if you create one)
NEXT_PUBLIC_DEVELOPMENT_MODE=true
NEXT_PUBLIC_BYPASS_AUTH=true
```

## Production Safety

The bypass only works when explicitly enabled through environment variables or when `NODE_ENV=development`. In production builds, authentication will work normally.

## Testing

1. Start the development server: `npm run dev`
2. Navigate to any protected route (e.g., `/workspace`)
3. You should be automatically logged in as the development user
4. Check the browser console for the "🔧 Development mode: Bypassing authentication" message
