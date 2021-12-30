export async function withEffects(it, handler) {
    let result;
    try {
        result = await it.next();
        while (result.done === false) {
            const resumeWith = await handler(result.value);
            result = await it.next(resumeWith);
        }
    } catch (e) {
        result = await it.throw(e);
    }
    return result.value;
}

export function withEffectsSync(it, handler) {
    let result;
    try {
        result = it.next();
        while (result.done === false) {
            const resumeWith = handler(result.value);
            result = it.next(handler(resumeWith));
        }
    } catch (e) {
        result = it.throw(e);
    }
    return result.value;
}
