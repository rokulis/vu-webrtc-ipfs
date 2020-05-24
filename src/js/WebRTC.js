import IPFS from './IPFS';
import LocalMedia from './LocalMedia';
import ErrorHandler from './ErrorHandler';
import Videos from './Videos';

let connections = []; // webrtc connections

const config = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' },

    {
        'url': 'turn:192.158.29.39:3478?transport=udp',
        'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        'username': '28224511:1379330808'
    },
    {
        'url': 'turn:192.158.29.39:3478?transport=tcp',
        'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        'username': '28224511:1379330808'
    }
]

};

function create(peerUuid, initCall = false) {
    console.log("setting up peer: ", peerUuid, " initcall: ", initCall)
    connections[peerUuid] = { 'pc': createPeerConnection() };
    connections[peerUuid].pc.onicecandidate = event => gotIceCandidate(event, peerUuid);
    connections[peerUuid].pc.ontrack = event => gotRemoteStream(event, peerUuid);
    connections[peerUuid].pc.oniceconnectionstatechange = event => checkPeerDisconnect(peerUuid);
    connections[peerUuid].pc.addStream(LocalMedia.get());
    connections[peerUuid].pc.onremovetrack = event => removeConnection(peerUuid);

    if (initCall) {
        connections[peerUuid].pc
            .createOffer()
            .then(description => createdDescription(description, peerUuid))
            .catch(ErrorHandler.error);
    }
}

function handleSDP(signal, peerUuid) {
    console.log("sdp...", signal, "peer: ", peerUuid)

    connections[peerUuid].pc.setRemoteDescription(new RTCSessionDescription(signal.sdp))
        .then(() => {
            console.log("sdp... 2")
            // Only create answers in response to offers
            if (signal.sdp.type == 'offer') {
                connections[peerUuid].pc
                    .createAnswer()
                    .then(description => createdDescription(description, peerUuid))
                    .catch(ErrorHandler.error);
            }
        })
        .catch(ErrorHandler.error);
}

function handleICE(signal, peerUuid) {
    console.log("ice...")
    connections[peerUuid].pc
        .addIceCandidate(new RTCIceCandidate(signal.ice))
        .catch(ErrorHandler.error);

}

// private

function createdDescription(description, peerUuid) {
    console.log(`got description, peer ${peerUuid}`);
    connections[peerUuid].pc
        .setLocalDescription(description)
        .then(IPFS.sendMessage({ 'sdp': connections[peerUuid].pc.localDescription, 'uuid': localUuid, 'dest': peerUuid }))
        .catch(ErrorHandler.error);
}

function createPeerConnection() {
    let pc = new RTCPeerConnection(config);
    console.log("peer connection created: ", pc);
    return pc;
}

function gotIceCandidate(event, peerUuid) {
    if (event.candidate != null) {
        IPFS.sendMessage({ 'ice': event.candidate, 'uuid': localUuid, 'dest': peerUuid })
    }
}

function gotRemoteStream(event, peerUuid) {
    Videos.add(event, peerUuid)
}

function checkPeerDisconnect(peerUuid) {
    let state = connections[peerUuid].pc.iceConnectionState;
    if (state === "failed" || state === "closed" || state === "disconnected") {
        removeConnection(peerUuid)
    }
}

function removeConnection(peerUuid) {
    let connection = connections[peerUuid];
    if (connection) {
        connection.pc.close();
        connection = null;
        delete connections[peerUuid];
        Videos.remove(peerUuid);
    }
}

export default {
    create, handleSDP, handleICE, removeConnection
};