import test from 'ava';
import { withEffects, withEffectsSync, bind, bindSync } from './index.js';

test('#withEffects - happy path - basic example', async t => {

    function* greet(firstName, lastName) {
        if (firstName == null) firstName = yield 'first_name_missing';
        if (lastName == null) lastName = yield 'last_name_missing';
        return `Hello, ${firstName} ${lastName}`;
    }

    t.is(await withEffects(
        greet(null, 'Voss'),
        effect => {
            if (effect === 'first_name_missing') return Promise.resolve('Baba');
            if (effect === 'last_name_missing') return Promise.resolve('Voss');
        }
    ), 'Hello, Baba Voss');

    t.is(await withEffects(
        greet('Tamacti', null),
        effect => {
            if (effect === 'first_name_missing') return Promise.resolve('Tamacti');
            if (effect === 'last_name_missing') return Promise.resolve('Jun');
        }
    ), 'Hello, Tamacti Jun');

});

test('#withEffects - happy path - effect as array', async t => {

    function* greet(firstName, lastName) {
        if (firstName == null) firstName = yield [ 'first_name_missing', true ];
        if (lastName == null) lastName = yield [ 'last_name_missing', false ];
        return `Hello, ${firstName} ${lastName}`;
    }

    t.is(await withEffects(
        greet(null, 'Voss'),
        (effect, shout) => {
            const transform = shout ? v => v.toUpperCase(v) : v => v;
            if (effect === 'first_name_missing') return Promise.resolve(transform('Baba'));
            if (effect === 'last_name_missing') return Promise.resolve(transform('Voss'));
        }
    ), 'Hello, BABA Voss');

});

test('#withEffects - happy path - effect delegation', async t => {

    function* formatName(firstName, lastName) {
        if (firstName == null) firstName = yield 'first_name_missing';
        if (lastName == null) lastName = yield 'last_name_missing';
        return `${firstName.charAt(0)}. ${lastName}`;
    }

    function* greet(firstName, lastName) {
        const name = yield* formatName(firstName, lastName);
        return `Hello, ${name}`;
    }

    t.is(await withEffects(
        greet(null, 'Voss'),
        effect => {
            if (effect === 'first_name_missing') return Promise.resolve('Baba');
            if (effect === 'last_name_missing') return Promise.resolve('Voss');
        }
    ), 'Hello, B. Voss');

    t.is(await withEffects(
        greet('Tamacti', null),
        effect => {
            if (effect === 'first_name_missing') return Promise.resolve('Tamacti');
            if (effect === 'last_name_missing') return Promise.resolve('Jun');
        }
    ), 'Hello, T. Jun');
});

test('#withEffects - error handling - error thrown in iterator', async t => {

    function* greet(firstName, lastName) {
        throw new Error('boom');
        if (firstName == null) firstName = yield 'first_name_missing';
        if (lastName == null) lastName = yield 'last_name_missing';
        return `Hello, ${firstName} ${lastName}`;
    }

    await t.throwsAsync(async () => await withEffects(
        greet(null, 'Voss'),
        effect => {
            if (effect === 'first_name_missing') return Promise.resolve('Baba');
            if (effect === 'last_name_missing') return Promise.resolve('Voss');
        }
    ), { message: 'boom' });

});

test('#withEffects - error handling - error thrown in handler', async t => {

    function* greet(firstName, lastName) {
        if (firstName == null) firstName = yield 'first_name_missing';
        if (lastName == null) lastName = yield 'last_name_missing';
        return `Hello, ${firstName} ${lastName}`;
    }

    await t.throwsAsync(async () => await withEffects(
        greet(null, 'Voss'),
        effect => {
            throw new Error('boom');
            if (effect === 'first_name_missing') return Promise.resolve('Baba');
            if (effect === 'last_name_missing') return Promise.resolve('Voss');
        }
    ), { message: 'boom' });

});

