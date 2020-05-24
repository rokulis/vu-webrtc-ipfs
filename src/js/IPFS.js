const Room = require('ipfs-pubsub-room')

let room; 

async function create(roomName) {
    const node = await Ipfs.create(
        {
            repo: String(Math.random() + Date.now()),
            EXPERIMENTAL: {
                pubsub: true
            },
            config: {
                Addresses: {
                    Swarm: ['/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star']
                }
            }
        }
    )

    window.localUuid = (await node.id()).id
    window.node = node;

    room = Room(node, roomName);
}

function getRoom() {
    return room;
}

function sendMessage(msg) {
    let to = msg.dest;
    msg = JSON.stringify(msg);
    if (to === 'all') {
        console.log("sending message to all - ", " msg: ", msg)
        room.broadcast(msg);
    } else {
        console.log("sending message to: ", to, " msg: ", msg)
        room.sendTo(to, msg);
    }
}


export default {
    create, sendMessage, getRoom
};
