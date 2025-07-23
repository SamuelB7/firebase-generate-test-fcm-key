# Exemplo de Envio de Notificação FCM

Este arquivo demonstra como enviar notificações FCM para o token gerado.

## 🚀 Envio via cURL

Substitua `YOUR_SERVER_KEY` pela sua chave do servidor Firebase e `YOUR_FCM_TOKEN` pelo token gerado:

```bash
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "YOUR_FCM_TOKEN",
    "notification": {
      "title": "Notification test",
      "body": "This is a test notification!",
      "icon": "/icon-192x192.png",
      "click_action": "https://seu-site.com"
    },
    "data": {
      "custom_key": "custom_value",
      "action": "open_app",
      "timestamp": "' + Date.now() + '"
    }
  }'
```

## 🐍 Envio via Python

```python
import requests
import json

def send_fcm_notification(server_key, token, title, body, data=None):
    url = "https://fcm.googleapis.com/fcm/send"
    
    headers = {
        "Authorization": f"key={server_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "to": token,
        "notification": {
            "title": title,
            "body": body,
            "icon": "/icon-192x192.png"
        }
    }
    
    if data:
        payload["data"] = data
    
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    return response.json()

# Exemplo de uso
server_key = "YOUR_SERVER_KEY"
fcm_token = "YOUR_FCM_TOKEN"

result = send_fcm_notification(
    server_key=server_key,
    token=fcm_token,
    title="🎉 Notificação de Teste",
    body="Sua aplicação está funcionando perfeitamente!",
    data={
        "action": "test",
        "timestamp": str(int(time.time()))
    }
)

print(result)
```

## 📦 Envio via Node.js

```javascript
const admin = require('firebase-admin');

// Inicializa o SDK Admin do Firebase
const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function sendNotification(token, title, body, data = {}) {
  const message = {
    notification: {
      title: title,
      body: body
    },
    data: data,
    token: token
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Notificação enviada com sucesso:', response);
    return response;
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    throw error;
  }
}

// Exemplo de uso
sendNotification(
  'YOUR_FCM_TOKEN',
  '🔔 Nova Mensagem',
  'Você tem uma nova notificação!',
  {
    action: 'open',
    url: 'https://exemplo.com'
  }
);
```

## 🌐 Envio via Postman

### Método: POST
### URL: `https://fcm.googleapis.com/fcm/send`

### Headers:
```
Authorization: key=YOUR_SERVER_KEY
Content-Type: application/json
```

### Body (JSON):
```json
{
  "to": "YOUR_FCM_TOKEN",
  "notification": {
    "title": "Teste via Postman",
    "body": "Esta notificação foi enviada via Postman!",
    "icon": "/icon-192x192.png"
  },
  "data": {
    "source": "postman",
    "test": "true"
  }
}
```

## 🔑 Como obter a Server Key

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Configurações do projeto** (ícone de engrenagem)
4. Clique na aba **Cloud Messaging**
5. Copie a **Chave do servidor** (Server Key)

## 📱 Tipos de Notificação

### Notificação Simples
```json
{
  "to": "TOKEN",
  "notification": {
    "title": "Título",
    "body": "Mensagem"
  }
}
```

### Notificação com Dados Customizados
```json
{
  "to": "TOKEN",
  "notification": {
    "title": "Título",
    "body": "Mensagem"
  },
  "data": {
    "key1": "value1",
    "key2": "value2"
  }
}
```

### Notificação Silenciosa (Apenas Dados)
```json
{
  "to": "TOKEN",
  "data": {
    "message": "Dados sem notificação visual",
    "action": "background_sync"
  }
}
```

## 🎯 Testando a Implementação

1. **Gere o token FCM** usando a interface web
2. **Copie o token** gerado
3. **Use um dos métodos acima** para enviar uma notificação
4. **Verifique se a notificação é recebida** tanto em foreground quanto background
5. **Teste o painel de notificações** na interface

## ⚠️ Pontos Importantes

- As notificações só funcionam em **HTTPS** ou **localhost**
- O **Service Worker** deve estar registrado corretamente
- As **permissões de notificação** devem estar concedidas
- A **chave VAPID** deve estar configurada corretamente
- O **Firebase Cloud Messaging** deve estar habilitado no projeto
