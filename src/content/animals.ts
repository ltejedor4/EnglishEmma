import type { Topic } from './types.ts';

export default {
  id: 'animals',
  title: 'Animals',
  sayTitle: 'Animals!',
  icon: '🐶',
  words: [
    { id: 'dog', image: '🐶', say: 'Dog.', ask: 'Where is the dog?', facts: ['The dog says woof!', 'The dog is happy.'] },
    { id: 'cat', image: '🐱', say: 'Cat.', ask: 'Where is the cat?', facts: ['The cat says meow!', 'The cat is sleeping.'] },
    { id: 'fish', image: '🐟', say: 'Fish.', ask: 'Where is the fish?', facts: ['The fish can swim.', 'The fish is in the water.'] },
    { id: 'bird', image: '🐦', say: 'Bird.', ask: 'Where is the bird?', facts: ['The bird can fly.', 'The bird says tweet tweet!'] },
    { id: 'cow', image: '🐮', say: 'Cow.', ask: 'Where is the cow?', facts: ['The cow says moo!', 'The cow is big.'] },
    { id: 'lion', image: '🦁', say: 'Lion.', ask: 'Where is the lion?', facts: ['The lion says roar!', 'The lion is big and yellow.'] },
  ],
  homeMission: ['What does the dog say?', 'Look! A cat!', "Let's feed the fish."],
} satisfies Topic;
