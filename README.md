# with-effects

> Dead simple algebraic effects for JavaScript

`with-effects` is a lightweight JavaScript library designed to introduce algebraic effects using generator-backed co-routines and promises, enabling a structured and elegant way to handle side effects in your applications. By leveraging existing JavaScript constructs, `with-effects` offers an intuitive approach to managing asynchronous operations, error handling, and more, with a focus on readability and maintainability.

## Basic Usage Example

```javascript
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
```

## Usage Example With Async, Event Hander Bindings, Event Handler Delegation

```javascript
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
```

## Features

- **Algebraic Effects**: Use generator functions to represent computations with side effects in a declarative manner.
- **Async/Sync Support**: Handle effects asynchronously with promises or synchronously, depending on your application's needs.
- **Composable**: Easily compose and reuse effectful functions for clean and maintainable code.
- **Flexible Effect Handling**: Support for handling effects using functions, objects, or `Map` instances, allowing for dynamic and static resolution strategies.

## Installation

```sh
npm install with-effects
```

## API Overview

- **`withEffects(generator, handler)`**: Executes a generator function that may yield effects, handling those effects asynchronously according to the provided handler.
- **`withEffectsSync(generator, handler)`**: Synchronous version of `withEffects`, for use when effects and their handlers do not involve asynchronous operations.
- **`tryWithEffects(generator, handler, catcher)`**: Wraps `withEffects` with a try-catch block, allowing for custom error handling.
- **`tryWithEffectsSync(generator, handler, catcher)`**: Synchronous version of `tryWithEffects`.
- **`bind(generator, bindings)`**: Binds effect handlers to a generator function, returning a new generator function that automatically handles effects when invoked.
- **`bindSync(generator, bindings)`**: Synchronous version of `bind`.

## Basic Usage

### Handling Effects Asynchronously

```js
import { withEffects } from 'with-effects';

function* fetchData(url) {
    const data = yield ['fetch', url];
    return data;
}

const handler = {
    fetch: async (effect, url) => {
        const response = await fetch(url);
        return response.json();
    }
};

const data = await withEffects(fetchData('https://jsonplaceholder.typicode.com/todos/1'), handler);
console.log(data);
```

## Using `bind` to Pre-apply Handlers

The `bind` function allows you to pre-bind effect handlers to a generator function. This creates a new generator function that automatically handles effects using the provided handlers when invoked. This approach simplifies the invocation of effectful functions by encapsulating the handling logic within the bound function, eliminating the need to specify handlers explicitly at each call site.

### Example: Fetching Data with Pre-applied Handlers

In this example, we define a generator function `fetchData` that yields an effect to fetch data from a URL. We then use `bind` to create a version of this function with a pre-applied handler for the `fetch` effect. This handler performs the actual data fetching operation. The bound function can be used directly with `withEffects`, without needing to specify the handler again.

```js
import { bind, withEffects } from 'with-effects';

function* fetchData(url) {
    const data = yield ['fetch', url];
    return data;
}

const boundFetchData = bind(fetchData, {
    fetch: async (effect, url) => {
        const response = await fetch(url);
        return response.json();
    }
});

(async () => {
    const data = await withEffects(boundFetchData('https://jsonplaceholder.typicode.com/todos/1'));
    console.log(data);
})();
```

This example demonstrates how `bind` can be used to streamline the process of handling algebraic effects in asynchronous operations, such as fetching data from an API. By pre-binding effect handlers, you can create modular, reusable components that encapsulate both their logic and their side-effect management, improving code clarity and maintainability.

### Handling Missing Information with Prompts

```js
import { withEffects } from 'with-effects';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'process';

const rl = readline.createInterface({ input, output });

function* getUserInput(prompt) {
    const input = yield ['prompt', prompt];
    return input;
}

const getUserInputBound = bind(getUserInput, {
    prompt: async (effect, prompt) => rl.question(prompt)
});

async function main() {
    const name = await withEffects(getUserInputBound('Enter your name: '));
    console.log(`Hello, ${name}!`);
    rl.close();
}

main();
```

## Error Handling

```js
import { tryWithEffects } from 'with-effects';

function* riskyOperation() {
    // Might throw an error
    const result = yield 'doRiskyThing';
    return result;
}

const result = await tryWithEffects(riskyOperation(), {
    doRiskyThing: () => { throw new Error('Oops!'); }
}, error => {
    console.error('Caught an error:', error);
    return 'Default Value';
});

console.log(result); // Logs 'Default Value' if an error occurred
```

## Conclusion

By providing a structured and intuitive approach to managing side effects, `with-effects` enhances the readability, maintainability, and reusability of your JavaScript code. This library leverages existing JavaScript features to bring algebraic effects to your applications, offering a powerful tool for both synchronous and asynchronous programming.
