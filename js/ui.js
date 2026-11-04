/* =====================================================
   CAMPEÕES
===================================================== */

function renderChampions() {

    const container = document.getElementById("championList");

    container.innerHTML = "";

    const excluded = JSON.parse(
        localStorage.getItem("excludedChampions") || "[]"
    );

    champions.forEach(champion => {

        const wrapper = document.createElement("label");
        wrapper.className = "champion-option";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = champion;
        checkbox.checked = excluded.includes(champion);
        checkbox.onchange = saveExcludedChampions;

        const image = document.createElement("img");
        image.src = IMAGE_URL + champion + ".png";
        image.onerror = () => { image.style.display = "none"; };

        const name = document.createElement("span");
        name.textContent = championNames[champion] || champion;

        wrapper.appendChild(checkbox);
        wrapper.appendChild(image);
        wrapper.appendChild(name);

        container.appendChild(wrapper);

    });

    updateExcludedCount();

}

/* Mostra quantos estão excluídos no título (visível com o card fechado) */
function updateExcludedCount() {
    const total = document.querySelectorAll("#championList input:checked").length;
    document.getElementById("excludedCount").textContent =
        total === 0 ? "(nenhum)" : "(" + total + (total === 1 ? " excluído)" : " excluídos)");
}

/* Pools marcadas, no título do card de listas */
function updatePoolsCount() {
    const total = getSelectedPoolIds().length;
    document.getElementById("poolsCount").textContent =
        total === 0 ? "(nenhuma ativa)" : "(" + total + (total === 1 ? " ativa)" : " ativas)");
}

/* Opções ligadas, no título do card de configurações */
const SETTINGS_TOGGLES = ["shufflePlayers", "persistNoRepeat", "noRepeatLanes"];

function updateSettingsCount() {
    const on = SETTINGS_TOGGLES
        .filter(id => document.getElementById(id).checked).length;
    document.getElementById("settingsCount").textContent =
        "(" + on + " de " + SETTINGS_TOGGLES.length + " ligadas)";
}

/* =====================================================
   CARDS QUE ABREM/FECHAM
   Começam fechados e lembram a escolha no navegador.
===================================================== */

const COLLAPSIBLE_CARDS = [
    { id: "settingsDetails", key: "settingsOpen" },
    { id: "poolsDetails", key: "poolsOpen" },
    { id: "excludedDetails", key: "excludedOpen" }
];

function setupCollapsibles() {

    COLLAPSIBLE_CARDS.forEach(({ id, key }) => {

        const details = document.getElementById(id);

        try {
            details.open = localStorage.getItem(key) === "true";
        } catch (e) { /* ignora */ }

        details.addEventListener("toggle", () => {
            try {
                localStorage.setItem(key, details.open);
            } catch (e) { /* opcional */ }
        });

    });

    SETTINGS_TOGGLES.forEach(id => {
        document.getElementById(id).addEventListener("change", updateSettingsCount);
    });

    updateSettingsCount();

}

/* =====================================================
   EXCLUSÕES
===================================================== */

function saveExcludedChampions() {

    const checked = [
        ...document.querySelectorAll("#championList input:checked")
    ].map(input => input.value);

    localStorage.setItem("excludedChampions", JSON.stringify(checked));

    updateExcludedCount();

}

/* =====================================================
   PESQUISA
===================================================== */

function filterChampions() {

    const search = document
        .getElementById("championSearch")
        .value
        .toLowerCase();

    document.querySelectorAll(".champion-option").forEach(element => {

        const text = element.textContent.toLowerCase();

        element.style.display = text.includes(search) ? "flex" : "none";

    });

}

/* =====================================================
   FULL RANDOM
===================================================== */

function toggleLanes() {

    const fullRandom = document.getElementById("fullRandom").checked;

    document.querySelectorAll("#laneContainer input").forEach(input => {
        input.disabled = fullRandom;
    });

}

/* =====================================================
   NOMES DOS JOGADORES (continuam após F5 / fechar a página)
===================================================== */

const PLAYER_NAMES_KEY = "playerNames";

function savePlayerNames() {
    const names = [...document.querySelectorAll(".player-input")]
        .map(input => input.value);
    try {
        localStorage.setItem(PLAYER_NAMES_KEY, JSON.stringify(names));
    } catch (e) { /* opcional */ }
}

function loadPlayerNames() {

    let names = [];

    try {
        const saved = JSON.parse(localStorage.getItem(PLAYER_NAMES_KEY));
        if (Array.isArray(saved)) names = saved;
    } catch (e) { /* ignora */ }

    document.querySelectorAll(".player-input").forEach((input, i) => {
        if (typeof names[i] === "string") input.value = names[i];
        input.addEventListener("input", savePlayerNames);
    });

}

