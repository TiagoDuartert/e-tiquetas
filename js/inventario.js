import { collection, addDoc, doc, getDoc, updateDoc, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

// Pegar ID da mudança da URL
const urlParams = new URLSearchParams(window.location.search);
const mudancaId = urlParams.get('id');

// Carregar dados da mudança
async function carregarMudanca() {
    if (!mudancaId) {
        alert('Mudança não encontrada');
        window.location.href = 'index.html';
        return;
    }

    try {
        const mudancaDoc = await getDoc(doc(window.db, 'mudancas', mudancaId));
        if (mudancaDoc.exists()) {
            const mudanca = mudancaDoc.data();
            document.getElementById('mudancaInfo').textContent = 
                `Mudança: ${mudanca.ref} - Cliente: ${mudanca.name}`;
        }
    } catch (error) {
        console.error('Erro ao carregar mudança:', error);
        alert('Erro ao carregar mudança. Tente novamente.');
    }
}

// Formulário de Item
const itemForm = document.getElementById('item-form');
itemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const itemData = {
        itemNumber: document.getElementById('itemNumber').value,
        packType: document.getElementById('packType').value,
        articleDescription: document.getElementById('articleDescription').value,
        condition: document.getElementById('condition').value,
        location: document.getElementById('location').value,
        packedBy: document.getElementById('packedBy').value,
        status: 'registrado',
        dataRegistro: new Date(),
        historico: [{
            status: 'registrado',
            timestamp: new Date(),
            usuario: document.getElementById('packedBy').value
        }]
    };
    
    try {
        await addDoc(collection(window.db, 'mudancas', mudancaId, 'items'), itemData);
        itemForm.reset();
        alert('Item registrado com sucesso!');
    } catch (error) {
        console.error('Erro ao registrar item:', error);
        alert('Erro ao registrar item. Tente novamente.');
    }
});

// Inicialização
document.addEventListener('DOMContentLoaded', carregarMudanca); 