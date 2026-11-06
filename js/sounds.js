/* =====================================================
   SOM DO SORTEIO
===================================================== */

/* =====================================================
   LISTA DE ÁUDIOS SORTEÁVEIS
   Para adicionar um áudio novo: coloque o arquivo na pasta do site
   e acrescente uma linha aqui { name: "Nome exibido", file: "arquivo.mp3" }
===================================================== */

const soundList = [
    { name: "Oloko", file: "oloko.mp3" },
    { name: "Aluqix", file: "aluqix.mp3" },
    { name: "Cachorro", file: "cachorro.mp3" },
    { name: "Risada", file: "risada.mp3" },
    { name: "Tá assistindo", file: "taassistindo.mp3" },
    { name: "Queria reseta", file: "queriareseta.mp3" },
    { name: "Ninguem quer me ajudar", file: "ninguemquermeajudar.mp3" },
    { name: "Nando cala boca", file: "nandocalaboca.mp3" },
    { name: "Escutou o que falei?", file: "escutouoqfalei.mp3" },
    { name: "Deixa comigo aspira", file: "deixacomigoaspira.mp3" },
    { name: "Deixa eu clicar", file: "deixaclicar.mp3" },
    { name: "Ai cara", file: "aicara.mp3" },
    { name: "Paixão pode relaxar", file: "paixaopoderelaxar.mp3" },
    { name: "Gritinho nardi", file: "gritinhonardi.mp3" },
    { name: "Me ajuda Valde", file: "meajudavalde.mp3" },
    { name: "Cu do gueixo", file: "cudogueixo.mp3" },
    { name: "Me ajuda Ber", file: "meajudaber.mp3" },
    { name: "Vamo fazer o drag", file: "vamofazerodrag.mp3" },
    { name: "Risada louca nardi", file: "risadaloucanardi.mp3" },

];

/* Cache de objetos Audio (um por arquivo) */
const audioCache = {};

function getAudio(file) {
    if (!audioCache[file]) {
        const audio = new Audio(file);
        audio.preload = "auto";
        audioCache[file] = audio;
    }
    return audioCache[file];
}

/* Pré-carrega todos os arquivos conhecidos */
function allSoundFiles() {
    return [...new Set(soundList.map(s => s.file))];
}

allSoundFiles().forEach(getAudio);

/* Sorteia áudios para os cards: todos os da lista entram, sem repetir
   entre lanes diferentes (só repete se houver menos áudios que cards).
   "exclude" = áudios já em uso por outros cards (resorteio). */
function pickSounds(count, exclude) {

    const all = soundList.map(s => s.file);

    if (all.length === 0) return Array(count).fill(null);

    let pool = shuffle(all.filter(f => !(exclude || []).includes(f)));

    if (pool.length === 0) pool = shuffle(all);

    const picked = [];

    while (picked.length < count) {
        if (pool.length === 0) pool = shuffle(all);
        picked.push(pool.shift());
    }

    return picked;

}

/* =====================================================
   MUTAR OS ÁUDIOS
   Vale só para este navegador (cada pessoa escolhe a sua) e
   continua valendo depois de F5.
===================================================== */

const SOUND_MUTED_KEY = "soundMuted";

let soundMuted = false;

function updateMuteButton() {
    const button = document.getElementById("muteBtn");
    button.textContent = soundMuted ? "🔇 Som desligado" : "🔊 Som ligado";
    button.setAttribute("aria-pressed", soundMuted);
}

function loadMuteSetting() {
    try {
        soundMuted = localStorage.getItem(SOUND_MUTED_KEY) === "true";
    } catch (e) { /* ignora */ }
    updateMuteButton();
}

function toggleMute() {

    soundMuted = !soundMuted;

    try {
        localStorage.setItem(SOUND_MUTED_KEY, soundMuted);
    } catch (e) { /* opcional */ }

    /* Corta também o áudio que estiver tocando agora */
    if (soundMuted) {
        Object.values(audioCache).forEach(audio => audio.pause());
    }

    updateMuteButton();

}

function playChampionSound(file) {
    if (!file || soundMuted) return;

    const audio = getAudio(file);

    audio.currentTime = 0;
    audio.play().catch(error => {
        console.log("Não foi possível reproduzir o som:", error);
    });
}

/* Navegadores só liberam áudio depois de um clique.
   O espectador clica em "Entrar na sala" e aqui "destravamos" os sons. */
function unlockAudio() {
    allSoundFiles().map(getAudio).forEach(sound => {
        sound.muted = true;
        const p = sound.play();
        const restore = () => {
            sound.pause();
            sound.currentTime = 0;
            sound.muted = false;
        };
        if (p && p.then) {
            p.then(restore).catch(() => { sound.muted = false; });
        } else {
            restore();
        }
    });
}

