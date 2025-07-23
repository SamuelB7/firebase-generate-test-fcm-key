# FCM Token Generator

A simple project to generate FCM (Firebase Cloud Messaging) tokens for testing push notifications.

## 📋 Prerequisites

1. **Configured Firebase project** with Cloud Messaging enabled
2. **VAPID keys** generated in the Firebase console
3. **Local HTTP server** to serve files (due to CORS restrictions)

## ⚙️ Configuration

### 1. Configure the `.env` file

Edit the `.env` file with your Firebase credentials:

```env
# Firebase configurations
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id

# VAPID key for Web Push
FIREBASE_VAPID_KEY=your_vapid_key_here
```

### 2. How to get Firebase credentials

1. Access the [Firebase Console](https://console.firebase.google.com/)
2. Select your project or create a new one
3. Go to **Project settings** (gear icon)
4. In the **General** tab, scroll to **Your apps** and click **Web**
5. Copy the configurations to the `.env` file

### 3. How to get the VAPID key

1. In the Firebase Console, go to **Project settings**
2. Click on the **Cloud Messaging** tab
3. In the **Web configuration** section, click **Generate key pair**
4. Copy the generated key to `FIREBASE_VAPID_KEY` in the `.env` file

## 🚀 How to use

### 1. Start a local HTTP server

Since the project uses ES6 modules and makes requests to local files, you need to serve the files through an HTTP server.

**Option 1: Python**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Option 2: Node.js (npx)**
```bash
npx http-server -p 8000
```

**Option 3: PHP**
```bash
php -S localhost:8000
```

### 2. Access the application

Open your browser and go to:
```
http://localhost:8000
```

### 3. Generate the FCM token

1. The page will load and automatically configure Firebase
2. Click the **"Generate FCM Token"** button
3. Accept the notification permission when prompted
4. The FCM token will be displayed on screen
5. Use the **"Copy"** button to copy the token

### 4. Test the notification system

1. **Local test**: Click the **"Test Notification Locally"** button to simulate a notification
2. **Real test**: Use the generated token with the examples in `NOTIFICATION_EXAMPLES.md`
3. **Visualize**: Notifications will appear as visual alerts and in the notifications panel
4. **Audio**: A sound will be played when a notification is received

## 🔧 Features

- ✅ Simple and intuitive interface
- ✅ Automatic loading of `.env` configurations
- ✅ Firebase credentials validation
- ✅ FCM token generation
- ✅ **Visual alerts** for received notifications
## 📱 Testing notifications

After generating the token, you can use it to test sending notifications:

### 🧪 Local Test
1. Click the **"Test Notification Locally"** button in the interface
2. Observe the visual alert, sound and entry in the notifications panel

### 🌐 Real Test
Consult the `NOTIFICATION_EXAMPLES.md` file for complete examples of how to send notifications via:

1. **Firebase Console** - Cloud Messaging
2. **cURL** - Via command line  
3. **Python** - Script for automation
4. **Node.js** - Firebase Admin SDK
5. **Postman** - Visual interface for testing

### Example payload for testing:

```json
{
    "to": "YOUR_FCM_TOKEN_HERE",
    "notification": {
        "title": "Test Notification",
        "body": "This is a test notification!",
        "icon": "/icon-192x192.png"
    },
    "data": {
        "custom_key": "custom_value"
    }
}
```

## 🐛 Troubleshooting

### Error: "Notification permission denied"
- Make sure to click "Allow" when the browser requests permission
- Check your browser's notification settings

### Error: "Could not generate FCM token"
- Check if all configurations in `.env` are correct
- Make sure Cloud Messaging is enabled in Firebase
- Verify if the VAPID key is correct

### Error: "Could not load .env file"
- Make sure you are serving files through an HTTP server
- Check if the `.env` file is in the project root

## 📂 Project structure

```
fcm-test-key/
├── index.html              # Main page
├── styles.css              # Interface styles
├── app.js                  # Main application logic
├── firebase-messaging-sw.js # Service Worker for FCM
├── .env                    # Firebase configurations
└── README.md               # This file
```

## 🔗 References

- [Firebase Cloud Messaging Web](https://firebase.google.com/docs/cloud-messaging/js/client)
- [Web Push Notifications](https://developer.chrome.com/blog/web-push-interop-wins)
- [VAPID for Server Identification](https://tools.ietf.org/html/draft-thomson-webpush-vapid-02)
