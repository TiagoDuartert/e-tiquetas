// Desestruturação das funções do Firestore
const { collection, addDoc, doc, updateDoc, query, where, getDocs, limit } = window.firestoreModule;
const db = window.db;

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAnQsZ5zgb3L85paW2HbFysW-ZI7tN5L4c",
    authDomain: "e-tiquetas.firebaseapp.com",
    projectId: "e-tiquetas",
    storageBucket: "e-tiquetas.firebasestorage.app",
    messagingSenderId: "428128437153",
    appId: "1:428128437153:web:281c188305dec3f45641e0",
    measurementId: "G-KYX0QZ2XY1"
};

// Gerenciamento de Navegação
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetPage = e.target.dataset.page;
        
        // Atualiza navegação
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        e.target.classList.add('active');
        
        // Atualiza conteúdo
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById(`${targetPage}-page`).classList.add('active');
    });
});

// Gerenciamento de Estado
let mudancaAtual = null;
let inventarioAtual = [];

// Formulário de Nova Mudança
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
        mudancaAtual = { id: docRef.id, ...formData };
        navegarPara('inventario-form-page');
    } catch (error) {
        console.error('Erro ao registrar mudança:', error);
        alert('Erro ao registrar mudança. Tente novamente.');
    }
});

// Formulário de Item
const itemForm = document.getElementById('item-form');
itemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!mudancaAtual) {
        alert('Erro: Nenhuma mudança ativa');
        return;
    }
    
    const itemData = {
        itemNumber: document.getElementById('itemNumber').value,
        packType: document.getElementById('packType').value,
        articleDescription: document.getElementById('articleDescription').value,
        condition: document.getElementById('condition').value,
        location: document.getElementById('location').value,
        packedBy: document.getElementById('packedBy').value,
        status: 'registrado',
        qrCode: gerarQRCode(mudancaAtual.id, document.getElementById('itemNumber').value),
        historico: [{
            status: 'registrado',
            timestamp: new Date(),
            usuario: document.getElementById('packedBy').value
        }]
    };
    
    try {
        await addDoc(collection(db, 'mudancas').doc(mudancaAtual.id).collection('items'), itemData);
        
        inventarioAtual.push(itemData);
        itemForm.reset();
        alert('Item registrado com sucesso!');
    } catch (error) {
        console.error('Erro ao registrar item:', error);
        alert('Erro ao registrar item. Tente novamente.');
    }
});

// Finalizar Inventário
document.getElementById('finalizarInventario').addEventListener('click', () => {
    if (inventarioAtual.length > 0) {
        navegarPara('scanner');
    } else {
        alert('Adicione pelo menos um item ao inventário');
    }
});

// Scanner QR Code
function onScanSuccess(decodedText) {
    const tipoPickup = document.getElementById('tipoPickup').value;
    if (!tipoPickup) {
        alert('Selecione o tipo de picagem antes de escanear');
        return;
    }
    
    atualizarStatusItem(decodedText, tipoPickup);
}

async function atualizarStatusItem(qrCode, tipoPickup) {
    try {
        const [mudancaId, itemNumber] = decodificarQRCode(qrCode);
        
        const itemRef = await getDocs(query(collection(db, 'mudancas').doc(mudancaId).collection('items'), where('itemNumber', '==', itemNumber)));
            
        if (!itemRef.empty) {
            const item = itemRef.docs[0];
            const historico = item.data().historico || [];
            
            historico.push({
                status: tipoPickup,
                timestamp: new Date(),
                usuario: mudancaAtual?.crewLeader || 'Usuário não identificado'
            });
            
            await updateDoc(item.ref, {
                status: tipoPickup,
                historico: historico
            });
            
            // Feedback visual e sonoro
            const statusDiv = document.querySelector('.scan-status');
            statusDiv.textContent = 'Picagem registrada com sucesso!';
            statusDiv.className = 'scan-status scan-success';
            
            const audio = new Audio('sounds/success.mp3');
            audio.play();
        }
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        alert('Erro ao registrar picagem. Tente novamente.');
    }
}

