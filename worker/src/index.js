/* =====================================================
   WORKER DO BOTÃO "ATUALIZAR DADOS DA RIOT"

   Guarda as chaves fora do site, aplica o cooldown global e
   liga os sorteios recentes às partidas de Swiftplay.

   POST /atualizar
     200 { status: "ok", ligadas, pendentes }
     429 { status: "cooldown", esperar }
     502 { status: "erro", mensagem }
===================================================== */

import configSource from "../../js/config.js";
import ligacao from "../../scripts/coleta/ligacao.js";

const {
    QUEUE_SWIFTPLAY, COOLDOWN_MS, PLAYERS,
    parseAliases, makePlayerKey, toGame, pairUp, gameRecord
} = ligacao;

const DATABASE_URL = "https://sorteador-dos-guri-default-rtdb.firebaseio.com";
const RIOT_API = "https://americas.api.riotgames.com";

/* Só sorteios recentes: o histórico antigo é tratado pelo script local */
const LOOKBACK_MS = 7 * 86400000;

/* Depois disso, a partida já acabou: sem par, o sorteio não é mais procurado */
const CLOSE_AFTER_MS = 6 * 3600000;

/* O plano gratuito do Cloudflare limita CPU e subrequisições por chamada.
   O que passar disso fica para o próximo clique. */
const MAX_MATCHES_PER_RUN = 6;
const MAX_LISTS_PER_RUN = 10;

const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
};

const playerKey = makePlayerKey(parseAliases(configSource));

function json(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: Object.assign({ "Content-Type": "application/json" }, CORS)
    });
}

/* -------------------- Firebase -------------------- */

function base64Url(data) {
    const bytes = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
    let binary = "";
    bytes.forEach(b => { binary += String.fromCharCode(b); });
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function firebaseToken(account) {

    const now = Math.floor(Date.now() / 1000);

    const unsigned = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" })) + "."
        + base64Url(JSON.stringify({
            iss: account.client_email,
            scope: "https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email",
            aud: account.token_uri,
            iat: now,
            exp: now + 600
        }));

    const pem = account.private_key.replace(/-----[^-]+-----|\s/g, "");
    const der = Uint8Array.from(atob(pem), c => c.charCodeAt(0));

    const key = await crypto.subtle.importKey(
        "pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]
    );

    const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned));

    const response = await fetch(account.token_uri, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion="
            + unsigned + "." + base64Url(signature)
    });

    if (!response.ok) throw new Error("Falha ao autenticar no Firebase (HTTP " + response.status + ")");

    return (await response.json()).access_token;

}

function firebaseClient(token) {

    const call = (path, options = {}) => fetch(DATABASE_URL + "/" + path + ".json" + (options.query || ""), {
        method: options.method || "GET",
        body: options.body,
        headers: Object.assign({ Authorization: "Bearer " + token }, options.headers)
    });

    return {
        call,
        async read(path, query) {
            const response = await call(path, { query });
            if (!response.ok) throw new Error("Falha ao ler o Firebase (HTTP " + response.status + ")");
            return response.json();
        },
        async update(updates) {
            const response = await call("", { method: "PATCH", body: JSON.stringify(updates) });
            if (!response.ok) throw new Error("Falha ao gravar no Firebase (HTTP " + response.status + ")");
        }
    };

}

/* Marca o início da coleta só se ninguém marcou antes (compara o ETag).
   Devolve quantos segundos faltam, ou 0 se a coleta pode seguir. */
async function claimCooldown(firebase, now) {

    const current = await firebase.call("global/riotColeta", { headers: { "X-Firebase-ETag": "true" } });

    if (!current.ok) throw new Error("Falha ao ler o cooldown (HTTP " + current.status + ")");

    const etag = current.headers.get("ETag");
    const state = await current.json();
    const elapsed = now - ((state && state.ultima) || 0);

    if (elapsed >= 0 && elapsed < COOLDOWN_MS) return Math.ceil((COOLDOWN_MS - elapsed) / 1000);

    const claim = await firebase.call("global/riotColeta", {
        method: "PUT",
        headers: { "if-match": etag },
        body: JSON.stringify({ ultima: now, status: "rodando", origem: "site" })
    });

    /* Outra chamada chegou primeiro */
    if (claim.status === 412) return Math.ceil(COOLDOWN_MS / 1000);

    if (!claim.ok) throw new Error("Falha ao gravar o cooldown (HTTP " + claim.status + ")");

    return 0;

}

/* -------------------- Riot -------------------- */

async function riot(env, path) {

    const response = await fetch(RIOT_API + path, { headers: { "X-Riot-Token": env.RIOT_API_KEY } });

    if (response.status === 401 || response.status === 403) {
        throw new Error("A chave da API expirou ou foi recusada.");
    }

    if (response.status === 429) throw new Error("Limite de requisições atingido. Tente de novo em instantes.");

    if (!response.ok) throw new Error("O servidor de partidas respondeu HTTP " + response.status + ".");

    return response.json();

}

