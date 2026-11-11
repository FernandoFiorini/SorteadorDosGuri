/* =====================================================
   COLETA DO RANKED FLEX (Fer e Rony)

   Busca as partidas de Ranked Flex dos dois na temporada e salva um
   resumo de cada uma em privado/flex/partidas (o site não lê esse
   caminho direto; a página flex.html pega pelo Worker, rota GET /flex).

   Sem argumentos, só mostra o que encontraria:
       node flex.js
       node flex.js --desde=2026-06-01

   Para gravar:
       node flex.js --gravar

   Usa os mesmos segredos e o mesmo cache de partidas do coletar.js.
   Partidas já salvas não são buscadas de novo.
===================================================== */

const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const { PLAYERS } = require("./ligacao");
const { QUEUE_FLEX, FLEX_PLAYERS, FLEX_SEASON_START, flexRecord } = require("./flex-core");

const DIR = __dirname;
const API = "https://americas.api.riotgames.com";
const DATABASE_URL = "https://sorteador-dos-guri-default-rtdb.firebaseio.com";

/* Respeita o limite de 100 requisições a cada 2 minutos */
const API_DELAY_MS = 1250;

const RIOT_KEY = fs.readFileSync(path.join(DIR, ".secrets", "riot.key"), "utf8").trim();

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function arg(name) {
    const found = process.argv.find(a => a === "--" + name || a.startsWith("--" + name + "="));
    if (!found) return null;
    return found.includes("=") ? found.split("=")[1] : true;
}

async function riot(url) {

    for (let attempt = 0; attempt < 6; attempt++) {

        await sleep(API_DELAY_MS);

        const response = await fetch(API + url, { headers: { "X-Riot-Token": RIOT_KEY } });

        if (response.status === 429) {
            const wait = Number(response.headers.get("retry-after") || 30);
            console.log("Limite atingido, aguardando " + wait + "s...");
            await sleep((wait + 1) * 1000);
            continue;
        }

        if (response.status === 401 || response.status === 403) {
            throw new Error("Chave recusada (HTTP " + response.status + "). Atualize .secrets/riot.key.");
        }

        if (!response.ok) throw new Error("HTTP " + response.status + " em " + url);

        return response.json();

    }

    throw new Error("Muitas tentativas em " + url);

}

/* Mesmo cache em disco do coletar.js: partida encerrada não muda */
async function fetchMatch(id) {

    const cacheDir = path.join(DIR, ".cache");
    const file = path.join(cacheDir, id + ".json");

    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8"));

    const { info } = await riot("/lol/match/v5/matches/" + id);

    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(info));

    return info;

}

async function main() {

    const write = arg("gravar") === true;
    const since = arg("desde") || FLEX_SEASON_START;
    const sinceSeconds = Math.floor(new Date(since + "T00:00:00-03:00").getTime() / 1000);

    if (Number.isNaN(sinceSeconds)) throw new Error("Data inválida em --desde (use AAAA-MM-DD).");

    admin.initializeApp({
        credential: admin.credential.cert(require(path.join(DIR, ".secrets", "firebase-admin.json"))),
        databaseURL: DATABASE_URL
    });

    const db = admin.database();

    const saved = (await db.ref("privado/flex/partidas").once("value")).val() || {};
    const skipped = (await db.ref("privado/flex/ignoradas").once("value")).val() || {};

    const puuids = {};

    for (const key of FLEX_PLAYERS) {
        const [name, tag] = PLAYERS[key].map(encodeURIComponent);
        puuids[key] = (await riot("/riot/account/v1/accounts/by-riot-id/" + name + "/" + tag)).puuid;
    }

    const ids = new Set();

    for (const key of FLEX_PLAYERS) {

        for (let start = 0; ; start += 100) {

            const page = await riot(
                "/lol/match/v5/matches/by-puuid/" + puuids[key] + "/ids"
                + "?queue=" + QUEUE_FLEX + "&startTime=" + sinceSeconds
                + "&start=" + start + "&count=100"
            );

            page.forEach(id => ids.add(id));

            if (page.length < 100) break;

        }

    }

    const fresh = [...ids].filter(id => !saved[id] && !skipped[id]);

    console.log("Partidas de Flex desde " + since + ": " + ids.size + " (novas: " + fresh.length + ")");

    const updates = {};
    let count = 0;

    for (const [i, id] of fresh.entries()) {

        const record = flexRecord(id, await fetchMatch(id), puuids);

        if (record) {
            updates["privado/flex/partidas/" + id] = record;
            count++;
        } else {
            updates["privado/flex/ignoradas/" + id] = true;
        }

        if ((i + 1) % 20 === 0) console.log("  " + (i + 1) + " de " + fresh.length + "...");

    }

    console.log("Prontas para salvar: " + count + " | recriações ignoradas: " + (fresh.length - count));

    if (!write) {
        console.log("\nSimulação: nada foi gravado. Use --gravar para salvar.");
    } else if (Object.keys(updates).length > 0) {
        const starts = Object.values(saved).map(r => r.start)
            .concat(Object.values(updates).map(r => r && r.start).filter(Boolean));
        updates["privado/flex/coleta/fim"] = Date.now();
        updates["privado/flex/coleta/origem"] = "script";
        updates["privado/flex/coleta/ultimaPartida"] = Math.max(0, ...starts);
        await db.ref().update(updates);
        console.log("Gravado.");
    } else {
        console.log("Nada novo para gravar.");
    }

    await admin.app().delete();

}

main().catch(error => {
    console.error("ERRO: " + error.message);
    process.exit(1);
});
