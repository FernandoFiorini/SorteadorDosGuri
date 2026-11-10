/* =====================================================
   CHAT DA SALA

   Estrutura: salas/CODIGO/mensagens/{pushId}
              -> { uid, nome, texto, ts }

   Fica numa janelinha flutuante no canto inferior direito.
   Minimizada, mostra quantas mensagens não foram lidas.
===================================================== */

const CHAT_NAME_KEY = "chatName";
const CHAT_OPEN_KEY = "chatAberto";
const CHAT_LIMIT = 100;

/* Em localhost sem Firebase, mostra o chat com mensagens de exemplo
   só para ver como fica (nada é enviado). false desliga. */
const CHAT_LOCAL_DEMO = false;

let chatStarted = false;
let chatDemo = false;
let chatListenerRef = null;
let lastSentAt = 0;
let chatUnread = 0;

const BASE_TITLE = document.title;

/* ---------- Abrir / minimizar ---------- */

function chatIsOpen() {
    return document.getElementById("chatCard").classList.contains("open");
}

function setChatOpen(open) {

    const card = document.getElementById("chatCard");

    card.classList.toggle("open", open);
    document.getElementById("chatLauncher").setAttribute("aria-expanded", String(open));

    try { localStorage.setItem(CHAT_OPEN_KEY, open ? "1" : "0"); } catch (e) { /* sem armazenamento */ }

    if (open) {

        setChatUnread(0);

        const box = document.getElementById("chatMessages");
        box.scrollTop = box.scrollHeight;

        /* Sem nome ainda: começa pelo nome; senão, pela mensagem */
        const nameInput = document.getElementById("chatName");
        (nameInput.value ? document.getElementById("chatInput") : nameInput).focus({ preventScroll: true });

        /* Balões somem quando o chat abre */
        const stack = document.getElementById("chatToasts");
        if (stack) stack.innerHTML = "";

    }

}

/* Contador de não lidas: bolinha no botão e "(2)" no título da aba */
function setChatUnread(count) {

    chatUnread = count;

    const badge = document.getElementById("chatBadge");

    badge.hidden = count === 0;
    badge.textContent = count > 9 ? "9+" : String(count);

    document.title = count > 0 ? "(" + (count > 9 ? "9+" : count) + ") " + BASE_TITLE : BASE_TITLE;

}

/* Mostra a janelinha (minimizada ou aberta, como a pessoa deixou) */
function showChatWidget() {

    const card = document.getElementById("chatCard");
    card.style.display = "block";

    let open = false;
    try { open = localStorage.getItem(CHAT_OPEN_KEY) === "1"; } catch (e) { /* sem armazenamento */ }

    setChatOpen(open);

}

/* ---------- Mensagens ---------- */

function resetChatBox() {

    const box = document.getElementById("chatMessages");

    box.innerHTML = "";

    const empty = document.createElement("div");
    empty.className = "chat-empty";
    empty.textContent = "Nenhuma mensagem ainda. Diga oi! 👋";
    box.appendChild(empty);

}

/* Põe uma mensagem na lista; "live" = chegou agora (não é histórico) */
function appendChatMessage(m, mine, live) {

    const box = document.getElementById("chatMessages");

    const emptyMsg = box.querySelector(".chat-empty");
    if (emptyMsg) emptyMsg.remove();

    const nearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 60;

    const row = document.createElement("div");
    row.className = "chat-msg" + (mine ? " mine" : "");

    const n = document.createElement("span");
    n.className = "n";
    n.textContent = (m.nome || "?") + ":";

    const text = document.createTextNode(" " + m.texto);

    const t = document.createElement("span");
    t.className = "t";
    t.textContent = new Date(m.ts || Date.now()).toLocaleTimeString(
        "pt-BR", { hour: "2-digit", minute: "2-digit" }
    );

    row.appendChild(n);
    row.appendChild(text);
    row.appendChild(t);

    box.appendChild(row);

    while (box.children.length > CHAT_LIMIT) box.firstChild.remove();

    if (nearBottom || mine) box.scrollTop = box.scrollHeight;

    /* Mensagem nova de outra pessoa: conta como não lida se o chat
       estiver minimizado ou a aba estiver em segundo plano */
    if (live && !mine) {

        if (!chatIsOpen() || document.hidden) setChatUnread(chatUnread + 1);

        if (!chatIsOpen()) showChatToast(m.nome, m.texto);

    }

}

function startChat() {

    if (chatStarted || !db || !roomCode) return;

    chatStarted = true;
    chatDemo = false;

    const nameInput = document.getElementById("chatName");

    if (!nameInput.value) {
        nameInput.value = localStorage.getItem(CHAT_NAME_KEY) || "";
    }

    resetChatBox();
    showChatWidget();

    /* Só as últimas mensagens; child_added dispara uma vez por mensagem */
    chatListenerRef = db.ref("salas/" + roomCode + "/mensagens")
        .orderByChild("ts")
        .limitToLast(CHAT_LIMIT);

    chatListenerRef.on("child_added", snap => {

        const m = snap.val();

        if (!m || typeof m.texto !== "string") return;

        appendChatMessage(m, m.uid === myUid, chatLive);

    }, error => {
        console.error(error);
    });

    /* O "value" chega depois de todas as mensagens antigas:
       a partir daí, cada child_added é uma mensagem nova */
    chatLive = false;
    chatListenerRef.once("value", () => { chatLive = true; });

}

