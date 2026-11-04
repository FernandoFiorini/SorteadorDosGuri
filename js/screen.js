/* =====================================================
   COMPARTILHAR TELA (WebRTC + sinalização via Firebase)

   O vídeo NÃO passa pelo Firebase: vai direto do host para cada
   espectador (peer-to-peer). O Firebase só troca as mensagens de
   conexão (ofertas, respostas e candidatos ICE), que são pequenas
   e apagadas quando o host para de compartilhar.

   Estrutura: salas/CODIGO/rtc/
     active            -> { sid }              (existe só enquanto compartilha)
     viewers/{uid}     -> { sid, cid }         (espectador pede para conectar)
     offers/{cid}      -> { sid, type, sdp }   (host -> espectador)
     answers/{cid}     -> { type, sdp }        (espectador -> host)
     ice/{cid}/host    -> candidatos do host
     ice/{cid}/viewer  -> candidatos do espectador
===================================================== */

const RTC_CONFIG = {
    iceServers: [
        { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }
    ]
};

/* Limite de bitrate do vídeo enviado a CADA espectador (bits/s) */
const SCREEN_MAX_BITRATE = 2500000;

function rtcRef(path) {
    return db.ref("salas/" + roomCode + "/rtc" + (path ? "/" + path : ""));
}

/* ---------- HOST ---------- */

let screenStream = null;
let screenSid = null;
let screenPeers = {};
let screenViewersRef = null;

function setScreenHostStatus(text) {
    document.getElementById("screenHostStatus").textContent = text;
}

function enableScreenHostUI() {

    if (!SCREEN_HOST) return;

    document.getElementById("screenHostBox").style.display = "block";

    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        document.getElementById("screenStartBtn").disabled = true;
        setScreenHostStatus(
            "Este navegador não consegue compartilhar a tela (use o Chrome/Edge/Firefox no computador)."
        );
        return;
    }

    setScreenHostStatus(
        "Pronto. O link da sala copiado acima já inclui o acesso à tela (&tv=1)."
    );

}

function updateScreenHostCount() {

    if (!screenStream) return;

    const connected = Object.values(screenPeers)
        .filter(p => p.pc.connectionState === "connected").length;

    setScreenHostStatus(
        "🔴 Compartilhando — " + connected + " espectador(es) conectado(s)."
    );

}

function limitBitrate(pc) {

    pc.getSenders().forEach(sender => {

        if (!sender.track || sender.track.kind !== "video") return;

        try {
            const p = sender.getParameters();
            if (!p.encodings || !p.encodings.length) p.encodings = [{}];
            p.encodings[0].maxBitrate = SCREEN_MAX_BITRATE;
            sender.setParameters(p).catch(() => { });
        } catch (e) { /* opcional */ }

    });

}

async function startScreenShare() {

    if (!liveReady || screenStream) return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        alert("Este navegador não suporta compartilhar a tela.");
        return;
    }

    try {
        screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: { frameRate: { ideal: 30 } },
            audio: true
        });
    } catch (error) {
        screenStream = null;
        setScreenHostStatus("Compartilhamento cancelado.");
        return;
    }

    const videoTrack = screenStream.getVideoTracks()[0];

    if (videoTrack) {
        try { videoTrack.contentHint = "motion"; } catch (e) { /* opcional */ }
        /* Botão "Parar compartilhamento" do próprio navegador */
        videoTrack.addEventListener("ended", stopScreenShare);
    }

    screenSid = newMatchId();

    const preview = document.getElementById("screenPreview");
    preview.srcObject = screenStream;
    preview.style.display = "block";

    document.getElementById("screenStartBtn").style.display = "none";
    document.getElementById("screenStopBtn").style.display = "";

    setScreenHostStatus("Iniciando transmissão da tela...");

    try {

        /* Limpa restos de transmissões anteriores e abre a nova */
        await rtcRef().remove();

        await rtcRef("active").set({
            sid: screenSid,
            ts: firebase.database.ServerValue.TIMESTAMP
        });

    } catch (error) {
        console.error(error);
        setScreenHostStatus(
            "Erro ao iniciar (" + (error.code || error.message) +
            "). Verifique as regras do Firebase para o nó 'rtc'."
        );
        stopScreenShare();
        return;
    }

    /* Escuta pedidos de conexão dos espectadores (só enquanto compartilha) */
    screenViewersRef = rtcRef("viewers");

    const onViewer = snap => {
        const v = snap.val();
        if (!v || v.sid !== screenSid || !v.cid) return;
        hostConnect(snap.key, v.cid);
    };

    screenViewersRef.on("child_added", onViewer);
    screenViewersRef.on("child_changed", onViewer);

    updateScreenHostCount();

}

