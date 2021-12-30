import { withEffects } from './index.js';
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

const greeting = await withEffects(
    greet(null, 'Smith'),
    effect => {
        if (effect === 'first_name_missing') return rl.question('First Name: ');
        if (effect === 'last_name_missing') return rl.question('Last Name: ');
    }
);

console.log(greeting);
