/* =====================================================
   NOTA DE UMA PARTIDA DO FLEX (0 a 10), no estilo do OP Score

   Só na página do Flex. A nota olha APENAS a própria partida:
   o seu histórico e as outras partidas não mudam nada.

   Como no OP Score do OP.GG, é uma classificação entre os 10 da
   partida: cada um ganha uma pontuação (KDA, mortes, participação
   nos abates, dano, ouro, farm, visão e um peso pela vitória,
   comparados com a média da partida) e a escala vai de ~1,4 (pior da
   partida) a 10 (melhor da partida). Como no OP.GG, o MVP é a maior
   nota do time que venceu e o ACE a maior do time que perdeu.

   Suporte tem pesos próprios (KDA, mortes, dano, ouro e farm pesam
   menos; ele já leva vantagem em KDA pelas assistências).

   Partida sem o resumo dos 10 (antiga): usa a comparação com o
   oponente de lane (duelScore), que fica no meio da escala.
===================================================== */

const clamp1 = v => Math.max(-1, Math.min(1, v));

const lobbyKda = o => Math.log1p((o.k + o.a) / Math.max(1, o.d));

/* Partida antiga sem o resumo dos 10 (ex.: buscada por um Worker
   desatualizado): monta um "lobby" só com você e o oponente de lane,
   que sempre vem salvo. Participação em abates fica neutra. */
function fallbackLobby(g) {

    if (!g.opp) return null;

    const entry = (s, team, kp) => ({
        c: s.champion, p: s.position || "", t: team,
        k: s.kills || 0, d: s.deaths || 0, a: s.assists || 0,
        g: s.gold || 0, dmg: s.damage || 0, v: s.vision || 0, cs: s.cs || 0,
        cc: s.ccTime || 0, hs: s.healShield || 0, tk: s.damageTaken || 0, w: s.wardsPlaced || 0,
        kpFixed: kp
    });

    const kp = g.killParticipation || 0;

    return [entry(g, 1, kp), entry(Object.assign({ position: g.position }, g.opp), 2, kp)];

}

function duelScore(g) {

    let lobby = g.lobby;
    let me = lobby && lobby[g.slot];

    if (!me) {
        lobby = fallbackLobby(g);
        me = lobby && lobby[0];
    }

    if (!me) return 5;

    const teamKills = {};
    lobby.forEach(o => { teamKills[o.t] = (teamKills[o.t] || 0) + o.k; });

    const kp = o => o.kpFixed !== undefined ? o.kpFixed : teamKills[o.t] ? (o.k + o.a) / teamKills[o.t] : 0;

    /* Contra os 10 da partida: desvios da média, de -1 a +1 */
    const vsLobby = fn => {
        const values = lobby.map(fn);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const sd = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length) || 1;
        return clamp1((fn(me) - mean) / sd / 2);
    };

    /* Contra o oponente direto: diferença relativa, de -1 a +1 */
    const opp = me.p ? lobby.find(o => o.t !== me.t && o.p === me.p) : null;

    const vsOpp = fn => {
        if (!opp) return null;
        const a = fn(me), b = fn(opp);
        const top = Math.max(Math.abs(a), Math.abs(b));
        return top ? clamp1((a - b) / top) : 0;
    };

    /* KDA, mortes e participação: contra o oponente da mesma lane (suporte
       sempre tem KDA alto pelas assistências, então comparar com os 10
       favoreceria o suporte). Sem oponente identificado, usa os 10. */
    const duel = fn => opp ? vsOpp(fn) : vsLobby(fn);

    let parts;

    if (me.p === "UTILITY") {

        /* Estilo: vale aquele em que você foi melhor que o seu oponente
           (Thresh não perde ponto por curar menos que uma Soraka) */
        const style = opp ? Math.max(
            vsOpp(o => o.hs),
            vsOpp(o => o.cc + o.tk / 100),
            vsOpp(o => o.dmg)
        ) : null;

        parts = [
            [1.5, duel(lobbyKda)],
            [1, duel(o => -o.d)],
            [1.25, duel(kp)],
            [1.25, vsOpp(o => o.v)],
            [0.5, vsOpp(o => o.w)],
            [1, style]
        ];

    } else {

        parts = [
            [1.5, duel(lobbyKda)],
            [1, duel(o => -o.d)],
            [1, duel(kp)],
            [1, vsOpp(o => o.dmg)],
            [1, vsOpp(o => o.g)],
            [0.5, vsOpp(o => o.cs)],
            [0.5, vsOpp(o => o.v)]
        ];

    }

    const valid = parts.filter(([, v]) => v !== null);
    const total = valid.reduce((a, [w]) => a + w, 0);
    const sum = valid.reduce((a, [w, v]) => a + w * v, 0);

    return Math.max(0, Math.min(10, 5 + 5 * sum / (total || 1)));

}

