
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
   DATA DRAGON
===================================================== */

/* Versão de reserva: a versão mais recente é buscada ao abrir a página
   (veja loadChampionData). Estes valores só valem se a busca falhar. */
let DATA_DRAGON_VERSION = "15.19.1";

let IMAGE_URL =
    "https://ddragon.leagueoflegends.com/cdn/"
    + DATA_DRAGON_VERSION
    + "/img/champion/";

/* =====================================================
   CAMPEÕES
===================================================== */

/* Lista de reserva (usada só se a busca no Data Dragon falhar
   e não houver cache salvo no navegador) */
let champions = [

    "Aatrox", "Ahri", "Akali", "Akshan", "Alistar", "Ambessa", "Amumu",
    "Anivia", "Annie", "Aphelios", "Ashe", "AurelionSol", "Aurora", "Azir",

    "Bard", "Belveth", "Blitzcrank", "Brand", "Braum", "Briar",

    "Caitlyn", "Camille", "Corki",

    "Darius", "Diana", "DrMundo", "Draven",

    "Ekko", "Elise", "Evelynn", "Ezreal",

    "Fiddlesticks", "Fiora", "Fizz",

    "Galio", "Gangplank", "Garen", "Gnar", "Gragas", "Graves", "Gwen",

    "Hecarim", "Heimerdinger", "Hwei",

    "Illaoi", "Irelia", "Ivern",

    "Janna", "JarvanIV", "Jax", "Jayce", "Jhin", "Jinx",

    "Kaisa", "Kalista", "Karma", "Karthus", "Kassadin", "Katarina", "Kayle",
    "Kayn", "Kennen", "Khazix", "Kindred", "Kled", "KogMaw",

    "Leblanc", "LeeSin", "Leona", "Lillia", "Lissandra", "Lucian", "Lulu", "Lux",

    "Malphite", "Malzahar", "Maokai", "Mel", "MasterYi", "Milio",
    "MissFortune", "Mordekaiser", "Morgana",

    "Naafiri", "Nami", "Nasus", "Nautilus", "Neeko", "Nidalee", "Nilah",
    "Nocturne", "Nunu",

    "Olaf", "Orianna", "Ornn",

    "Pantheon", "Poppy", "Pyke",

    "Qiyana", "Quinn",

    "Rakan", "Rammus", "RekSai", "Rell", "Renata", "Renekton", "Rengar",
    "Riven", "Rumble", "Ryze",

    "Samira", "Sejuani", "Senna", "Seraphine", "Sett", "Shaco", "Shen",
    "Shyvana", "Singed", "Sion", "Sivir", "Skarner", "Smolder", "Sona",
    "Soraka", "Swain", "Sylas", "Syndra",

    "TahmKench", "Taliyah", "Talon", "Taric", "Teemo", "Thresh", "Tristana",
    "Trundle", "Tryndamere", "TwistedFate", "Twitch",

    "Udyr", "Urgot",

    "Varus", "Vayne", "Veigar", "Velkoz", "Vex", "Vi", "Viego", "Viktor",
    "Vladimir", "Volibear",

    "Warwick", "MonkeyKing", "Xayah", "Xerath", "XinZhao",

    "Yasuo", "Yone", "Yorick", "Yunara", "Yuumi",

    "Zac", "Zed", "Zeri", "Ziggs", "Zilean", "Zoe", "Zyra"

];

/* =====================================================
   POOLS PREDETERMINADAS
   Para criar uma pool nova, basta adicionar um item aqui.
   Use os mesmos IDs da lista "champions" (ex.: "MonkeyKing" = Wukong).
===================================================== */

const championPools = [
    {
        id: "veneno",
        name: "Veneno",
        champions: ["Teemo", "Twitch", "Singed", "Cassiopeia", "Zyra"]
    },
    {
        id: "sangramento",
        name: "Sangramento",
        champions: ["Darius", "Talon", "Kindred", "Draven", "Hecarim"]
    },
    {
        id: "fogo",
        name: "Fogo",
        champions: ["Brand", "Smolder", "Annie", "Shyvana", "Rumble"]
    },
    {
        id: "tankudini",
        name: "Tankudini",
        champions: ["Ornn", "Malphite", "Maokai", "Alistar", "Poppy"]
    },
    {
        id: "velocidade",
        name: "Velocidade",
        champions: ["Zilean", "Janna", "Hecarim", "Rammus", "Lillia"]
    },
    {
        id: "assasino",
        name: "Assasino",
        champions: ["Zed", "Katarina", "Talon", "Locke", "Fizz"]
    },
    {
        id: "fullCC",
        name: "Full cc",
        champions: ["Morgana", "Leona", "Sejuani", "Amumu", "Lissandra"]
    }
];

const POOLS_KEY = "selectedPools";

function loadSelectedPools() {
    try {
        const saved = JSON.parse(localStorage.getItem(POOLS_KEY));
        return Array.isArray(saved) ? saved : [];
    } catch (e) {
        return [];
    }
}

function getSelectedPoolIds() {
    return [...document.querySelectorAll("#poolList input:checked")]
        .map(input => input.value);
}

/* União (sem repetição) dos campeões das pools marcadas */
function getPoolChampions() {

    const ids = getSelectedPoolIds();
    const set = new Set();

    championPools
        .filter(pool => ids.includes(pool.id))
        .forEach(pool => pool.champions.forEach(c => {
            /* Ignora ids que não existem mais na versão atual do jogo */
            if (champions.includes(c)) set.add(c);
        }));

    return [...set];

}

function renderPools() {

    const container = document.getElementById("poolList");
    const saved = loadSelectedPools();

    container.innerHTML = "";

    championPools.forEach(pool => {

        const wrapper = document.createElement("label");
        wrapper.className = "pool-option";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = pool.id;
        checkbox.checked = saved.includes(pool.id);
        checkbox.onchange = onPoolChange;

        const name = document.createElement("div");
        name.className = "pool-name";
        name.textContent = pool.name;

        const champs = document.createElement("div");
        champs.className = "pool-champs";

        pool.champions.forEach(champion => {
            const img = document.createElement("img");
            img.src = IMAGE_URL + champion + ".png";
            img.title = championNames[champion] || champion;
            img.onerror = () => { img.style.display = "none"; };
            champs.appendChild(img);
        });

        wrapper.appendChild(checkbox);
        wrapper.appendChild(name);
        wrapper.appendChild(champs);

        container.appendChild(wrapper);

    });

    updatePoolUI();

}

function onPoolChange() {
    localStorage.setItem(POOLS_KEY, JSON.stringify(getSelectedPoolIds()));
    updatePoolUI();
}

/* Destaca pools marcadas e "apaga" as regras que ficam ignoradas */
function updatePoolUI() {

    const active = getSelectedPoolIds().length > 0;

    document.querySelectorAll(".pool-option").forEach(option => {
        option.classList.toggle(
            "active",
            option.querySelector("input").checked
        );
    });

    document.getElementById("poolWarning").style.display =
        active ? "block" : "none";

    document.getElementById("excludedCard")
        .classList.toggle("disabled-by-pool", active);

    ["noRepeat", "persistNoRepeat", "noRepeatLanes"].forEach(id => {
        document.getElementById(id).closest(".setting")
            .classList.toggle("disabled-by-pool", active);
    });

    document.querySelector(".persist-wrap")
        .classList.toggle("disabled-by-pool", active);

    /* O botão de resortear depende de "já sorteados" estar ativo */
    applyPersistClass();

}

/* =====================================================
   NOMES
===================================================== */

let championNames = {
    AurelionSol: "Aurelion Sol",
    Belveth: "Bel'Veth",
    DrMundo: "Dr. Mundo",
    JarvanIV: "Jarvan IV",
    Kaisa: "Kai'Sa",
    Khazix: "Kha'Zix",
    KogMaw: "Kog'Maw",
    Leblanc: "LeBlanc",
    LeeSin: "Lee Sin",
    MasterYi: "Master Yi",
    MissFortune: "Miss Fortune",
    MonkeyKing: "Wukong",
    RekSai: "Rek'Sai",
    RenataGlasc: "Renata Glasc",
    TahmKench: "Tahm Kench",
    TwistedFate: "Twisted Fate",
    XinZhao: "Xin Zhao",
    Velkoz: "Vel'Koz"
};

/* =====================================================
   ORDEM DAS LANES
===================================================== */

const laneOrder = ["Top", "Jungle", "Mid", "ADC", "Support"];

/* =====================================================
   LISTA DE CAMPEÕES AUTOMÁTICA (DATA DRAGON)

   Ao abrir a página:
   1. busca a versão mais recente do jogo (versions.json);
   2. se for a mesma do cache salvo no navegador, usa o cache;
   3. senão baixa champion.json (nomes em português) e atualiza;
   4. se a internet/Riot falhar, usa o cache; se não houver
      cache, usa a lista de reserva escrita acima.
===================================================== */

const DDRAGON_BASE = "https://ddragon.leagueoflegends.com";
const DDRAGON_CACHE_KEY = "ddragonCache";

async function fetchJson(url, timeoutMs) {

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs || 5000);

    try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error("HTTP " + response.status);
        return await response.json();
    } finally {
        clearTimeout(timer);
    }

}

function readDdragonCache() {
    try {
        const saved = JSON.parse(localStorage.getItem(DDRAGON_CACHE_KEY));
        if (saved && saved.version && Array.isArray(saved.ids)
            && saved.ids.length > 100 && saved.names) return saved;
    } catch (e) { /* ignora */ }
    return null;
}

function applyChampionData(data) {

    DATA_DRAGON_VERSION = data.version;

    IMAGE_URL = DDRAGON_BASE + "/cdn/" + data.version + "/img/champion/";

    champions = data.ids;

    /* Mantém as grafias manuais como reserva para o que faltar */
    championNames = Object.assign({}, championNames, data.names);

}

async function loadChampionData() {

    const cached = readDdragonCache();

    try {

        const versions = await fetchJson(DDRAGON_BASE + "/api/versions.json");
        const latest = versions[0];

        if (cached && cached.version === latest) {
            applyChampionData(cached);
            return;
        }

        const json = await fetchJson(
            DDRAGON_BASE + "/cdn/" + latest + "/data/pt_BR/champion.json",
            8000
        );

        const names = {};

        Object.keys(json.data).forEach(id => {
            names[id] = json.data[id].name;
        });

        /* Ordem alfabética pelo nome exibido */
        const ids = Object.keys(names).sort(
            (a, b) => names[a].localeCompare(names[b], "pt-BR")
        );

        if (ids.length < 100) throw new Error("Lista de campeões incompleta");

        const data = { version: latest, ids: ids, names: names };

        try {
            localStorage.setItem(DDRAGON_CACHE_KEY, JSON.stringify(data));
        } catch (e) { /* cache é opcional */ }

        applyChampionData(data);

    } catch (error) {

        console.warn("Data Dragon indisponível, usando cache/reserva:", error);

        if (cached) applyChampionData(cached);

    }

}

/* =====================================================
   SOM DO SORTEIO
===================================================== */

/* =====================================================
   LISTA DE ÁUDIOS SORTEÁVEIS
   Para adicionar um áudio novo: coloque o arquivo na pasta do site
   e acrescente uma linha aqui { name: "Nome exibido", file: "arquivo.mp3" }
===================================================== */

const soundList = [
    { name: "Oloko", file: "oloko.mp3" },
    { name: "Aluqix", file: "aluqix.mp3" },
    { name: "Cachorro", file: "cachorro.mp3" },
    { name: "Risada", file: "risada.mp3" },
    { name: "Tá assistindo", file: "taassistindo.mp3" },
    { name: "Queria reseta", file: "queriareseta.mp3" },
    { name: "Ninguem quer me ajudar", file: "ninguemquermeajudar.mp3" },
    { name: "Nando cala boca", file: "nandocalaboca.mp3" },
    { name: "Escutou o que falei?", file: "escutouoqfalei.mp3" },
    { name: "Deixa comigo aspira", file: "deixacomigoaspira.mp3" },
    { name: "Deixa eu clicar", file: "deixaclicar.mp3" },
    { name: "Ai cara", file: "aicara.mp3" },
    { name: "Paixão pode relaxar", file: "paixaopoderelaxar.mp3" },
    { name: "Gritinho nardi", file: "gritinhonardi.mp3" },

];

