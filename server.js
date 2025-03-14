const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const qrcode = require('qrcode');
const path = require('path');  // Importando o módulo path para resolver caminhos de arquivos

const app = express();
const PORT = process.env.PORT || 3000; // Usa a porta dinâmica do Render

// Serve arquivos estáticos da raiz do projeto (onde o index.html está localizado)
app.use(express.static(path.join(__dirname)));  
app.use(express.json());

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true }
});

let whatsappConectado = false;
let qrCodeAtual = "";

client.on('qr', async (qr) => {
    qrCodeAtual = await qrcode.toDataURL(qr);
    console.log("🔹 QR Code gerado! Escaneie para conectar.");
});

client.on('ready', () => {
    console.log('✅ WhatsApp conectado!');
    whatsappConectado = true;
    qrCodeAtual = ""; 
});

client.initialize();

// Rota para servir o index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Serve o index.html da raiz do projeto
});

app.get('/qrcode', (req, res) => {
    if (qrCodeAtual) {
        res.json({ qr: qrCodeAtual });
    } else {
        res.json({ message: "Já conectado ou aguardando QR Code..." });
    }
});

app.get('/status', (req, res) => {
    res.json({ conectado: whatsappConectado });
});

app.post('/salvar-numeros', (req, res) => {
    const { numeros } = req.body;
    if (!numeros.trim()) {
        return res.send("Nenhum número informado.");
    }

    fs.appendFileSync('contatos.txt', `\n${numeros.trim()}`);
    res.send("✅ Números adicionados com sucesso!");
});

app.post('/limpar-numeros', (req, res) => {
    fs.writeFileSync('contatos.txt', ''); // Limpar o conteúdo do arquivo
    res.send("✅ Números limpos com sucesso!");
});

app.post('/disparar', (req, res) => {
    if (!whatsappConectado) {
        return res.send("❌ WhatsApp não está conectado.");
    }

    const { mensagem } = req.body;
    const contatos = fs.readFileSync('contatos.txt', 'utf8')
        .split('\n')
        .map(num => num.trim())
        .filter(num => num);

    if (contatos.length === 0) {
        return res.send("❌ Nenhum número salvo para envio.");
    }

    contatos.forEach((numero, index) => {
        setTimeout(() => {
            client.sendMessage(`${numero}@c.us`, mensagem)
                .then(() => console.log(`✅ Mensagem enviada para ${numero}`))
                .catch(err => console.error(`❌ Erro ao enviar para ${numero}:`, err));
        }, index * 5000);
    });

    res.send("📩 Disparo iniciado!");
});

app.post('/desconectar', (req, res) => {
    console.log('🔴 Desconectando WhatsApp...');
    fs.rmSync('./.wwebjs_auth', { recursive: true, force: true });
    whatsappConectado = false;
    qrCodeAtual = ""; // Limpar o QR Code ao desconectar
    res.send("WhatsApp desconectado! Recarregue a página e escaneie um novo QR Code.");
});

app.listen(PORT, () => {
    console.log(`🔥 Servidor rodando na porta ${PORT}`);
});
