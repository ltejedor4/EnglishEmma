import type { Topic } from './types.ts';

export default {
  id: 'colors',
  title: 'Colors',
  sayTitle: 'Colors!',
  icon: '🎨',
  words: [
    { id: 'red', image: '🔴', say: 'Red.', ask: 'Find the red one!', facts: ['The apple is red.', 'The fire truck is red.'] },
    { id: 'blue', image: '🔵', say: 'Blue.', ask: 'Find the blue one!', facts: ['The sky is blue.', 'The sea is blue.'] },
    { id: 'yellow', image: '🟡', say: 'Yellow.', ask: 'Find the yellow one!', facts: ['The sun is yellow.', 'The banana is yellow.'] },
    { id: 'green', image: '🟢', say: 'Green.', ask: 'Find the green one!', facts: ['The tree is green.', 'The frog is green.'] },
    { id: 'pink', image: '🩷', say: 'Pink.', ask: 'Find the pink one!', facts: ['The flower is pink.', 'The pig is pink.'] },
    { id: 'orange', image: '🟠', say: 'Orange.', ask: 'Find the orange one!', facts: ['The carrot is orange.', 'The orange is orange!'] },
  ],
  homeMission: ['What color is it?', 'Your shirt is blue!', 'Find something red!'],
} satisfies Topic;
