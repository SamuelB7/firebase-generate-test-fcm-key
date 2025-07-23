// Carrega as configurações do .env
async function loadConfig() {
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

    return config;
  } catch (error) {
    console.error("Erro ao carregar configurações:", error);
    return null;
  }
}

// Configuração do Firebase
let firebaseConfig = {};
let app = null;
let messaging = null;

// Elementos DOM
const statusElement = document.getElementById("status");
const generateButton = document.getElementById("generateToken");
const loaderElement = document.getElementById("loader");
const tokenContainer = document.getElementById("tokenContainer");
const tokenOutput = document.getElementById("tokenOutput");
const copyButton = document.getElementById("copyToken");
const errorContainer = document.getElementById("errorContainer");
const errorMessage = document.getElementById("errorMessage");

// Atualiza o status
function updateStatus(message, type = "loading") {
  statusElement.className = `status ${type}`;
  statusElement.querySelector(".status-text").textContent = message;
}

// Mostra erro
function showError(message) {
  errorContainer.style.display = "block";
  tokenContainer.style.display = "none";
  errorMessage.textContent = message;
  updateStatus("Erro ao configurar Firebase", "error");
}

// Mostra token
function showToken(token) {
  tokenContainer.style.display = "block";
  errorContainer.style.display = "none";
  tokenOutput.value = token;
  updateStatus("Token gerado com sucesso!", "success");
}

// Configura o loading do botão
function setButtonLoading(loading) {
  if (loading) {
    generateButton.classList.add("loading");
    generateButton.disabled = true;
  } else {
    generateButton.classList.remove("loading");
    generateButton.disabled = false;
  }
}

// Inicializa o Firebase
async function initializeFirebase() {
  try {
    updateStatus("Carregando configurações...", "loading");

    const config = await loadConfig();
    if (!config) {
      throw new Error("Não foi possível carregar o arquivo .env");
    }

    // Verifica se todas as configurações necessárias estão presentes
    const requiredKeys = [
      "FIREBASE_API_KEY",
      "FIREBASE_AUTH_DOMAIN",
      "FIREBASE_PROJECT_ID",
      "FIREBASE_STORAGE_BUCKET",
      "FIREBASE_MESSAGING_SENDER_ID",
      "FIREBASE_APP_ID",
      "FIREBASE_VAPID_KEY",
    ];

    const missingKeys = requiredKeys.filter(
      (key) =>
        !config[key] ||
        config[key] ===
          "your_" + key.toLowerCase().replace("firebase_", "") + "_here"
    );

    if (missingKeys.length > 0) {
      throw new Error(
        `Configure as seguintes variáveis no arquivo .env: ${missingKeys.join(
          ", "
        )}`
      );
    }

    firebaseConfig = {
      apiKey: config.FIREBASE_API_KEY,
      authDomain: config.FIREBASE_AUTH_DOMAIN,
      projectId: config.FIREBASE_PROJECT_ID,
      storageBucket: config.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: config.FIREBASE_MESSAGING_SENDER_ID,
      appId: config.FIREBASE_APP_ID,
      measurementId: config.FIREBASE_MEASUREMENT_ID,
    };

    updateStatus("Carregando Firebase SDK...", "loading");

    // Importa o Firebase
    const { initializeApp } = await import(
      "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
    );
    const { getMessaging, getToken, onMessage } = await import(
      "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js"
    );

    // Inicializa o Firebase
    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);

    // Verifica se o service worker está disponível
    if ("serviceWorker" in navigator) {
      // Registra o service worker para FCM
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );
      console.log("Service Worker registrado:", registration);
    }

    updateStatus("Firebase configurado! Clique para gerar token.", "ready");
    generateButton.disabled = false;

    // Configura listener para mensagens
    onMessage(messaging, (payload) => {
      console.log("Mensagem recebida em foreground:", payload);

      // Mostra notificação personalizada
      if (Notification.permission === "granted") {
        new Notification(payload.notification?.title || "Nova mensagem", {
          body: payload.notification?.body || "Você recebeu uma nova mensagem",
          icon: payload.notification?.icon || "/icon-192x192.png",
        });
      }
    });

    return { getToken, onMessage };
  } catch (error) {
    console.error("Erro ao inicializar Firebase:", error);
    showError(error.message);
    return null;
  }
}

// Gera o token FCM
async function generateFCMToken() {
  try {
    setButtonLoading(true);
    updateStatus("Solicitando permissão para notificações...", "loading");

    // Solicita permissão para notificações
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      throw new Error(
        "Permissão para notificações negada. Permita notificações para gerar o token FCM."
      );
    }

    updateStatus("Gerando token FCM...", "loading");

    // Importa getToken dinamicamente
    const { getToken } = await import(
      "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js"
    );

    // Obtém o token FCM
    const config = await loadConfig();
    const token = await getToken(messaging, {
      vapidKey: config.FIREBASE_VAPID_KEY,
    });

    if (token) {
      console.log("Token FCM gerado:", token);
      showToken(token);
    } else {
      throw new Error(
        "Não foi possível gerar o token FCM. Verifique as configurações do Firebase."
      );
    }
  } catch (error) {
    console.error("Erro ao gerar token:", error);
    showError(error.message);
  } finally {
    setButtonLoading(false);
  }
}

// Copia o token para área de transferência
async function copyToken() {
  try {
    await navigator.clipboard.writeText(tokenOutput.value);

    const originalText = copyButton.textContent;
    copyButton.textContent = "✅ Copiado!";
    copyButton.classList.add("copied");

    setTimeout(() => {
      copyButton.textContent = originalText;
      copyButton.classList.remove("copied");
    }, 2000);
  } catch (error) {
    console.error("Erro ao copiar token:", error);

    // Fallback para browsers mais antigos
    tokenOutput.select();
    document.execCommand("copy");

    const originalText = copyButton.textContent;
    copyButton.textContent = "✅ Copiado!";
    copyButton.classList.add("copied");

    setTimeout(() => {
      copyButton.textContent = originalText;
      copyButton.classList.remove("copied");
    }, 2000);
  }
}

// Event listeners
generateButton.addEventListener("click", generateFCMToken);
copyButton.addEventListener("click", copyToken);

// Inicializa quando a página carrega
document.addEventListener("DOMContentLoaded", () => {
  initializeFirebase();
});
