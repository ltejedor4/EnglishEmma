import type { Topic } from './types.ts';

export default {
  id: 'clothes',
  title: 'Clothes',
  sayTitle: 'Clothes!',
  icon: '👕',
  words: [
    { id: 'shirt', image: '👕', say: 'Shirt.', ask: 'Where is the shirt?', facts: ['Put on your shirt.', 'My shirt is blue.'] },
    { id: 'shoes', image: '👟', say: 'Shoes.', ask: 'Where are the shoes?', facts: ['Put on your shoes.', 'My shoes are pink.'] },
    { id: 'hat', image: '👒', say: 'Hat.', ask: 'Where is the hat?', facts: ['Put on your hat.', 'The hat is on my head.'] },
    { id: 'socks', image: '🧦', say: 'Socks.', ask: 'Where are the socks?', facts: ['Put on your socks.', 'My socks are yellow.'] },
    { id: 'pants', image: '👖', say: 'Pants.', ask: 'Where are the pants?', facts: ['Put on your pants.', 'My pants are blue.'] },
    { id: 'jacket', image: '🧥', say: 'Jacket.', ask: 'Where is the jacket?', facts: ['Put on your jacket.', "It's cold! Put on your jacket."] },
  ],
  homeMission: ['Put on your shoes!', 'Where are your socks?', 'What color is your shirt?'],
} satisfies Topic;