test('#withEffects - happy path - basic example - bind as fn', async t => {

    function* greet(firstName, lastName) {
        if (firstName == null) firstName = yield 'first_name_missing';
        if (lastName == null) lastName = yield 'last_name_missing';
        return `Hello, ${firstName} ${lastName}`;
    }

    const greetWithToodle = bind(
        greet,
        effect => ({ 'first_name_missing': Promise.resolve('Toodle') })[effect]
    );

    t.is(await withEffects(
        greetWithToodle(null, null),
        effect => {
            if (effect === 'first_name_missing') return Promise.resolve('Beebop');
            if (effect === 'last_name_missing') return Promise.resolve('Deedoo');
        }
    ), 'Hello, Toodle Deedoo');

    t.is(await withEffects(
        greet(null, null),
        effect => {
            if (effect === 'first_name_missing') return Promise.resolve('Beebop');
            if (effect === 'last_name_missing') return Promise.resolve('Deedoo');
        }
    ), 'Hello, Beebop Deedoo');

});

test('#withEffects - happy path - basic example - bind as obj', async t => {

    function* greet(firstName, lastName) {
        if (firstName == null) firstName = yield 'first_name_missing';
        if (lastName == null) lastName = yield 'last_name_missing';
        return `Hello, ${firstName} ${lastName}`;
    }

    const greetWithToodle = bind(
        greet,
        { 'first_name_missing': Promise.resolve('Toodle') }
    );

    t.is(await withEffects(
        greetWithToodle(null, null),
        effect => {
            if (effect === 'first_name_missing') return Promise.resolve('Beebop');
            if (effect === 'last_name_missing') return Promise.resolve('Deedoo');
        }
    ), 'Hello, Toodle Deedoo');

    t.is(await withEffects(
        greet(null, null),
        effect => {
            if (effect === 'first_name_missing') return Promise.resolve('Beebop');
            if (effect === 'last_name_missing') return Promise.resolve('Deedoo');
        }
    ), 'Hello, Beebop Deedoo');

});

test('#withEffects - happy path - basic example - bind as map', async t => {

    function* greet(firstName, lastName) {
        if (firstName == null) firstName = yield 'first_name_missing';
        if (lastName == null) lastName = yield 'last_name_missing';
        return `Hello, ${firstName} ${lastName}`;
    }

    const greetWithToodle = bind(
        greet,
        new Map([[ 'first_name_missing', Promise.resolve('Toodle') ]])
    );

    t.is(await withEffects(
        greetWithToodle(null, null),
        effect => {
            if (effect === 'first_name_missing') return Promise.resolve('Beebop');
            if (effect === 'last_name_missing') return Promise.resolve('Deedoo');
        }
    ), 'Hello, Toodle Deedoo');

    t.is(await withEffects(
        greet(null, null),
        effect => {
            if (effect === 'first_name_missing') return Promise.resolve('Beebop');
            if (effect === 'last_name_missing') return Promise.resolve('Deedoo');
        }
    ), 'Hello, Beebop Deedoo');

});

test('#withEffectsSync - happy path - basic example', t => {

    function* greet(firstName, lastName) {
        if (firstName == null) firstName = yield 'first_name_missing';
        if (lastName == null) lastName = yield 'last_name_missing';
        return `Hello, ${firstName} ${lastName}`;
    }

    t.is(withEffectsSync(
        greet(null, 'Voss'),
        effect => {
            if (effect === 'first_name_missing') return 'Baba';
            if (effect === 'last_name_missing') return 'Voss';
        }
    ), 'Hello, Baba Voss');

    t.is(withEffectsSync(
        greet('Tamacti', null),
        effect => {
            if (effect === 'first_name_missing') return 'Tamacti';
            if (effect === 'last_name_missing') return 'Jun';
        }
    ), 'Hello, Tamacti Jun');

});

test('#withEffectsSync - happy path - effect delegation', t => {

    function* formatName(firstName, lastName) {
        if (firstName == null) firstName = yield 'first_name_missing';
        if (lastName == null) lastName = yield 'last_name_missing';
        return `${firstName.charAt(0)}. ${lastName}`;
    }

    function* greet(firstName, lastName) {
        const name = yield* formatName(firstName, lastName);
        return `Hello, ${name}`;
    }

    t.is(withEffectsSync(
        greet(null, 'Voss'),
        effect => {
            if (effect === 'first_name_missing') return 'Baba';
            if (effect === 'last_name_missing') return 'Voss';
        }
    ), 'Hello, B. Voss');

    t.is(withEffectsSync(
        greet('Tamacti', null),
        effect => {
            if (effect === 'first_name_missing') return 'Tamacti';
            if (effect === 'last_name_missing') return 'Jun';
        }
    ), 'Hello, T. Jun');
});

