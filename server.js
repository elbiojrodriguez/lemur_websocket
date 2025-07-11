const WebSocket = require("ws");
const PORT = process.env.PORT || 10000;

const wss = new WebSocket.Server({ port: PORT });
console.log(`🚀 Servidor WebSocket ativo na porta ${PORT}`);

const conexoes = {
  owner: {},     // ID → [ws]
  visitante: {}, // ID → [ws]
  // Futuro: sensor, audio, etc.
};

// 🧠 Registro de conexão por tipo
function registrarConexao(tipo, id, ws) {
  if (!conexoes[tipo]) conexoes[tipo] = {};
  if (!conexoes[tipo][id]) conexoes[tipo][id] = [];
  conexoes[tipo][id].push(ws);
  logEvento(`✅ Conexão registrada: ${tipo} ➜ ${id}`);
}

// 📡 Envia mensagem para todos donos com ID
function enviarParaDonos(id, payload) {
  const donos = conexoes.owner[id] || [];
  donos.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    }
  });
}

// 🧼 Remove conexão encerrada
function limparConexao(ws) {
  for (const tipo in conexoes) {
    for (const id in conexoes[tipo]) {
      conexoes[tipo][id] = conexoes[tipo][id].filter(conn => conn !== ws);
      if (conexoes[tipo][id].length === 0) {
        delete conexoes[tipo][id];
        logEvento(`🔴 Removido ${tipo} ${id}`);
      }
    }
  }
}

// 📋 Logger central
function logEvento(texto) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${texto}`);
}

wss.on("connection", (ws) => {
  logEvento("🟢 Nova conexão WebSocket");

  ws.on("message", (msg) => {
    try {
      const dados = JSON.parse(msg);
      const { tipo, id, conteudo } = dados;

      logEvento(`📨 Mensagem recebida: ${tipo} ➜ ${id}`);

      if (["owner", "visitante"].includes(tipo)) {
        registrarConexao(tipo, id, ws);
      }

      if (tipo === "visitante") {
        // O visitante quer enviar algo ao dono correspondente
        enviarParaDonos(id, {
          tipo: "visitante",
          id,
          conteudo: conteudo || "cracha solicitado"
        });
        logEvento(`📤 Enviado para dono ➜ ${id}`);
      }

      // Futuro: lidar com tipo "sensor", "audio", etc.

    } catch (e) {
      logEvento(`❌ Erro ao processar mensagem: ${e.message}`);
    }
  });

  ws.on("close", () => {
    limparConexao(ws);
  });
});
