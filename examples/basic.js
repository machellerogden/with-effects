import { tryWithEffects } from '../index.js';

function* greet(name) {
    name = yield ['format_name', name];
    return `Hello, ${name}!`;
}

const greeting = await tryWithEffects(
    greet('mac'),
    {
        'format_name': (effect, name) => `${name.charAt(0).toUpperCase()}${name.slice(1)}`
    },
    error => console.error(error)
);

console.log(greeting);
