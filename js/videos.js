/* =====================================================
   ÚLTIMOS CLIPES DOS CANAIS DO YOUTUBE

   O Worker (rota GET /videos) lê o feed de cada canal e devolve
   os 5 vídeos mais recentes de cada um. Uma aba por canal e os
   vídeos numa rolagem horizontal. Se não carregar, a seção some.
===================================================== */

let clipsChannels = [];
let clipsActive = 0;

function clipDate(iso) {

    const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);

    if (days <= 0) return "hoje";
    if (days === 1) return "ontem";
    if (days < 7) return "há " + days + " dias";

    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

}

function clipCard(video) {

    const link = document.createElement("a");
    link.className = "clip";
    link.href = video.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.title = video.titulo;

    const thumb = document.createElement("span");
    thumb.className = "clip-thumb";

    const img = document.createElement("img");
    img.src = video.thumb;
    img.alt = "";
    img.loading = "lazy";

    const play = document.createElement("span");
    play.className = "clip-play";
    play.textContent = "▶";

    thumb.appendChild(img);
    thumb.appendChild(play);

    const title = document.createElement("span");
    title.className = "clip-title";
    title.textContent = video.titulo;

    const meta = document.createElement("span");
    meta.className = "clip-meta";
    meta.textContent = "Canal do " + video.canal + " · " + clipDate(video.publicado);

    link.appendChild(thumb);
    link.appendChild(title);
    link.appendChild(meta);

    return link;

}

function renderClips() {

    const tabs = document.getElementById("clipsTabs");
    const track = document.getElementById("clipsTrack");

    tabs.innerHTML = "";
    track.innerHTML = "";

    clipsChannels.forEach((channel, i) => {

        const tab = document.createElement("button");
        tab.type = "button";
        tab.setAttribute("role", "tab");
        tab.setAttribute("aria-selected", String(i === clipsActive));
        tab.className = "clips-tab" + (i === clipsActive ? " active" : "");
        tab.textContent = "Canal do " + channel.nome;

        tab.onclick = () => {
            clipsActive = i;
            renderClips();
        };

        tabs.appendChild(tab);

    });

    const channel = clipsChannels[clipsActive];

    channel.videos.forEach(video => track.appendChild(clipCard(video)));

    /* Último card: link para o canal */
    const more = document.createElement("a");
    more.className = "clip clip-more";
    more.href = channel.url;
    more.target = "_blank";
    more.rel = "noopener noreferrer";
    more.textContent = "Ver todos no canal do " + channel.nome + " →";
    track.appendChild(more);

    track.scrollLeft = 0;
    updateClipArrows();

}

/* Setas só aparecem quando dá para rolar naquela direção */
function updateClipArrows() {

    const track = document.getElementById("clipsTrack");

    document.getElementById("clipsPrev").disabled = track.scrollLeft <= 4;
    document.getElementById("clipsNext").disabled =
        track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;

}

function scrollClips(direction) {

    const track = document.getElementById("clipsTrack");
    const card = track.querySelector(".clip");
    const step = card ? card.getBoundingClientRect().width + 12 : 260;

    track.scrollBy({ left: direction * step, behavior: "smooth" });

}

async function loadClips() {

    if (typeof RIOT_WORKER_URL === "undefined" || !RIOT_WORKER_URL) return;

    try {

        const response = await fetch(RIOT_WORKER_URL.replace(/\/$/, "") + "/videos");

        if (!response.ok) return;

        const data = await response.json();

        if (data.status !== "ok" || !Array.isArray(data.canais) || data.canais.length === 0) return;

        clipsChannels = data.canais;
        clipsActive = 0;

        document.getElementById("clipsCard").style.display = "";

        renderClips();

    } catch (error) {
        /* Sem clipes: a seção simplesmente não aparece */
        console.warn("Clipes indisponíveis:", error);
    }

}

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("clipsPrev").addEventListener("click", () => scrollClips(-1));
    document.getElementById("clipsNext").addEventListener("click", () => scrollClips(1));
    document.getElementById("clipsTrack").addEventListener("scroll", updateClipArrows, { passive: true });
    window.addEventListener("resize", updateClipArrows);

    loadClips();

});
