import { collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';
import { db } from './firebase-config.js';

// Buscar tracking
async function buscarTracking(numeroProcesso) {
    try {
        const mudancaRef = collection(db, 'mudancas');
        const q = query(mudancaRef, where('ref', '==', numeroProcesso));
        const mudancaSnap = await getDocs(q);
        
        if (!mudancaSnap.empty) {
            const mudanca = mudancaSnap.docs[0];
            const itemsRef = collection(db, 'mudancas', mudanca.id, 'items');
            const itemsSnap = await getDocs(itemsRef);
            
            const trackingList = document.getElementById('tracking-list');
            trackingList.innerHTML = '';
            
            itemsSnap.forEach(doc => {
                const item = doc.data();
                const div = document.createElement('div');
                div.className = 'tracking-item';
                div.innerHTML = `
                    <h5>Item ${item.itemNumber}</h5>
                    <p>${item.articleDescription}</p>
                    <div class="status-badge status-${item.status}">${formatarStatus(item.status)}</div>
                    <div class="tracking-timestamp">
                        Última atualização: ${item.historico[item.historico.length-1].timestamp.toDate().toLocaleString()}
                    </div>
                `;
                trackingList.appendChild(div);
            });
        } else {
            document.getElementById('tracking-list').innerHTML = 
                '<div class="alert alert-warning">Processo não encontrado</div>';
        }
    } catch (error) {
        console.error('Erro ao buscar tracking:', error);
    }
}

function formatarStatus(status) {
    const statusMap = {
        'saida_cliente': 'Saída Casa Cliente',
        'entrada_armazem': 'Entrada Armazém',
        'movimentacao_armazem': 'Movimentação Armazém',
        'saida_armazem': 'Saída Armazém'
    };
    return statusMap[status] || status;
}

// Event listener para pesquisa
const searchProcesso = document.getElementById('searchProcesso');
searchProcesso.addEventListener('input', (e) => {
    if (e.target.value.length >= 3) {
        buscarTracking(e.target.value);
    }
});

// Exportação PDF
document.getElementById('exportarPDF').addEventListener('click', () => {
    // TODO: Implementar exportação PDF
    alert('Exportação PDF em desenvolvimento');
});

// Exportação Excel
document.getElementById('exportarExcel').addEventListener('click', () => {
    // TODO: Implementar exportação Excel
    alert('Exportação Excel em desenvolvimento');
}); 