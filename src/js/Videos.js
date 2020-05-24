import WebRTC from './WebRTC.js';

function add(event, peerUuid) {
    let videos = document.getElementById('videos');


    let video = document.getElementById(peerUuid);
    if (!video)
        video = document.createElement('video');

    video.setAttribute('autoplay', '');
    video.setAttribute('muted', '');
    video.setAttribute('controls', true);
    video.setAttribute('id', peerUuid);
    video.addEventListener('click', (e) => WebRTC.removeConnection(peerUuid));
    video.srcObject = event.streams[0];


    let button = document.createElement('button');
    button.classList.add('btn')
    button.classList.add('btn-danger')
    button.textContent = 'Hang up'
    button.addEventListener('click', e => WebRTC.removeConnection(peerUuid));

    video.appendChild(button);

    videos.appendChild(video);
}

function remove(peerUuid) {
    let video = document.getElementById(peerUuid);
    document.getElementById('videos').removeChild(video);
    video = null; // remove listeners
}

export default {
    add, remove
};