
/* =====================================================
   CONFIGURAÇÃO DO FIREBASE
   Cole aqui os dados do seu projeto
   (Console Firebase → Configurações do projeto → Seus apps)
===================================================== */

const firebaseConfig = {
   apiKey: "AIzaSyD6rjLg-HpCZIRNhjkZLzlIOjOqxKc2KUY",
   authDomain: "sorteador-dos-guri.firebaseapp.com",
   databaseURL: "https://sorteador-dos-guri-default-rtdb.firebaseio.com",
   projectId: "sorteador-dos-guri",
   storageBucket: "sorteador-dos-guri.firebasestorage.app",
   messagingSenderId: "296192489526",
   appId: "1:296192489526:web:420d195c7e34628f500097",
   measurementId: "G-3TGJZF3BLS"
};

/* =====================================================
   APELIDOS DOS JOGADORES (unificação nas estatísticas)

   Maiúsculas/minúsculas e espaços extras já são ignorados
   ("fer", "Fer" e " FER " contam como a mesma pessoa).
   Aqui você junta nomes DIFERENTES na mesma pessoa:
       "apelido": "nome principal"   (tudo em minúsculas)
   Só afeta a leitura: nada é apagado ou reescrito no Firebase,
   e dá para desfazer removendo a linha.
===================================================== */

const PLAYER_ALIASES = {
   /* Fer */
   "nando": "fer",
   "nandini": "fer",
   "fernandoviski": "fer",

   /* Pitty */
   "pit": "pitty",

   /* Nardi */
   "nardinski": "nardi",

   /* Valde */
   "valdemar": "valde",
   "valdemarr": "valde",

   /* Ber */
   "bernoso": "ber",
};

/* =====================================================
   BOTÃO "ATUALIZAR DADOS DA RIOT"

   Endereço do Cloudflare Worker (pasta worker/). Vazio esconde o botão.
===================================================== */

const RIOT_WORKER_URL = "";

/* =====================================================
   DATA DRAGON
===================================================== */

/* Versão de reserva: a versão mais recente é buscada ao abrir a página
   (veja loadChampionData). Estes valores só valem se a busca falhar. */
let DATA_DRAGON_VERSION = "15.19.1";

let IMAGE_URL =
   "https://ddragon.leagueoflegends.com/cdn/"
   + DATA_DRAGON_VERSION
   + "/img/champion/";

