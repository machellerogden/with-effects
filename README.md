# with-effects

> Simple wrapper for algebraic effects using coroutines.


## Example:

```
import { withEffects } from 'with-effects';

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
    greet(null, 'Voss'),
    effect => {
        if (effect === 'first_name_missing') return Promise.resolve('Baba');
        if (effect === 'last_name_missing') return Promise.resolve('Voss');
    }
);

console.log(greeting);
```


## Note on Effects

Effects can be strings or arrays. If an effect is performed as an array it will be applied as arguments to its matching handler.
