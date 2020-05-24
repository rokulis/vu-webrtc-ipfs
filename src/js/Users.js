import IPFS from './IPFS';

function add(user, me = false) {
    console.log("add usr: ", user)

    let users = document.getElementById("users"),
    container = document.createElement('div'),
    name      = document.createElement('div');

    container.setAttribute("id", "user_" + user);

    name.textContent = user.substring(0, 5);

    container.appendChild(name)

    if (!me) {
        let button = document.createElement('button');
        button.classList.add('btn')
        button.classList.add('btn-primary')
        button.textContent = 'Call'
        button.addEventListener('click', e => {
            console.log("clicked, so sending message");
            IPFS.sendMessage({ 'dest': user, 'justCreate': true });
        });
        container.appendChild(button);
    }
    users.appendChild(container);
}

function remove(user) {
    console.log("removing usr: ", user)
    let users = document.getElementById("user_" + user);
    if (users)
        users.remove();
}

export default {
    add, remove
};