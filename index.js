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
            result = it.next(resumeWith);
        }
    } catch (e) {
        result = it.throw(e);
    }
    return result.value;
}

export async function* always(it, bindings) {
    let result;
    try {
        result = await it.next();
        while (result.done === false) {
            if (bindings.has(result.value)) {
                result = await it.next(await bindings.get(result.value));
            } else {
                result = await it.next(yield result.value);
            }
        }
    } catch (e) {
        result = await it.throw(e);
    }
    return result.value;
}

export function* alwaysSync(it, bindings) {
    let result;
    try {
        result = it.next();
        while (result.done === false) {
            if (bindings.has(result.value)) {
                result = it.next(bindings.get(result.value));
            } else {
                result = it.next(yield result.value);
            }
        }
    } catch (e) {
        result = it.throw(e);
    }
    return result.value;
}
