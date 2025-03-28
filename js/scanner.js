import { doc, getDoc, updateDoc, arrayUnion } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

let html5QrCode = null;
let isScanning = false;

// Inicializar scanner
function iniciarScanner() {
    const tipoPickup = document.getElementById('tipoPickup');
    if (!tipoPickup.value) {
        alert('Selecione o tipo de picagem antes de escanear');
        return;
    }

    if (!html5QrCode) {
        html5QrCode = new Html5Qrcode("reader");
    }

    if (!isScanning) {
        const config = { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        };
        
        isScanning = true;
        html5QrCode.start(
            { facingMode: "environment" },
            config,
            onScanSuccess,
            onScanError
        ).catch((err) => {
            console.error("Erro ao iniciar scanner:", err);
            isScanning = false;
        });
    }
}

// Callback de sucesso do scanner
async function onScanSuccess(decodedText) {
    if (!isScanning) return;

    try {
        // Parar o scanner temporariamente
        isScanning = false;
        await html5QrCode.pause();

        const tipoPickup = document.getElementById('tipoPickup').value;
        
        // Validar o formato do QR Code
        if (!decodedText || !decodedText.includes('-')) {
            throw new Error('Formato de QR Code inválido');
        }

        const [mudancaId, itemNumber] = decodedText.split('-');
        
        // Validar os dados extraídos
        if (!mudancaId || !itemNumber) {
            throw new Error('Dados do QR Code incompletos');
        }

        const itemRef = doc(window.db, 'mudancas', mudancaId, 'items', itemNumber);
        const itemDoc = await getDoc(itemRef);
        
        if (!itemDoc.exists()) {
            throw new Error('Item não encontrado');
        }

        await updateDoc(itemRef, {
            status: tipoPickup,
            historico: arrayUnion({
                status: tipoPickup,
                timestamp: new Date(),
                usuario: 'Scanner'
            })
        });
        
        // Feedback visual e sonoro
        const statusDiv = document.querySelector('.scan-status');
        statusDiv.textContent = 'Picagem registrada com sucesso!';
        statusDiv.className = 'scan-status scan-success';
        
        const audio = new Audio('sounds/success.mp3');
        await audio.play();

        // Limpar o status após 3 segundos
        setTimeout(() => {
            statusDiv.textContent = 'Scanner pronto';
            statusDiv.className = 'scan-status';
        }, 3000);

    } catch (error) {
        console.error('Erro ao processar QR Code:', error);
        const statusDiv = document.querySelector('.scan-status');
        statusDiv.textContent = `Erro: ${error.message}`;
        statusDiv.className = 'scan-status scan-error';
    } finally {
        // Retomar o scanner após 1 segundo
        setTimeout(() => {
            if (html5QrCode) {
                html5QrCode.resume();
                isScanning = true;
            }
        }, 1000);
    }
}

function onScanError(error) {
    // Ignorar erros comuns de leitura
    if (error?.includes('NotFound')) return;
    console.warn(`Erro na leitura:`, error);
}

// Event Listeners
const tipoPickupSelect = document.getElementById('tipoPickup');
if (tipoPickupSelect) {
    tipoPickupSelect.addEventListener('change', iniciarScanner);
}

// Botão para alternar câmera
const toggleCameraBtn = document.getElementById('toggleCamera');
if (toggleCameraBtn) {
    toggleCameraBtn.addEventListener('click', async () => {
        if (html5QrCode) {
            await html5QrCode.stop();
            html5QrCode = null;
            isScanning = false;
            iniciarScanner();
        }
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', iniciarScanner);

// Limpeza ao sair da página
window.addEventListener('beforeunload', () => {
    if (html5QrCode) {
        html5QrCode.stop();
        html5QrCode = null;
        isScanning = false;
    }
}); 