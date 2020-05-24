import ErrorHandler from "./ErrorHandler";

let localStream;


async function init() {
    const localVideo = document.getElementById('localVideo');
    localVideo.addEventListener('loadedmetadata', () => console.log(`Local media has been loaded. videoWidth: ${localVideo.videoWidth}px, videoHeight: ${localVideo.videoHeight}px`));
    let stream = await receiveLocalVideo();
    localVideo.srcObject = stream;
    localStream = stream;
}

function get() {
    return localStream;
}

// private

async function receiveLocalVideo() {

    return await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .catch(e => ErrorHandler.error("We can't access your video and/or microphone :(", true));
}

export default {
    init, get
};


// 
// POLYFILLS FOR OLDER BROWSERS
//


// Older browsers might not implement mediaDevices at all, so we set an empty object first
if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
}

// Some browsers partially implement mediaDevices. We can't just assign an object
// with getUserMedia as it would overwrite existing properties.
// Here, we will just add the getUserMedia property if it's missing.
if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function (constraints) {

        // First get ahold of the legacy getUserMedia, if present
        var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

        // Some browsers just don't implement it - return a rejected promise with an error
        // to keep a consistent interface
        if (!getUserMedia) {
            return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
        }

        // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
        return new Promise(function (resolve, reject) {
            getUserMedia.call(navigator, constraints, resolve, reject);
        });
    }
}