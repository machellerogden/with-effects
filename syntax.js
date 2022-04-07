import { withEffects, bind } from './index.js';
import { unwrap, isKeyword, isIdentifier, fromBraces, isBraces, isParens } from '@sweet-js/helpers' for syntax;

syntax fx = function (ctx) {
    let c = {};
    let id, args, body;
    while (!c.done) {
        c = ctx.next();

        if (isIdentifier(c.value)) {
            id = c.value;
            continue;
        }

        if (isParens(c.value)) {
            args = c.value;
            continue;
        }
        if (isBraces(c.value)) {
            body = c.value;
            continue;
        }
    }

    let bodyCtx = ctx.contextify(body);

    let r = #``;

    for (let item of bodyCtx) {

        if (isIdentifier(item)) {
            let v = unwrap(item).value;

            if (v === 'perform') {
                r = r.concat(#`yield`);
                continue;
            }

            if (v === 'perform*') {
                r = r.concat(#`yield*`);
                continue;
            }

        }
        r = r.concat(item);
    }

    return #`function* ${id} ${args} ${fromBraces(#`stub`.get(0), r)}`;
}

fx formatName(firstName, lastName) {
    if (firstName == null) firstName = perform 'first_name_missing';
    if (lastName == null) lastName = perform 'last_name_missing';
    const fn = firstName.charAt(0);
    return `${fn}. ${lastName}`;
}
