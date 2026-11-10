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
   Para testar com Firebase de verdade localmente, abra com ?firebase=on

   EMULADOR (teste sem tocar no banco real): rode
       npx firebase-tools emulators:start --project demo-sorteador
   e abra com ?emulador=1 — banco e login ficam só no seu PC. */
const IS_LOCAL = ["localhost", "127.0.0.1", "[::1]", ""].includes(location.hostname);
const FORCE_FIREBASE = params.get("firebase") === "on";
const USE_EMULATOR = IS_LOCAL && params.get("emulador") === "1";

const FIREBASE_READY =
    !firebaseConfig.apiKey.startsWith("COLE")
    && (!IS_LOCAL || FORCE_FIREBASE || USE_EMULATOR);

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
   global/votos/{matchId}/{campeao}/{uid} -> 1 | -1
   global/riot/{riotMatchId} -> {sorteioId, start, duration, players}
   global/riotColeta -> {ultima, status} (cooldown global do botão) */
let globalData = { partidas: {}, votos: {}, riot: {} };
let globalLoaded = { partidas: false, votos: false };
let statsScope = "global"; /* estatísticas sempre globais */

function initFirebase() {
    if (!FIREBASE_READY) return false;
    if (!firebase.apps.length) {

        firebase.initializeApp(firebaseConfig);

        /* Precisa ser feito antes de qualquer leitura/escrita/login */
        if (USE_EMULATOR) {
            firebase.auth().useEmulator("http://127.0.0.1:9099");
            firebase.database().useEmulator("127.0.0.1", 9000);
            console.info("🧪 Usando o Firebase Emulator (nada vai para o banco real).");
        }

    }
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
        + (SCREEN_HOST ? "&tv=1" : "")
        /* Teste local: o espectador também precisa do Firebase ligado */
        + (USE_EMULATOR ? "&emulador=1" : IS_LOCAL && FORCE_FIREBASE ? "&firebase=on" : "");
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

        setHostStatus(
            (USE_EMULATOR ? "🧪 EMULADOR (nada vai para o banco real) — " : "")
            + "Sala " + roomCode + " pronta. Aguardando o sorteio.",
            "on"
        );

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
    updates["global/partidas/" + matchId] = Object.assign({ hostUid: hostUid, sala: roomCode }, data);

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

/* Marca o resultado (somente host; hoje só "anulada"). Clicar de novo desmarca. */
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

    /* Só "Não deu jogo" é marcado à mão; vitória e derrota vêm ao atualizar as partidas */
    document.getElementById("btnVoid").classList.toggle("on-anulada", res === "anulada");

    document.getElementById("resultBarStatus").textContent =
        res === "vitoria" ? "Vitória ✅ (veio ao atualizar as partidas)"
            : res === "derrota" ? "Derrota ❌ (veio ao atualizar as partidas)"
                : res === "anulada" ? "Partida anulada 🚫 — fora de todas as estatísticas."
                    : "O resultado aparece aqui depois de atualizar as partidas.";

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

    const riotRef = db.ref("global/riot");
    const coletaRef = db.ref("global/riotColeta");

    /* Não bloqueia a tela: sem isso, só as colunas da Riot ficam vazias */
    riotRef.on("value", snap => {
        globalData.riot = snap.val() || {};
        onStatsChanged();
    }, error => console.error(error));

    coletaRef.on("value", snap => {
        riotColeta = snap.val();
        riotMessage = "";
        renderRiotBar();
    }, error => console.error(error));

    globalRefs = [partidasRef, votosRef, riotRef, coletaRef];

    renderRiotBar();

}

function stopGlobalStats() {

    globalRefs.forEach(ref => ref.off());
    globalRefs = [];

    globalData = { partidas: {}, votos: {}, riot: {} };
    globalLoaded = { partidas: false, votos: false };

}

function onStatsChanged() {

    if (statsTimer) return;

    statsTimer = setTimeout(() => {
        statsTimer = null;
        renderStats();
        refreshDrawNicks();
        refreshVoteBars();
        refreshResultBar();
        renderMatchHistory();
    }, 50);

}

