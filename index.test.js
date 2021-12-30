import test from 'ava';
import { withEffects } from './index.js';

test('happy path - basic example', async t => {

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

test('happy path - effect delegation', async t => {

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

test('error handling - error thrown in iterator', async t => {

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

test('error handling - error thrown in handler', async t => {

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
