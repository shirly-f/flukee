# פריסת אפליקציית Mobile (מתאמנים) / Mobile App Deployment

מדריך להעלאת אפליקציית Flukee למתאמנים ולשיתוף עם בודקים.

---

## דרישות מקדימות

- **Backend** מועלה ל-Render (או שרת אחר) – כתובת לדוגמה: `https://flukee-backend.onrender.com`
- **Node.js 18+** מותקן

---

## אפשרות א': Expo Go (טלפון)

מתאים לבדיקה בטלפון עם אפליקציית Expo Go.

### שלב 1: הגדרת כתובת ה-Backend

צרי קובץ `.env` בתיקיית `mobile`:

```bash
cd mobile
```

תוכן הקובץ:

```
FLUKEE_API_BASE_URL=https://flukee-backend.onrender.com
```

(הַחליפי בכתובת ה-API שלך מ-Render.)

### שלב 2: התקנה והפעלה

```bash
npm install
npx expo start
```

### שלב 3: שיתוף עם בודק

- יופיע **QR code** בטרמינל
- הבודק מוריד **Expo Go** (Android / iOS) וסורק את ה-QR
- או: לחצי `s` בטרמינל ושלחי את הקישור

### כניסה לאפליקציה

- **מייל:** `trainee@test.com`
- **סיסמה:** `password`

---

## אפשרות ב': אפליקציה בדפדפן (Web)

מתאים לבודקים שלא רוצים להתקין אפליקציה – פתיחה בקישור.

### שלב 1: הגדרת .env (כמו באפשרות א')

```
FLUKEE_API_BASE_URL=https://flukee-backend.onrender.com
```

### שלב 2: בניית גרסת Web

```bash
cd mobile
npm install
npm run build:web
```

זה יוצר תיקיית `dist` עם הקבצים המוכנים להעלאה. (הרצה רק מהמחשב המקומי.)

### שלב 3: העלאה ל-Netlify

1. **Netlify** → **Add new site** → **Deploy manually**
2. גרור את תיקיית `mobile/dist` לאזור ה-Drag & Drop
3. או: **Sites** → **Import from Git** והגדרות:
   - **Base directory:** `mobile`
   - **Build command:** `npm run build:web`
   - **Publish directory:** `mobile/dist`
   - **Environment variable:** `FLUKEE_API_BASE_URL` = כתובת ה-Backend

לאחר ההעלאה תקבלי קישור לאפליקציה (למשל `https://flukee-mobile.netlify.app`).

---

## אפשרות ג': APK לאנדרואיד (התקנה ישירה)

לבניית קובץ APK להתקנה ישירה על אנדרואיד.

### דרישות

- חשבון Expo (חינמי)
- התקנה: `npm install -g eas-cli`

### שלב 1: התחברות

```bash
eas login
```

### שלב 2: הגדרת הפרויקט

```bash
cd mobile
eas build:configure
```

### שלב 3: בניית APK

```bash
FLUKEE_API_BASE_URL=https://flukee-backend.onrender.com eas build -p android --profile preview
```

(תחליפי `preview` ב-`production` אם צריך פרופיל אחר.)

### שלב 4: הורדה ושיתוף

- אחרי סיום הבנייה תקבלי קישור להורדת APK
- שלחי את הקישור לבודק – הוא מוריד ומתקין

---

## סיכום – איזו אפשרות לבחור

| אפשרות    | יתרונות                    | חסרונות                    |
|-----------|----------------------------|-----------------------------|
| Expo Go   | התקנה קלה, מהירה לבדיקה   | צריך להתקין Expo Go         |
| Web       | פתיחה ישירה בדפדפן        | חוויית שימוש פחות טובה בטלפון |
| APK       | התקנה רגילה של אפליקציה   | בנייה ממושכת יותר           |

לסקירת עבודה – **Expo Go** או **Web** לרוב מספיקים.
