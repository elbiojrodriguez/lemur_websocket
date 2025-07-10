const WebSocket = require("ws");
const PORT = process.env.PORT || 10000;

const wss = new WebSocket.Server({ port: PORT });
console.log(`🚀 Servidor WebSocket ativo na porta ${PORT}`);

const donos = {}; // ID do dono → conexão WebSocket

wss.on("connection", (ws) => {
  console.log("🟢 Nova conexão WebSocket");

  ws.on("message", (msg) => {
    const texto = msg.toString();
    console.log(`📨 Mensagem recebida: ${texto}`);

    const [tipo, id, payload] = texto.split(":");

    if (tipo === "owner") {
      donos[id] = ws;
      console.log(`✅ Dono registrado com ID: ${id}`);
    }

    if (tipo === "visitante") {
      const donoWs = donos[id];
      if (donoWs && donoWs.readyState === WebSocket.OPEN) {
        donoWs.send(`visitante:${id}`);
        console.log(`📤 Enviado para dono: visitante:${id}`);
      } else {
        console.log(`❌ Dono com ID ${id} não está conectado`);
      }
    }

    if (tipo === "offer") {
      const donoWs = donos[id];
      const sdpEncoded = texto.split(":").slice(2).join(":"); // suporta SDP com ":" dentro
      const sdp = Buffer.from(sdpEncoded, "base64").toString("utf-8");

      if (donoWs && donoWs.readyState === WebSocket.OPEN) {
        donoWs.send(`offer:${sdp}`);
        console.log(`📤 Offer enviada ao dono: ${id}`);
      } else {
        console.log(`❌ Dono com ID ${id} não está conectado para receber a offer`);
      }
    }
  });

  ws.on("close", () => {
    for (const id in donos) {
      if (donos[id] === ws) {
        delete donos[id];
        console.log(`🔴 Dono desconectado: ${id}`);
      }
    }
  });
});
