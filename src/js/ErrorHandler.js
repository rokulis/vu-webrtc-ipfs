function error(msg, alert = false) {
    console.error(msg);
    if (alert)
        window.alert(msg);
}

export default {
    error
};