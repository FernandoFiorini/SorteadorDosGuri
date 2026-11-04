/* =====================================================
   INICIALIZAÇÃO
===================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    /* Antes de tudo: vale para o host e para o espectador */
    loadMuteSetting();

    /* Carrega a lista atual de campeões antes de montar a tela */
    await loadChampionData();

    renderMatchHistory();

    if (IS_VIEWER) {
        initViewer();
        renderStats();
        return;
    }

    loadPlayerNames(); /* antes da rotação, que lê os nomes */
    loadRotationSettings();
    loadPersistSettings();
    renderChampions();
    renderPools();
    setupCollapsibles(); /* depois de carregar as opções, para contar certo */

    /* Atualiza o status da rotação quando os nomes mudam */
    document.querySelectorAll(".player-input").forEach(input => {
        input.addEventListener("input", updateRotationStatus);
    });

    initHost();

});

