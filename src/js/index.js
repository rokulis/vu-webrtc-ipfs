import '../css/styles.scss';
import adapter from 'webrtc-adapter';

import LocalMedia from './LocalMedia.js';
import IPFS from './IPFS.js';
import WebRTC from './WebRTC.js';
import Users from './Users.js';
import Messages from './Messages.js';

window.addEventListener('DOMContentLoaded', async (event) => {
    initRoomName();

    $('#myModal').modal()
    initEventListeners();
});

async function start(roomName) {
    await IPFS.create(roomName);
    IPFS.getRoom().on('peer joined', (p) => peerJoined(p));
    IPFS.getRoom().on('peer left', (p) => peerLeft(p));
    IPFS.getRoom().on('subscribed', (p) => subscribedToRoom(p));
    IPFS.getRoom().on('message', (p) => messageReceived(p));
}

function initEventListeners() {
    document.getElementById("startUse").addEventListener('click', () => {
        let roomName = document.getElementById("roomName").value;
        if (!roomName)
            roomName = "default";

        document.getElementById("roomHeader").innerHTML = `You are connected to <u><i>${roomName}</i></u> room.`
        let share = document.getElementById("share");
        share.setAttribute("href", window.location.host + `/#${roomName}`);
        share.innerHTML = `Share this link: "https://" + ${window.location.host}` + `/#${roomName}`

        start(roomName);
        addToHashUrl(roomName)
        $('#myModal').modal('hide');
    });

    document.getElementById("message").addEventListener('keyup', (e) => e.keyCode === 13 ? Messages.handleUserInput() : '');
    document.getElementById("button").addEventListener('click', () => Messages.handleUserInput());
}

function peerJoined(peer) {
    Users.add(peer, false);
    Messages.add(`peer joined to chat!`, peer);
}

function peerLeft(peer) {
    console.log("peer left")
    Users.remove(peer);
    Messages.add(`peer disconnected from chat!`, peer);
}

async function subscribedToRoom() {
    Users.add(localUuid, true);
    await LocalMedia.init();
}

function messageReceived(message) {
    let signal = JSON.parse(new TextDecoder("utf-8").decode(message.data))
    let peerUuid = message.from;
    console.log("got message: ", signal);

    if (message.from === localUuid) {
        console.log("got message from myself, returning")
        return;
    }

    // messages for everyone
    if (signal.chat) {
        Messages.add(signal.chat, peerUuid);
        return;
    }
    // end messages for everyone

    if (signal.dest !== localUuid) {
        console.log("not for me, returning")
        return;
    }

    // individual messages from now
    if (signal.sdp) {
        WebRTC.handleSDP(signal, peerUuid);
        return;
    }

    if (signal.ice) {
        WebRTC.handleICE(signal, peerUuid);
        return;
    }

    if (signal.justCreate == true) {
        console.log("someone wants to video-chat with me")
        WebRTC.create(peerUuid);
        IPFS.sendMessage({ 'dest': peerUuid, 'send': true })
        return;
    }

    if (signal.send == true) {
        console.log("they accepted my video-chat request, lets init a session!")
        WebRTC.create(peerUuid, true);
        return;
    }
}

function initRoomName() {
    let hash = getHash();
    document.getElementById("roomName").value = hash;
}

function getHash() {
    let hash = window.location.hash;
    if (hash) {
        hash = hash.substring(1, hash.length);
    } else {
        hash = ""
    }

    return hash;
}

function addToHashUrl(hash) {
    window.location.hash = `#${hash}`;
}

