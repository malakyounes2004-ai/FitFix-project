# Setup .env File with Your Firebase Credentials

Your Firebase credentials have been extracted and formatted correctly. Follow these steps:

## Step 1: Create .env File

Create a file named `.env` in your project root directory (same folder as `package.json`).

## Step 2: Copy This Content

Copy and paste this into your `.env` file:

```env
# FitFix Backend Environment Variables

# Server Configuration
PORT=3000
NODE_ENV=development

# Firebase Configuration
USE_EMULATORS=false

# Firebase Admin SDK Credentials
FIREBASE_PROJECT_ID=fitfix-database
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@fitfix-database.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCsuoB7kCUO63ti\n7S+NBf30cyiRIdZCuxT5pcS0vgvPwMpmXq2ZXYzNaP+qOxSybn9tHazmA1s2+j1W\nCbhV9RZcM9TCYq1eHKx3zHfK7wynwBDTIPqkN+6e3vwimBtVXo/e5n87NmAWQGTZ\nHYRtV0v0nfcWkW6qPSprz8rC2zZWdPp5Pg+pQWk0OcnAlIEGVHp/1yFwHCXxqwlB\nCAdl38UU24GljzLo1yJQ44KsmQ4pfvV3cv1EcPsFtSZXd/v7AWv2hC2qptGZwQ+z\n/cBYT/84XS4/AgkRMvyJQFwV7L17PnPs9Jb2L+k3HpCqKecXthOe1yhkID6hJibi\nX3VdTsXLAgMBAAECgf8i+PVgD09xizxFoMB/9+FIyAhEBRXcwlmnh74hhQPfN1Ru\nZb0V0Fsx5pCIEcOfB8Bv12eqgAN384giY4AZ51sfpV7up2Fy11tpkNIFxLZLQMLR\n/LDC5JBBRTodHFnBxI5cvflaLn2bWRkSMhJzZmQlTdaO5eNXlLWCHrsZuPNyODyT\nPOmpHuC/RoaUmb8X6t58VEwwmFbP1K63UIuaIfHL53MG4Eil67dV3AIXNz6iPkuh\nv5YkOPJtFg0BBgiTt+b58croA02t99/aZsXhihhW6AncNYfqbSdkHM6bRe64lNfc\nlsagjjSlYCL+KqRsnnwmY4bc7IcWuZBP7vCBMjECgYEA8HLsEXWKnMYNo43/vN5o\neCqAp3SJxZqjv2Z1eiIOsGhebzicLC4xX227SufVH/+VAu1znDm0ngQ4BZajAVt4\n1I1+p9hwm7m21UXF/yJS3vqWBOVFEx/hHYrN1gE6aZDhiXPPzrUMIInGk+Pj4+7i\noXC+af12iJU8xwbVHNdixzsCgYEAt+ZX0JtEMK9EUbZ8GnOqV5it+kzFRNAEBh+7\nPdSiwRADrYTcFxKJnwzDvjBQreC2cEZIYmiyDG0odRe3+8XNA+17jSSqD+H9nUSF\nVM5gBazlZcUrzP3gwXBfb5jT4llrale6vU8knA4TF8Pz2mBVIQFyatetiy4PTzYZ\n+iq0srECgYEAokLLb9TEX5t/pLm0tP3Zvg3gmCCawJDko8s+x9an1v/3ilLHgUEC\n7IUeeSQNvPQ62Kjo9aozatcp/wtyoP3bgoShzh7Pjyc6bJ4TSWMeTX8JMfCONqOy\nxL7gvORDSO4OZTWULMgckPCo4zBMn4qbwZpVxSzYir87Low70KTA8fUCgYAUlFxj\nZdy9rf9xPYCp3SPE5bsidZDl4Hlyzf5ALxl/jXE769BNbK+l8uG82N9OdgU0j0ju\nalTyewy5/cuDC2Gj/OGErAOz/1BIVzCsiuPH/s81ElmSeR67xv2HGY0smWEh52to\nYADyzchpMm6Jk5ozNVw+hKBRIPhpnt5NVpYeIQKBgQDQ2XD/8qxd4rJlsnlvYtJj\nFop6hYnldPzEeEt8P7IJ2LAFJ+CM2enQX15p6RZnPx7NgcjgtUfoVOBUbBngtDwH\n8TY8zLLy2OfBAK9HvST0NTsNNbZEJ+pZ6sMtlXCx/LlkmyC3lyUkOvUso2DJmRW7\nFGhF6bq4JDSQKq1v94qJ8Q==\n-----END PRIVATE KEY-----\n"

# Firebase Web API Key (required for login endpoint)
# Get this from: Firebase Console > Project Settings > General > Web API Key
# FIREBASE_API_KEY=your_firebase_web_api_key_here
```

## Step 3: Add Your Firebase Web API Key

You still need to add your Firebase Web API Key for the login endpoint to work:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **fitfix-database** project
3. Click ⚙️ **Settings** → **Project settings**
4. Go to **General** tab
5. Scroll to **Your apps** section
6. If you don't have a web app, click **Add app** → Select **Web** (</>)
7. Copy the **Web API Key** (starts with `AIzaSy...`)
8. Add it to your `.env` file:
   ```env
   FIREBASE_API_KEY=AIzaSyC1234567890abcdefghijklmnop
   ```

## Step 4: Restart Your Server

```bash
npm run dev
```

You should see:
```
✅ Firebase Admin SDK initialized successfully
   Project ID: fitfix-database
🚀 FitFix API Server running on port 3000
```

## ✅ Verification

If you see the success message above, your Firebase credentials are configured correctly!

---

## Important Notes

1. **Never commit `.env` file to Git** - It contains sensitive credentials
2. **Keep your private key secure** - Don't share it publicly
3. **The private key is already formatted correctly** - It includes `\n` for newlines and is wrapped in quotes

---

## Troubleshooting

### Still getting "Invalid PEM formatted message" error?

1. Make sure the private key is wrapped in **double quotes** `"`
2. Make sure there are no extra spaces around the `=` sign
3. Make sure the private key includes `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
4. Restart your server after making changes

### Need to verify your credentials?

Run:
```bash
npm run test-connection
```

This will test your Firebase connection and show any errors.