/* =====================================================
   BALÕES DO CHAT

   Com o chat minimizado, mensagem nova aparece num balão
   logo acima do botão. Clicar abre o chat.
===================================================== */

let chatLive = false;

const BUBBLE_MS = 6000;
const TOAST_MAX = 3;

function showChatToast(nome, texto) {

    let stack = document.getElementById("chatToasts");

    if (!stack) {
        stack = document.createElement("div");
        stack.id = "chatToasts";
        stack.className = "chat-toasts";
        document.body.appendChild(stack);
    }

    while (stack.children.length >= TOAST_MAX) stack.firstChild.remove();

    const toast = document.createElement("button");
    toast.type = "button";
    toast.className = "chat-toast";
    toast.title = "Abrir o chat";

    const n = document.createElement("strong");
    n.textContent = (nome || "?") + ": ";

    toast.appendChild(n);
    toast.appendChild(document.createTextNode(texto));

    toast.onclick = () => setChatOpen(true);

    stack.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("leaving");
        setTimeout(() => toast.remove(), 300);
    }, BUBBLE_MS);

}

/* Para de escutar a sala atual (usado ao criar nova sala) */
function stopChat() {

    if (chatListenerRef) {
        chatListenerRef.off();
        chatListenerRef = null;
    }

    chatStarted = false;
    chatLive = false;

    document.getElementById("chatMessages").innerHTML = "";
    setChatUnread(0);

}

function sendChatMessage() {

    const nameInput = document.getElementById("chatName");
    const input = document.getElementById("chatInput");

    const nome = nameInput.value.trim().slice(0, 20);
    const texto = input.value.trim().slice(0, 300);

    if (!texto) return;

    if (!nome) {
        nameInput.focus();
        return;
    }

    /* Anti-spam simples: 1 mensagem por segundo */
    if (Date.now() - lastSentAt < 1000) return;
    lastSentAt = Date.now();

    try { localStorage.setItem(CHAT_NAME_KEY, nome); } catch (e) { /* sem armazenamento */ }

    /* Demonstração local: só mostra na tela */
    if (chatDemo) {
        appendChatMessage({ nome: nome, texto: texto, ts: Date.now() }, true, true);
        input.value = "";
        return;
    }

    if (!myUid || !db || !roomCode) return;

    db.ref("salas/" + roomCode + "/mensagens").push({
        uid: myUid,
        nome: nome,
        texto: texto,
        ts: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        input.value = "";
    }).catch(error => {
        console.error("Erro ao enviar mensagem:", error);
        alert("Não foi possível enviar (" + (error.code || error.message) + "). Verifique as regras do Firebase.");
    });

}

/* ---------- Demonstração local (sem Firebase) ---------- */

function startChatDemo() {

    if (chatStarted || db) return;

    chatStarted = true;
    chatDemo = true;

    const nameInput = document.getElementById("chatName");
    if (!nameInput.value) {
        try { nameInput.value = localStorage.getItem(CHAT_NAME_KEY) || ""; } catch (e) { /* sem armazenamento */ }
    }

    resetChatBox();

    const now = Date.now();

    [
        { nome: "Valde", texto: "bora mais uma?", ts: now - 300000 },
        { nome: "Nardi", texto: "se cair de jungle de novo eu saio", ts: now - 240000 },
        { nome: "Ber", texto: "sorteia logo", ts: now - 60000 }
    ].forEach(m => appendChatMessage(m, false, false));

    showChatWidget();

    /* Simula mensagens chegando, para ver o contador e o balão */
    setTimeout(() => appendChatMessage({ nome: "Pitty", texto: "caí de suporte DE NOVO", ts: Date.now() }, false, true), 5000);
    setTimeout(() => appendChatMessage({ nome: "Valde", texto: "kkkkkkkk", ts: Date.now() }, false, true), 9000);

}

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("chatForm").addEventListener("submit", event => {
        event.preventDefault();
        sendChatMessage();
    });

    document.getElementById("chatLauncher").addEventListener("click", () => {
        setChatOpen(!chatIsOpen());
    });

    document.getElementById("chatMinimize").addEventListener("click", () => {
        setChatOpen(false);
    });

    /* Esc minimiza */
    document.getElementById("chatPanel").addEventListener("keydown", event => {
        if (event.key === "Escape") setChatOpen(false);
    });

    /* Voltou para a aba com o chat aberto: zera as não lidas */
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden && chatIsOpen()) setChatUnread(0);
    });

});

/* Localhost sem Firebase: mostra a demonstração */
window.addEventListener("load", () => {
    setTimeout(() => {
        if (CHAT_LOCAL_DEMO && IS_LOCAL && !db && !chatStarted) startChatDemo();
    }, 800);
});