/* Cache de objetos Audio (um por arquivo) */
const audioCache = {};

function getAudio(file) {
    if (!audioCache[file]) {
        const audio = new Audio(file);
        audio.preload = "auto";
        audioCache[file] = audio;
    }
    return audioCache[file];
}

/* Pré-carrega todos os arquivos conhecidos */
function allSoundFiles() {
    return [...new Set(soundList.map(s => s.file))];
}

allSoundFiles().forEach(getAudio);

/* Sorteia áudios para os cards: todos os da lista entram, sem repetir
   entre lanes diferentes (só repete se houver menos áudios que cards).
   "exclude" = áudios já em uso por outros cards (resorteio). */
function pickSounds(count, exclude) {

    const all = soundList.map(s => s.file);

    if (all.length === 0) return Array(count).fill(null);

    let pool = shuffle(all.filter(f => !(exclude || []).includes(f)));

    if (pool.length === 0) pool = shuffle(all);

    const picked = [];

    while (picked.length < count) {
        if (pool.length === 0) pool = shuffle(all);
        picked.push(pool.shift());
    }

    return picked;

}

function playChampionSound(file) {
    if (!file) return;

    const audio = getAudio(file);

    audio.currentTime = 0;
    audio.play().catch(error => {
        console.log("Não foi possível reproduzir o som:", error);
    });
}

/* Navegadores só liberam áudio depois de um clique.
   O espectador clica em "Entrar na sala" e aqui "destravamos" os sons. */
function unlockAudio() {
    allSoundFiles().map(getAudio).forEach(sound => {
        sound.muted = true;
        const p = sound.play();
        const restore = () => {
            sound.pause();
            sound.currentTime = 0;
            sound.muted = false;
        };
        if (p && p.then) {
            p.then(restore).catch(() => { sound.muted = false; });
        } else {
            restore();
        }
    });
}

/* =====================================================
   TRANSMISSÃO AO VIVO (FIREBASE)

   Estrutura no banco:
   salas/CODIGO/hostUid    -> dono da sala
   salas/CODIGO/sorteio    -> { id, matchId, results: [{player, lane, champion}] }
   salas/CODIGO/partidas   -> {matchId: {time, entries, rerolls, resultado}}
   salas/CODIGO/votos      -> {matchId: {campeao: {uid: 1 | -1}}}
   salas/CODIGO/mensagens  -> chat
===================================================== */

const ROOM_KEY = "roomCode";

const params = new URLSearchParams(location.search);
const rawRoom = (params.get("sala") || "").trim().toUpperCase();
const IS_VIEWER = rawRoom.length > 0;

/* COMPARTILHAR TELA — liberado só por URL secreta.
   Host: abra o site com  ?tela=SEGREDO  (troque o SEGREDO abaixo por algo seu).
   O link da sala copiado pelo host passa a incluir &tv=1; só quem abre com
   esse parâmetro escuta a sinalização da tela. Quem usa o link normal não
   gasta nada do Firebase com isso. */
const SCREEN_SECRET = "guri-tela-7k2x";
const SCREEN_HOST = !IS_VIEWER && params.get("tela") === SCREEN_SECRET;
const SCREEN_VIEW = IS_VIEWER && params.get("tv") === "1";

/* Em ambiente local (localhost, 127.0.0.1 ou arquivo aberto direto) o
   Firebase fica DESLIGADO para não gravar nada no banco de produção.
   Para testar com Firebase de verdade localmente, abra com ?firebase=on */
const IS_LOCAL = ["localhost", "127.0.0.1", "[::1]", ""].includes(location.hostname);
const FORCE_FIREBASE = params.get("firebase") === "on";

const FIREBASE_READY =
    !firebaseConfig.apiKey.startsWith("COLE")
    && (!IS_LOCAL || FORCE_FIREBASE);

let db = null;
let roomCode = null;
let hostUid = null;
let liveReady = false;
let myUid = null;

/* Partida atual (host) e dados de estatísticas lidos do Firebase */
let currentMatchId = null;
let statsData = { partidas: {}, votos: {} };

/* Estatísticas GLOBAIS (todas as salas). Só são lidas quando o seletor
   "Global" está ativo, para não gastar leitura do Firebase à toa.
   Estrutura no banco:
   global/partidas/{matchId} -> {hostUid, time, entries, rerolls, resultado}
   global/votos/{matchId}/{campeao}/{uid} -> 1 | -1 */
let globalData = { partidas: {}, votos: {} };
let globalLoaded = { partidas: false, votos: false };
let statsScope = "global"; /* estatísticas sempre globais */

function initFirebase() {
    if (!FIREBASE_READY) return false;
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    return true;
}

function generateRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    return [...bytes].map(b => chars[b % chars.length]).join("");
}

function newMatchId() {
    return Date.now() + "-" + Math.random().toString(36).slice(2, 8);
}

function roomUrl() {
    return location.origin + location.pathname + "?sala=" + roomCode
        + (SCREEN_HOST ? "&tv=1" : "");
}

function setHostStatus(text, state) {
    const el = document.getElementById("hostStatus");
    el.innerHTML = "";
    const dot = document.createElement("span");
    dot.className = "live-dot" + (state ? " " + state : "");
    el.appendChild(dot);
    el.appendChild(document.createTextNode(text));
}

/* ---------- HOST ---------- */

async function initHost() {

    if (!initFirebase()) {
        setHostStatus(
            IS_LOCAL
                ? "Modo local: Firebase desligado — o sorteio funciona, mas sem transmissão, chat e estatísticas."
                : "Firebase não configurado — o sorteio funciona, mas sem transmissão.",
            "off"
        );
        document.getElementById("roomLink").placeholder =
            IS_LOCAL
                ? "Desligado em localhost (use ?firebase=on para ativar)"
                : "Preencha o firebaseConfig no código para ativar";
        renderStats();
        return;
    }

    try {

        const cred = await firebase.auth().signInAnonymously();
        hostUid = cred.user.uid;
        myUid = hostUid;

        roomCode = localStorage.getItem(ROOM_KEY) || generateRoomCode();

        await claimRoom();

        liveReady = true;

        document.getElementById("roomLink").value = roomUrl();

        setHostStatus("Sala " + roomCode + " pronta. Aguardando o sorteio.", "on");

        enableScreenHostUI();

        startChat();
        startStats();

    } catch (error) {

        console.error(error);

        setHostStatus(
            "Erro ao conectar ao Firebase: " + (error.code || error.message),
            "off"
        );

    }

}

/* Garante que a sala existe e pertence a este navegador.
   Se pertencer a outro dono, gera um código novo. */
async function claimRoom() {

    let ref = db.ref("salas/" + roomCode + "/hostUid");
    let snap = await ref.get();

    if (snap.exists() && snap.val() !== hostUid) {
        roomCode = generateRoomCode();
        ref = db.ref("salas/" + roomCode + "/hostUid");
        snap = await ref.get();
    }

    if (!snap.exists()) {
        await ref.set(hostUid);
    }

    localStorage.setItem(ROOM_KEY, roomCode);

}

async function createNewRoom() {

    if (!liveReady) return;

    if (!confirm(
        "Criar uma nova sala? O link atual deixa de receber sorteios " +
        "e as estatísticas começam do zero na sala nova " +
        "(as da sala antiga continuam salvas no link antigo)."
    )) return;

    /* Encerra a tela compartilhada da sala antiga (antes de trocar o código) */
    stopScreenShare();

    stopChat();
    stopStats();

    /* Limpa a partida atual: ela pertencia à sala antiga */
    currentMatchId = null;
    currentResults = [];
    hideResultBar();
    refreshAddPlayerBar();

    const container = document.getElementById("results");
    container.innerHTML = "";
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "O resultado aparecerá aqui.";
    container.appendChild(empty);

    try {
        roomCode = generateRoomCode();
        localStorage.setItem(ROOM_KEY, roomCode);
        await claimRoom();
        document.getElementById("roomLink").value = roomUrl();
        setHostStatus("Nova sala " + roomCode + " criada. Envie o novo link.", "on");
        startChat();
        startStats();
    } catch (error) {
        setHostStatus("Erro ao criar sala: " + (error.code || error.message), "off");
    }

}

function copyRoomLink() {

    const input = document.getElementById("roomLink");
    const button = document.getElementById("copyLinkBtn");

    if (!input.value) return;

    const done = () => {
        button.textContent = "✅ Copiado!";
        setTimeout(() => { button.textContent = "📋 Copiar link"; }, 1800);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(input.value).then(done).catch(() => {
            input.select();
            document.execCommand("copy");
            done();
        });
    } else {
        input.select();
        document.execCommand("copy");
        done();
    }

}

/* Envia o resultado aos espectadores (chamado antes da animação
   do host, para as duas animações começarem juntas). */
function broadcastResults(results, matchId, rerollLane, addedLane) {

    if (!liveReady) return;

    const payload = {
        id: Date.now() + "-" + Math.random().toString(36).slice(2, 8),
        matchId: matchId,
        results: results.map(r => ({
            player: r.player,
            lane: r.lane,
            champion: r.champion,
            sound: r.sound || null
        }))
    };

    /* Resorteio de um único card: os espectadores animam só essa lane */
    if (rerollLane) payload.reroll = rerollLane;

    /* Jogador adicionado depois: os espectadores animam só esse card novo */
    if (addedLane) payload.add = addedLane;

    db.ref("salas/" + roomCode + "/sorteio").set(payload)
        .then(() => {
            setHostStatus("Sorteio enviado para a sala " + roomCode + ".", "on");
        })
        .catch(error => {
            console.error(error);
            setHostStatus(
                "Falha ao enviar o sorteio: " + (error.code || error.message),
                "off"
            );
        });

}

/* =====================================================
   PARTIDAS NO FIREBASE (base das estatísticas)
===================================================== */

function entriesOf(results) {
    return results.map(r => ({
        player: r.player,
        lane: r.lane,
        champion: r.champion
    }));
}

/* Registra uma partida nova */
function saveMatch(matchId, results) {

    if (!liveReady) return;

    const data = {
        time: Date.now(),
        entries: entriesOf(results)
    };

    /* Grava na sala e no global ao mesmo tempo (atualização atômica) */
    const updates = {};

    updates["salas/" + roomCode + "/partidas/" + matchId] = data;
    updates["global/partidas/" + matchId] = Object.assign({ hostUid: hostUid }, data);

    db.ref().update(updates)
        .catch(error => console.error("Erro ao salvar partida:", error));

}

/* Resorteio: atualiza o campeão e guarda o rejeitado */
function saveReroll(matchId, results, oldChampion) {

    if (!liveReady || !matchId) return;

    /* Partida precisa existir na sala atual (evita registro "solto") */
    if (!statsData.partidas[matchId]) return;

    const entries = entriesOf(results);
    const rerollKey = db.ref().push().key;

    const updates = {};

    ["salas/" + roomCode + "/partidas/" + matchId, "global/partidas/" + matchId]
        .forEach(base => {
            updates[base + "/entries"] = entries;
            updates[base + "/rerolls/" + rerollKey] = oldChampion;
        });

    db.ref().update(updates)
        .catch(error => console.error(error));

}

/* Jogador adicionado depois do sorteio: atualiza a lista de entradas
   da partida (sala + global) sem mexer em resultado, votos ou resorteios */
function saveAddedPlayer(matchId, results) {

    if (!liveReady || !matchId) return;

    if (!statsData.partidas[matchId]) return;

    const entries = entriesOf(results);

    const updates = {};

    ["salas/" + roomCode + "/partidas/" + matchId, "global/partidas/" + matchId]
        .forEach(base => {
            updates[base + "/entries"] = entries;
        });

    db.ref().update(updates)
        .catch(error => console.error(error));

}

