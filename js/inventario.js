import { collection, addDoc, doc, getDoc, getDocs, query, orderBy } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

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
            
            // Carregar itens existentes
            await carregarItens();
        }
    } catch (error) {
        console.error('Erro ao carregar mudança:', error);
        alert('Erro ao carregar mudança. Tente novamente.');
    }
}

// Carregar itens existentes
async function carregarItens() {
    try {
        const itemsRef = collection(window.db, 'mudancas', mudancaId, 'items');
        const q = query(itemsRef, orderBy('dataRegistro', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const itemsList = document.getElementById('items-list');
        itemsList.innerHTML = ''; // Limpar lista atual
        
        querySnapshot.forEach((doc) => {
            const item = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.itemNumber}</td>
                <td>${item.packType}</td>
                <td>${item.articleDescription}</td>
                <td>${item.condition}</td>
                <td>${item.location}</td>
                <td>${item.packedBy}</td>
            `;
            itemsList.prepend(row); // Adicionar no início da lista
        });
    } catch (error) {
        console.error('Erro ao carregar itens:', error);
    }
}

// Formulário de Item
const itemForm = document.getElementById('item-form');
if (itemForm) {
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
            
            // Adicionar o novo item à lista
            const itemsList = document.getElementById('items-list');
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${itemData.itemNumber}</td>
                <td>${itemData.packType}</td>
                <td>${itemData.articleDescription}</td>
                <td>${itemData.condition}</td>
                <td>${itemData.location}</td>
                <td>${itemData.packedBy}</td>
            `;
            itemsList.prepend(row); // Adicionar no início da lista
            
            itemForm.reset();
            // Focar no campo itemNumber para facilitar o próximo registro
            document.getElementById('itemNumber').focus();
        } catch (error) {
            console.error('Erro ao registrar item:', error);
            alert('Erro ao registrar item. Tente novamente.');
        }
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', carregarMudanca); 