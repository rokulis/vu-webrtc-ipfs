import IPFS from './IPFS';

function handleUserInput() {
    let message = document.getElementById("message");
    if (!message.value)
        return;
    IPFS.sendMessage({ 'chat': message.value, 'uuid': localUuid, 'dest': 'all' });
    add(message.value, localUuid);
    message.value = '';
}

function add(text, from) {
    let messages = document.getElementById("messages");

    let container = document.createElement('div');
    let peer = document.createElement('div');
    let message = document.createElement('div');

    peer.textContent = `${from.substring(0, 5)}: `;
    message.textContent = text;

    messages.appendChild(container);
    container.appendChild(peer);
    container.appendChild(message);

    messages.scrollTop = messages.scrollHeight;
}

export default {
    add, handleUserInput
};