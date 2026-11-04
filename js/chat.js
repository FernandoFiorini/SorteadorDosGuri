/* =====================================================
   CHAT DA SALA

   Estrutura: salas/CODIGO/mensagens/{pushId}
              -> { uid, nome, texto, ts }
===================================================== */

const CHAT_NAME_KEY = "chatName";
const CHAT_LIMIT = 100;

let chatStarted = false;
let chatListenerRef = null;
let lastSentAt = 0;

function startChat() {

    if (chatStarted || !db || !roomCode) return;

    chatStarted = true;

    document.getElementById("chatCard").style.display = "block";

    const nameInput = document.getElementById("chatName");

    if (!nameInput.value) {
        nameInput.value = localStorage.getItem(CHAT_NAME_KEY) || "";
    }

    const box = document.getElementById("chatMessages");

    box.innerHTML = "";

    const empty = document.createElement("div");
    empty.className = "chat-empty";
    empty.textContent = "Nenhuma mensagem ainda. Diga oi! 👋";
    box.appendChild(empty);

    /* Só as últimas mensagens; child_added dispara uma vez por mensagem */
    chatListenerRef = db.ref("salas/" + roomCode + "/mensagens")
        .orderByChild("ts")
        .limitToLast(CHAT_LIMIT);

    chatListenerRef.on("child_added", snap => {

        const m = snap.val();

        if (!m || typeof m.texto !== "string") return;

        const emptyMsg = box.querySelector(".chat-empty");
        if (emptyMsg) emptyMsg.remove();

        const nearBottom =
            box.scrollHeight - box.scrollTop - box.clientHeight < 60;

        const row = document.createElement("div");
        row.className = "chat-msg" + (m.uid === myUid ? " mine" : "");

        const n = document.createElement("span");
        n.className = "n";
        n.textContent = (m.nome || "?") + ":";

        const text = document.createTextNode(" " + m.texto);

        const t = document.createElement("span");
        t.className = "t";
        t.textContent = new Date(m.ts).toLocaleTimeString(
            "pt-BR", { hour: "2-digit", minute: "2-digit" }
        );

        row.appendChild(n);
        row.appendChild(text);
        row.appendChild(t);

        box.appendChild(row);

        while (box.children.length > CHAT_LIMIT) box.firstChild.remove();

        if (nearBottom || m.uid === myUid) box.scrollTop = box.scrollHeight;

        /* Balão só para mensagens novas (não para o histórico carregado) */
        if (chatLive) showChatToast(m.nome, m.texto);

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

   Toda mensagem nova aparece num balão no canto inferior direito.
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
    toast.title = "Ir para o chat";

    const n = document.createElement("strong");
    n.textContent = (nome || "?") + ": ";

    toast.appendChild(n);
    toast.appendChild(document.createTextNode(texto));

    /* Clicar leva até o chat e já foca o campo de mensagem */
    toast.onclick = () => {
        document.getElementById("chatCard").scrollIntoView({ behavior: "smooth", block: "center" });
        document.getElementById("chatInput").focus({ preventScroll: true });
        toast.remove();
    };

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

    if (!myUid || !db || !roomCode) return;

    /* Anti-spam simples: 1 mensagem por segundo */
    if (Date.now() - lastSentAt < 1000) return;
    lastSentAt = Date.now();

    localStorage.setItem(CHAT_NAME_KEY, nome);

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

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("chatForm").addEventListener("submit", event => {
        event.preventDefault();
        sendChatMessage();
    });
});

