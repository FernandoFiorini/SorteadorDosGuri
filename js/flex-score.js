/* =====================================================
   NOTA DE UMA PARTIDA DO FLEX (0 a 10)

   Só na página do Flex. A nota olha APENAS a própria partida:
   o seu histórico e as outras partidas não mudam nada.

   Cada número vira um valor de -1 (muito pior) a +1 (muito melhor),
   comparando com o seu oponente direto de lane (mesma posição no
   outro time): KDA, mortes, participação nos abates do time, ouro,
   dano, farm e visão. Assim suporte é comparado com suporte e
   atirador com atirador. Sem oponente identificado, compara com
   os 10 da partida.

   Suporte tem pesos próprios: visão e participação pesam mais, e
   vale o estilo em que você foi melhor que o oponente: cura e escudo,
   tank (controle + dano recebido) ou dano.

   5 é uma partida na média; acima disso, melhor que a média.
===================================================== */

const clamp1 = v => Math.max(-1, Math.min(1, v));

const lobbyKda = o => Math.log1p((o.k + o.a) / Math.max(1, o.d));

function matchScore(g) {

    const lobby = g.lobby;
    const me = lobby && lobby[g.slot];

    if (!me) return 5;

    const teamKills = {};
    lobby.forEach(o => { teamKills[o.t] = (teamKills[o.t] || 0) + o.k; });

    const kp = o => teamKills[o.t] ? (o.k + o.a) / teamKills[o.t] : 0;

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

/* Dá nota a cada partida da lista (grava em g.score). Cada uma é
   calculada sozinha: a lista não influencia a nota das outras. */
function scorePerformances(list) {
    list.forEach(g => { g.score = matchScore(g); });
}
