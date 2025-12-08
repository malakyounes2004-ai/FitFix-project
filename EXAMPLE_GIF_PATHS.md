# 📝 Example GIF Paths for Exercises

## Quick Reference for Employees

When adding exercises, use these example paths as templates for **both MALE and FEMALE** users:

---

## ✅ Correct Format

**Male:**
```
gs://fitfix-database.firebasestorage.app/exercises/male/EXERCISE_NAME/BODY_TYPE.gif
```

**Female:**
```
gs://fitfix-database.firebasestorage.app/exercises/female/EXERCISE_NAME/BODY_TYPE.gif
```

---

## 📋 Example Paths

### Push-ups (Male)
```
gs://fitfix-database.firebasestorage.app/exercises/male/pushups/skinny.gif
gs://fitfix-database.firebasestorage.app/exercises/male/pushups/normal.gif
gs://fitfix-database.firebasestorage.app/exercises/male/pushups/fat.gif
gs://fitfix-database.firebasestorage.app/exercises/male/pushups/teen.gif
gs://fitfix-database.firebasestorage.app/exercises/male/pushups/senior.gif
```

### Push-ups (Female)
```
gs://fitfix-database.firebasestorage.app/exercises/female/pushups/skinny.gif
gs://fitfix-database.firebasestorage.app/exercises/female/pushups/normal.gif
gs://fitfix-database.firebasestorage.app/exercises/female/pushups/fat.gif
gs://fitfix-database.firebasestorage.app/exercises/female/pushups/teen.gif
gs://fitfix-database.firebasestorage.app/exercises/female/pushups/senior.gif
```

### Squats (Male)
```
gs://fitfix-database.firebasestorage.app/exercises/male/squats/skinny.gif
gs://fitfix-database.firebasestorage.app/exercises/male/squats/normal.gif
gs://fitfix-database.firebasestorage.app/exercises/male/squats/fat.gif
gs://fitfix-database.firebasestorage.app/exercises/male/squats/teen.gif
gs://fitfix-database.firebasestorage.app/exercises/male/squats/senior.gif
```

### Squats (Female)
```
gs://fitfix-database.firebasestorage.app/exercises/female/squats/skinny.gif
gs://fitfix-database.firebasestorage.app/exercises/female/squats/normal.gif
gs://fitfix-database.firebasestorage.app/exercises/female/squats/fat.gif
gs://fitfix-database.firebasestorage.app/exercises/female/squats/teen.gif
gs://fitfix-database.firebasestorage.app/exercises/female/squats/senior.gif
```

### Lunges (Female-specific)
```
gs://fitfix-database.firebasestorage.app/exercises/female/lunges/skinny.gif
gs://fitfix-database.firebasestorage.app/exercises/female/lunges/normal.gif
gs://fitfix-database.firebasestorage.app/exercises/female/lunges/fat.gif
gs://fitfix-database.firebasestorage.app/exercises/female/lunges/teen.gif
gs://fitfix-database.firebasestorage.app/exercises/female/lunges/senior.gif
```

### Bench Press (Male-specific)
```
gs://fitfix-database.firebasestorage.app/exercises/male/bench-press/skinny.gif
gs://fitfix-database.firebasestorage.app/exercises/male/bench-press/normal.gif
gs://fitfix-database.firebasestorage.app/exercises/male/bench-press/fat.gif
gs://fitfix-database.firebasestorage.app/exercises/male/bench-press/teen.gif
gs://fitfix-database.firebasestorage.app/exercises/male/bench-press/senior.gif
```

### Deadlifts
```
gs://fitfix-database.firebasestorage.app/exercises/male/deadlifts/skinny.gif
gs://fitfix-database.firebasestorage.app/exercises/male/deadlifts/normal.gif
gs://fitfix-database.firebasestorage.app/exercises/male/deadlifts/fat.gif
gs://fitfix-database.firebasestorage.app/exercises/male/deadlifts/teen.gif
gs://fitfix-database.firebasestorage.app/exercises/male/deadlifts/senior.gif
```

