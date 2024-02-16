import { tryWithEffects, bind } from '../index.js';

// for this example, we'll need a readline interface to collect input from the user
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'process';
const rl = readline.createInterface({ input, output });

// performs first_name_missing and last_name_missing effects
function* formatName(firstName, lastName) {
    if (firstName == null) firstName = yield 'first_name_missing';
    if (lastName == null) lastName = yield 'last_name_missing';
    return `${firstName} ${lastName}`;
}

// greets a person, delegating to formatName handler
function* greet(firstName, lastName, disposition) {
    const name = yield* formatName(firstName, lastName);
    if (disposition == null) disposition = yield 'disposition_missing';
    if (disposition === 'hostile') return `Go away, ${name}.`;
    return `Hello, ${name}!`;
}

// bind the greet function to a handler that resolves disposition_missing
const hostileGreet = bind(greet, { 'disposition_missing': 'hostile' });

const greeting = await tryWithEffects(
    hostileGreet(null, 'Voss'),
    {
        'first_name_missing': async (effect) => rl.question('First Name: '), // to which you might respond "Baba"
        'last_name_missing': async (effect) => rl.question('Last Name: '),
        // is ignored because disposition_missing is resolved by the handler
        'disposition_missing': 'friendly'
    },
    error => console.error(error)
);

console.log(greeting);

rl.close();