async function hostConnect(uid, cid) {

    if (!screenStream || screenPeers[cid]) return;

    /* O mesmo espectador reconectou (recarregou a página): descarta a antiga */
    Object.keys(screenPeers).forEach(key => {
        if (screenPeers[key].uid === uid) closeHostPeer(key);
    });

    const pc = new RTCPeerConnection(RTC_CONFIG);

    const peer = { pc: pc, uid: uid, pending: [], remoteSet: false, gotAnswer: false, refs: [] };

    screenPeers[cid] = peer;

    screenStream.getTracks().forEach(track => pc.addTrack(track, screenStream));

    pc.onicecandidate = event => {
        if (event.candidate) {
            rtcRef("ice/" + cid + "/host").push(event.candidate.toJSON())
                .catch(error => console.error(error));
        }
    };

    pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "closed") {
            closeHostPeer(cid);
        }
        updateScreenHostCount();
    };

    /* Resposta do espectador */
    const answerRef = rtcRef("answers/" + cid);

    answerRef.on("value", async snap => {

        const a = snap.val();

        if (!a || peer.gotAnswer) return;

        peer.gotAnswer = true;

        try {
            await pc.setRemoteDescription({ type: a.type, sdp: a.sdp });
            peer.remoteSet = true;
            peer.pending.forEach(c => pc.addIceCandidate(c).catch(() => { }));
            peer.pending = [];
        } catch (error) {
            console.error("Erro ao aplicar resposta:", error);
        }

    });

    /* Candidatos ICE do espectador */
    const iceRef = rtcRef("ice/" + cid + "/viewer");

    iceRef.on("child_added", snap => {
        const c = snap.val();
        if (!c) return;
        if (peer.remoteSet) pc.addIceCandidate(c).catch(() => { });
        else peer.pending.push(c);
    });

    peer.refs = [answerRef, iceRef];

    /* Oferta */
    try {

        const offer = await pc.createOffer();

        await pc.setLocalDescription(offer);

        limitBitrate(pc);

        await rtcRef("offers/" + cid).set({
            sid: screenSid,
            type: offer.type,
            sdp: offer.sdp
        });

    } catch (error) {
        console.error("Erro ao criar oferta:", error);
        closeHostPeer(cid);
    }

}

function closeHostPeer(cid) {

    const peer = screenPeers[cid];

    if (!peer) return;

    delete screenPeers[cid];

    peer.refs.forEach(ref => ref.off());

    try { peer.pc.close(); } catch (e) { /* ignora */ }

    if (db && roomCode) {
        rtcRef("offers/" + cid).remove().catch(() => { });
        rtcRef("answers/" + cid).remove().catch(() => { });
        rtcRef("ice/" + cid).remove().catch(() => { });
    }

}

function stopScreenShare() {

    if (!screenStream && !screenSid) return;

    if (screenViewersRef) {
        screenViewersRef.off();
        screenViewersRef = null;
    }

    Object.keys(screenPeers).forEach(cid => {
        const peer = screenPeers[cid];
        delete screenPeers[cid];
        peer.refs.forEach(ref => ref.off());
        try { peer.pc.close(); } catch (e) { /* ignora */ }
    });

    if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        screenStream = null;
    }

    const preview = document.getElementById("screenPreview");
    preview.srcObject = null;
    preview.style.display = "none";

    document.getElementById("screenStartBtn").style.display = "";
    document.getElementById("screenStopBtn").style.display = "none";

    setScreenHostStatus("Compartilhamento encerrado.");

    /* Apaga toda a sinalização da sala: avisa os espectadores e
       não deixa lixo no Firebase */
    if (db && roomCode && screenSid) {
        rtcRef().remove().catch(error => console.error(error));
    }

    screenSid = null;

}

/* ---------- ESPECTADOR ---------- */

let screenViewStarted = false;
let viewerCurrentSid = null;
let viewerPeer = null;
let viewerRetries = 0;

function setScreenViewStatus(text) {
    document.getElementById("screenViewStatus").textContent = text;
}

function setScreenPlaying(on) {
    document.querySelector("#screenViewCard .screen-wrap")
        .classList.toggle("playing", on);
}