/* Vitória / derrota (somente host). Clicar de novo desmarca. */
function setMatchResult(matchId, value) {

    if (!liveReady || !matchId) return;

    if (!statsData.partidas[matchId]) {
        alert("Esta partida não está registrada na sala atual.");
        return;
    }

    const current = statsData.partidas[matchId].resultado || null;

    /* null apaga o resultado (clicar de novo desmarca) */
    const newValue = (value === null || current === value) ? null : value;

    const updates = {};

    updates["salas/" + roomCode + "/partidas/" + matchId + "/resultado"] = newValue;
    updates["global/partidas/" + matchId + "/resultado"] = newValue;

    db.ref().update(updates).catch(error => {
        console.error(error);
        alert("Não foi possível salvar o resultado (" + (error.code || error.message) + ").");
    });

}

function markCurrent(value) {
    setMatchResult(currentMatchId, value);
}

function showResultBar() {

    if (IS_VIEWER || !liveReady || !currentMatchId) return;

    document.getElementById("resultBar").classList.add("show");

    refreshResultBar();

}

function hideResultBar() {
    document.getElementById("resultBar").classList.remove("show");
}

function refreshResultBar() {

    if (!currentMatchId) return;

    const match = statsData.partidas[currentMatchId];
    const res = match ? match.resultado || null : null;

    document.getElementById("btnWin").classList.toggle("on-vitoria", res === "vitoria");
    document.getElementById("btnLoss").classList.toggle("on-derrota", res === "derrota");
    document.getElementById("btnVoid").classList.toggle("on-anulada", res === "anulada");

    document.getElementById("resultBarStatus").textContent =
        res === "vitoria" ? "Marcada como vitória ✅"
            : res === "derrota" ? "Marcada como derrota ❌"
                : res === "anulada" ? "Partida anulada 🚫 — fora de todas as estatísticas."
                    : "Sem resultado marcado. Você pode marcar agora ou depois, pelo histórico.";

}

/* =====================================================
   LEITURA EM TEMPO REAL: PARTIDAS + VOTOS
===================================================== */

let statsRefs = [];
let statsTimer = null;

function startStats() {

    if (!db || !roomCode) return;

    stopStats();

    const partidasRef = db.ref("salas/" + roomCode + "/partidas");
    const votosRef = db.ref("salas/" + roomCode + "/votos");

    partidasRef.on("value", snap => {
        statsData.partidas = snap.val() || {};
        onStatsChanged();
    }, error => console.error(error));

    votosRef.on("value", snap => {
        statsData.votos = snap.val() || {};
        onStatsChanged();
    }, error => console.error(error));

    statsRefs = [partidasRef, votosRef];

    /* Estatísticas são globais: escuta o global uma única vez */
    if (globalRefs.length === 0) startGlobalStats();

    renderStats();

}

function stopStats() {

    statsRefs.forEach(ref => ref.off());
    statsRefs = [];

    statsData = { partidas: {}, votos: {} };

    renderStats();
    refreshVoteBars();

}

/* =====================================================
   ESTATÍSTICAS GLOBAIS (leitura sob demanda)
===================================================== */

let globalRefs = [];

function startGlobalStats() {

    if (!db) return;

    stopGlobalStats();

    const partidasRef = db.ref("global/partidas");
    const votosRef = db.ref("global/votos");

    partidasRef.on("value", snap => {
        globalData.partidas = snap.val() || {};
        globalLoaded.partidas = true;
        onStatsChanged();
    }, error => {
        console.error(error);
        globalLoaded.partidas = globalLoaded.votos = true;
        renderStats();
    });

    votosRef.on("value", snap => {
        globalData.votos = snap.val() || {};
        globalLoaded.votos = true;
        onStatsChanged();
    }, error => console.error(error));

    globalRefs = [partidasRef, votosRef];

}

function stopGlobalStats() {

    globalRefs.forEach(ref => ref.off());
    globalRefs = [];

    globalData = { partidas: {}, votos: {} };
    globalLoaded = { partidas: false, votos: false };

}

function onStatsChanged() {

    if (statsTimer) return;

    statsTimer = setTimeout(() => {
        statsTimer = null;
        renderStats();
        refreshVoteBars();
        refreshResultBar();
        renderMatchHistory();
    }, 50);

}

/* =====================================================
   LIKE / DISLIKE (espectadores votam na sala)
===================================================== */

function getVotes(matchId, champion) {
    const byMatch = statsData.votos[matchId];
    return (byMatch && byMatch[champion]) || {};
}

async function castVote(matchId, champion, value) {

    if (!IS_VIEWER || !db || !myUid || !matchId) return;

    const current = getVotes(matchId, champion)[myUid] || 0;

    /* Clicar de novo no mesmo voto remove (null) */
    const newValue = current === value ? null : value;

    const suffix = "/votos/" + matchId + "/" + champion + "/" + myUid;

    const updates = {};

    updates["salas/" + roomCode + suffix] = newValue;
    updates["global" + suffix] = newValue;

    try {
        await db.ref().update(updates);
    } catch (error) {
        console.error(error);
        alert("Não foi possível registrar o voto (" + (error.code || error.message) + ").");
    }

}

function createVoteBar(matchId, champion) {

    const bar = document.createElement("div");
    bar.className = "vote-bar";
    bar.dataset.match = matchId;
    bar.dataset.champion = champion;

    [["like", 1], ["dislike", -1]].forEach(([kind, value]) => {

        const button = document.createElement("button");
        button.type = "button";
        button.className = "vote-btn " + kind;
        button.dataset.kind = kind;
        button.onclick = () => castVote(matchId, champion, value);

        bar.appendChild(button);

    });

    return bar;

}

function refreshVoteBars() {

    document.querySelectorAll(".vote-bar").forEach(bar => {

        const votes = getVotes(bar.dataset.match, bar.dataset.champion);

        let likes = 0;
        let dislikes = 0;

        Object.values(votes).forEach(v => {
            if (v === 1) likes++;
            else if (v === -1) dislikes++;
        });

        const mine = myUid ? votes[myUid] || 0 : 0;

        const likeBtn = bar.querySelector(".like");
        const dislikeBtn = bar.querySelector(".dislike");

        likeBtn.textContent = "👍 " + likes;
        dislikeBtn.textContent = "👎 " + dislikes;

        likeBtn.classList.toggle("on", mine === 1);
        dislikeBtn.classList.toggle("on", mine === -1);

        /* Só espectador logado vota; o host só enxerga os números */
        const canVote = IS_VIEWER && !!myUid;

        likeBtn.disabled = !canVote;
        dislikeBtn.disabled = !canVote;

    });

}

/* Adiciona a barra de votos num card (quando há partida e Firebase) */
function appendVoteBar(card, matchId, champion) {

    if (!matchId || !db) return;

    card.appendChild(createVoteBar(matchId, champion));

    refreshVoteBars();

}

/* =====================================================
   ESTATÍSTICAS
===================================================== */

const STATS_TABS = [
    { id: "champions", label: "🛡️ Campeões" },
    { id: "players", label: "👥 Jogadores" },
    { id: "lanes", label: "⚔️ Lanes" }
];

let statsTab = "champions";

const statsSort = {
    champions: { key: "picks", dir: -1 },
    players: { key: "games", dir: -1 },
    lanes: { key: "games", dir: -1 }
};

function ratio(a, b) {
    return (a + b) > 0 ? a / (a + b) : null;
}

function pct(value) {
    return value === null ? "—" : Math.round(value * 100) + "%";
}

function topKey(counts) {

    let best = null;

    Object.keys(counts).forEach(key => {
        if (best === null || counts[key] > counts[best]) best = key;
    });

    return best;

}

function computeStats(src) {

    const champs = {};
    const players = {};
    const lanes = {};

    let total = 0;
    let wins = 0;
    let losses = 0;
    let likes = 0;
    let dislikes = 0;

    const champ = id => champs[id] || (champs[id] = {
        id: id,
        name: championNames[id] || id,
        picks: 0, likes: 0, dislikes: 0, rerolls: 0, wins: 0, losses: 0
    });

    Object.values(src.partidas || {}).forEach(match => {

        if (!match) return;

        const entries = Object.values(match.entries || {});

        if (entries.length === 0) return;

        /* "Não deu jogo": partida descartada, não entra em nenhuma estatística */
        if (match.resultado === "anulada") return;

        const won = match.resultado === "vitoria";
        const lost = match.resultado === "derrota";

        total++;
        if (won) wins++;
        if (lost) losses++;

        entries.forEach(entry => {

            if (!entry || !entry.champion) return;

            const c = champ(entry.champion);
            c.picks++;
            if (won) c.wins++;
            if (lost) c.losses++;

            const pkey = String(entry.player || "").trim().toLowerCase();

            const p = players[pkey] || (players[pkey] = {
                name: entry.player || "?",
                games: 0, wins: 0, losses: 0, champs: {}, lanes: {}
            });

            p.games++;
            if (won) p.wins++;
            if (lost) p.losses++;
            p.champs[entry.champion] = (p.champs[entry.champion] || 0) + 1;
            p.lanes[entry.lane] = (p.lanes[entry.lane] || 0) + 1;

            const l = lanes[entry.lane] || (lanes[entry.lane] = {
                name: entry.lane, games: 0, wins: 0, losses: 0
            });

            l.games++;
            if (won) l.wins++;
            if (lost) l.losses++;

        });

        Object.values(match.rerolls || {}).forEach(id => {
            champ(id).rerolls++;
        });

    });

    Object.keys(src.votos || {}).forEach(matchId => {

        /* Votos de partidas anuladas também ficam de fora */
        const voted = (src.partidas || {})[matchId];
        if (voted && voted.resultado === "anulada") return;

        const byChamp = src.votos[matchId] || {};

        Object.keys(byChamp).forEach(id => {

            const c = champ(id);

            Object.values(byChamp[id] || {}).forEach(v => {
                if (v === 1) { c.likes++; likes++; }
                else if (v === -1) { c.dislikes++; dislikes++; }
            });

        });

    });

    const championRows = Object.values(champs).map(c => Object.assign(c, {
        approval: ratio(c.likes, c.dislikes),
        winrate: ratio(c.wins, c.losses)
    }));

    const playerRows = Object.values(players).map(p => {

        const bestChamp = topKey(p.champs);
        const bestLane = topKey(p.lanes);

        return Object.assign(p, {
            winrate: ratio(p.wins, p.losses),
            topChampion: bestChamp
                ? (championNames[bestChamp] || bestChamp) + " (" + p.champs[bestChamp] + "x)"
                : "—",
            topLane: bestLane ? bestLane + " (" + p.lanes[bestLane] + "x)" : "—"
        });

    });

    const laneRows = laneOrder
        .filter(name => lanes[name])
        .map(name => Object.assign(lanes[name], {
            winrate: ratio(lanes[name].wins, lanes[name].losses)
        }));

    return {
        total, wins, losses, likes, dislikes,
        championRows, playerRows, laneRows
    };

}

function bestBy(rows, key, minValue) {

    let best = null;

    rows.forEach(row => {

        const value = row[key];

        if (value === null || value < minValue) return;

        if (!best || value > best[key]) best = row;

    });

    return best;

}

function statTile(label, value) {

    const tile = document.createElement("div");
    tile.className = "stat-tile";

    const v = document.createElement("div");
    v.className = "v";
    v.textContent = value;

    const k = document.createElement("div");
    k.className = "k";
    k.textContent = label;

    tile.appendChild(v);
    tile.appendChild(k);

    return tile;

}

function statHighlight(label, row, valueText) {

    const box = document.createElement("div");
    box.className = "stat-hl";

    const img = document.createElement("img");
    img.src = IMAGE_URL + row.id + ".png";
    img.onerror = () => { img.style.display = "none"; };

    const info = document.createElement("div");

    const l = document.createElement("div");
    l.className = "hl-label";
    l.textContent = label;

    const n = document.createElement("div");
    n.className = "hl-name";
    n.textContent = row.name;

    const v = document.createElement("div");
    v.className = "hl-value";
    v.textContent = valueText;

    info.appendChild(l);
    info.appendChild(n);
    info.appendChild(v);

    box.appendChild(img);
    box.appendChild(info);

    return box;

}

