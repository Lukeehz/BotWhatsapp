const path = require('path');
const fs = require('fs');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js'); 

const client = new Client({
    webVersionCache: {
        type: "remote",
        remotePath: "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
    },
    authStrategy: new LocalAuth()
});

let testePalavra, testeTF=true, nomeCliente, hasAtendimento

const imagePath = path.join(__dirname, 'image');
const atendimentoState = new Map(); // Armazena o estado do atendimento

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Cliente está pronto!');
});

client.on('message_create', message => {
    if (message.body.toLocaleLowerCase() === '!atendimento') {
        atendimentoState.set(message.from, true); // Marca o usuário como tendo solicitado atendimento
        client.sendMessage(message.from, '*Atendimento automático (Em fase de testes)*');
        client.sendMessage(message.from, 'Boa noite! Meu nome é Isabela, e farei seu atendimento hoje ^-^');
        client.sendMessage(message.from, `Como posso está te ajudando hoje? \n\n Digite *!1* para Agendar/Cancelar ou mudar um horário \n\n Digite *!2* para outros assuntos `);
        atendimento
      }
});

client.on ("message_create", message =>{
  switch (message.body.toLocaleLowerCase()){
    case "!um" :case "!1":
      hasAtendimento = atendimentoState.get(message.from);
      if(hasAtendimento){
      client.sendMessage (message.from, "Se você deseja agendar diga seu nome e o dia/horário que queira agendar \n\n Caso queira mudar o horário, diga seu nome, e para qual horário que deseja agendar \n\n Caso queira cancelar, diga seu nome e o horário que deseja cancelar.")
      atendimentoState.delete(message.from);
      break;
  }else{
    client.sendMessage(message.from, 'Você precisa começar com o !atendimento :)');
  }break;
  case "!dois": case "!2":
    hasAtendimento = atendimentoState.get(message.from);
  if(hasAtendimento){
    client.sendMessage (message.from, "Aguarde um momentinho que a Rose já te atende ^-^")
    atendimentoState.delete(message.from);
  }else{
    client.sendMessage(message.from, 'Você precisa começar com o !atendimento :)');
  }
}
})

client.on('message_create', message => {
    if (message.body === '!cardapio') {
        const hasAtendimento = atendimentoState.get(message.from); // Verifica se o usuário solicitou atendimento

        if (hasAtendimento) {
            fs.readFile(`${imagePath}/cardapio.jpg`, (err, data) => {
                if (err) {
                    console.error('Erro ao ler a imagem:', err);
                    client.sendMessage(message.from, 'Desculpe, não consegui carregar o cardápio.');
                    return;
                }
                const media = new MessageMedia('image/jpeg', data.toString('base64'), 'cardapio.jpg');
                client.sendMessage(message.from, media);
            });

            // Opcional: Reseta o estado após enviar o cardápio
            atendimentoState.delete(message.from);
        } else {
            client.sendMessage(message.from, 'Você precisa enviar !atendimento antes de pedir o cardápio.');
        }
    }
});

client.initialize();
