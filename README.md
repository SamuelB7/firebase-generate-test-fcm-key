# FCM Token Generator

Um projeto simples para gerar tokens FCM (Firebase Cloud Messaging) para testar notificações push.

## 📋 Pré-requisitos

1. **Projeto Firebase configurado** com Cloud Messaging habilitado
2. **Chaves VAPID** geradas no console do Firebase
3. **Servidor HTTP local** para servir os arquivos (devido a restrições CORS)

## ⚙️ Configuração

### 1. Configure o arquivo `.env`

Edite o arquivo `.env` com suas credenciais do Firebase:

```env
# Configurações do Firebase
FIREBASE_API_KEY=sua_api_key_aqui
FIREBASE_AUTH_DOMAIN=seu_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=seu_project_id
FIREBASE_STORAGE_BUCKET=seu_project_id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
FIREBASE_APP_ID=seu_app_id
FIREBASE_MEASUREMENT_ID=seu_measurement_id

# Chave VAPID para Web Push
FIREBASE_VAPID_KEY=sua_vapid_key_aqui
```

### 2. Como obter as credenciais do Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione seu projeto ou crie um novo
3. Vá em **Configurações do projeto** (ícone de engrenagem)
4. Na aba **Geral**, role até **Seus aplicativos** e clique em **Web**
5. Copie as configurações para o arquivo `.env`

### 3. Como obter a chave VAPID

1. No Console do Firebase, vá em **Configurações do projeto**
2. Clique na aba **Cloud Messaging**
3. Na seção **Configuração da Web**, clique em **Gerar par de chaves**
4. Copie a chave gerada para `FIREBASE_VAPID_KEY` no arquivo `.env`

## 🚀 Como usar

### 1. Inicie um servidor HTTP local

Como o projeto usa módulos ES6 e faz requisições para arquivos locais, você precisa servir os arquivos através de um servidor HTTP.

**Opção 1: Python**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Opção 2: Node.js (npx)**
```bash
npx http-server -p 8000
```

**Opção 3: PHP**
```bash
php -S localhost:8000
```

### 2. Acesse a aplicação

Abra seu navegador e vá para:
```
http://localhost:8000
```

### 3. Gere o token FCM

1. A página irá carregar e configurar automaticamente o Firebase
2. Clique no botão **"Gerar Token FCM"**
3. Aceite a permissão para notificações quando solicitado
4. O token FCM será exibido na tela
5. Use o botão **"Copiar"** para copiar o token

### 4. Teste o sistema de notificações

1. **Teste local**: Clique no botão **"Testar Notificação Localmente"** para simular uma notificação
2. **Teste real**: Use o token gerado com os exemplos em `NOTIFICATION_EXAMPLES.md`
3. **Visualize**: As notificações aparecerão como alertas visuais e no painel de notificações
4. **Áudio**: Um som será reproduzido quando uma notificação é recebida

## 🔧 Funcionalidades

- ✅ Interface simples e intuitiva
- ✅ Carregamento automático das configurações do `.env`
- ✅ Validação das credenciais do Firebase
- ✅ Geração de tokens FCM
- ✅ **Alertas visuais** para notificações recebidas
## 📱 Testando notificações

Após gerar o token, você pode usá-lo para testar o envio de notificações:

### 🧪 Teste Local
1. Clique no botão **"Testar Notificação Localmente"** na interface
2. Observe o alert visual, som e entrada no painel de notificações

### 🌐 Teste Real
Consulte o arquivo `NOTIFICATION_EXAMPLES.md` para exemplos completos de como enviar notificações via:

1. **Console do Firebase** - Cloud Messaging
2. **cURL** - Via linha de comando  
3. **Python** - Script para automação
4. **Node.js** - SDK Admin do Firebase
5. **Postman** - Interface visual para testes

### Exemplo de payload para teste:

```json
{
    "to": "SEU_TOKEN_FCM_AQUI",
    "notification": {
        "title": "Teste de Notificação",
        "body": "Esta é uma notificação de teste!",
        "icon": "/icon-192x192.png"
    },
    "data": {
        "custom_key": "custom_value"
    }
}
```

## 🐛 Solução de problemas

### Erro: "Permissão para notificações negada"
- Certifique-se de clicar em "Permitir" quando o navegador solicitar permissão
- Verifique as configurações de notificação do seu navegador

### Erro: "Não foi possível gerar o token FCM"
- Verifique se todas as configurações no `.env` estão corretas
- Certifique-se de que o Cloud Messaging está habilitado no Firebase
- Verifique se a chave VAPID está correta

### Erro: "Não foi possível carregar o arquivo .env"
- Certifique-se de estar servindo os arquivos através de um servidor HTTP
- Verifique se o arquivo `.env` está na raiz do projeto

## 📂 Estrutura do projeto

```
fcm-test-key/
├── index.html              # Página principal
├── styles.css              # Estilos da interface
├── app.js                  # Lógica principal da aplicação
├── firebase-messaging-sw.js # Service Worker para FCM
├── .env                    # Configurações do Firebase
└── README.md               # Este arquivo
```

## 🔗 Referências

- [Firebase Cloud Messaging Web](https://firebase.google.com/docs/cloud-messaging/js/client)
- [Web Push Notifications](https://developer.chrome.com/blog/web-push-interop-wins)
- [VAPID for Server Identification](https://tools.ietf.org/html/draft-thomson-webpush-vapid-02)
