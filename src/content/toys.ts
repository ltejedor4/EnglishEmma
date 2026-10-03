import type { Topic } from './types.ts';

export default {
  id: 'toys',
  title: 'Toys',
  sayTitle: 'Toys!',
  icon: '🧸',
  words: [
    { id: 'ball', image: '⚽', say: 'Ball.', ask: 'Where is the ball?', facts: ['Give me the ball.', "Let's play with the ball!"] },
    { id: 'doll', image: '🪆', say: 'Doll.', ask: 'Where is the doll?', facts: ['Give me the doll.', 'I love my doll.'] },
    { id: 'car', image: '🚗', say: 'Car.', ask: 'Where is the car?', facts: ['The car goes vroom!', 'Give me the car.'] },
    { id: 'teddy-bear', image: '🧸', say: 'Teddy bear.', ask: 'Where is the teddy bear?', facts: ['Give me the teddy bear.', 'I hug my teddy bear.'] },
    { id: 'blocks', image: '🧱', say: 'Blocks.', ask: 'Where are the blocks?', facts: ['Give me the blocks.', "Let's build with blocks!"] },
    { id: 'train', image: '🚂', say: 'Train.', ask: 'Where is the train?', facts: ['The train goes choo choo!', 'Give me the train.'] },
  ],
  homeMission: ['Give me the ball, please.', "Let's play!", 'Where is your teddy bear?'],
} satisfies Topic;