function championColumns() {
    return [
        {
            key: "name", label: "Campeão", type: "text",
            value: r => r.name,
            show: r => {
                const wrap = document.createElement("span");
                const img = document.createElement("img");
                img.src = IMAGE_URL + r.id + ".png";
                img.onerror = () => { img.style.display = "none"; };
                wrap.appendChild(img);
                wrap.appendChild(document.createTextNode(r.name));
                return wrap;
            }
        },
        { key: "picks", label: "Sorteios", type: "num", value: r => r.picks },
        { key: "likes", label: "👍", type: "num", value: r => r.likes },
        { key: "dislikes", label: "👎", type: "num", value: r => r.dislikes },
        { key: "approval", label: "Aprovação", type: "num", value: r => r.approval, show: r => pct(r.approval) },
        { key: "rerolls", label: "Resorteios", type: "num", value: r => r.rerolls },
        { key: "wins", label: "V", type: "num", value: r => r.wins },
        { key: "losses", label: "D", type: "num", value: r => r.losses },
        { key: "winrate", label: "Win%", type: "num", value: r => r.winrate, show: r => pct(r.winrate) }
    ];
}

function playerColumns() {
    return [
        { key: "name", label: "Jogador", type: "text", value: r => r.name },
        { key: "games", label: "Partidas", type: "num", value: r => r.games },
        { key: "wins", label: "V", type: "num", value: r => r.wins },
        { key: "losses", label: "D", type: "num", value: r => r.losses },
        { key: "winrate", label: "Win%", type: "num", value: r => r.winrate, show: r => pct(r.winrate) },
        { key: "topChampion", label: "Campeão mais sorteado", type: "text", value: r => r.topChampion },
        { key: "topLane", label: "Lane mais jogada", type: "text", value: r => r.topLane }
    ];
}

function laneColumns() {
    return [
        { key: "name", label: "Lane", type: "text", value: r => r.name },
        { key: "games", label: "Partidas", type: "num", value: r => r.games },
        { key: "wins", label: "V", type: "num", value: r => r.wins },
        { key: "losses", label: "D", type: "num", value: r => r.losses },
        { key: "winrate", label: "Win%", type: "num", value: r => r.winrate, show: r => pct(r.winrate) }
    ];
}

function renderStatsTable(columns, rows) {

    const table = document.getElementById("statsTable");

    table.innerHTML = "";

    const sort = statsSort[statsTab];
    const sortCol = columns.find(c => c.key === sort.key) || columns[0];

    const sorted = [...rows].sort((a, b) => {

        const va = sortCol.value(a);
        const vb = sortCol.value(b);

        let result;

        if (sortCol.type === "text") {
            result = String(va).localeCompare(String(vb), "pt-BR");
        } else {
            result = (va === null ? -1 : va) - (vb === null ? -1 : vb);
        }

        if (result !== 0) return result * sort.dir;

        return String(a.name).localeCompare(String(b.name), "pt-BR");

    });

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");

    columns.forEach(col => {

        const th = document.createElement("th");

        th.textContent = col.label +
            (col.key === sortCol.key ? (sort.dir === 1 ? " ▲" : " ▼") : "");

        th.onclick = () => {

            if (sort.key === col.key) {
                sort.dir = -sort.dir;
            } else {
                sort.key = col.key;
                sort.dir = col.type === "text" ? 1 : -1;
            }

            renderStats();

        };

        headRow.appendChild(th);

    });

    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    sorted.forEach(row => {

        const tr = document.createElement("tr");

        columns.forEach(col => {

            const td = document.createElement("td");

            const content = col.show ? col.show(row) : col.value(row);

            if (content instanceof Node) {
                td.appendChild(content);
            } else {
                td.textContent = content === null ? "—" : String(content);
            }

            tr.appendChild(td);

        });

        tbody.appendChild(tr);

    });

    table.appendChild(tbody);

}

function renderStats() {

    const body = document.getElementById("statsBody");
    const empty = document.getElementById("statsEmpty");

    const isGlobal = true;

    document.getElementById("statsInfo").textContent =
        "Soma de todos os sorteios já feitos. Partidas marcadas como \"Não deu jogo\" não entram. Clique no título de uma coluna para ordenar.";

    if (!db) {
        empty.textContent =
            IS_LOCAL
                ? "Estatísticas indisponíveis em modo local (Firebase desligado)."
                : "Estatísticas indisponíveis: o Firebase não está configurado.";
        empty.style.display = "block";
        body.style.display = "none";
        return;
    }

    if (isGlobal && !(globalLoaded.partidas && globalLoaded.votos)) {
        empty.textContent = "Carregando estatísticas globais...";
        empty.style.display = "block";
        body.style.display = "none";
        return;
    }

    const stats = computeStats(isGlobal ? globalData : statsData);

    if (stats.total === 0 && stats.likes + stats.dislikes === 0) {
        empty.textContent = isGlobal
            ? "Nenhuma partida global registrada ainda (ou sem permissão de leitura nas regras do Firebase)."
            : "Nenhuma partida registrada ainda. Faça um sorteio para começar.";
        empty.style.display = "block";
        body.style.display = "none";
        return;
    }

    empty.style.display = "none";
    body.style.display = "block";

    /* Resumo */
    const summary = document.getElementById("statsSummary");
    summary.innerHTML = "";

    summary.appendChild(statTile("Partidas", stats.total));
    summary.appendChild(statTile("Vitórias", stats.wins));
    summary.appendChild(statTile("Derrotas", stats.losses));
    summary.appendChild(statTile("Winrate", pct(ratio(stats.wins, stats.losses))));
    summary.appendChild(statTile("👍 Likes", stats.likes));
    summary.appendChild(statTile("👎 Dislikes", stats.dislikes));

    /* Destaques */
    const highlights = document.getElementById("statsHighlights");
    highlights.innerHTML = "";

    const rows = stats.championRows;

    const mostPicked = bestBy(rows, "picks", 1);
    const mostLoved = bestBy(rows, "likes", 1);
    const mostHated = bestBy(rows, "dislikes", 1);
    const mostRerolled = bestBy(rows, "rerolls", 1);
    const bestWinrate = bestBy(
        rows.filter(r => r.wins + r.losses >= 2), "winrate", 0
    );

    if (mostPicked) highlights.appendChild(
        statHighlight("Mais sorteado", mostPicked, mostPicked.picks + "x"));

    if (mostLoved) highlights.appendChild(
        statHighlight("Mais amado", mostLoved, "👍 " + mostLoved.likes));

    if (mostHated) highlights.appendChild(
        statHighlight("Mais odiado", mostHated, "👎 " + mostHated.dislikes));

    if (mostRerolled) highlights.appendChild(
        statHighlight("Mais resorteado", mostRerolled, mostRerolled.rerolls + "x"));

    if (bestWinrate) highlights.appendChild(
        statHighlight(
            "Melhor winrate", bestWinrate,
            pct(bestWinrate.winrate) + " (" + bestWinrate.wins + "V " + bestWinrate.losses + "D)"
        ));

    /* Abas */
    const tabs = document.getElementById("statsTabs");
    tabs.innerHTML = "";

    STATS_TABS.forEach(tab => {

        const button = document.createElement("button");
        button.type = "button";
        button.className = "mini-btn" + (tab.id === statsTab ? " active" : "");
        button.textContent = tab.label;
        button.onclick = () => {
            statsTab = tab.id;
            renderStats();
        };

        tabs.appendChild(button);

    });

    /* Tabela da aba atual */
    if (statsTab === "champions") {
        renderStatsTable(championColumns(), stats.championRows);
    } else if (statsTab === "players") {
        renderStatsTable(playerColumns(), stats.playerRows);
    } else {
        renderStatsTable(laneColumns(), stats.laneRows);
    }

}

/* =====================================================
   CHAT DA SALA

   Estrutura: salas/CODIGO/mensagens/{pushId}
              -> { uid, nome, texto, ts }
===================================================== */

const CHAT_NAME_KEY = "chatName";
const CHAT_LIMIT = 100;

let chatStarted = false;
let chatListenerRef = null;
let lastSentAt = 0;

function startChat() {

    if (chatStarted || !db || !roomCode) return;

    chatStarted = true;

    document.getElementById("chatCard").style.display = "block";

    const nameInput = document.getElementById("chatName");

    if (!nameInput.value) {
        nameInput.value = localStorage.getItem(CHAT_NAME_KEY) || "";
    }

    const box = document.getElementById("chatMessages");

    box.innerHTML = "";

    const empty = document.createElement("div");
    empty.className = "chat-empty";
    empty.textContent = "Nenhuma mensagem ainda. Diga oi! 👋";
    box.appendChild(empty);

    /* Só as últimas mensagens; child_added dispara uma vez por mensagem */
    chatListenerRef = db.ref("salas/" + roomCode + "/mensagens")
        .orderByChild("ts")
        .limitToLast(CHAT_LIMIT);

    chatListenerRef.on("child_added", snap => {

        const m = snap.val();

        if (!m || typeof m.texto !== "string") return;

        const emptyMsg = box.querySelector(".chat-empty");
        if (emptyMsg) emptyMsg.remove();

        const nearBottom =
            box.scrollHeight - box.scrollTop - box.clientHeight < 60;

        const row = document.createElement("div");
        row.className = "chat-msg" + (m.uid === myUid ? " mine" : "");

        const n = document.createElement("span");
        n.className = "n";
        n.textContent = (m.nome || "?") + ":";

        const text = document.createTextNode(" " + m.texto);

        const t = document.createElement("span");
        t.className = "t";
        t.textContent = new Date(m.ts).toLocaleTimeString(
            "pt-BR", { hour: "2-digit", minute: "2-digit" }
        );

        row.appendChild(n);
        row.appendChild(text);
        row.appendChild(t);

        box.appendChild(row);

        while (box.children.length > CHAT_LIMIT) box.firstChild.remove();

        if (nearBottom || m.uid === myUid) box.scrollTop = box.scrollHeight;

    }, error => {
        console.error(error);
    });

}

/* Para de escutar a sala atual (usado ao criar nova sala) */
function stopChat() {

    if (chatListenerRef) {
        chatListenerRef.off();
        chatListenerRef = null;
    }

    chatStarted = false;

    document.getElementById("chatMessages").innerHTML = "";

}

function sendChatMessage() {

    const nameInput = document.getElementById("chatName");
    const input = document.getElementById("chatInput");

    const nome = nameInput.value.trim().slice(0, 20);
    const texto = input.value.trim().slice(0, 300);

    if (!texto) return;

    if (!nome) {
        nameInput.focus();
        return;
    }

    if (!myUid || !db || !roomCode) return;

    /* Anti-spam simples: 1 mensagem por segundo */
    if (Date.now() - lastSentAt < 1000) return;
    lastSentAt = Date.now();

    localStorage.setItem(CHAT_NAME_KEY, nome);

    db.ref("salas/" + roomCode + "/mensagens").push({
        uid: myUid,
        nome: nome,
        texto: texto,
        ts: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        input.value = "";
    }).catch(error => {
        console.error("Erro ao enviar mensagem:", error);
        alert("Não foi possível enviar (" + (error.code || error.message) + "). Verifique as regras do Firebase.");
    });

}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("chatForm").addEventListener("submit", event => {
        event.preventDefault();
        sendChatMessage();
    });
});

/* =====================================================
   COMPARTILHAR TELA (WebRTC + sinalização via Firebase)

   O vídeo NÃO passa pelo Firebase: vai direto do host para cada
   espectador (peer-to-peer). O Firebase só troca as mensagens de
   conexão (ofertas, respostas e candidatos ICE), que são pequenas
   e apagadas quando o host para de compartilhar.

   Estrutura: salas/CODIGO/rtc/
     active            -> { sid }              (existe só enquanto compartilha)
     viewers/{uid}     -> { sid, cid }         (espectador pede para conectar)
     offers/{cid}      -> { sid, type, sdp }   (host -> espectador)
     answers/{cid}     -> { type, sdp }        (espectador -> host)
     ice/{cid}/host    -> candidatos do host
     ice/{cid}/viewer  -> candidatos do espectador
===================================================== */

const RTC_CONFIG = {
    iceServers: [
        { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }
    ]
};

/* Limite de bitrate do vídeo enviado a CADA espectador (bits/s) */
const SCREEN_MAX_BITRATE = 2500000;

function rtcRef(path) {
    return db.ref("salas/" + roomCode + "/rtc" + (path ? "/" + path : ""));
}

