import { collection, addDoc } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';
import { db } from './firebase-config.js';

const mudancaForm = document.getElementById('mudanca-form');

mudancaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        origin: document.getElementById('origin').value,
        destination: document.getElementById('destination').value,
        crewLeader: document.getElementById('crewLeader').value,
        ref: document.getElementById('ref').value,
        status: 'em_andamento',
        dataInicio: new Date(),
        items: []
    };
    
    try {
        const docRef = await addDoc(collection(db, 'mudancas'), formData);
        // Redireciona para a página de inventário com o ID da mudança
        window.location.href = `inventario.html?id=${docRef.id}`;
    } catch (error) {
        console.error('Erro ao registrar mudança:', error);
        alert('Erro ao registrar mudança. Tente novamente.');
    }
}); 