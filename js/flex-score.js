/* =====================================================
   NOTA DE UMA PARTIDA DO FLEX (0 a 10)

   Só na página do Flex: lá cada um joga a lane que escolheu, então
   faz sentido comparar por lane. No sorteador o campeão é sorteado
   (dá suporte na selva etc.), e os recordes 🐐 / 🍼 seguem com a
   nota simples de js/achievements.js.

   Cada número vira "quantos desvios acima ou abaixo da média"
   e a nota é a média ponderada disso. Duas regras para ser justo:

   1. Cada partida é comparada com partidas da MESMA lane
      (suporte com suporte, top com top). Se a lane tiver poucas
      partidas ainda, compara com todas.
   2. Suporte tem pesos próprios: visão e participação pesam mais,
      dano e ouro quase nada. E vale o melhor estilo entre
      encantador (cura/escudo), tank (controle + dano recebido)
      e mago (dano), para não punir quem joga de tank.

   Cada atuação precisa ter: kills, deaths, assists, kp, dmgMin,
   goldMin, visionMin, wardsMin, healShieldMin, ccMin, takenMin
   e position.
===================================================== */

const SCORE_MIN_GROUP = 6;

const scoreKda = g => Math.log1p((g.kills + g.assists) / Math.max(1, g.deaths));

const SCORE_ROLES = {

    /* Topo, selva, meio e atirador */
    CARRY: [
        { weight: 1.5, value: scoreKda },
        { weight: 1, value: g => -g.deaths },
        { weight: 1, value: g => g.kp },
        { weight: 1, value: g => g.dmgMin },
        { weight: 1, value: g => g.goldMin },
        { weight: 0.5, value: g => g.visionMin }
    ],

    UTILITY: [
        { weight: 1.5, value: scoreKda },
        { weight: 1, value: g => -g.deaths },
        { weight: 1.25, value: g => g.kp },
        { weight: 1.25, value: g => g.visionMin },
        { weight: 0.5, value: g => g.wardsMin },
        /* Vale o melhor estilo da partida */
        {
            weight: 1.25, anyOf: [
                [g => g.healShieldMin],
                [g => g.ccMin, g => g.takenMin],
                [g => g.dmgMin]
            ]
        }
    ]

};

function scoreRole(position) {
    return position === "UTILITY" ? SCORE_ROLES.UTILITY : SCORE_ROLES.CARRY;
}

/* Dá nota a cada atuação da lista (grava em g.score) */
function scorePerformances(list, spread = 2.5) {

    if (list.length < 2) {
        list.forEach(g => { g.score = 5; });
        return;
    }

    const byLane = {};
    list.forEach(g => { (byLane[g.position || "?"] = byLane[g.position || "?"] || []).push(g); });

    const poolOf = g => {
        const lane = byLane[g.position || "?"];
        return lane.length >= SCORE_MIN_GROUP ? lane : list;
    };

    /* Média e desvio de cada número em cada grupo (calculado uma vez) */
    const cache = new Map();
    const styles = new Map();

    const z = (g, fn) => {

        const pool = poolOf(g);
        let perPool = cache.get(pool);
        if (!perPool) cache.set(pool, perPool = new Map());

        let s = perPool.get(fn);

        if (!s) {
            const values = pool.map(x => fn(x) || 0);
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const sd = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length) || 1;
            perPool.set(fn, s = { mean, sd });
        }

        return ((fn(g) || 0) - s.mean) / s.sd;

    };

    list.forEach(g => {

        const metrics = scoreRole(g.position);
        const total = metrics.reduce((a, m) => a + m.weight, 0);

        const sum = metrics.reduce((acc, m) => {
            /* O "melhor estilo" também é comparado com a média do grupo,
               senão pegar o máximo de três inflaria a nota do suporte */
            if (m.anyOf && !styles.has(m)) {
                styles.set(m, x => Math.max(...m.anyOf.map(fns => fns.reduce((a, fn) => a + z(x, fn), 0) / fns.length)));
            }
            const value = z(g, m.anyOf ? styles.get(m) : m.value);
            return acc + m.weight * value;
        }, 0);

        g.score = Math.max(0, Math.min(10, 5 + spread * sum / total));

    });

}
