import { tryWithEffects, bind } from '../index.js';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'process';
const rl = readline.createInterface({ input, output });

function* formatName(firstName, lastName) {
    if (firstName == null) firstName = yield 'first_name_missing';
    if (lastName == null) lastName = yield 'last_name_missing';
    return `${firstName.charAt(0)}. ${lastName}`;
}

function* greet(firstName, lastName) {
    const name = yield* formatName(firstName, lastName);
    return `Hello, ${name}`;
}

const greetJoe = bind(greet, {
    first_name_missing: 'Joe'
});

const greetPhil = bind(greet, new Map([[
    'first_name_missing', 'Phil'
]]));

const greetSuzi = bind(greet, effect => {
    if (effect === 'first_name_missing') return 'Suzi';
});

console.log(
    await tryWithEffects(
        greet(null, 'AAA'),
        // handlers as object with right-hand as value
        {
            first_name_missing: rl.question('First Name: '),
            last_name_missing: rl.question('Last Name: ')
        },
        error => console.error(error)
    )
);

console.log(
    await tryWithEffects(
        greet(null, 'BBB'),
        // handlers as object with right-hand as function
        {
            first_name_missing: () => rl.question('First Name: '),
            last_name_missing: () => rl.question('Last Name: ')
        },
        error => console.error(error)
    )
);


console.log(
    await tryWithEffects(
        // handler with pre-bound resolution via object
        greetJoe(null, 'CCC'),
        {
            first_name_missing: rl.question('First Name: '),
            last_name_missing: rl.question('Last Name: ')
        },
        error => console.error(error)
    )
);

console.log(
    await tryWithEffects(
        // handler with pre-bound resolution via Map
        greetPhil(null, 'DDD'),
        // handler as function
        effect => {
            if (effect === 'first_name_missing') return rl.question('First Name: ');
            if (effect === 'last_name_missing') return rl.question('Last Name: ');
        },
        error => console.error(error)
    )
);

console.log(
    await tryWithEffects(
        // handler with pre-bound resolution via function
        greetSuzi(null, 'EEE'),
        // handler as Map with right-hand as value
        new Map([
            [ 'first_name_missing', rl.question('First Name: ') ],
            [ 'last_name_missing', rl.question('Last Name: ') ]
        ]),
        error => console.error(error)
    )
);

console.log(
    await tryWithEffects(
        // handler with pre-bound resolution via function
        greetSuzi(null, 'FFF'),
        // handler as Map with right-hand as function
        new Map([
            [ 'first_name_missing', () => rl.question('First Name: ') ],
            [ 'last_name_missing', () => rl.question('Last Name: ') ]
        ]),
        error => console.error(error)
    )
);


rl.close();
