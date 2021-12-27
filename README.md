# with-effects

> Simple wrapper for algebraic effects using generators.


## Example:

```
import { withEffects } from 'with-effects';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'process';
const rl = readline.createInterface({ input, output });

function* greet(firstName, lastName) {
    if (firstName == null) firstName = yield 'first_name_missing';
    if (lastName == null) lastName = yield 'last_name_missing';
    return `Hello, ${firstName} ${lastName}`;
}

const greeting = await withEffects(
    greet(null, 'Smith'),
    effect => {
        if (effect === 'first_name_missing') return rl.question('First Name: ');
        if (effect === 'last_name_missing') return rl.question('Last Name: ');
    }
)

console.log(greeting);
```