/* ---------- HOST ---------- */

let screenStream = null;
let screenSid = null;
let screenPeers = {};
let screenViewersRef = null;

function setScreenHostStatus(text) {
    document.getElementById("screenHostStatus").textContent = text;
}

function enableScreenHostUI() {

    if (!SCREEN_HOST) return;

    document.getElementById("screenHostBox").style.display = "block";

    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        document.getElementById("screenStartBtn").disabled = true;
        setScreenHostStatus(
            "Este navegador não consegue compartilhar a tela (use o Chrome/Edge/Firefox no computador)."
        );
        return;
    }

    setScreenHostStatus(
        "Pronto. O link da sala copiado acima já inclui o acesso à tela (&tv=1)."
    );

}

function updateScreenHostCount() {

    if (!screenStream) return;

    const connected = Object.values(screenPeers)
        .filter(p => p.pc.connectionState === "connected").length;

    setScreenHostStatus(
        "🔴 Compartilhando — " + connected + " espectador(es) conectado(s)."
    );

}

function limitBitrate(pc) {

    pc.getSenders().forEach(sender => {

        if (!sender.track || sender.track.kind !== "video") return;

        try {
            const p = sender.getParameters();
            if (!p.encodings || !p.encodings.length) p.encodings = [{}];
            p.encodings[0].maxBitrate = SCREEN_MAX_BITRATE;
            sender.setParameters(p).catch(() => { });
        } catch (e) { /* opcional */ }

    });

}

async function startScreenShare() {

    if (!liveReady || screenStream) return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        alert("Este navegador não suporta compartilhar a tela.");
        return;
    }

    try {
        screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: { frameRate: { ideal: 30 } },
            audio: true
        });
    } catch (error) {
        screenStream = null;
        setScreenHostStatus("Compartilhamento cancelado.");
        return;
    }

    const videoTrack = screenStream.getVideoTracks()[0];

    if (videoTrack) {
        try { videoTrack.contentHint = "motion"; } catch (e) { /* opcional */ }
        /* Botão "Parar compartilhamento" do próprio navegador */
        videoTrack.addEventListener("ended", stopScreenShare);
    }

    screenSid = newMatchId();

    const preview = document.getElementById("screenPreview");
    preview.srcObject = screenStream;
    preview.style.display = "block";

    document.getElementById("screenStartBtn").style.display = "none";
    document.getElementById("screenStopBtn").style.display = "";

    setScreenHostStatus("Iniciando transmissão da tela...");

    try {

        /* Limpa restos de transmissões anteriores e abre a nova */
        await rtcRef().remove();

        await rtcRef("active").set({
            sid: screenSid,
            ts: firebase.database.ServerValue.TIMESTAMP
        });

    } catch (error) {
        console.error(error);
        setScreenHostStatus(
            "Erro ao iniciar (" + (error.code || error.message) +
            "). Verifique as regras do Firebase para o nó 'rtc'."
        );
        stopScreenShare();
        return;
    }

    /* Escuta pedidos de conexão dos espectadores (só enquanto compartilha) */
    screenViewersRef = rtcRef("viewers");

    const onViewer = snap => {
        const v = snap.val();
        if (!v || v.sid !== screenSid || !v.cid) return;
        hostConnect(snap.key, v.cid);
    };

    screenViewersRef.on("child_added", onViewer);
    screenViewersRef.on("child_changed", onViewer);

    updateScreenHostCount();

}

async function hostConnect(uid, cid) {

    if (!screenStream || screenPeers[cid]) return;

    /* O mesmo espectador reconectou (recarregou a página): descarta a antiga */
    Object.keys(screenPeers).forEach(key => {
        if (screenPeers[key].uid === uid) closeHostPeer(key);
    });

    const pc = new RTCPeerConnection(RTC_CONFIG);

    const peer = { pc: pc, uid: uid, pending: [], remoteSet: false, gotAnswer: false, refs: [] };

    screenPeers[cid] = peer;

    screenStream.getTracks().forEach(track => pc.addTrack(track, screenStream));

    pc.onicecandidate = event => {
        if (event.candidate) {
            rtcRef("ice/" + cid + "/host").push(event.candidate.toJSON())
                .catch(error => console.error(error));
        }
    };

    pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "closed") {
            closeHostPeer(cid);
        }
        updateScreenHostCount();
    };

    /* Resposta do espectador */
    const answerRef = rtcRef("answers/" + cid);

    answerRef.on("value", async snap => {

        const a = snap.val();

        if (!a || peer.gotAnswer) return;

        peer.gotAnswer = true;

        try {
            await pc.setRemoteDescription({ type: a.type, sdp: a.sdp });
            peer.remoteSet = true;
            peer.pending.forEach(c => pc.addIceCandidate(c).catch(() => { }));
            peer.pending = [];
        } catch (error) {
            console.error("Erro ao aplicar resposta:", error);
        }

    });

    /* Candidatos ICE do espectador */
    const iceRef = rtcRef("ice/" + cid + "/viewer");

    iceRef.on("child_added", snap => {
        const c = snap.val();
        if (!c) return;
        if (peer.remoteSet) pc.addIceCandidate(c).catch(() => { });
        else peer.pending.push(c);
    });

    peer.refs = [answerRef, iceRef];

    /* Oferta */
    try {

        const offer = await pc.createOffer();

        await pc.setLocalDescription(offer);

        limitBitrate(pc);

        await rtcRef("offers/" + cid).set({
            sid: screenSid,
            type: offer.type,
            sdp: offer.sdp
        });

    } catch (error) {
        console.error("Erro ao criar oferta:", error);
        closeHostPeer(cid);
    }

}

function closeHostPeer(cid) {

    const peer = screenPeers[cid];

    if (!peer) return;

    delete screenPeers[cid];

    peer.refs.forEach(ref => ref.off());

    try { peer.pc.close(); } catch (e) { /* ignora */ }

    if (db && roomCode) {
        rtcRef("offers/" + cid).remove().catch(() => { });
        rtcRef("answers/" + cid).remove().catch(() => { });
        rtcRef("ice/" + cid).remove().catch(() => { });
    }

}

function stopScreenShare() {

    if (!screenStream && !screenSid) return;

    if (screenViewersRef) {
        screenViewersRef.off();
        screenViewersRef = null;
    }

    Object.keys(screenPeers).forEach(cid => {
        const peer = screenPeers[cid];
        delete screenPeers[cid];
        peer.refs.forEach(ref => ref.off());
        try { peer.pc.close(); } catch (e) { /* ignora */ }
    });

    if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        screenStream = null;
    }

    const preview = document.getElementById("screenPreview");
    preview.srcObject = null;
    preview.style.display = "none";

    document.getElementById("screenStartBtn").style.display = "";
    document.getElementById("screenStopBtn").style.display = "none";

    setScreenHostStatus("Compartilhamento encerrado.");

    /* Apaga toda a sinalização da sala: avisa os espectadores e
       não deixa lixo no Firebase */
    if (db && roomCode && screenSid) {
        rtcRef().remove().catch(error => console.error(error));
    }

    screenSid = null;

}

/* ---------- ESPECTADOR ---------- */

let screenViewStarted = false;
let viewerCurrentSid = null;
let viewerPeer = null;
let viewerRetries = 0;

function setScreenViewStatus(text) {
    document.getElementById("screenViewStatus").textContent = text;
}

function setScreenPlaying(on) {
    document.querySelector("#screenViewCard .screen-wrap")
        .classList.toggle("playing", on);
}

function startScreenView() {

    if (!SCREEN_VIEW || screenViewStarted || !db || !myUid) return;

    screenViewStarted = true;

    document.getElementById("screenViewCard").style.display = "block";

    setScreenViewStatus("Aguardando o host compartilhar a tela...");

    rtcRef("active").on("value", snap => {

        const active = snap.val();

        if (!active || !active.sid) {
            viewerCurrentSid = null;
            closeViewerPeer();
            setScreenPlaying(false);
            setScreenViewStatus("O host não está compartilhando a tela agora.");
            return;
        }

        if (active.sid === viewerCurrentSid) return;

        viewerCurrentSid = active.sid;
        viewerRetries = 0;

        viewerJoin(active.sid);

    }, error => {
        console.error(error);
        setScreenViewStatus("Sem permissão para ler a tela (" + error.code + ").");
    });

}

function closeViewerPeer() {

    if (!viewerPeer) return;

    viewerPeer.refs.forEach(ref => ref.off());

    try { viewerPeer.pc.close(); } catch (e) { /* ignora */ }

    viewerPeer = null;

    const video = document.getElementById("screenVideo");
    video.srcObject = null;

}

async function viewerJoin(sid) {

    closeViewerPeer();

    const cid = newMatchId();
    const pc = new RTCPeerConnection(RTC_CONFIG);

    const peer = { pc: pc, cid: cid, pending: [], remoteSet: false, gotOffer: false, refs: [] };

    viewerPeer = peer;

    setScreenViewStatus("Conectando à tela do host...");

    pc.ontrack = event => {

        const video = document.getElementById("screenVideo");

        if (video.srcObject !== event.streams[0]) {
            video.srcObject = event.streams[0];
        }

        setScreenPlaying(true);

        video.play().catch(() => {
            /* Sem permissão de som: começa mudo (use os controles do vídeo) */
            video.muted = true;
            video.play().catch(() => { });
            setScreenViewStatus("Vídeo sem som — clique no ícone de volume do player.");
        });

    };

    pc.onicecandidate = event => {
        if (event.candidate) {
            rtcRef("ice/" + cid + "/viewer").push(event.candidate.toJSON())
                .catch(error => console.error(error));
        }
    };

    pc.onconnectionstatechange = () => {

        if (viewerPeer !== peer) return;

        if (pc.connectionState === "connected") {
            viewerRetries = 0;
            setScreenViewStatus("🔴 Ao vivo");
        } else if (pc.connectionState === "failed") {

            setScreenPlaying(false);

            if (viewerRetries < 3) {
                viewerRetries++;
                setScreenViewStatus("Conexão falhou. Tentando de novo...");
                setTimeout(() => {
                    if (viewerPeer === peer && viewerCurrentSid === sid) viewerJoin(sid);
                }, 2000);
            } else {
                setScreenViewStatus(
                    "Não foi possível conectar à tela (rede bloqueando a conexão direta)."
                );
            }

        }

    };

    /* Oferta do host */
    const offerRef = rtcRef("offers/" + cid);

    offerRef.on("value", async snap => {

        const o = snap.val();

        if (!o || o.sid !== sid || peer.gotOffer) return;

        peer.gotOffer = true;

        try {

            await pc.setRemoteDescription({ type: o.type, sdp: o.sdp });

            peer.remoteSet = true;
            peer.pending.forEach(c => pc.addIceCandidate(c).catch(() => { }));
            peer.pending = [];

            const answer = await pc.createAnswer();

            await pc.setLocalDescription(answer);

            await rtcRef("answers/" + cid).set({
                type: answer.type,
                sdp: answer.sdp
            });

        } catch (error) {
            console.error("Erro ao responder à oferta:", error);
            setScreenViewStatus("Erro ao conectar (" + (error.code || error.message) + ").");
        }

    });

    /* Candidatos ICE do host */
    const iceRef = rtcRef("ice/" + cid + "/host");

    iceRef.on("child_added", snap => {
        const c = snap.val();
        if (!c) return;
        if (peer.remoteSet) pc.addIceCandidate(c).catch(() => { });
        else peer.pending.push(c);
    });

    peer.refs = [offerRef, iceRef];

    /* Avisa o host que quer conectar */
    try {
        await rtcRef("viewers/" + myUid).set({
            sid: sid,
            cid: cid,
            ts: firebase.database.ServerValue.TIMESTAMP
        });
    } catch (error) {
        console.error(error);
        setScreenViewStatus(
            "Sem permissão para conectar à tela (" + (error.code || error.message) + ")."
        );
    }

}

/* ---------- ESPECTADOR (sorteio) ---------- */

function setViewerStatus(text, state) {
    const el = document.getElementById("viewerStatus");
    el.innerHTML = "";
    const dot = document.createElement("span");
    dot.className = "live-dot" + (state ? " " + state : "");
    el.appendChild(dot);
    el.appendChild(document.createTextNode(text));
}

