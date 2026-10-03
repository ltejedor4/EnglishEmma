import type { Topic } from './types.ts';

export default {
  id: 'food',
  title: 'Food',
  sayTitle: 'Food!',
  icon: '🍎',
  words: [
    { id: 'apple', image: '🍎', say: 'Apple.', ask: 'Where is the apple?', facts: ['I want an apple.', 'The apple is red.'] },
    { id: 'banana', image: '🍌', say: 'Banana.', ask: 'Where is the banana?', facts: ['I want a banana.', 'The banana is yellow.'] },
    { id: 'milk', image: '🥛', say: 'Milk.', ask: 'Where is the milk?', facts: ['I drink milk.', 'Milk is white.'] },
    { id: 'bread', image: '🍞', say: 'Bread.', ask: 'Where is the bread?', facts: ['I eat bread.', 'Bread is yummy!'] },
    { id: 'egg', image: '🥚', say: 'Egg.', ask: 'Where is the egg?', facts: ['I want an egg.', 'The egg is white.'] },
    { id: 'water', image: '💧', say: 'Water.', ask: 'Where is the water?', facts: ['I drink water.', 'Water, please!'] },
  ],
  homeMission: ['Do you want milk or water?', 'Yummy!', 'An apple, please.'],
} satisfies Topic;
