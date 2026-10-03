import type { Topic } from './types.ts';

export default {
  id: 'body',
  title: 'My body',
  sayTitle: 'My body!',
  icon: '🙂',
  words: [
    { id: 'head', image: '🙆', say: 'Head.', ask: 'Where is the head?', facts: ['Touch your head!', 'Shake your head!'] },
    { id: 'eyes', image: '👀', say: 'Eyes.', ask: 'Where are the eyes?', facts: ['Touch your eyes!', 'I see with my eyes.'] },
    { id: 'nose', image: '👃', say: 'Nose.', ask: 'Where is the nose?', facts: ['Touch your nose!', 'I smell with my nose.'] },
    { id: 'mouth', image: '👄', say: 'Mouth.', ask: 'Where is the mouth?', facts: ['Open your mouth!', 'I eat with my mouth.'] },
    { id: 'hands', image: '🙌', say: 'Hands.', ask: 'Where are the hands?', facts: ['Clap your hands!', 'Wash your hands.'] },
    { id: 'feet', image: '🦶', say: 'Feet.', ask: 'Where are the feet?', facts: ['Stamp your feet!', 'I walk with my feet.'] },
  ],
  homeMission: ['Wash your hands!', 'Where is your nose?', 'Brush your teeth, open your mouth!'],
} satisfies Topic;