function initViewer() {

    document.body.classList.add("viewer");

    document.getElementById("headerSubtitle").textContent =
        "Acompanhe o sorteio ao vivo";

    const overlay = document.getElementById("viewerOverlay");
    const joinButton = document.getElementById("joinButton");
    const joinName = document.getElementById("joinName");

    /* Reaproveita o nome usado antes, se houver */
    joinName.value = localStorage.getItem("chatName") || "";

    joinName.addEventListener("input", () => joinName.classList.remove("invalid"));

    joinName.addEventListener("keydown", event => {
        if (event.key === "Enter") joinButton.click();
    });

    /* Código inválido ou Firebase ausente */
    if (!/^[A-Z0-9]{4,12}$/.test(rawRoom)) {
        overlay.style.display = "flex";
        document.getElementById("overlayText").textContent =
            "Link de sala inválido.";
        joinButton.style.display = "none";
        document.getElementById("joinName").style.display = "none";
        return;
    }

    if (!initFirebase()) {
        overlay.style.display = "flex";
        document.getElementById("overlayText").textContent =
            "Este site ainda não está configurado para transmissão ao vivo.";
        joinButton.style.display = "none";
        document.getElementById("joinName").style.display = "none";
        return;
    }

    roomCode = rawRoom;

    overlay.style.display = "flex";

    joinButton.onclick = async () => {

        /* Nome obrigatório (pode ser qualquer um) */
        const chosenName = joinName.value.trim().slice(0, 20);

        if (!chosenName) {
            joinName.classList.add("invalid");
            joinName.focus();
            return;
        }

        localStorage.setItem("chatName", chosenName);
        document.getElementById("chatName").value = chosenName;

        unlockAudio();
        overlay.style.display = "none";
        startListening();
        startStats();

        /* Login anônimo do espectador (necessário para chat e votos) */
        try {
            const cred = await firebase.auth().signInAnonymously();
            myUid = cred.user.uid;
        } catch (error) {
            console.error("Falha no login anônimo:", error);
        }

        startChat();

        /* Tela compartilhada (só com &tv=1 na URL) */
        startScreenView();

        /* Agora que o uid existe, libera os botões de voto */
        refreshVoteBars();
    };

}

let viewerFirstSnapshot = true;
let viewerLastId = null;
let viewerQueue = Promise.resolve();

function startListening() {

    setViewerStatus("Conectando à sala " + roomCode + "...");

    db.ref(".info/connected").on("value", snap => {
        if (snap.val() === true) {
            setViewerStatus("Ao vivo — sala " + roomCode, "on");
        } else {
            setViewerStatus("Reconectando...", "off");
        }
    });

    db.ref("salas/" + roomCode + "/sorteio").on("value", snap => {

        const data = snap.val();

        /* Primeira leitura: mostra o último resultado sem animar */
        if (viewerFirstSnapshot) {
            viewerFirstSnapshot = false;

            if (data && data.results) {
                viewerLastId = data.id;
                renderStaticResults(Object.values(data.results), data.matchId);
            }

            return;
        }

        if (!data || !data.results || data.id === viewerLastId) return;

        viewerLastId = data.id;

        const results = Object.values(data.results);
        const matchId = data.matchId || null;

        /* Jogador novo adicionado à partida: anima só o card dele */
        if (data.add) {
            const added = results.find(r => r.lane === data.add);

            if (added) {
                viewerQueue = viewerQueue
                    .then(() => animateAddedCard(added, matchId))
                    .then(() => updateLatestHistory(results))
                    .catch(error => console.error(error));
            }

            return;
        }

        /* Resorteio de um card só */
        if (data.reroll) {
            const changed = results.find(r => r.lane === data.reroll);

            if (changed) {
                viewerQueue = viewerQueue
                    .then(() => animateSingleCard(changed, matchId))
                    .then(() => updateLatestHistory(results))
                    .catch(error => console.error(error));
            }

            return;
        }

        /* Enfileira para não sobrepor animações */
        viewerQueue = viewerQueue
            .then(() => animateResults(results, matchId))
            .then(() => addMatchToHistory(results, matchId))
            .catch(error => console.error(error));

    }, error => {
        console.error(error);
        setViewerStatus("Sem permissão para ler a sala (" + error.code + ")", "off");
    });

}

/* Mostra um resultado já pronto, sem animação (quem entra no meio) */
function renderStaticResults(results, matchId) {

    const container = document.getElementById("results");

    container.innerHTML = "";

    results.forEach(result => {

        const card = document.createElement("div");
        card.className = "result";
        card.dataset.lane = result.lane;
        card.dataset.match = matchId || "";

        const lane = document.createElement("div");
        lane.className = "lane-name";
        lane.textContent = result.lane;

        const box = document.createElement("div");
        box.className = "shuffle-container";

        const image = document.createElement("img");
        image.src = IMAGE_URL + result.champion + ".png";

        const text = document.createElement("div");
        text.className = "shuffle-text";
        const strong = document.createElement("strong");
        strong.textContent = result.player;
        text.appendChild(strong);

        const champion = document.createElement("div");
        champion.className = "champion";
        champion.textContent = championNames[result.champion] || result.champion;

        box.appendChild(image);
        box.appendChild(text);
        box.appendChild(champion);

        card.appendChild(lane);
        card.appendChild(box);

        appendVoteBar(card, matchId, result.champion);

        container.appendChild(card);

    });

}

/* =====================================================
   INICIALIZAÇÃO
===================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    /* Carrega a lista atual de campeões antes de montar a tela */
    await loadChampionData();

    renderMatchHistory();

    if (IS_VIEWER) {
        initViewer();
        renderStats();
        return;
    }

    loadSettings();
    loadRotationSettings();
    loadPersistSettings();
    renderChampions();
    renderPools();

    /* Atualiza o status da rotação quando os nomes mudam */
    document.querySelectorAll(".player-input").forEach(input => {
        input.addEventListener("input", updateRotationStatus);
    });

    initHost();

});

/* =====================================================
   CAMPEÕES
===================================================== */

function renderChampions() {

    const container = document.getElementById("championList");

    container.innerHTML = "";

    const excluded = JSON.parse(
        localStorage.getItem("excludedChampions") || "[]"
    );

    champions.forEach(champion => {

        const wrapper = document.createElement("label");
        wrapper.className = "champion-option";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = champion;
        checkbox.checked = excluded.includes(champion);
        checkbox.onchange = saveExcludedChampions;

        const image = document.createElement("img");
        image.src = IMAGE_URL + champion + ".png";
        image.onerror = () => { image.style.display = "none"; };

        const name = document.createElement("span");
        name.textContent = championNames[champion] || champion;

        wrapper.appendChild(checkbox);
        wrapper.appendChild(image);
        wrapper.appendChild(name);

        container.appendChild(wrapper);

    });

}

/* =====================================================
   EXCLUSÕES
===================================================== */

function saveExcludedChampions() {

    const checked = [
        ...document.querySelectorAll("#championList input:checked")
    ].map(input => input.value);

    localStorage.setItem("excludedChampions", JSON.stringify(checked));

}

/* =====================================================
   PESQUISA
===================================================== */

function filterChampions() {

    const search = document
        .getElementById("championSearch")
        .value
        .toLowerCase();

    document.querySelectorAll(".champion-option").forEach(element => {

        const text = element.textContent.toLowerCase();

        element.style.display = text.includes(search) ? "flex" : "none";

    });

}

/* =====================================================
   FULL RANDOM
===================================================== */

function toggleLanes() {

    const fullRandom = document.getElementById("fullRandom").checked;

    document.querySelectorAll("#laneContainer input").forEach(input => {
        input.disabled = fullRandom;
    });

}

/* =====================================================
   CONFIGURAÇÕES
===================================================== */

function saveSettings() {

    const remember = document.getElementById("rememberNoRepeat").checked;

    if (!remember) {
        localStorage.removeItem("noRepeat");
        return;
    }

    localStorage.setItem(
        "noRepeat",
        document.getElementById("noRepeat").checked
    );

}

function loadSettings() {

    const saved = localStorage.getItem("noRepeat");

    if (saved !== null) {
        document.getElementById("rememberNoRepeat").checked = true;
        document.getElementById("noRepeat").checked = saved === "true";
    }

}

/* =====================================================
   UTILITÁRIOS
===================================================== */

function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function shuffle(array) {

    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];

    }

    return result;

}

/* =====================================================
   ROTAÇÃO DE LANES (não repetir lane entre partidas)

   Guarda, para cada jogador, as lanes que ele já jogou
   no ciclo atual. A cada sorteio, cada um recebe uma lane
   que ainda não jogou. Quando não for mais possível
   (ex.: 3 jogadores, 4ª partida), avisa e reinicia o ciclo.
===================================================== */

const ROTATION_KEY = "laneRotation";

function emptyRotation() {
    return { count: 0, history: {} };
}

function loadRotation() {
    try {
        const saved = JSON.parse(localStorage.getItem(ROTATION_KEY));
        if (saved && saved.history) return saved;
    } catch (e) { /* ignora */ }
    return null;
}

function saveRotation(state) {
    localStorage.setItem(ROTATION_KEY, JSON.stringify(state));
}

function getCurrentPlayers() {
    return [...document.querySelectorAll(".player-input")]
        .map(input => input.value.trim())
        .filter(name => name.length > 0);
}

/* Tenta dar a cada jogador uma lane diferente que ele ainda não jogou
   (backtracking; com no máximo 5 jogadores é instantâneo).
   Retorna a lista de pares ou null se for impossível. */
function findRotationMatch(players, pool, history, randomize) {

    const pairs = [];
    const used = new Set();

    function assign(i) {

        if (i === players.length) return true;

        const played = history[players[i]] || [];

        const candidates = (randomize ? shuffle(pool) : pool)
            .filter(lane => !played.includes(lane) && !used.has(lane));

        for (const lane of candidates) {

            used.add(lane);
            pairs.push({ player: players[i], lane: lane });

            if (assign(i + 1)) return true;

            pairs.pop();
            used.delete(lane);

        }

        return false;

    }

    return assign(0) ? pairs : null;

}

function assignLanesWithRotation(players, pool, randomize) {

    /* O histórico fica salvo no navegador e só é limpo quando o
       ciclo completa ou quando o usuário clica em "Resetar rotação" */
    let state = loadRotation() || emptyRotation();

    let wasReset = false;

    let pairs = findRotationMatch(players, pool, state.history, randomize);

    /* Não há mais como evitar repetição -> reseta o ciclo */
    if (!pairs) {
        wasReset = state.count > 0;
        state = emptyRotation();
        pairs = findRotationMatch(players, pool, state.history, randomize);
    }

    /* Registra as lanes desta partida */
    pairs.forEach(({ player, lane }) => {
        if (!state.history[player]) state.history[player] = [];
        state.history[player].push(lane);
    });

    state.count++;

    saveRotation(state);

    return { pairs: pairs, wasReset: wasReset, count: state.count };

}

function resetRotation(manual) {

    localStorage.removeItem(ROTATION_KEY);

    hideRotationNotice();
    updateRotationStatus();

    if (manual) {
        showRotationNotice("↺ Rotação resetada. A próxima partida começa um novo ciclo.");
    }

}

function showRotationNotice(message) {
    const notice = document.getElementById("rotationNotice");
    notice.textContent = message;
    notice.style.display = "block";
}

function hideRotationNotice() {
    const notice = document.getElementById("rotationNotice");
    notice.style.display = "none";
    notice.textContent = "";
}

function updateRotationStatus() {

    const status = document.getElementById("rotationStatus");
    const button = document.getElementById("resetRotationBtn");
    const enabled = document.getElementById("noRepeatLanes").checked;

    status.style.display = button.style.display = enabled ? "" : "none";

    if (!enabled) return;

    const players = getCurrentPlayers();
    const state = loadRotation();

    if (!state || state.count === 0) {
        status.textContent = "Rotação nova: nenhuma partida registrada ainda.";
        return;
    }

    const fullRandom = document.getElementById("fullRandom").checked;

    /* No modo manual o ciclo tem exatamente "nº de jogadores" partidas */
    if (!fullRandom && state.count >= players.length) {
        status.textContent =
            `Rotação completa (${state.count} partidas). ` +
            `O próximo sorteio vai resetar o ciclo.`;
    } else if (!fullRandom) {
        status.textContent =
            `Partidas no ciclo: ${state.count} de ${players.length}.`;
    } else {
        status.textContent = `Partidas no ciclo: ${state.count}.`;
    }

}

