/* =====================================================
   POOLS PREDETERMINADAS
   Para criar uma pool nova, basta adicionar um item aqui.
   Use os mesmos IDs da lista "champions" (ex.: "MonkeyKing" = Wukong).
===================================================== */

const championPools = [
    {
        id: "veneno",
        name: "Veneno",
        champions: ["Teemo", "Twitch", "Singed", "Cassiopeia", "Zyra"]
    },
    {
        id: "sangramento",
        name: "Sangramento",
        champions: ["Darius", "Talon", "Kindred", "Draven", "Hecarim"]
    },
    {
        id: "fogo",
        name: "Fogo",
        champions: ["Brand", "Smolder", "Annie", "Shyvana", "Rumble"]
    },
    {
        id: "tankudini",
        name: "Tankudini",
        champions: ["Ornn", "Malphite", "Maokai", "Alistar", "Poppy"]
    },
    {
        id: "velocidade",
        name: "Velocidade",
        champions: ["Zilean", "Janna", "Hecarim", "Rammus", "Lillia"]
    },
    {
        id: "assasino",
        name: "Assasino",
        champions: ["Zed", "Katarina", "Talon", "Locke", "Fizz"]
    },
    {
        id: "fullCC",
        name: "Full cc",
        champions: ["Morgana", "Leona", "Sejuani", "Amumu", "Lissandra"]
    }
];

const POOLS_KEY = "selectedPools";

function loadSelectedPools() {
    try {
        const saved = JSON.parse(localStorage.getItem(POOLS_KEY));
        return Array.isArray(saved) ? saved : [];
    } catch (e) {
        return [];
    }
}

function getSelectedPoolIds() {
    return [...document.querySelectorAll("#poolList input:checked")]
        .map(input => input.value);
}

/* União (sem repetição) dos campeões das pools marcadas */
function getPoolChampions() {

    const ids = getSelectedPoolIds();
    const set = new Set();

    championPools
        .filter(pool => ids.includes(pool.id))
        .forEach(pool => pool.champions.forEach(c => {
            /* Ignora ids que não existem mais na versão atual do jogo */
            if (champions.includes(c)) set.add(c);
        }));

    return [...set];

}

function renderPools() {

    const container = document.getElementById("poolList");
    const saved = loadSelectedPools();

    container.innerHTML = "";

    championPools.forEach(pool => {

        const wrapper = document.createElement("label");
        wrapper.className = "pool-option";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = pool.id;
        checkbox.checked = saved.includes(pool.id);
        checkbox.onchange = onPoolChange;

        const name = document.createElement("div");
        name.className = "pool-name";
        name.textContent = pool.name;

        const champs = document.createElement("div");
        champs.className = "pool-champs";

        pool.champions.forEach(champion => {
            const img = document.createElement("img");
            img.src = IMAGE_URL + champion + ".png";
            img.title = championNames[champion] || champion;
            img.onerror = () => { img.style.display = "none"; };
            champs.appendChild(img);
        });

        wrapper.appendChild(checkbox);
        wrapper.appendChild(name);
        wrapper.appendChild(champs);

        container.appendChild(wrapper);

    });

    updatePoolUI();

}

function onPoolChange() {
    localStorage.setItem(POOLS_KEY, JSON.stringify(getSelectedPoolIds()));
    updatePoolUI();
}

/* Destaca pools marcadas e "apaga" as regras que ficam ignoradas */
function updatePoolUI() {

    const active = getSelectedPoolIds().length > 0;

    updatePoolsCount();

    document.querySelectorAll(".pool-option").forEach(option => {
        option.classList.toggle(
            "active",
            option.querySelector("input").checked
        );
    });

    document.getElementById("poolWarning").style.display =
        active ? "block" : "none";

    document.getElementById("excludedCard")
        .classList.toggle("disabled-by-pool", active);

    ["persistNoRepeat", "noRepeatLanes"].forEach(id => {
        document.getElementById(id).closest(".setting")
            .classList.toggle("disabled-by-pool", active);
    });

    document.querySelector(".persist-wrap")
        .classList.toggle("disabled-by-pool", active);

    /* O botão de resortear depende de "já sorteados" estar ativo */
    applyPersistClass();

}