test('#withEffectsSync - happy path - basic example - bindSync as fn', async t => {

    function* greet(firstName, lastName) {
        if (firstName == null) firstName = yield 'first_name_missing';
        if (lastName == null) lastName = yield 'last_name_missing';
        return `Hello, ${firstName} ${lastName}`;
    }
    const greetWithToodle = bindSync(
        greet,
        effect => ({ 'first_name_missing': 'Toodle' })[effect]
    );

    t.is(withEffectsSync(
        greetWithToodle(null, null),
        effect => {
            if (effect === 'first_name_missing') return 'Beebop';
            if (effect === 'last_name_missing') return 'Deedoo';
        }
    ), 'Hello, Toodle Deedoo');

});

test('#withEffectsSync - happy path - basic example - bindSync as obj', async t => {

    function* greet(firstName, lastName) {
        if (firstName == null) firstName = yield 'first_name_missing';
        if (lastName == null) lastName = yield 'last_name_missing';
        return `Hello, ${firstName} ${lastName}`;
    }
    const greetWithToodle = bindSync(
        greet,
        { 'first_name_missing': 'Toodle' }
    );

    t.is(withEffectsSync(
        greetWithToodle(null, null),
        effect => {
            if (effect === 'first_name_missing') return 'Beebop';
            if (effect === 'last_name_missing') return 'Deedoo';
        }
    ), 'Hello, Toodle Deedoo');

});

test('#withEffectsSync - happy path - basic example - bindSync as map', async t => {

    function* greet(firstName, lastName) {
        if (firstName == null) firstName = yield 'first_name_missing';
        if (lastName == null) lastName = yield 'last_name_missing';
        return `Hello, ${firstName} ${lastName}`;
    }
    const greetWithToodle = bindSync(
        greet,
        new Map([[ 'first_name_missing', 'Toodle' ]])
    );

    t.is(withEffectsSync(
        greetWithToodle(null, null),
        effect => {
            if (effect === 'first_name_missing') return 'Beebop';
            if (effect === 'last_name_missing') return 'Deedoo';
        }
    ), 'Hello, Toodle Deedoo');

});

test('#withEffectsSync - error handling - error thrown in iterator', t => {

    function* greet(firstName, lastName) {
        throw new Error('boom');
        if (firstName == null) firstName = yield 'first_name_missing';
        if (lastName == null) lastName = yield 'last_name_missing';
        return `Hello, ${firstName} ${lastName}`;
    }

    t.throws(() => withEffectsSync(
        greet(null, 'Voss'),
        effect => {
            if (effect === 'first_name_missing') return 'Baba';
            if (effect === 'last_name_missing') return 'Voss';
        }
    ), { message: 'boom' });

});

test('#withEffectsSync - error handling - error thrown in handler', t => {

    function* greet(firstName, lastName) {
        if (firstName == null) firstName = yield 'first_name_missing';
        if (lastName == null) lastName = yield 'last_name_missing';
        return `Hello, ${firstName} ${lastName}`;
    }

    t.throws(() => withEffectsSync(
        greet(null, 'Voss'),
        effect => {
            throw new Error('boom');
            if (effect === 'first_name_missing') return 'Baba';
            if (effect === 'last_name_missing') return 'Voss';
        }
    ), { message: 'boom' });

});

test('#withEffects - error handling - error thrown in delegated async generator', async t => {

    async function* getName() {
        throw new Error('boom');
    }

    async function* greet() {
        const name = yield* getName();
        return `Hello, ${name}`;
    }

    await t.throwsAsync(async () => await withEffects(
        greet(),
        {}
    ), { message: 'boom' });

});