function onRotationToggle() {
    localStorage.setItem(
        "noRepeatLanes",
        document.getElementById("noRepeatLanes").checked
    );
    updateRotationStatus();
}

function loadRotationSettings() {
    document.getElementById("noRepeatLanes").checked =
        localStorage.getItem("noRepeatLanes") === "true";
    updateRotationStatus();
}

/* =====================================================
   HISTÓRICO DAS ÚLTIMAS PARTIDAS
===================================================== */

const HISTORY_KEY = "matchHistory";
const HISTORY_LIMIT = 20;

function loadMatchHistory() {
    try {
        const saved = JSON.parse(localStorage.getItem(HISTORY_KEY));
        return Array.isArray(saved) ? saved : [];
    } catch (e) {
        return [];
    }
}

function addMatchToHistory(results, matchId) {

    const history = loadMatchHistory();

    history.unshift({
        id: matchId || null,
        time: Date.now(),
        entries: results.map(r => ({
            player: r.player,
            lane: r.lane,
            champion: r.champion
        }))
    });

    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(history.slice(0, HISTORY_LIMIT))
    );

    renderMatchHistory();

}

function renderMatchHistory() {

    const container = document.getElementById("matchHistory");

    const history = loadMatchHistory();

    container.innerHTML = "";

    if (history.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty";
        empty.textContent = "Nenhuma partida sorteada ainda.";
        container.appendChild(empty);
        return;
    }

    history.forEach(match => {

        const item = document.createElement("div");
        item.className = "history-item";

        const when = document.createElement("div");
        when.className = "when";
        when.textContent = new Date(match.time).toLocaleString("pt-BR");

        /* Resultado (vem do Firebase, quando a partida está registrada) */
        const saved = match.id ? statsData.partidas[match.id] : null;
        const res = saved ? saved.resultado || null : null;

        if (res) {
            const tag = document.createElement("span");
            tag.className = "result-tag " + res;
            tag.textContent = res === "vitoria" ? "✅ Vitória"
                : res === "derrota" ? "❌ Derrota" : "🚫 Não deu jogo";
            when.appendChild(tag);
        }

        item.appendChild(when);

        match.entries.forEach(entry => {

            const span = document.createElement("span");
            span.className = "entry";

            const lane = document.createElement("span");
            lane.className = "l";
            lane.textContent = entry.lane + ": ";

            const player = document.createElement("strong");
            player.textContent = entry.player;

            const champion = document.createElement("span");
            champion.className = "c";
            champion.textContent =
                " (" + (championNames[entry.champion] || entry.champion) + ")";

            span.appendChild(lane);
            span.appendChild(player);
            span.appendChild(champion);

            item.appendChild(span);

        });

        /* Host pode marcar vitória/derrota de partidas anteriores */
        if (!IS_VIEWER && liveReady && match.id && saved) {

            const actions = document.createElement("div");
            actions.className = "history-actions";

            [["vitoria", "✅ Vitória"], ["derrota", "❌ Derrota"], ["anulada", "🚫 Não deu jogo"]].forEach(([value, label]) => {

                const button = document.createElement("button");
                button.type = "button";
                button.className = "mini-btn" + (res === value ? " on-" + value : "");
                button.textContent = label;
                button.onclick = () => setMatchResult(match.id, value);

                actions.appendChild(button);

            });

            item.appendChild(actions);

        }

        container.appendChild(item);

    });

}

function clearMatchHistory() {

    if (loadMatchHistory().length === 0) return;

    if (!confirm("Limpar o histórico das partidas?")) return;

    localStorage.removeItem(HISTORY_KEY);

    renderMatchHistory();

}

/* =====================================================
   CAMPEÕES JÁ SORTEADOS (lista persistente)

   Quando a opção está ativa, a lista salva no navegador é
   consultada antes de sortear e só é limpa pelo botão de reset
   (ou se não sobrarem campeões suficientes e você confirmar).
===================================================== */

const DRAWN_KEY = "drawnChampions";

function loadDrawn() {
    try {
        const saved = JSON.parse(localStorage.getItem(DRAWN_KEY));
        return Array.isArray(saved) ? saved : [];
    } catch (e) {
        return [];
    }
}

function addDrawn(list) {
    const set = new Set(loadDrawn());
    list.forEach(champion => set.add(champion));
    localStorage.setItem(DRAWN_KEY, JSON.stringify([...set]));
    updatePersistStatus();
}

function resetDrawn(manual) {

    localStorage.removeItem(DRAWN_KEY);

    updatePersistStatus();

    if (manual) {
        showRotationNotice("↺ Lista de campeões já sorteados resetada.");
    }

}

function updatePersistStatus() {

    const enabled = document.getElementById("persistNoRepeat").checked;
    const status = document.getElementById("persistStatus");
    const button = document.getElementById("resetDrawnBtn");

    status.style.display = button.style.display = enabled ? "" : "none";

    if (!enabled) return;

    status.textContent =
        `Já sorteados: ${loadDrawn().length} de ${champions.length} campeões.`;

}

/* "Já sorteados" só vale quando nenhuma pool está ativa */
function persistActive() {
    return document.getElementById("persistNoRepeat").checked
        && getSelectedPoolIds().length === 0;
}

function applyPersistClass() {
    document.body.classList.toggle("persist-on", persistActive());
}

function onPersistToggle() {
    localStorage.setItem(
        "persistNoRepeat",
        document.getElementById("persistNoRepeat").checked
    );
    applyPersistClass();
    updatePersistStatus();
}

/* Por padrão a opção vem marcada */
function loadPersistSettings() {
    const saved = localStorage.getItem("persistNoRepeat");
    document.getElementById("persistNoRepeat").checked =
        saved === null ? true : saved === "true";
    applyPersistClass();
    updatePersistStatus();
}

/* =====================================================
   RESORTEAR UM CAMPEÃO (só com "já sorteados" desligado)
===================================================== */

let currentResults = [];
let rerolling = false;

function updateLatestHistory(results) {

    const history = loadMatchHistory();

    if (history.length === 0) return;

    history[0].entries = results.map(r => ({
        player: r.player,
        lane: r.lane,
        champion: r.champion
    }));

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

    renderMatchHistory();

}

/* =====================================================
   ADICIONAR JOGADOR NO MEIO DA PARTIDA

   Sorteia só o novo jogador (lane livre + campeão), sem alterar
   os cards já sorteados. Funciona até completar 5 jogadores.
===================================================== */

let addingPlayer = false;

function freeLanesNow() {
    const used = currentResults.map(r => r.lane);
    return laneOrder.filter(lane => !used.includes(lane));
}

/* Mostra/esconde a barra e atualiza as lanes livres no seletor */
function refreshAddPlayerBar() {

    const bar = document.getElementById("addPlayerBar");

    if (!bar) return;

    const total = currentResults.length;

    if (IS_VIEWER || total === 0 || total >= laneOrder.length) {
        bar.classList.remove("show");
        return;
    }

    const select = document.getElementById("addPlayerLane");
    const previous = select.value;

    select.innerHTML = "";

    const random = document.createElement("option");
    random.value = "";
    random.textContent = "Lane aleatória";
    select.appendChild(random);

    freeLanesNow().forEach(lane => {
        const option = document.createElement("option");
        option.value = lane;
        option.textContent = lane;
        select.appendChild(option);
    });

    if ([...select.options].some(o => o.value === previous)) {
        select.value = previous;
    }

    bar.classList.add("show");

}

async function addPlayerToMatch() {

    if (rerolling || addingPlayer) return;

    const sortButton = document.getElementById("sortButton");

    /* Ainda sorteando a partida inteira */
    if (sortButton.disabled) return;

    if (currentResults.length === 0) return;

    if (currentResults.length >= laneOrder.length) {
        alert("O time já tem 5 jogadores.");
        return;
    }

    const nameInput = document.getElementById("addPlayerName");
    const name = nameInput.value.trim().slice(0, 20);

    if (!name) {
        nameInput.focus();
        return;
    }

    /* ---------- LANE ---------- */

    const freeLanes = freeLanesNow();
    const choice = document.getElementById("addPlayerLane").value;

    const lane = freeLanes.includes(choice) ? choice : randomItem(freeLanes);

    /* ---------- CAMPEÃO ---------- */

    const excluded = JSON.parse(
        localStorage.getItem("excludedChampions") || "[]"
    );

    const inUse = currentResults.map(r => r.champion);

    const poolChampions = getPoolChampions();
    const poolMode = poolChampions.length > 0;
    const persist = persistActive();

    let pool;

    if (poolMode) {

        /* Pool ativa: só dentro da pool, evitando quem já está no time */
        pool = poolChampions.filter(champion => !inUse.includes(champion));

        if (pool.length === 0) pool = [...poolChampions];

    } else {

        const drawn = persist ? loadDrawn() : [];

        const buildPool = ignoreDrawn => champions.filter(champion =>
            !excluded.includes(champion)
            && !inUse.includes(champion)
            && (ignoreDrawn || !drawn.includes(champion))
        );

        pool = buildPool(false);

        if (pool.length === 0 && persist) {

            const ok = confirm(
                "Não restam campeões ainda não sorteados para o novo jogador. " +
                "Resetar a lista de sorteados e continuar?"
            );

            if (!ok) return;

            resetDrawn(false);

            pool = buildPool(true);

        }

    }

    if (pool.length === 0) {
        alert("Não existem campeões disponíveis para o novo jogador.");
        return;
    }

    /* ---------- SORTEIA SÓ O NOVO ---------- */

    addingPlayer = true;
    sortButton.disabled = true;
    document.querySelectorAll(".reroll-btn").forEach(b => b.disabled = true);
    document.getElementById("addPlayerBtn").disabled = true;

    try {

        const newResult = {
            player: name,
            lane: lane,
            champion: randomItem(pool),
            sound: pickSounds(1, currentResults.map(r => r.sound))[0]
        };

        /* Registra o campeão como já sorteado (mesma regra do sorteio) */
        if (persist && !poolMode) addDrawn([newResult.champion]);

        /* Rotação de lanes: guarda a lane do novo jogador no histórico */
        if (!poolMode && document.getElementById("noRepeatLanes").checked) {
            const state = loadRotation() || emptyRotation();
            if (!state.history[name]) state.history[name] = [];
            state.history[name].push(lane);
            saveRotation(state);
            updateRotationStatus();
        }

        currentResults.push(newResult);

        currentResults.sort(
            (a, b) => laneOrder.indexOf(a.lane) - laneOrder.indexOf(b.lane)
        );

        nameInput.value = "";

        /* Espectadores animam só o card novo */
        broadcastResults(currentResults, currentMatchId, null, lane);

        saveAddedPlayer(currentMatchId, currentResults);

        await animateAddedCard(newResult, currentMatchId);

        updateLatestHistory(currentResults);

    } finally {

        addingPlayer = false;
        sortButton.disabled = false;
        document.querySelectorAll(".reroll-btn").forEach(b => b.disabled = false);
        document.getElementById("addPlayerBtn").disabled = false;

        refreshAddPlayerBar();

    }

}

