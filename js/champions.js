/* =====================================================
   CAMPEÕES
===================================================== */

/* Lista de reserva (usada só se a busca no Data Dragon falhar
   e não houver cache salvo no navegador) */
let champions = [

    "Aatrox", "Ahri", "Akali", "Akshan", "Alistar", "Ambessa", "Amumu",
    "Anivia", "Annie", "Aphelios", "Ashe", "AurelionSol", "Aurora", "Azir",

    "Bard", "Belveth", "Blitzcrank", "Brand", "Braum", "Briar",

    "Caitlyn", "Camille", "Corki",

    "Darius", "Diana", "DrMundo", "Draven",

    "Ekko", "Elise", "Evelynn", "Ezreal",

    "Fiddlesticks", "Fiora", "Fizz",

    "Galio", "Gangplank", "Garen", "Gnar", "Gragas", "Graves", "Gwen",

    "Hecarim", "Heimerdinger", "Hwei",

    "Illaoi", "Irelia", "Ivern",

    "Janna", "JarvanIV", "Jax", "Jayce", "Jhin", "Jinx",

    "Kaisa", "Kalista", "Karma", "Karthus", "Kassadin", "Katarina", "Kayle",
    "Kayn", "Kennen", "Khazix", "Kindred", "Kled", "KogMaw",

    "Leblanc", "LeeSin", "Leona", "Lillia", "Lissandra", "Lucian", "Lulu", "Lux",

    "Malphite", "Malzahar", "Maokai", "Mel", "MasterYi", "Milio",
    "MissFortune", "Mordekaiser", "Morgana",

    "Naafiri", "Nami", "Nasus", "Nautilus", "Neeko", "Nidalee", "Nilah",
    "Nocturne", "Nunu",

    "Olaf", "Orianna", "Ornn",

    "Pantheon", "Poppy", "Pyke",

    "Qiyana", "Quinn",

    "Rakan", "Rammus", "RekSai", "Rell", "Renata", "Renekton", "Rengar",
    "Riven", "Rumble", "Ryze",

    "Samira", "Sejuani", "Senna", "Seraphine", "Sett", "Shaco", "Shen",
    "Shyvana", "Singed", "Sion", "Sivir", "Skarner", "Smolder", "Sona",
    "Soraka", "Swain", "Sylas", "Syndra",

    "TahmKench", "Taliyah", "Talon", "Taric", "Teemo", "Thresh", "Tristana",
    "Trundle", "Tryndamere", "TwistedFate", "Twitch",

    "Udyr", "Urgot",

    "Varus", "Vayne", "Veigar", "Velkoz", "Vex", "Vi", "Viego", "Viktor",
    "Vladimir", "Volibear",

    "Warwick", "MonkeyKing", "Xayah", "Xerath", "XinZhao",

    "Yasuo", "Yone", "Yorick", "Yunara", "Yuumi",

    "Zac", "Zed", "Zeri", "Ziggs", "Zilean", "Zoe", "Zyra"

];

/* =====================================================
   NOMES
===================================================== */

let championNames = {
    AurelionSol: "Aurelion Sol",
    Belveth: "Bel'Veth",
    DrMundo: "Dr. Mundo",
    JarvanIV: "Jarvan IV",
    Kaisa: "Kai'Sa",
    Khazix: "Kha'Zix",
    KogMaw: "Kog'Maw",
    Leblanc: "LeBlanc",
    LeeSin: "Lee Sin",
    MasterYi: "Master Yi",
    MissFortune: "Miss Fortune",
    MonkeyKing: "Wukong",
    RekSai: "Rek'Sai",
    RenataGlasc: "Renata Glasc",
    TahmKench: "Tahm Kench",
    TwistedFate: "Twisted Fate",
    XinZhao: "Xin Zhao",
    Velkoz: "Vel'Koz"
};

/* =====================================================
   ORDEM DAS LANES
===================================================== */

const laneOrder = ["Top", "Jungle", "Mid", "ADC", "Support"];

/* =====================================================
   LISTA DE CAMPEÕES AUTOMÁTICA (DATA DRAGON)

   Ao abrir a página:
   1. busca a versão mais recente do jogo (versions.json);
   2. se for a mesma do cache salvo no navegador, usa o cache;
   3. senão baixa champion.json (nomes em português) e atualiza;
   4. se a internet/Riot falhar, usa o cache; se não houver
      cache, usa a lista de reserva escrita acima.
===================================================== */

const DDRAGON_BASE = "https://ddragon.leagueoflegends.com";
const DDRAGON_CACHE_KEY = "ddragonCache";

async function fetchJson(url, timeoutMs) {

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs || 5000);

    try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error("HTTP " + response.status);
        return await response.json();
    } finally {
        clearTimeout(timer);
    }

}

function readDdragonCache() {
    try {
        const saved = JSON.parse(localStorage.getItem(DDRAGON_CACHE_KEY));
        if (saved && saved.version && Array.isArray(saved.ids)
            && saved.ids.length > 100 && saved.names) return saved;
    } catch (e) { /* ignora */ }
    return null;
}

function applyChampionData(data) {

    DATA_DRAGON_VERSION = data.version;

    IMAGE_URL = DDRAGON_BASE + "/cdn/" + data.version + "/img/champion/";

    champions = data.ids;

    /* Mantém as grafias manuais como reserva para o que faltar */
    championNames = Object.assign({}, championNames, data.names);

    /* Seção de tutoriais com os nomes e ícones da versão nova */
    if (typeof renderTutorialSection === "function") renderTutorialSection();

}

async function loadChampionData() {

    const cached = readDdragonCache();

    try {

        const versions = await fetchJson(DDRAGON_BASE + "/api/versions.json");
        const latest = versions[0];

        if (cached && cached.version === latest) {
            applyChampionData(cached);
            return;
        }

        const json = await fetchJson(
            DDRAGON_BASE + "/cdn/" + latest + "/data/pt_BR/champion.json",
            8000
        );

        const names = {};

        Object.keys(json.data).forEach(id => {
            names[id] = json.data[id].name;
        });

        /* Ordem alfabética pelo nome exibido */
        const ids = Object.keys(names).sort(
            (a, b) => names[a].localeCompare(names[b], "pt-BR")
        );

        if (ids.length < 100) throw new Error("Lista de campeões incompleta");

        const data = { version: latest, ids: ids, names: names };

        try {
            localStorage.setItem(DDRAGON_CACHE_KEY, JSON.stringify(data));
        } catch (e) { /* cache é opcional */ }

        applyChampionData(data);

    } catch (error) {

        console.warn("Data Dragon indisponível, usando cache/reserva:", error);

        if (cached) applyChampionData(cached);

    }

}
