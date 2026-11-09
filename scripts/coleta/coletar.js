/* =====================================================
   COLETA DE DADOS DA RIOT

   Liga cada sorteio à partida de Swiftplay correspondente e salva
   as estatísticas dos jogadores do grupo em global/riot.

   Sem argumentos, apenas simula e não grava nada:
       node coletar.js
       node coletar.js --desde=2026-10-19

   Para gravar (faz backup antes):
       node coletar.js --gravar

   Segredos, ignorados pelo Git:
       .secrets/riot.key             chave da Riot
       .secrets/firebase-admin.json  conta de serviço do Firebase

   Partidas já ligadas não são alteradas. Por isso, corrigir um
   resultado à mão depois da ligação continua valendo.

   Respeita o cooldown global de 1 minuto, compartilhado com o
   botão do site.
===================================================== */

const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const {
    QUEUE_SWIFTPLAY, COOLDOWN_MS, PLAYERS,
    parseAliases, makePlayerKey, toGame, pairUp, gameRecord
} = require("./ligacao");

const DIR = __dirname;
const API = "https://americas.api.riotgames.com";
const DATABASE_URL = "https://sorteador-dos-guri-default-rtdb.firebaseio.com";

/* Pausa entre chamadas: respeita o limite de 100 requisições a cada 2 minutos */
const API_DELAY_MS = 1250;

const playerKey = makePlayerKey(parseAliases(
    fs.readFileSync(path.join(DIR, "..", "..", "js", "config.js"), "utf8")
));

function arg(name) {
    const found = process.argv.find(a => a === "--" + name || a.startsWith("--" + name + "="));
    if (!found) return null;
    return found.includes("=") ? found.split("=")[1] : true;
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/* -------------------- Riot -------------------- */

const RIOT_KEY = fs.readFileSync(path.join(DIR, ".secrets", "riot.key"), "utf8").trim();

async function riot(url) {

    for (let attempt = 0; attempt < 6; attempt++) {

        await sleep(API_DELAY_MS);

        const response = await fetch(API + url, { headers: { "X-Riot-Token": RIOT_KEY } });

        if (response.status === 429) {
            const wait = Number(response.headers.get("retry-after") || 30);
            console.log("Limite da Riot atingido, aguardando " + wait + "s...");
            await sleep((wait + 1) * 1000);
            continue;
        }

        if (response.status === 401 || response.status === 403) {
            throw new Error("Chave da Riot recusada (HTTP " + response.status + "). Gere uma nova no portal e atualize .secrets/riot.key.");
        }

        if (!response.ok) throw new Error("Riot respondeu HTTP " + response.status + " em " + url);

        return response.json();

    }

    throw new Error("Muitas tentativas em " + url);

}

async function fetchPuuids() {

    const puuids = {};

    for (const key of Object.keys(PLAYERS)) {
        const [name, tag] = PLAYERS[key].map(encodeURIComponent);
        const account = await riot("/riot/account/v1/accounts/by-riot-id/" + name + "/" + tag);
        puuids[key] = account.puuid;
    }

    return puuids;

}

/* Devolve { idDaPartida: quantos jogadores do grupo estão nela } */
async function fetchMatchIds(puuids, startSeconds) {

    const seen = {};

    for (const key of Object.keys(puuids)) {

        for (let start = 0; ; start += 100) {

            const ids = await riot(
                "/lol/match/v5/matches/by-puuid/" + puuids[key] + "/ids"
                + "?queue=" + QUEUE_SWIFTPLAY
                + "&startTime=" + startSeconds
                + "&start=" + start
                + "&count=100"
            );

            ids.forEach(id => { seen[id] = (seen[id] || 0) + 1; });

            if (ids.length < 100) break;

        }

    }

    return seen;

}

/* Detalhes guardados em disco: uma partida encerrada não muda */
async function fetchMatch(id) {

    const cacheDir = path.join(DIR, ".cache");
    const file = path.join(cacheDir, id + ".json");

    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8"));

    const { info } = await riot("/lol/match/v5/matches/" + id);

    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(info));

    return info;

}

/* Salas onde cada partida está gravada */
async function findRooms(db, ids) {

    const token = (await admin.app().options.credential.getAccessToken()).access_token;
    const response = await fetch(DATABASE_URL + "/salas.json?shallow=true&access_token=" + token);

    if (!response.ok) throw new Error("Falha ao listar salas (HTTP " + response.status + ")");

    const rooms = Object.keys((await response.json()) || {});
    const copies = {};
    const backup = {};

    for (const room of rooms) {

        const partidas = (await db.ref("salas/" + room + "/partidas").once("value")).val() || {};

        ids.forEach(id => {
            if (!partidas[id]) return;
            (copies[id] = copies[id] || []).push(room);
            backup[room + "/" + id] = partidas[id];
        });

    }

    return { copies, backup };

}

/* -------------------- Execução -------------------- */