async function rerollChampion(lane) {

    if (rerolling) return;

    const sortButton = document.getElementById("sortButton");

    /* Ainda sorteando a partida inteira */
    if (sortButton.disabled) return;

    const target = currentResults.find(r => r.lane === lane);

    if (!target) return;

    const excluded = JSON.parse(
        localStorage.getItem("excludedChampions") || "[]"
    );

    const noRepeat = document.getElementById("noRepeat").checked;

    const inUse = currentResults
        .filter(r => r !== target)
        .map(r => r.champion);

    const poolChampions = getPoolChampions();

    /* Lista de "já sorteados" ativa (e sem pool): o novo campeão
       também não pode ser um que já saiu antes */
    const persist = persistActive();

    let pool;

    if (poolChampions.length > 0) {

        /* Pool ativa: resorteia só dentro da pool, evitando repetir
           quem já está em outro card quando ainda houver opção */
        pool = poolChampions.filter(champion =>
            champion !== target.champion && !inUse.includes(champion)
        );

        if (pool.length === 0) {
            pool = poolChampions.filter(champion => champion !== target.champion);
        }

    } else {

        const drawn = persist ? loadDrawn() : [];

        const buildPool = ignoreDrawn => champions.filter(champion =>
            !excluded.includes(champion)
            && champion !== target.champion
            && !((noRepeat || persist) && inUse.includes(champion))
            && (ignoreDrawn || !drawn.includes(champion))
        );

        pool = buildPool(false);

        /* Acabaram os campeões não sorteados: oferece resetar a lista */
        if (pool.length === 0 && persist) {

            const ok = confirm(
                "Não restam campeões ainda não sorteados para resortear. " +
                "Resetar a lista de sorteados e continuar?"
            );

            if (!ok) return;

            resetDrawn(false);

            pool = buildPool(true);

        }

    }

    if (pool.length === 0) {
        alert("Não existem outros campeões disponíveis para resortear.");
        return;
    }

    rerolling = true;
    sortButton.disabled = true;
    document.querySelectorAll(".reroll-btn").forEach(b => b.disabled = true);

    try {

        const oldChampion = target.champion;

        target.champion = randomItem(pool);

        /* Registra o novo campeão como já sorteado */
        if (persist && poolChampions.length === 0) addDrawn([target.champion]);

        target.sound = pickSounds(1, currentResults.filter(r => r !== target).map(r => r.sound))[0];

        broadcastResults(currentResults, currentMatchId, lane);

        saveReroll(currentMatchId, currentResults, oldChampion);

        await animateSingleCard(target, currentMatchId);

        updateLatestHistory(currentResults);

    } finally {

        rerolling = false;
        sortButton.disabled = false;
        document.querySelectorAll(".reroll-btn").forEach(b => b.disabled = false);

    }

}

/* =====================================================
   SORTEIO PRINCIPAL
===================================================== */

async function sortear() {

    const button = document.getElementById("sortButton");

    /* Evita clicar duas vezes */
    button.disabled = true;

    try {

        /* ---------- JOGADORES ---------- */

        const players = [...document.querySelectorAll(".player-input")]
            .map(input => input.value.trim())
            .filter(name => name.length > 0);

        if (players.length === 0) {
            alert("Informe pelo menos um jogador.");
            return;
        }

        /* Sorteia a ordem dos nomes (ou mantém a digitada) */
        const shufflePlayers =
            document.getElementById("shufflePlayers").checked;

        const orderedPlayers =
            shufflePlayers ? shuffle(players) : players;

        /* ---------- LANES ---------- */

        const fullRandom = document.getElementById("fullRandom").checked;

        /* Pool ativa: ignora excluídos, "não repetir", "já sorteados" e rotação */
        const poolChampions = getPoolChampions();
        const poolMode = poolChampions.length > 0;

        const noRepeatLanes =
            !poolMode && document.getElementById("noRepeatLanes").checked;

        let selectedLanes = [];

        if (fullRandom) {

            /* Com rotação, todas as lanes entram no "pool" e o
               histórico decide quais cada jogador pode receber */
            selectedLanes = noRepeatLanes
                ? [...laneOrder]
                : shuffle(laneOrder).slice(0, players.length);

        } else {

            selectedLanes = [
                ...document.querySelectorAll("#laneContainer input:checked")
            ].map(input => input.value);

            if (selectedLanes.length !== players.length) {

                alert(
                    `Você informou ${players.length} jogador(es), ` +
                    `então deve selecionar exatamente ` +
                    `${players.length} lane(s).`
                );

                return;

            }

        }

        /* Sempre TOP → JUNGLE → MID → ADC → SUPPORT */
        selectedLanes.sort(
            (a, b) => laneOrder.indexOf(a) - laneOrder.indexOf(b)
        );

        /* ---------- CAMPEÕES EXCLUÍDOS / DISPONÍVEIS ---------- */

        const excluded = JSON.parse(
            localStorage.getItem("excludedChampions") || "[]"
        );

        /* Pool ativa: só os campeões das pools marcadas, sem filtro de excluídos */
        let available = poolMode
            ? [...poolChampions]
            : champions.filter(champion => !excluded.includes(champion));

        /* ---------- NÃO REPETIR ---------- */

        /* Lista persistente: consulta os já sorteados antes de sortear
           (ignorada quando há pool ativa) */
        const persist = !poolMode
            && document.getElementById("persistNoRepeat").checked;

        if (persist) {

            const drawn = loadDrawn();

            let pool = available.filter(champion => !drawn.includes(champion));

            if (pool.length < players.length) {

                const ok = confirm(
                    `Restam só ${pool.length} campeão(ões) ainda não sorteado(s), ` +
                    `e são necessários ${players.length}. ` +
                    `Resetar a lista de sorteados e continuar?`
                );

                if (!ok) return;

                resetDrawn(false);

                pool = [...available];

            }

            available = pool;

        }

        /* Com a lista persistente ativa, também não repete dentro do sorteio */
        /* Em pool, não repete sempre que houver campeões suficientes */
        const noRepeat = poolMode
            ? available.length >= players.length
            : (persist || document.getElementById("noRepeat").checked);

        if (!poolMode && noRepeat && available.length < players.length) {
            alert("Não existem campeões suficientes disponíveis para esse sorteio.");
            return;
        }

        if (available.length === 0) {
            alert("Todos os campeões estão excluídos.");
            return;
        }

        /* ---------- PARES JOGADOR + LANE ---------- */

        let pairs;

        hideRotationNotice();

        if (noRepeatLanes) {

            const rotation = assignLanesWithRotation(
                players,
                selectedLanes,
                shufflePlayers || fullRandom
            );

            pairs = rotation.pairs;

            if (rotation.wasReset) {
                showRotationNotice(
                    "⚠️ Todos já passaram por todas as lanes desta rotação. " +
                    "A rotação foi resetada e esta partida inicia um novo ciclo."
                );
            }

            updateRotationStatus();

        } else {

            pairs = selectedLanes.map((lane, index) => ({
                player: orderedPlayers[index],
                lane: lane
            }));

        }

        /* ---------- ASSOCIA PLAYER + LANE + CAMPEÃO ---------- */

        const results = [];

        pairs.forEach(({ player, lane }) => {

            let champion;

            if (noRepeat) {

                const randomIndex = Math.floor(Math.random() * available.length);

                champion = available[randomIndex];

                available.splice(randomIndex, 1);

            } else {

                champion = randomItem(available);

            }

            results.push({
                player: player,
                lane: lane,
                champion: champion
            });

        });

        /* ---------- ORDENA RESULTADOS ---------- */

        const sounds = pickSounds(results.length);
        results.forEach((r, i) => { r.sound = sounds[i]; });

        results.sort(
            (a, b) => laneOrder.indexOf(a.lane) - laneOrder.indexOf(b.lane)
        );

        /* ---------- GRAVA OS SORTEADOS / GUARDA PARA RESORTEAR ---------- */

        if (persist) addDrawn(results.map(r => r.champion));

        currentResults = results.map(r => ({ ...r }));

        /* ---------- REGISTRA A PARTIDA (estatísticas) ---------- */

        currentMatchId = newMatchId();

        hideResultBar();

        refreshAddPlayerBar();

        saveMatch(currentMatchId, results);

        /* ---------- TRANSMITE AOS ESPECTADORES ---------- */

        broadcastResults(results, currentMatchId);

        /* ---------- ANIMAÇÃO ---------- */

        await animateResults(results, currentMatchId);

        addMatchToHistory(results, currentMatchId);

        /* Pergunta (opcional) como terminou; não bloqueia novos sorteios */
        showResultBar();

        /* Permite adicionar mais um jogador sem refazer o sorteio */
        refreshAddPlayerBar();

    } finally {

        button.disabled = false;

    }

}

/* =====================================================
   ANIMAÇÃO DOS RESULTADOS
===================================================== */

async function animateResults(results, matchId) {

    const container = document.getElementById("results");

    container.innerHTML = "";

    /* Cria os cards inicialmente */

    results.forEach(result => {

        const card = document.createElement("div");

        card.className = "result";

        card.dataset.lane = result.lane;

        card.dataset.match = matchId || "";

        card.innerHTML = shuffleCardHTML(result.lane);

        container.appendChild(card);

    });

    /* Revela um por um */

    for (let i = 0; i < results.length; i++) {
        await shuffleAnimation(container.children[i], results[i]);
    }

}

function shuffleCardHTML(lane) {
    return `
            <div class="lane-name">${lane}</div>

            <div class="shuffle-container">
                <div class="dice">🎲</div>

                <img class="shuffle-image"
                     src="${IMAGE_URL}${randomItem(champions)}.png">

                <div class="shuffle-text">Sorteando...</div>
            </div>
        `;
}

/* Insere e anima o card de um jogador adicionado depois do sorteio,
   na posição certa da ordem das lanes, sem mexer nos outros cards */
async function animateAddedCard(result, matchId) {

    const container = document.getElementById("results");

    /* Já existe (ex.: evento repetido): só refaz esse card */
    const existing = [...container.querySelectorAll(".result")]
        .find(c => c.dataset.lane === result.lane);

    if (existing) {
        await animateSingleCard(result, matchId);
        return;
    }

    const placeholder = container.querySelector(".empty");
    if (placeholder) placeholder.remove();

    const card = document.createElement("div");
    card.className = "result";
    card.dataset.lane = result.lane;
    card.dataset.match = matchId || "";
    card.innerHTML = shuffleCardHTML(result.lane);

    const order = laneOrder.indexOf(result.lane);

    const next = [...container.querySelectorAll(".result")]
        .find(c => laneOrder.indexOf(c.dataset.lane) > order);

    container.insertBefore(card, next || null);

    await shuffleAnimation(card, result);

}

/* Refaz a animação de um único card (resorteio) */
async function animateSingleCard(result, matchId) {

    const card = [...document.querySelectorAll("#results .result")]
        .find(c => c.dataset.lane === result.lane);

    if (!card) return;

    if (matchId) card.dataset.match = matchId;

    card.innerHTML = shuffleCardHTML(result.lane);

    await shuffleAnimation(card, result);

}

/* =====================================================
   ANIMAÇÃO INDIVIDUAL
===================================================== */

function shuffleAnimation(card, result) {

    return new Promise(resolve => {

        const image = card.querySelector(".shuffle-image");
        const text = card.querySelector(".shuffle-text");
        const dice = card.querySelector(".dice");

        const duration = 3000;
        const intervalTime = 100;

        /* Troca as imagens rapidamente */
        const interval = setInterval(() => {
            image.src = IMAGE_URL + randomItem(champions) + ".png";
        }, intervalTime);

        /* Depois revela o campeão */
        setTimeout(() => {

            clearInterval(interval);

            image.src = IMAGE_URL + result.champion + ".png";

            playChampionSound(result.sound);

            image.classList.remove("shuffle-image");

            dice.style.display = "none";

            text.innerHTML = "";

            const playerName = document.createElement("strong");
            playerName.textContent = result.player;
            text.appendChild(playerName);

            /* Adiciona nome do campeão */
            const championName = document.createElement("div");

            championName.className = "champion";

            championName.textContent =
                championNames[result.champion] || result.champion;

            card.querySelector(".shuffle-container").appendChild(championName);

            /* Like / dislike (espectadores votam; host vê os números) */
            appendVoteBar(card, card.dataset.match, result.champion);

            /* Botão de resortear (só host; fica oculto via CSS quando
               "não repetir campeões já sorteados" está marcado) */
            if (!IS_VIEWER) {

                const rerollButton = document.createElement("button");

                rerollButton.type = "button";
                rerollButton.className = "reroll-btn";
                rerollButton.textContent = "🔄 Resortear";
                rerollButton.onclick = () => rerollChampion(result.lane);

                card.appendChild(rerollButton);

            }

            resolve();

        }, duration);

    });

}