async function fetchPuuids(env) {

    const puuids = {};

    await Promise.all(Object.keys(PLAYERS).map(async key => {
        const [name, tag] = PLAYERS[key].map(encodeURIComponent);
        const account = await riot(env, "/riot/account/v1/accounts/by-riot-id/" + name + "/" + tag);
        puuids[key] = account.puuid;
    }));

    return puuids;

}

/* -------------------- Coleta -------------------- */

function pendingMatches(partidas, closed, now) {

    return Object.entries(partidas || {})
        .filter(([id, m]) => m && m.entries && m.time >= now - LOOKBACK_MS
            && !m.riotMatchId && m.resultado !== "anulada" && !closed[id])
        .map(([id, m]) => ({
            id,
            time: m.time,
            sala: m.sala || null,
            resultado: m.resultado || null,
            entries: Object.values(m.entries).filter(Boolean)
        }))
        .filter(m => m.entries.length > 0)
        .sort((a, b) => a.time - b.time);

}

async function collect(env, firebase, now) {

    const partidas = await firebase.read("global/partidas");
    const closed = (await firebase.read("global/riotSemPar")) || {};
    const pending = pendingMatches(partidas, closed, now);

    if (pending.length === 0) return { ligadas: 0, pendentes: 0 };

    const saved = (await firebase.read("global/riot", "?shallow=true")) || {};
    const puuids = await fetchPuuids(env);

    const ids = new Set();
    const checked = [];

    /* Do mais antigo para o mais novo, até o limite desta chamada */
    for (const match of pending) {

        if (checked.length >= MAX_LISTS_PER_RUN || ids.size >= MAX_MATCHES_PER_RUN) break;

        const first = puuids[playerKey(match.entries[0].player)];

        if (!first) continue;

        const start = Math.floor(match.time / 1000) - 300;
        const end = Math.floor(match.time / 1000) + 7200;

        const found = await riot(env,
            "/lol/match/v5/matches/by-puuid/" + first + "/ids?queue=" + QUEUE_SWIFTPLAY
            + "&startTime=" + start + "&endTime=" + end + "&count=20"
        );

        found.filter(id => !saved[id]).forEach(id => ids.add(id));

        checked.push(match);

    }

    const chosen = [...ids].slice(0, MAX_MATCHES_PER_RUN);
    const games = [];

    await Promise.all(chosen.map(async id => {
        const { info } = await riot(env, "/lol/match/v5/matches/" + id);
        games.push(toGame(id, info, puuids));
    }));

    const pairs = pairUp(checked, games, playerKey);
    const linked = new Set(pairs.map(p => p.match.id));
    const updates = {};

    pairs.forEach(pair => {

        const id = pair.match.id;
        const resultado = pair.win ? "vitoria" : "derrota";

        updates["global/riot/" + pair.game.id] = gameRecord(pair.game, id);

        const bases = ["global/partidas/" + id];

        if (pair.match.sala) bases.push("salas/" + pair.match.sala + "/partidas/" + id);

        bases.forEach(base => {
            updates[base + "/riotMatchId"] = pair.game.id;
            updates[base + "/resultado"] = resultado;
        });

    });

    /* Sem par e com a partida certamente encerrada: não procura mais.
       Só vale se todas as partidas desta busca foram avaliadas. */
    if (ids.size <= MAX_MATCHES_PER_RUN) {
        checked
            .filter(m => !linked.has(m.id) && now - m.time > CLOSE_AFTER_MS)
            .forEach(m => { updates["global/riotSemPar/" + m.id] = true; });
    }

    if (Object.keys(updates).length > 0) await firebase.update(updates);

    return { ligadas: pairs.length, pendentes: pending.length - pairs.length };

}

export default {

    async fetch(request, env) {

        if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

        const url = new URL(request.url);

        if (request.method !== "POST" || url.pathname !== "/atualizar") {
            return json({ status: "erro", mensagem: "Rota inválida." }, 404);
        }

        let firebase = null;
        const now = Date.now();

        try {

            /* Em base64 para as aspas do JSON não se perderem no terminal */
            const account = JSON.parse(atob(env.FIREBASE_SERVICE_ACCOUNT));

            firebase = firebaseClient(await firebaseToken(account));

            const wait = await claimCooldown(firebase, now);

            if (wait > 0) return json({ status: "cooldown", esperar: wait }, 429);

            const result = await collect(env, firebase, now);

            await firebase.update({
                "global/riotColeta/status": "ok",
                "global/riotColeta/ligadas": result.ligadas,
                "global/riotColeta/fim": Date.now()
            });

            return json(Object.assign({ status: "ok" }, result));

        } catch (error) {

            console.error(error);

            /* O status ajuda quem estiver olhando o site; o cooldown continua valendo */
            if (firebase) {
                await firebase.update({
                    "global/riotColeta/status": "erro",
                    "global/riotColeta/mensagem": error.message,
                    "global/riotColeta/fim": Date.now()
                }).catch(() => { });
            }

            return json({ status: "erro", mensagem: error.message }, 502);

        }

    }

};
