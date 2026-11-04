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

