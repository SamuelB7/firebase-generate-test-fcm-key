# 🧪 Guia de Teste Completo

Este guia te ajudará a testar completamente o sistema de notificações FCM.

## ✅ Checklist de Configuração

### 1. Pré-requisitos
- [ ] Projeto Firebase criado
- [ ] Cloud Messaging habilitado no Firebase
- [ ] Chaves VAPID geradas
- [ ] Arquivo `.env` configurado corretamente
- [ ] Servidor HTTP local rodando

### 2. Teste da Interface
- [ ] Página carrega sem erros
- [ ] Status mostra "Firebase configurado!"
- [ ] Botão "Gerar Token FCM" está habilitado

### 3. Teste de Geração de Token
- [ ] Clique em "Gerar Token FCM"
- [ ] Permissão para notificações foi concedida
- [ ] Token FCM foi gerado e exibido
- [ ] Botão "Copiar" funciona
- [ ] Botão "Testar Notificação Localmente" apareceu

## 🎯 Testes de Notificação

### Teste 1: Notificação Local
1. **Ação**: Clique em "Testar Notificação Localmente"
2. **Resultado esperado**:
   - ✅ Alert visual aparece no canto superior direito
   - ✅ Som de notificação é reproduzido
   - ✅ Painel de notificações aparece com o teste
   - ✅ Notificação do navegador é exibida (se permitida)

### Teste 2: Notificação Real via cURL
```bash
# Substitua YOUR_SERVER_KEY e YOUR_FCM_TOKEN pelos valores reais
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "YOUR_FCM_TOKEN",
    "notification": {
      "title": "🔔 Teste Real",
      "body": "Esta notificação veio do seu servidor!",
      "icon": "/icon-192x192.png"
    },
    "data": {
      "source": "curl_test",
      "timestamp": "'$(date +%s)'"
    }
  }'
```

**Resultado esperado**:
- ✅ Mesmas reações do teste local
- ✅ Dados extras aparecem no painel

### Teste 3: Notificação em Background
1. **Ação**: Minimize ou mude de aba do navegador
2. **Envie uma notificação** (via cURL, Postman, etc.)
3. **Resultado esperado**:
   - ✅ Notificação aparece como notificação do sistema
   - ✅ Ao clicar, a aba/janela é focada
   - ✅ Notificação aparece no painel quando voltar à aba

## 🐛 Solução de Problemas

### ❌ "Erro ao carregar o arquivo .env"
**Solução**: Certifique-se de estar servindo os arquivos via HTTP, não abrindo diretamente no navegador.

### ❌ "Permissão para notificações negada"
**Solução**: 
1. Recarregue a página
2. Clique no ícone de cadeado na barra de endereços
3. Altere as permissões de notificação para "Permitir"

### ❌ "Não foi possível gerar o token FCM"
**Possíveis causas**:
- Chave VAPID incorreta
- Configurações do Firebase incorretas
- Cloud Messaging não habilitado

### ❌ "Service Worker não registrado"
**Solução**: 
1. Abra as ferramentas de desenvolvedor (F12)
2. Vá na aba "Application" > "Service Workers"
3. Verifique se o service worker está registrado

### ❌ Notificações não chegam
**Checklist**:
- [ ] Token FCM foi copiado corretamente
- [ ] Server Key do Firebase está correta
- [ ] Projeto Firebase tem Cloud Messaging habilitado
- [ ] URL está em HTTPS ou localhost

## 📊 Monitoramento

### Console do Navegador
Monitore as mensagens no console para debug:
```javascript
// Abra o console (F12) e procure por:
"Mensagem recebida em foreground:"
"Service Worker registrado:"
"Token FCM gerado:"
```

### Aba Network
Verifique se as requisições estão sendo feitas:
- Carregamento do `.env`
- Scripts do Firebase
- Registro do Service Worker

### Aba Application
Verifique:
- **Service Workers**: Se está registrado e ativo
- **Local Storage**: Se tem dados do Firebase
- **Notifications**: Permissões concedidas

## 🎉 Teste de Sucesso Completo

Se todos os itens abaixo funcionaram, seu sistema está 100% operacional:

1. ✅ **Geração de token**: Token FCM criado com sucesso
2. ✅ **Teste local**: Alert visual + som + painel atualizado
3. ✅ **Notificação real**: Recebida via API externa
4. ✅ **Background**: Notificações chegam com app minimizado
5. ✅ **Foreground**: Notificações chegam com app aberto
6. ✅ **Painel**: Histórico de notificações funcionando
7. ✅ **Service Worker**: Registrado e processando mensagens

## 📞 Próximos Passos

Agora você pode:
1. **Integrar com seu microsserviço** usando os exemplos em `NOTIFICATION_EXAMPLES.md`
2. **Personalizar as notificações** alterando títulos, ícones e dados
3. **Implementar ações customizadas** baseadas nos dados recebidos
4. **Adicionar analytics** para monitorar o engajamento
5. **Configurar diferentes tipos** de notificação para diferentes cenários

## 💡 Dicas Avançadas

### Teste Automatizado
Crie um script para testar automaticamente:
```bash
# teste_notificacao.sh
#!/bin/bash
SERVER_KEY="sua_server_key"
TOKEN="seu_token_fcm"

curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=$SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"to\": \"$TOKEN\",
    \"notification\": {
      \"title\": \"Teste Automatizado\",
      \"body\": \"Testando às $(date)\"
    }
  }"
```

### Teste de Carga
Para testar múltiplas notificações:
```bash
for i in {1..5}; do
  # Envie notificação
  sleep 2
done
```

### Monitoramento de Logs
Configure logs detalhados para produção:
```javascript
// No app.js, adicione logs personalizados
console.log('FCM Token:', token);
console.log('Notification received:', payload);
```