async function main() {

    const write = arg("gravar") === true;
    const since = arg("desde");

    admin.initializeApp({
        credential: admin.credential.cert(require(path.join(DIR, ".secrets", "firebase-admin.json"))),
        databaseURL: DATABASE_URL
    });

    const db = admin.database();

    /* Cooldown global, o mesmo do botão do site */
    const startedAt = Date.now();
    const claim = await db.ref("global/riotColeta").transaction(current => {
        if (current && startedAt - (current.ultima || 0) < COOLDOWN_MS) return undefined;
        return { ultima: startedAt, status: "rodando", origem: "script" };
    });

    if (!claim.committed) {
        const wait = Math.ceil((COOLDOWN_MS - (startedAt - claim.snapshot.val().ultima)) / 1000);
        console.log("Em cooldown global: tente de novo em " + wait + "s.");
        await admin.app().delete();
        return;
    }

    const finish = async () => {
        await db.ref("global/riotColeta").update({ status: "ok", fim: Date.now() });
        await admin.app().delete();
    };

    const partidas = (await db.ref("global/partidas").once("value")).val() || {};
    const riotSaved = (await db.ref("global/riot").once("value")).val() || {};

    const sinceTime = since ? new Date(since + "T00:00:00-03:00").getTime() : Date.now() - 14 * 86400000;

    if (Number.isNaN(sinceTime)) throw new Error("Data inválida em --desde (use AAAA-MM-DD).");

    const pending = Object.entries(partidas)
        .filter(([, m]) => m && m.entries && m.time >= sinceTime && !m.riotMatchId && m.resultado !== "anulada")
        .map(([id, m]) => ({
            id,
            time: m.time,
            resultado: m.resultado || null,
            entries: Object.values(m.entries).filter(Boolean)
        }))
        .filter(m => m.entries.length > 0);

    console.log("Sorteios sem ligação no período: " + pending.length);

    if (pending.length === 0) {
        await finish();
        return;
    }

    const puuids = await fetchPuuids();
    const startSeconds = Math.floor(Math.min(...pending.map(m => m.time)) / 1000) - 3600;
    const seen = await fetchMatchIds(puuids, startSeconds);

    /* Só interessam partidas novas com pelo menos 2 jogadores do grupo */
    const ids = Object.keys(seen).filter(id => seen[id] >= 2 && !riotSaved[id]);

    console.log("Partidas de Swiftplay do grupo para avaliar: " + ids.length);

    const games = [];

    for (const id of ids) {
        games.push(toGame(id, await fetchMatch(id), puuids));
    }

    const pairs = pairUp(pending, games, playerKey);
    const linked = new Set(pairs.map(p => p.match.id));
    const when = time => new Date(time - 3 * 3600000).toISOString().slice(5, 16).replace("T", " ");
    const names = m => m.entries.map(e => playerKey(e.player)).join(", ");

    const conflicts = pairs.filter(p => p.agrees === false);
    const filled = pairs.filter(p => p.agrees === null);

    console.log("\nLigados: " + pairs.length + " de " + pending.length);
    console.log("  Todos os campeões iguais: " + pairs.filter(p => p.exact === p.match.entries.length).length);
    console.log("  Com troca ou diferença: " + pairs.filter(p => p.exact < p.match.entries.length).length);
    console.log("Resultados que mudam: " + conflicts.length + " | preenchidos: " + filled.length);

    conflicts.forEach(p => console.log(
        "  MUDA  " + when(p.match.time) + "  " + names(p.match) + "  " + p.match.resultado + " -> " + (p.win ? "vitoria" : "derrota")
    ));

    pairs.filter(p => p.exact < p.match.entries.length).forEach(p => console.log(
        "  DIFERENÇA  " + when(p.match.time) + "  " + names(p.match) + "  campeões iguais: " + p.exact + "/" + p.match.entries.length
    ));

    pending.filter(m => !linked.has(m.id)).forEach(m => console.log(
        "  SEM PAR  " + when(m.time) + "  " + names(m) + "  " + (m.resultado || "sem resultado")
    ));

    if (!write) {
        console.log("\nSimulação: nada foi gravado. Use --gravar para salvar.");
        await finish();
        return;
    }

    if (pairs.length === 0) {
        console.log("\nNada para gravar.");
        await finish();
        return;
    }

    const pairIds = pairs.map(p => p.match.id);
    const { copies, backup } = await findRooms(db, pairIds);

    /* Backup de tudo que será alterado, antes de gravar */
    const backupDir = path.join(DIR, ".backups");
    const backupFile = path.join(backupDir, new Date().toISOString().replace(/[:.]/g, "-") + ".json");

    fs.mkdirSync(backupDir, { recursive: true });
    fs.writeFileSync(backupFile, JSON.stringify({ globalPartidas: partidas, salas: backup }, null, 1));

    console.log("\nBackup: " + backupFile);

    const updates = {};

    pairs.forEach(pair => {

        const id = pair.match.id;
        const resultado = pair.win ? "vitoria" : "derrota";

        updates["global/riot/" + pair.game.id] = gameRecord(pair.game, id);

        const bases = ["global/partidas/" + id].concat(
            (copies[id] || []).map(room => "salas/" + room + "/partidas/" + id)
        );

        bases.forEach(base => {
            updates[base + "/riotMatchId"] = pair.game.id;
            updates[base + "/resultado"] = resultado;
        });

    });

    /* Atualização atômica: ou grava tudo, ou nada */
    updates["global/riotColeta/status"] = "ok";
    updates["global/riotColeta/ligadas"] = pairs.length;
    updates["global/riotColeta/fim"] = Date.now();

    await db.ref().update(updates);

    /* Confere o que ficou salvo */
    const after = (await db.ref("global/partidas").once("value")).val() || {};
    const savedRiot = (await db.ref("global/riot").once("value")).val() || {};

    const wrong = pairs.filter(p =>
        after[p.match.id].riotMatchId !== p.game.id
        || after[p.match.id].resultado !== (p.win ? "vitoria" : "derrota")
        || !savedRiot[p.game.id]
    );

    console.log("Gravado: " + pairs.length + " ligações. Divergências na conferência: " + wrong.length);

    await admin.app().delete();

    if (wrong.length > 0) process.exitCode = 1;

}

main().catch(error => {
    console.error("ERRO: " + error.message);
    process.exit(1);
});