### Bicep Curls
```
gs://fitfix-database.firebasestorage.app/exercises/male/bicep-curls/skinny.gif
gs://fitfix-database.firebasestorage.app/exercises/male/bicep-curls/normal.gif
gs://fitfix-database.firebasestorage.app/exercises/male/bicep-curls/fat.gif
gs://fitfix-database.firebasestorage.app/exercises/male/bicep-curls/teen.gif
gs://fitfix-database.firebasestorage.app/exercises/male/bicep-curls/senior.gif
```

---

## 🎯 Body Type Options

| Body Type | When to Use |
|-----------|-------------|
| `skinny` | Lean/ectomorph users |
| `normal` | Average/mesomorph users (DEFAULT) |
| `fat` | Overweight/endomorph users |
| `teen` | Users under 16 years old |
| `senior` | Users over 55 years old |

## 👫 Gender Options

| Gender | Path Pattern |
|--------|-------------|
| `male` | `exercises/male/EXERCISE_NAME/...` |
| `female` | `exercises/female/EXERCISE_NAME/...` |

**Note:** You can create exercises with:
- Only male GIFs
- Only female GIFs
- Both male and female GIFs
- The system handles all scenarios automatically!

---

## 💡 Tips

1. **Use lowercase** for exercise names
2. **Use hyphens** instead of spaces (e.g., `bench-press` not `bench press`)
3. **Start with `normal.gif`** - it's the default fallback
4. **Test the path** before saving - the system will show you a live preview!
5. **Age takes priority** - teen/senior GIFs override body type selections

---

## 🔍 How to Find Your GIF Path

### Method 1: Firebase Console
1. Go to Firebase Console → Storage
2. Navigate to your GIF file
3. Click the file
4. Look for "gs://" path in the details
5. Copy and paste it

### Method 2: Upload Tool
1. Use Firebase Storage browser
2. Right-click your GIF
3. Select "Copy gs:// URI"
4. Paste into the GIF Path field

---

## ❌ Common Mistakes

### Wrong:
```
// Missing gs:// prefix
fitfix-database.firebasestorage.app/exercises/male/pushups/normal.gif

// Using http:// instead of gs://
http://firebasestorage.googleapis.com/...

// Spaces in filename
gs://fitfix-database.firebasestorage.app/exercises/male/bench press/normal.gif

// Wrong file extension
gs://fitfix-database.firebasestorage.app/exercises/male/pushups/normal.mp4
```

### Right:
```
gs://fitfix-database.firebasestorage.app/exercises/male/pushups/normal.gif
```

---

## 🎬 Quick Start

### For Male Exercises:
1. Open "Exercises Library"
2. Click "Add Exercise"
3. Fill in exercise details
4. In "Exercise GIF" field, paste:
   ```
   gs://fitfix-database.firebasestorage.app/exercises/male/EXERCISE_NAME/normal.gif
   ```
5. Replace `EXERCISE_NAME` with your exercise (lowercase, hyphens)
6. Wait for preview to load
7. If preview shows ✅ → Click "Add Exercise"
8. If preview shows ❌ → Check your path!

### For Female Exercises:
1. Same steps as above
2. But use **female** in the path:
   ```
   gs://fitfix-database.firebasestorage.app/exercises/female/EXERCISE_NAME/normal.gif
   ```
3. Example:
   ```
   gs://fitfix-database.firebasestorage.app/exercises/female/squats/normal.gif
   ```

---

## 🚀 Need Help?

**Error**: "GIF file not found"
- Check if the file exists in Firebase Storage
- Verify bucket name is correct
- Ensure path is spelled correctly

**Error**: "Path must start with gs://"
- Add `gs://` at the beginning

**Error**: "Path must point to a .gif file"
- Ensure file ends with `.gif`
- Don't use `.mp4`, `.png`, or other formats

---

**Happy exercising!** 💪

