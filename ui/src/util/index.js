export function getHashAsObject(windowHash) {
    const hash = windowHash.slice(1);
    const hashList = hash.split('&');
    let hashObject = {};
    let h;
    for (let i = 0; i < hashList.length; i++) {
        h = hashList[i].split("=");
        hashObject[h[0]] = h[1];
    }

    return hashObject;
}