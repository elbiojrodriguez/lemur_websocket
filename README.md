# 🌀 lemur_websocket

Servidor WebSocket leve e eficiente, criado com Node.js e a biblioteca `ws`. Ele escuta conexões entre clientes em tempo real — perfeito para apps como **Lemur**, que se comunicam com páginas através de QR codes.

## 🚀 Funcionalidades

- Aceita múltiplas conexões WebSocket
- Reenvia mensagens recebidas para todos os clientes conectados
- Loga atividades no terminal (conexões, mensagens, desconexões)

## 🧪 Teste local

```bash
npm install
node server.js
