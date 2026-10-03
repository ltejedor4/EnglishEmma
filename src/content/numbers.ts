import type { Topic } from './types.ts';

export default {
  id: 'numbers',
  title: 'Numbers',
  sayTitle: 'Numbers!',
  icon: '🔢',
  words: [
    { id: 'one', image: '1️⃣', say: 'One.', ask: 'Show me one!', facts: ['One!', 'I have one nose.'] },
    { id: 'two', image: '2️⃣', say: 'Two.', ask: 'Show me two!', facts: ['One, two!', 'I have two eyes.'] },
    { id: 'three', image: '3️⃣', say: 'Three.', ask: 'Show me three!', facts: ['One, two, three!', 'Three little fish.'] },
    { id: 'four', image: '4️⃣', say: 'Four.', ask: 'Show me four!', facts: ['One, two, three, four!', 'The cat has four legs.'] },
    { id: 'five', image: '5️⃣', say: 'Five.', ask: 'Show me five!', facts: ['One, two, three, four, five!', 'I have five fingers.'] },
    { id: 'six', image: '6️⃣', say: 'Six.', ask: 'Show me six!', facts: ['One, two, three, four, five, six!', 'Six yellow ducks.'] },
    { id: 'seven', image: '7️⃣', say: 'Seven.', ask: 'Show me seven!', facts: ['One, two, three, four, five, six, seven!', 'Seven little stars.'] },
    { id: 'eight', image: '8️⃣', say: 'Eight.', ask: 'Show me eight!', facts: ['One, two, three, four, five, six, seven, eight!', 'The spider has eight legs.'] },
    { id: 'nine', image: '9️⃣', say: 'Nine.', ask: 'Show me nine!', facts: ['One, two, three, four, five, six, seven, eight, nine!', 'Nine red apples.'] },
    { id: 'ten', image: '🔟', say: 'Ten.', ask: 'Show me ten!', facts: ['One, two, three, four, five, six, seven, eight, nine, ten!', 'I have ten toes.'] },
  ],
  homeMission: ['How many apples?', "Let's count the stairs: one, two, three...", 'Show me three fingers!'],
} satisfies Topic;
