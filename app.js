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
const testButton = document.getElementById("testNotification");

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
  updateStatus("Error on configuring Firebase", "error");
}

// Mostra token
function showToken(token) {
  tokenContainer.style.display = "block";
  errorContainer.style.display = "none";
  tokenOutput.value = token;
  updateStatus("Token generated!", "success");
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
    updateStatus("Loading configs...", "loading");

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

    updateStatus("Loading Firebase SDK...", "loading");

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

    updateStatus("Firebase configured! Clique to generate token.", "ready");
    generateButton.disabled = false;

    // Configura listener para mensagens
    onMessage(messaging, (payload) => {
      console.log("Mensagem recebida em foreground:", payload);

      // Mostra alert visual na interface
      showNotificationAlert(payload);

      // Mostra notificação do navegador (se permitido)
      if (Notification.permission === "granted") {
        const notification = new Notification(
          payload.notification?.title || "Nova mensagem",
          {
            body:
              payload.notification?.body || "Você recebeu uma nova mensagem",
            icon: payload.notification?.icon || "/icon-192x192.png",
            tag: "fcm-foreground",
            requireInteraction: true,
          }
        );

        // Fecha a notificação automaticamente após 5 segundos
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      // Adiciona a notificação ao painel
      addNotificationToPanel(payload);
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
    updateStatus("Checking permissions for notifications...", "loading");

    // Solicita permissão para notificações
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      throw new Error(
        "Permissão para notificações negada. Permita notificações para gerar o token FCM."
      );
    }

    updateStatus("Generating token...", "loading");

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

// Funções para alertas visuais e painel de notificações
function showNotificationAlert(payload) {
  // Cria um alert visual na interface
  const alertDiv = document.createElement("div");
  alertDiv.className = "notification-alert";
  alertDiv.innerHTML = `
    <div class="alert-content">
      <div class="alert-icon">🔔</div>
      <div class="alert-text">
        <strong>${payload.notification?.title || "Nova Notificação"}</strong>
        <p>${payload.notification?.body || "Você recebeu uma nova mensagem"}</p>
      </div>
      <button class="alert-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;

  document.body.appendChild(alertDiv);

  // Reproduz som de notificação (opcional)
  playNotificationSound();

  // Remove automaticamente após 5 segundos
  setTimeout(() => {
    if (alertDiv.parentElement) {
      alertDiv.remove();
    }
  }, 5000);

  // Animação de entrada
  setTimeout(() => {
    alertDiv.classList.add("show");
  }, 10);
}

function addNotificationToPanel(payload) {
  // Verifica se o painel já existe, se não, cria
  let panel = document.getElementById("notificationPanel");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "notificationPanel";
    panel.className = "notification-panel";
    panel.innerHTML = `
      <div class="panel-header">
        <h3>📱 Notificações Recebidas</h3>
        <button onclick="clearNotificationPanel()" class="clear-btn">Limpar Tudo</button>
      </div>
      <div class="panel-content" id="panelContent">
        <p class="empty-message">Nenhuma notificação recebida ainda.</p>
      </div>
    `;

    // Adiciona o painel após o container de token
    const container = document.querySelector(".card");
    container.appendChild(panel);
  }

  const panelContent = document.getElementById("panelContent");
  const emptyMessage = panelContent.querySelector(".empty-message");

  // Remove mensagem vazia se existir
  if (emptyMessage) {
    emptyMessage.remove();
  }

  // Cria item de notificação
  const notificationItem = document.createElement("div");
  notificationItem.className = "notification-item";
  notificationItem.innerHTML = `
    <div class="notification-header">
      <strong>${payload.notification?.title || "Sem título"}</strong>
      <span class="notification-time">${new Date().toLocaleTimeString()}</span>
    </div>
    <div class="notification-body">
      ${payload.notification?.body || "Sem conteúdo"}
    </div>
    ${
      payload.data
        ? `
      <div class="notification-data">
        <small><strong>Dados extras:</strong> ${JSON.stringify(
          payload.data
        )}</small>
      </div>
    `
        : ""
    }
  `;

  // Adiciona no topo da lista
  panelContent.insertBefore(notificationItem, panelContent.firstChild);

  // Mostra o painel se estiver oculto
  panel.style.display = "block";

  // Animação para o novo item
  setTimeout(() => {
    notificationItem.classList.add("show");
  }, 10);
}

function clearNotificationPanel() {
  const panelContent = document.getElementById("panelContent");
  if (panelContent) {
    panelContent.innerHTML =
      '<p class="empty-message">Nenhuma notificação recebida ainda.</p>';
  }
}

function playNotificationSound() {
  // Cria um som simples usando Web Audio API
  try {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.3
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.log("Som de notificação não disponível:", error);
  }
}

// Função para testar notificação localmente
function testLocalNotification() {
  // Simula uma notificação recebida
  const mockPayload = {
    notification: {
      title: "🎉 Teste de Notificação",
      body: "Esta é uma notificação de teste para verificar se o sistema está funcionando corretamente!",
      icon: "/icon-192x192.png",
    },
    data: {
      test: "true",
      timestamp: Date.now().toString(),
      source: "local-test",
    },
  };

  console.log("Testando notificação local:", mockPayload);

  // Chama as mesmas funções que seriam chamadas quando uma notificação real é recebida
  showNotificationAlert(mockPayload);
  addNotificationToPanel(mockPayload);

  // Mostra também notificação do navegador se permitido
  if (Notification.permission === "granted") {
    const notification = new Notification(mockPayload.notification.title, {
      body: mockPayload.notification.body,
      icon: mockPayload.notification.icon,
      tag: "fcm-test",
      requireInteraction: true,
    });

    // Fecha a notificação automaticamente após 5 segundos
    setTimeout(() => {
      notification.close();
    }, 5000);
  }
}

// Event listeners
generateButton.addEventListener("click", generateFCMToken);
copyButton.addEventListener("click", copyToken);

// Adiciona listener para o botão de teste apenas quando ele existir (após gerar token)
document.addEventListener("click", (event) => {
  if (event.target.id === "testNotification") {
    testLocalNotification();
  }
});

// Inicializa quando a página carrega
document.addEventListener("DOMContentLoaded", () => {
  initializeFirebase();
});
