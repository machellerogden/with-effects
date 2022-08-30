import { withEffects } from '../index.js';

const result = await withEffects(
    async function* () {
        const a = 1 + 2;
        const b = yield [ 'add-numbers', a ];
        return `is ${b}`;
    }(),
    {
        'add-numbers': function* (_, a, b) {
            if (b == null) b = yield [ 'get-number' ];
            return a + b;
        },
        'get-number': () => {
            return 3;
        }
    }
);

console.log('result', result);