// Funções Auxiliares
function gerarQRCode(mudancaId, itemNumber) {
    return `${mudancaId}-${itemNumber}`;
}

function decodificarQRCode(qrCode) {
    return qrCode.split('-');
}

function navegarPara(paginaId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(paginaId).classList.add('active');
}

// Busca de Mudanças
const searchMudanca = document.getElementById('searchMudanca');
searchMudanca.addEventListener('input', async (e) => {
    if (e.target.value.length >= 3) {
        await buscarMudancas(e.target.value);
    }
});

async function buscarMudancas(termo) {
    try {
        const snapshot = await getDocs(query(collection(db, 'mudancas'), where('ref', '>=', termo), where('ref', '<=', termo + '\uf8ff'), limit(10)));
            
        const listaMudancas = document.getElementById('lista-mudancas');
        listaMudancas.innerHTML = '';
        
        snapshot.forEach(doc => {
            const mudanca = doc.data();
            const div = document.createElement('div');
            div.className = 'list-group-item';
            div.innerHTML = `
                <h5 class="mb-1">Ref: ${mudanca.ref}</h5>
                <p class="mb-1">Cliente: ${mudanca.name}</p>
                <small>Status: ${mudanca.status}</small>
            `;
            div.addEventListener('click', () => carregarMudanca(doc.id));
            listaMudancas.appendChild(div);
        });
    } catch (error) {
        console.error('Erro ao buscar mudanças:', error);
    }
}

// Inventário
const searchProcesso = document.getElementById('searchProcesso');
const inventarioList = document.getElementById('inventario-list');

searchProcesso.addEventListener('input', async (e) => {
    const numeroProcesso = e.target.value;
    if (numeroProcesso.length >= 3) {
        await buscarInventario(numeroProcesso);
    }
});

async function buscarInventario(numeroProcesso) {
    try {
        const snapshot = await getDocs(query(collection(db, 'caixas'), where('numeroProcesso', '==', numeroProcesso)));
            
        inventarioList.innerHTML = '';
        snapshot.forEach(doc => {
            const caixa = doc.data();
            const div = document.createElement('div');
            div.className = 'card mb-3';
            div.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">Caixa ${doc.id}</h5>
                    <p class="card-text">Descrição: ${caixa.descricao}</p>
                    <p class="card-text">Dimensões: ${caixa.dimensoes.largura}x${caixa.dimensoes.altura}x${caixa.dimensoes.profundidade} cm</p>
                    <p class="card-text">Peso: ${caixa.peso} kg</p>
                    <p class="card-text">Status: ${caixa.status}</p>
                </div>
            `;
            inventarioList.appendChild(div);
        });
    } catch (error) {
        console.error('Erro ao buscar inventário:', error);
    }
}

// Exportação
document.getElementById('exportarPDF').addEventListener('click', () => {
    // Implementar exportação para PDF
    alert('Funcionalidade de exportação PDF em desenvolvimento');
});

document.getElementById('exportarExcel').addEventListener('click', () => {
    // Implementar exportação para Excel
    alert('Funcionalidade de exportação Excel em desenvolvimento');
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Event listener para o botão de nova mudança
    const btnNovaMudanca = document.querySelector('button[data-page="nova-mudanca"]');
    if (btnNovaMudanca) {
        btnNovaMudanca.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            document.getElementById('nova-mudanca-page').classList.add('active');
        });
    }

    // Inicia o scanner quando a página do scanner estiver ativa
    const scannerPage = document.getElementById('scanner-page');
    if (scannerPage.classList.contains('active')) {
        iniciarScanner();
    }

    verificarElementos();
});

function verificarElementos() {
    const elementos = {
        'mudanca-form': document.getElementById('mudanca-form'),
        'nova-mudanca-btn': document.querySelector('button[data-page="nova-mudanca"]'),
        'home-page': document.getElementById('home-page'),
        'nova-mudanca-page': document.getElementById('nova-mudanca-page')
    };

    for (const [nome, elemento] of Object.entries(elementos)) {
        if (!elemento) {
            console.error(`Elemento não encontrado: ${nome}`);
        }
    }
} 