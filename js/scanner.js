import { doc, getDoc, updateDoc, arrayUnion } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

let html5QrCode = null;

// Inicializar scanner
function iniciarScanner() {
    const tipoPickup = document.getElementById('tipoPickup');
    if (!tipoPickup.value) {
        alert('Selecione o tipo de picagem antes de escanear');
        return;
    }

    html5QrCode = new Html5Qrcode("reader");
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    
    html5QrCode.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanError
    );
}

// Callback de sucesso do scanner
async function onScanSuccess(decodedText) {
    const tipoPickup = document.getElementById('tipoPickup').value;
    
    try {
        const [mudancaId, itemNumber] = decodedText.split('-');
        const itemRef = doc(window.db, 'mudancas', mudancaId, 'items', itemNumber);
        const itemDoc = await getDoc(itemRef);
        
        if (itemDoc.exists()) {
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
            audio.play();
        } else {
            alert('Item não encontrado!');
        }
    } catch (error) {
        console.error('Erro ao processar QR Code:', error);
        alert('Erro ao processar QR Code. Tente novamente.');
    }
}

function onScanError(error) {
    console.warn(`Erro na leitura: ${error}`);
}

// Event Listeners
const tipoPickupSelect = document.getElementById('tipoPickup');
if (tipoPickupSelect) {
    tipoPickupSelect.addEventListener('change', () => {
        if (html5QrCode === null) {
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
    }
}); 