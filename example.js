import { tryWithEffects, bind } from './index.js';
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

const greetJoe = bind(greet, { 'first_name_missing', 'Joe' });

const greeting = await tryWithEffects(

    greetJoe(null, 'Bob'),

    function handler(effect) {
        if (effect === 'first_name_missing') return rl.question('First Name: ');
        if (effect === 'last_name_missing') return rl.question('Last Name: ');
    },

    function catcher(effect) {
        console.error(error)
    }

);

console.log(greeting);

rl.close();
