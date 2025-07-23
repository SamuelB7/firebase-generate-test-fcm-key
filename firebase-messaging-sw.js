// Service Worker para Firebase Cloud Messaging
// Este arquivo deve estar na raiz do projeto para funcionar corretamente

importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

// Configuração do Firebase (será carregada dinamicamente)
let firebaseConfig = {};

// Função para carregar configuração do .env
async function loadFirebaseConfig() {
  try {
    const response = await fetch(".env");
    const text = await response.text();
    const config = {};

    text.split("\n").forEach((line) => {
      const [key, value] = line.split("=");
      if (key && value && !key.startsWith("#")) {
        config[key.trim()] = value.trim();
      }
    });

    return {
      apiKey: config.FIREBASE_API_KEY,
      authDomain: config.FIREBASE_AUTH_DOMAIN,
      projectId: config.FIREBASE_PROJECT_ID,
      storageBucket: config.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: config.FIREBASE_MESSAGING_SENDER_ID,
      appId: config.FIREBASE_APP_ID,
      measurementId: config.FIREBASE_MEASUREMENT_ID,
    };
  } catch (error) {
    console.error("Erro ao carregar configuração no Service Worker:", error);
    return null;
  }
}

// Inicializa o Firebase no Service Worker
loadFirebaseConfig()
  .then((config) => {
    if (config) {
      firebase.initializeApp(config);

      const messaging = firebase.messaging();

      // Manipula mensagens em background
      messaging.onBackgroundMessage((payload) => {
        console.log("Mensagem recebida em background:", payload);

        const notificationTitle =
          payload.notification?.title || "Nova mensagem";
        const notificationOptions = {
          body: payload.notification?.body || "Você recebeu uma nova mensagem",
          icon: payload.notification?.icon || "/icon-192x192.png",
          badge: "/badge-72x72.png",
          tag: "fcm-notification",
          data: payload.data,
          requireInteraction: true,
          actions: [
            {
              action: "open",
              title: "Abrir",
              icon: "/icon-192x192.png",
            },
            {
              action: "close",
              title: "Fechar",
            },
          ],
        };

        return self.registration.showNotification(
          notificationTitle,
          notificationOptions
        );
      });
    }
  })
  .catch((error) => {
    console.error("Erro ao inicializar Firebase no Service Worker:", error);
  });

// Manipula cliques nas notificações
self.addEventListener("notificationclick", (event) => {
  console.log("Clique na notificação:", event);

  event.notification.close();

  if (event.action === "open" || !event.action) {
    // Abre a aplicação quando a notificação é clicada
    event.waitUntil(
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clientList) => {
          // Se já existe uma janela aberta, foca nela
          for (const client of clientList) {
            if (client.url === self.location.origin && "focus" in client) {
              return client.focus();
            }
          }

          // Caso contrário, abre uma nova janela
          if (clients.openWindow) {
            return clients.openWindow(self.location.origin);
          }
        })
    );
  }
});

// Manipula instalação do Service Worker
self.addEventListener("install", (event) => {
  console.log("Service Worker instalado");
  self.skipWaiting();
});

// Manipula ativação do Service Worker
self.addEventListener("activate", (event) => {
  console.log("Service Worker ativado");
  event.waitUntil(self.clients.claim());
});
