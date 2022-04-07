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

export async function tryWithEffects(it, handler, catcher) {
    let result;
    try {
        result = await withEffects(it, handler)
    } catch (error) {
        result = catcher(error);
    }
    return result;
}

export function withEffectsSync(it, handler) {
    let result;
    try {
        result = it.next();
        while (result.done === false) {
            const resumeWith = handler(result.value);
            result = it.next(resumeWith);
        }
    } catch (e) {
        result = it.throw(e);
    }
    return result.value;
}

export function tryWithEffectsSync(it, handler, catcher) {
    let result;
    try {
        result = withEffectsSync(it, handler)
    } catch (error) {
        result = catcher(error);
    }
    return result;
}

export function bind(gen, bindings) {
    async function* g(...args) {
        const it = gen(...args);
        let result;
        try {
            result = await it.next();
            while (result.done === false) {
                if (bindings?.[result.value] != null) {
                    result = await it.next(await bindings[result.value]);
                } else {
                    result = await it.next(yield result.value);
                }
            }
        } catch (e) {
            result = await it.throw(e);
        }
        return result.value;
    }
    return g;
}
export function bindSync(gen, bindings) {
    function* g(...args) {
        const it = gen(...args);
        let result;
        try {
            result = it.next();
            while (result.done === false) {
                if (bindings?.[result.value] != null) {
                    result = it.next(bindings[result.value]);
                } else {
                    result = it.next(yield result.value);
                }
            }
        } catch (e) {
            result = it.throw(e);
        }
        return result.value;
    }
    return g;
}
