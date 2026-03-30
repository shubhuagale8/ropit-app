# 🌿 Ropit — Nursery Owner App

## ⚠️ IMPORTANT — Read before running

This app uses @react-native-firebase which requires a **Development Build**.
It will NOT work with plain `npx expo start` + Expo Go.
You MUST run `npx expo prebuild` + Android Studio first.

---

## 🚀 Setup — Exact Steps

### Step 1 — Install dependencies
```
npm install
```

### Step 2 — Setup Firebase
1. Go to firebase.google.com → create project "ropit"
2. Add Android app → package name: com.ropit.nursery
3. Download google-services.json → paste it in the ropit/ root folder
4. Authentication → Sign-in method → Phone → Enable
5. (For testing) Authentication → Sign-in method → Phone
   → "Phone numbers for testing" → Add:
   Phone: +91 9999999999    Code: 123456

### Step 3 — Prebuild (generates android/ folder)
```
npx expo prebuild --platform android
```
This creates the android/ folder. Run it ONCE only.

### Step 4 — Run on Android via USB
```
npx expo run:android
```
Make sure:
- USB Debugging is ON on your phone
- Phone is connected via USB
- You accepted the "Trust this computer" popup on your phone

### Step 5 — After first build, for faster reload:
```
npx expo start
```
Then press 'a' — it will use your already-installed dev build.

---

## 📁 Key Files
- src/config/firebase.js   ← nothing to change (uses native SDK)
- google-services.json     ← YOU must add this from Firebase Console

---

## 🔧 Troubleshooting

| Error | Fix |
|-------|-----|
| `verify of null/undefined` | You ran with Expo Go. Use `expo run:android` instead |
| `google-services.json not found` | Download from Firebase Console and paste in root |
| `expo prebuild` fails | Run `npm install` first |
| Build takes long | Normal — first build is slow (5-10 min). Next builds are fast |

