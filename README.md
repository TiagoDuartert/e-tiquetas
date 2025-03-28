# E-tiquetas

Sistema de etiquetagem para identificação e rastreamento de cargas em armazém, utilizando QR Code e Firebase.

## Instalação

1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/e-tiquetas.git
cd e-tiquetas
```

2. Configure o Firebase:
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com)
   - Ative o Firestore Database
   - Copie as configurações do Firebase
   - Crie um arquivo `js/firebase-config.js` com suas credenciais

3. Adicione os recursos necessários:
   - Adicione o logo da empresa em `img/logo.png`
   - Adicione o som de sucesso em `sounds/success.mp3`

4. Abra o `index.html` em um servidor web local

## Funcionalidades

- Registro de mudanças e itens
- Geração de QR Codes para rastreamento
- Scanner de QR Code com câmera
- Tracking em tempo real
- Exportação de inventário (PDF/Excel)

## Tecnologias

- HTML5
- CSS3 (Bootstrap 5)
- JavaScript
- Firebase (Firestore)
- HTML5-QRCode

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes. 