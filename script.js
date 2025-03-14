document.addEventListener('DOMContentLoaded', () => {
    const flowBlocks = document.getElementById('flow-blocks');
    const startBotButton = document.getElementById('start-bot');
    const qrCodeContainer = document.getElementById('qr-code-container');

    // Conectar o WhatsApp e gerar o QR Code
    function generateQRCode() {
        fetch('/generate-qr')
            .then(response => response.json())
            .then(data => {
                qrCodeContainer.innerHTML = `<img src="${data.qrCodeUrl}" alt="QR Code">`;
            })
            .catch(error => console.error('Erro ao gerar QR Code:', error));
    }

    // Ativar o robô
    startBotButton.addEventListener('click', () => {
        fetch('/start-bot', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
            })
            .catch(error => console.error('Erro ao ativar o robô:', error));
    });

    // Inicializa o QR Code
    generateQRCode();
});
