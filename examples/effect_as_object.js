import { tryWithEffectsSync, bind } from '../index.js';

const result = tryWithEffectsSync(
    function* () {
        const a = 1 + 2;
        yield { name: 'log', value: a };
        return `foo is ${a}`;
    }(),
    effect => effect.name === 'log' && console.log('logging', effect.value),
    error => console.error(error)
);

console.log('result', result);