/* ---------- Nota tipo OP Score: classificação entre os 10 ---------- */

/* Pesos de cada número (z = desvios em relação à média da partida) */
/* Pesos calibrados contra o OP.GG numa partida real (os 10 jogadores
   ficaram, em média, a 0,4 ponto da nota de lá). Vitória, KDA e dano
   pesam mais: é o que o OP.GG diz valorizar ("o que mais impacta a
   vitória"). */
const OP_WEIGHTS = {
    carry: { kda: 2, deaths: 1, kp: 0.5, dmg: 1.5, gold: 0.5, cs: 0.5, vision: 0.25, win: 2 },
    support: { kda: 1, deaths: 0.67, kp: 0.5, dmg: 0.5, gold: 0.25, cs: 0, vision: 0.25, win: 2 }
};

/* Nota do pior da partida (o melhor é sempre 10) */
const OP_FLOOR = 1.4;

/* Notas dos 10 jogadores, guardadas por partida (calcula uma vez só) */
const lobbyScoreCache = new WeakMap();

function lobbyScores(lobby, winners) {

    if (lobbyScoreCache.has(lobby)) return lobbyScoreCache.get(lobby);

    const teamKills = {};
    lobby.forEach(o => { teamKills[o.t] = (teamKills[o.t] || 0) + o.k; });

    const metric = {
        kda: o => Math.log1p((o.k + o.a) / Math.max(1, o.d)),
        deaths: o => -o.d,
        kp: o => teamKills[o.t] ? (o.k + o.a) / teamKills[o.t] : 0,
        dmg: o => o.dmg,
        gold: o => o.g,
        cs: o => o.cs,
        vision: o => o.v,
        win: o => o.t === winners ? 1 : 0
    };

    /* z de cada número dentro da partida (limitado para um número
       absurdo não decidir sozinho) */
    const z = {};
    Object.keys(metric).forEach(k => {
        const values = lobby.map(metric[k]);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const sd = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length) || 1;
        z[k] = values.map(v => Math.max(-2.5, Math.min(2.5, (v - mean) / sd)));
    });

    const raw = lobby.map((o, i) => {
        const w = o.p === "UTILITY" ? OP_WEIGHTS.support : OP_WEIGHTS.carry;
        const total = Object.values(w).reduce((a, b) => a + b, 0);
        return Object.keys(w).reduce((sum, k) => sum + w[k] * z[k][i], 0) / total;
    });

    /* Escala: pior da partida ~1,4, melhor da partida 10 */
    const max = Math.max(...raw);
    const min = Math.min(...raw);
    const scores = raw.map(r => max === min ? 5 : OP_FLOOR + (10 - OP_FLOOR) * (r - min) / (max - min));

    /* MVP = maior nota do time que venceu; ACE = maior do time que perdeu */
    const bestOf = team => lobby.reduce((b, o, i) => (o.t === team && (b < 0 || scores[i] > scores[b])) ? i : b, -1);
    const loser = (lobby.find(o => o.t !== winners) || {}).t;
    const result = { scores, mvp: bestOf(winners), ace: bestOf(loser) };

    lobbyScoreCache.set(lobby, result);

    return result;

}

function matchScore(g) {

    const lobby = g.lobby;

    if (Array.isArray(lobby) && lobby.length >= 6 && lobby[g.slot]) {
        /* Time vencedor: o do jogador, se ele ganhou; senão, o outro */
        const mine = lobby[g.slot].t;
        const other = lobby.find(o => o.t !== mine);
        const winners = g.win ? mine : (other ? other.t : null);
        const r = lobbyScores(lobby, winners);
        g.mvp = r.mvp === g.slot;
        g.ace = r.ace === g.slot;
        g.lobbyResult = r;
        return r.scores[g.slot];
    }

    return duelScore(g);

}

/* Dá nota a cada partida da lista (grava em g.score). Cada uma é
   calculada sozinha: a lista não influencia a nota das outras. */
function scorePerformances(list) {
    list.forEach(g => { g.score = matchScore(g); });
}
