/* =====================================================
   UTILITÁRIOS
===================================================== */

function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/* Nome limpo: sem espaços nas pontas nem espaços duplos */
function normalizePlayerName(name) {
    return String(name || "").trim().replace(/\s+/g, " ");
}

/* Chave única do jogador nas estatísticas (ignora maiúsculas e
   aplica os apelidos de PLAYER_ALIASES) */
function playerKey(name) {
    const key = normalizePlayerName(name).toLowerCase();
    return PLAYER_ALIASES[key] || key;
}

function shuffle(array) {

    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];

    }

    return result;

}

