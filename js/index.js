import { collection, query, orderBy, limit, getDocs, where } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

// Carregar mudanças recentes
async function carregarMudancasRecentes() {
    const mudancasRef = collection(window.db, 'mudancas');
    const q = query(mudancasRef, orderBy('dataInicio', 'desc'), limit(5));
    
    try {
        const querySnapshot = await getDocs(q);
        const listaMudancas = document.getElementById('lista-mudancas');
        listaMudancas.innerHTML = '';
        
        querySnapshot.forEach((doc) => {
            const mudanca = doc.data();
            const div = document.createElement('div');
            div.className = 'list-group-item';
            div.innerHTML = `
                <h5 class="mb-1">Ref: ${mudanca.ref}</h5>
                <p class="mb-1">Cliente: ${mudanca.name}</p>
                <small>Status: ${mudanca.status}</small>
            `;
            div.addEventListener('click', () => {
                window.location.href = `inventario.html?id=${doc.id}`;
            });
            listaMudancas.appendChild(div);
        });
    } catch (error) {
        console.error('Erro ao carregar mudanças:', error);
    }
}

// Pesquisar mudanças
const searchInput = document.getElementById('searchMudanca');
if (searchInput) {
    searchInput.addEventListener('input', async (e) => {
        if (e.target.value.length >= 3) {
            const searchRef = collection(window.db, 'mudancas');
            const q = query(
                searchRef,
                where('ref', '>=', e.target.value),
                where('ref', '<=', e.target.value + '\uf8ff'),
                limit(5)
            );
            
            try {
                const querySnapshot = await getDocs(q);
                const listaMudancas = document.getElementById('lista-mudancas');
                listaMudancas.innerHTML = '';
                
                querySnapshot.forEach((doc) => {
                    const mudanca = doc.data();
                    const div = document.createElement('div');
                    div.className = 'list-group-item';
                    div.innerHTML = `
                        <h5 class="mb-1">Ref: ${mudanca.ref}</h5>
                        <p class="mb-1">Cliente: ${mudanca.name}</p>
                        <small>Status: ${mudanca.status}</small>
                    `;
                    div.addEventListener('click', () => {
                        window.location.href = `inventario.html?id=${doc.id}`;
                    });
                    listaMudancas.appendChild(div);
                });
            } catch (error) {
                console.error('Erro na pesquisa:', error);
            }
        }
    });
}

// Carregar mudanças ao iniciar a página
document.addEventListener('DOMContentLoaded', carregarMudancasRecentes); 