import type { Topic } from './types.ts';

export default {
  id: 'actions',
  title: 'Actions',
  sayTitle: "Let's move!",
  icon: '🤸',
  words: [
    { id: 'jump', image: '🤸', say: 'Jump.', ask: 'Who is jumping?', facts: ["Let's jump!", 'Jump, jump, jump!'] },
    { id: 'run', image: '🏃', say: 'Run.', ask: 'Who is running?', facts: ["Let's run!", 'Run, run, run!'] },
    { id: 'sit', image: '🪑', say: 'Sit.', ask: 'Who is sitting?', facts: ['Sit down, please.', "Let's sit!"] },
    { id: 'clap', image: '👏', say: 'Clap.', ask: 'Who is clapping?', facts: ['Clap your hands!', 'Clap, clap, clap!'] },
    { id: 'dance', image: '💃', say: 'Dance.', ask: 'Who is dancing?', facts: ["Let's dance!", 'Dance, dance, dance!'] },
    { id: 'sleep', image: '😴', say: 'Sleep.', ask: 'Who is sleeping?', facts: ['Time to sleep.', 'Shh! MaLu is sleeping.'] },
  ],
  homeMission: ["Let's jump!", 'Sit down, please.', 'Time to sleep!'],
} satisfies Topic;
