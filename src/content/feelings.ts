import type { Topic } from './types.ts';

export default {
  id: 'feelings',
  title: 'Feelings',
  sayTitle: 'Feelings!',
  icon: '😀',
  words: [
    { id: 'happy', image: '😀', say: 'Happy.', ask: 'Who is happy?', facts: ['I am happy!', "Happy! Let's smile!"] },
    { id: 'sad', image: '😢', say: 'Sad.', ask: 'Who is sad?', facts: ['I am sad.', "Don't be sad. Hug!"] },
    { id: 'angry', image: '😠', say: 'Angry.', ask: 'Who is angry?', facts: ['I am angry!', 'Take a deep breath.'] },
    { id: 'tired', image: '🥱', say: 'Tired.', ask: 'Who is tired?', facts: ['I am tired.', 'Time for bed.'] },
    { id: 'scared', image: '😨', say: 'Scared.', ask: 'Who is scared?', facts: ['I am scared.', "It's okay. I'm here."] },
    { id: 'surprised', image: '😮', say: 'Surprised.', ask: 'Who is surprised?', facts: ['Wow! I am surprised!', 'Oh! A surprise!'] },
  ],
  homeMission: ['Are you happy or sad?', 'I am tired. Time for bed!', 'Big hug!'],
} satisfies Topic;
