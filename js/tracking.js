import { collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

// Buscar tracking
async function buscarTracking(numeroProcesso) {
    try {
        const mudancaRef = collection(window.db, 'mudancas');
        const q = query(mudancaRef, where('ref', '==', numeroProcesso));
        const mudancaSnap = await getDocs(q);
        
        if (!mudancaSnap.empty) {
            const mudanca = mudancaSnap.docs[0];
            const itemsRef = collection(window.db, 'mudancas', mudanca.id, 'items');
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
if (searchProcesso) {
    searchProcesso.addEventListener('input', (e) => {
        if (e.target.value.length >= 3) {
            buscarTracking(e.target.value);
        }
    });
}

// Exportação PDF
const exportarPDFBtn = document.getElementById('exportarPDF');
if (exportarPDFBtn) {
    exportarPDFBtn.addEventListener('click', () => {
        alert('Exportação PDF em desenvolvimento');
    });
}

// Exportação Excel
const exportarExcelBtn = document.getElementById('exportarExcel');
if (exportarExcelBtn) {
    exportarExcelBtn.addEventListener('click', () => {
        alert('Exportação Excel em desenvolvimento');
    });
} 