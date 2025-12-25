# Fix "Invalid PEM formatted message" Error

This error occurs when the `FIREBASE_PRIVATE_KEY` in your `.env` file is not formatted correctly.

---

## ✅ Solution: Format Your Private Key Correctly

### Option 1: Using Double Quotes (Recommended)

In your `.env` file, wrap the private key in **double quotes** and use `\n` for newlines:

```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

### Option 2: Using Single Quotes

```env
FIREBASE_PRIVATE_KEY='-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n'
```

### Option 3: Multi-line Format (If your .env parser supports it)

Some `.env` parsers support multi-line values:

```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
-----END PRIVATE KEY-----"
```

---

## 🔍 How to Get Your Private Key

### From Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (⚙️ icon)
4. Click **Service accounts** tab
5. Click **Generate new private key**
6. Download the JSON file

### From serviceAccountKey.json:

If you have `serviceAccountKey.json`, extract the `private_key` field:

```json
{
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  "project_id": "..."
}
```

**Copy the entire `private_key` value** (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)

---

## 📝 Complete .env Example

```env
PORT=3000
NODE_ENV=development
USE_EMULATORS=false

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7vXJ8K9Q...\n-----END PRIVATE KEY-----\n"
FIREBASE_API_KEY=AIzaSyC1234567890abcdefghijklmnop
```

---

## ⚠️ Common Mistakes

### ❌ Wrong: Missing Quotes
```env
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...
```
**Problem:** Newlines won't be processed correctly

### ❌ Wrong: Missing \n
```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
```
**Problem:** All newlines are removed, key becomes one line

### ❌ Wrong: Extra Spaces
```env
FIREBASE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\n..."
```
**Problem:** Variable name has spaces (should be `FIREBASE_PRIVATE_KEY=`)

### ❌ Wrong: Missing BEGIN/END Markers
```env
FIREBASE_PRIVATE_KEY="MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC..."
```
**Problem:** Key must include `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`

---

## ✅ Correct Format Checklist

- [ ] Private key is wrapped in quotes (double or single)
- [ ] Uses `\n` for newlines (not actual line breaks)
- [ ] Includes `-----BEGIN PRIVATE KEY-----` at the start
- [ ] Includes `-----END PRIVATE KEY-----` at the end
- [ ] No extra spaces around the `=` sign
- [ ] Variable name is exactly `FIREBASE_PRIVATE_KEY`

---

## 🧪 Test Your Configuration

After updating your `.env` file:

1. **Restart your server:**
   ```bash
   npm run dev
   ```

2. **Look for this message:**
   ```
   ✅ Firebase Admin SDK initialized successfully
   ```

3. **If you still see errors:**
   - Check the error message - it will tell you what's wrong
   - Verify your `.env` file format matches the examples above
   - Make sure there are no hidden characters

---

## 🔧 Alternative: Use serviceAccountKey.json

If you're having trouble with the `.env` format, you can use the JSON file directly:

1. Place `serviceAccountKey.json` in your project root
2. Update `src/firebase.js` to read from the file instead

But using `.env` is recommended for production deployments.

---

**Still having issues?** Check the server console for the specific error message - it will indicate what's wrong with the private key format.

