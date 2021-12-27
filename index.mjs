export async function withEffects(it, handler) {
    let n = await it.next();
    while (!n.done) {
        try {
            n = await it.next(await handler(n.value));
        } catch (e) {
            n = await it.throw(e);
        }
    }
    return n.value;
}

export function withEffectsSync(it, handler) {
    let n = it.next();
    while (!n.done) {
        try {
            n = it.next(handler(n.value));
        } catch (e) {
            n = it.throw(e);
        }
    }
    return n.value;
}
