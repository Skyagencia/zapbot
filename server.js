const { Client, LocalAuth } = require("whatsapp-web.js");
const express = require("express");
const qrcode = require("qrcode-terminal");
const rimraf = require("rimraf");
const { execSync } = require("child_process");

const app = express();
const port = process.env.PORT || 10000;

// Corrigindo o caminho de autenticação para evitar erros no Render
const authPath = "/tmp/wwebjs_auth";

// Configuração do cliente do WhatsApp Web.js
const client = new Client({
    authStrategy: new LocalAuth({ dataPath: authPath }),
    puppeteer: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    }
});

// Evento disparado quando o QR Code é gerado
client.on("qr", (qr) => {
    console.log("🔹 QR Code gerado! Escaneie para conectar.");
    qrcode.generate(qr, { small: true });
});

// Evento disparado quando o WhatsApp está pronto
client.on("ready", () => {
    console.log("✅ Cliente WhatsApp conectado e pronto!");
});

// Evento disparado ao receber uma mensagem
client.on("message", (message) => {
    console.log(`📩 Mensagem recebida: ${message.body}`);
    if (message.body.toLowerCase() === "ping") {
        message.reply("Pong! 🏓");
    }
});

// Iniciando o cliente do WhatsApp
client.initialize();

// Endpoint básico para verificar se o servidor está rodando
app.get("/", (req, res) => {
    res.send("🤖 Bot do WhatsApp rodando!");
});

// Rota para resetar a autenticação (se necessário)
app.get("/reset", (req, res) => {
    try {
        console.log("🚀 Resetando sessão do WhatsApp...");
        execSync(`chmod -R 777 ${authPath}`);
        rimraf.sync(authPath);
        res.send("✅ Sessão resetada com sucesso!");
    } catch (error) {
        console.error("❌ Erro ao resetar sessão:", error);
        res.status(500).send("Erro ao resetar sessão.");
    }
});

// Iniciando o servidor Express
app.listen(port, () => {
    console.log(`🔥 Servidor rodando na porta ${port}`);
});