function startScreenView() {

    if (!SCREEN_VIEW || screenViewStarted || !db || !myUid) return;

    screenViewStarted = true;

    document.getElementById("screenViewCard").style.display = "block";

    setScreenViewStatus("Aguardando o host compartilhar a tela...");

    rtcRef("active").on("value", snap => {

        const active = snap.val();

        if (!active || !active.sid) {
            viewerCurrentSid = null;
            closeViewerPeer();
            setScreenPlaying(false);
            setScreenViewStatus("O host não está compartilhando a tela agora.");
            return;
        }

        if (active.sid === viewerCurrentSid) return;

        viewerCurrentSid = active.sid;
        viewerRetries = 0;

        viewerJoin(active.sid);

    }, error => {
        console.error(error);
        setScreenViewStatus("Sem permissão para ler a tela (" + error.code + ").");
    });

}

function closeViewerPeer() {

    if (!viewerPeer) return;

    viewerPeer.refs.forEach(ref => ref.off());

    try { viewerPeer.pc.close(); } catch (e) { /* ignora */ }

    viewerPeer = null;

    const video = document.getElementById("screenVideo");
    video.srcObject = null;

}

async function viewerJoin(sid) {

    closeViewerPeer();

    const cid = newMatchId();
    const pc = new RTCPeerConnection(RTC_CONFIG);

    const peer = { pc: pc, cid: cid, pending: [], remoteSet: false, gotOffer: false, refs: [] };

    viewerPeer = peer;

    setScreenViewStatus("Conectando à tela do host...");

    pc.ontrack = event => {

        const video = document.getElementById("screenVideo");

        if (video.srcObject !== event.streams[0]) {
            video.srcObject = event.streams[0];
        }

        setScreenPlaying(true);

        video.play().catch(() => {
            /* Sem permissão de som: começa mudo (use os controles do vídeo) */
            video.muted = true;
            video.play().catch(() => { });
            setScreenViewStatus("Vídeo sem som — clique no ícone de volume do player.");
        });

    };

    pc.onicecandidate = event => {
        if (event.candidate) {
            rtcRef("ice/" + cid + "/viewer").push(event.candidate.toJSON())
                .catch(error => console.error(error));
        }
    };

    pc.onconnectionstatechange = () => {

        if (viewerPeer !== peer) return;

        if (pc.connectionState === "connected") {
            viewerRetries = 0;
            setScreenViewStatus("🔴 Ao vivo");
        } else if (pc.connectionState === "failed") {

            setScreenPlaying(false);

            if (viewerRetries < 3) {
                viewerRetries++;
                setScreenViewStatus("Conexão falhou. Tentando de novo...");
                setTimeout(() => {
                    if (viewerPeer === peer && viewerCurrentSid === sid) viewerJoin(sid);
                }, 2000);
            } else {
                setScreenViewStatus(
                    "Não foi possível conectar à tela (rede bloqueando a conexão direta)."
                );
            }

        }

    };

    /* Oferta do host */
    const offerRef = rtcRef("offers/" + cid);

    offerRef.on("value", async snap => {

        const o = snap.val();

        if (!o || o.sid !== sid || peer.gotOffer) return;

        peer.gotOffer = true;

        try {

            await pc.setRemoteDescription({ type: o.type, sdp: o.sdp });

            peer.remoteSet = true;
            peer.pending.forEach(c => pc.addIceCandidate(c).catch(() => { }));
            peer.pending = [];

            const answer = await pc.createAnswer();

            await pc.setLocalDescription(answer);

            await rtcRef("answers/" + cid).set({
                type: answer.type,
                sdp: answer.sdp
            });

        } catch (error) {
            console.error("Erro ao responder à oferta:", error);
            setScreenViewStatus("Erro ao conectar (" + (error.code || error.message) + ").");
        }

    });

    /* Candidatos ICE do host */
    const iceRef = rtcRef("ice/" + cid + "/host");

    iceRef.on("child_added", snap => {
        const c = snap.val();
        if (!c) return;
        if (peer.remoteSet) pc.addIceCandidate(c).catch(() => { });
        else peer.pending.push(c);
    });

    peer.refs = [offerRef, iceRef];

    /* Avisa o host que quer conectar */
    try {
        await rtcRef("viewers/" + myUid).set({
            sid: sid,
            cid: cid,
            ts: firebase.database.ServerValue.TIMESTAMP
        });
    } catch (error) {
        console.error(error);
        setScreenViewStatus(
            "Sem permissão para conectar à tela (" + (error.code || error.message) + ")."
        );
    }

}

