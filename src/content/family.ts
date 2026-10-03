import type { Topic } from './types.ts';

export default {
  id: 'family',
  title: 'Family',
  sayTitle: 'My family!',
  icon: '👨‍👩‍👧',
  words: [
    { id: 'mom', image: '👩', say: 'Mom.', ask: 'Where is mom?', facts: ['This is my mom.', 'I love you, Mom!'] },
    { id: 'dad', image: '👨', say: 'Dad.', ask: 'Where is dad?', facts: ['This is my dad.', 'I love you, Dad!'] },
    { id: 'sister', image: '👧', say: 'Sister.', ask: 'Where is my sister?', facts: ['This is my sister, MaLu.', 'I love you, MaLu!'] },
    { id: 'grandma', image: '👵', say: 'Grandma.', ask: 'Where is grandma?', facts: ['This is my grandma.', 'Hello, Grandma!'] },
    { id: 'grandpa', image: '👴', say: 'Grandpa.', ask: 'Where is grandpa?', facts: ['This is my grandpa.', 'Hello, Grandpa!'] },
  ],
  homeMission: ['I love you!', 'Say hello to Grandma!', 'Where is Dad?'],
} satisfies Topic;
