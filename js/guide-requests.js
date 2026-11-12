/* =====================================================
   PEDIDOS DE GUIA ("🙋 Pedir um guia" na seção Tutoriais)

   Qualquer pessoa escolhe campeões que ainda não têm tutorial e
   registra um pedido (um por pessoa por campeão; clicar de novo
   desfaz). Todo mundo vê os mais pedidos. A fila de prioridade
   (scripts/tutorial/fila-tutoriais.html) também mostra os pedidos.

   Firebase: global/pedidosGuia/{IdDoCampeao}/{uid} -> data do pedido
   (regra de segurança em database.rules.json, na raiz do projeto)
===================================================== */

let guideRequests = {};       /* { Campeao: { uid: data } } */
let guideRequestsReady = false;
let guideRequestsError = "";
let guideRequestsUid = null;

const requestCount = id => Object.keys(guideRequests[id] || {}).length;
const requestedByMe = id => !!(guideRequestsUid && guideRequests[id] && guideRequests[id][guideRequestsUid]);
const champLabel = id => (typeof championNames !== "undefined" && championNames[id]) || id;

/* Campeões que ainda não têm guia */
function requestableChampions() {
    const list = (typeof champions !== "undefined" && champions.length) ? champions : [];
    return list.filter(id => !TUTORIALS[id]);
}

async function startGuideRequests() {

    if (typeof initFirebase !== "function" || !initFirebase()) {
        guideRequestsError = "Os pedidos só funcionam no site publicado.";
        renderGuideRequestTop();
        return;
    }

    try {
        const auth = firebase.auth();
        const user = auth.currentUser || (await auth.signInAnonymously()).user;
        guideRequestsUid = user.uid;
    } catch (error) {
        console.warn("Pedidos de guia: login anônimo falhou", error);
    }

    db.ref("global/pedidosGuia").on("value", snap => {
        guideRequests = snap.val() || {};
        guideRequestsReady = true;
        guideRequestsError = "";
        renderGuideRequestTop();
        if (document.getElementById("guideRequestDialog").open) renderGuideRequestGrid();
    }, error => {
        console.warn("Pedidos de guia indisponíveis:", error);
        guideRequestsError = "Os pedidos ainda não estão liberados no banco.";
        renderGuideRequestTop();
    });

}

async function toggleGuideRequest(id) {

    if (!guideRequestsUid || !db) return;

    const ref = db.ref("global/pedidosGuia/" + id + "/" + guideRequestsUid);

    try {
        if (requestedByMe(id)) await ref.remove();
        else await ref.set(firebase.database.ServerValue.TIMESTAMP);
    } catch (error) {
        console.warn("Não foi possível registrar o pedido:", error);
        alert("Não foi possível registrar o pedido agora.");
    }

}

/* Faixa "Mais pedidos" na seção Tutoriais (todo mundo vê) */
function renderGuideRequestTop() {

    const box = document.getElementById("guideRequestTop");
    if (!box) return;

    box.innerHTML = "";

    if (guideRequestsError) {
        box.appendChild(Object.assign(document.createElement("span"), { className: "guide-req-muted", textContent: guideRequestsError }));
        return;
    }

    const top = Object.keys(guideRequests)
        .filter(id => !TUTORIALS[id] && requestCount(id) > 0)
        .sort((a, b) => requestCount(b) - requestCount(a) || champLabel(a).localeCompare(champLabel(b), "pt-BR"))
        .slice(0, 6);

    const title = document.createElement("span");
    title.className = "guide-req-title";
    title.textContent = "🔥 Mais pedidos:";
    box.appendChild(title);

    if (!top.length) {
        box.appendChild(Object.assign(document.createElement("span"), { className: "guide-req-muted", textContent: guideRequestsReady ? "nenhum pedido ainda. Seja o primeiro!" : "carregando..." }));
        return;
    }

    top.forEach(id => {
        const chip = document.createElement("span");
        chip.className = "guide-req-chip";
        chip.title = requestCount(id) + " pedido(s)";
        const img = document.createElement("img");
        img.src = IMAGE_URL + id + ".png";
        img.alt = "";
        chip.appendChild(img);
        chip.appendChild(document.createTextNode(champLabel(id)));
        const n = document.createElement("b");
        n.textContent = requestCount(id);
        chip.appendChild(n);
        box.appendChild(chip);
    });

}

/* Janela para escolher os campeões */
function renderGuideRequestGrid() {

    const grid = document.getElementById("guideRequestGrid");
    const term = normalizeName(document.getElementById("guideRequestSearch").value);

    grid.innerHTML = "";

    const ids = requestableChampions()
        .filter(id => !term || normalizeName(champLabel(id)).includes(term) || normalizeName(id).includes(term))
        .sort((a, b) => requestCount(b) - requestCount(a) || champLabel(a).localeCompare(champLabel(b), "pt-BR"));

    ids.forEach(id => {
        const mine = requestedByMe(id);
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "guide-req-tile" + (mine ? " mine" : "");
        btn.title = mine ? "Você pediu este guia (clique para desfazer)" : "Pedir o guia de " + champLabel(id);
        btn.disabled = !guideRequestsUid || !!guideRequestsError;
        btn.onclick = () => toggleGuideRequest(id);

        const img = document.createElement("img");
        img.src = IMAGE_URL + id + ".png";
        img.alt = "";
        img.loading = "lazy";
        btn.appendChild(img);

        const name = document.createElement("strong");
        name.textContent = champLabel(id);
        btn.appendChild(name);

        const count = document.createElement("span");
        const n = requestCount(id);
        count.textContent = (mine ? "✓ pedido · " : "") + (n ? n + (n === 1 ? " pedido" : " pedidos") : "pedir");
        btn.appendChild(count);

        grid.appendChild(btn);
    });

    if (!ids.length) {
        grid.appendChild(Object.assign(document.createElement("div"), { className: "tutorial-grid-empty", textContent: "Nenhum campeão com esse nome (ou ele já tem guia)." }));
    }

    const status = document.getElementById("guideRequestStatus");
    status.textContent = guideRequestsError
        || (!guideRequestsUid ? "Conectando..." : "Clique nos campeões que você quer ver com guia. Clicar de novo desfaz.");

}

document.addEventListener("DOMContentLoaded", () => {

    const dialog = document.getElementById("guideRequestDialog");
    if (!dialog) return;

    document.getElementById("guideRequestBtn").addEventListener("click", () => {
        document.getElementById("guideRequestSearch").value = "";
        renderGuideRequestGrid();
        dialog.showModal();
    });

    document.getElementById("guideRequestClose").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
    document.getElementById("guideRequestSearch").addEventListener("input", renderGuideRequestGrid);

    renderGuideRequestTop();
    startGuideRequests();

});
