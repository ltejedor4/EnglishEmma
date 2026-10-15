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
    // Segunda tanda: no están en la escena del rompecabezas, así que llevan su descripción (picture).
    // La primera frase sigue siendo una orden que Emma puede hacer (Simon Says).
    { id: 'ears', image: '👂', say: 'Ears.', ask: 'Where are the ears?', facts: ['Touch your ears!', 'I hear with my ears.'], sounds: ['years', 'ear', 'here'], picture: 'pair of cute cartoon child ears, one on each side, with little sound waves next to them' },
    { id: 'hair', image: '💇', say: 'Hair.', ask: 'Where is the hair?', facts: ['Touch your hair!', 'My hair is soft.'], sounds: ['hare', 'her', 'air'], picture: "smiling girl's head seen from the front with long, shiny, very visible brown hair, the hair is the clear focus" },
    { id: 'teeth', image: '🦷', say: 'Teeth.', ask: 'Where are the teeth?', facts: ['Show me your teeth!', 'Brush your teeth.'], sounds: ['teef', 'tea', 'tooth'], picture: 'big happy open-mouth smile showing clean white teeth, next to a small toothbrush' },
    { id: 'arms', image: '💪', say: 'Arms.', ask: 'Where are the arms?', facts: ['Wave your arms!', 'I hug with my arms.'], sounds: ['arm', 'alms', 'arts'], picture: 'cheerful child with both arms raised high and waving, the arms are the clear focus' },
    { id: 'legs', image: '🦵', say: 'Legs.', ask: 'Where are the legs?', facts: ['Shake your legs!', 'I run with my legs.'], sounds: ['leg', 'lex', 'eggs'], picture: "pair of a child's legs in shorts, from the waist down, with sneakers, mid-step" },
    { id: 'fingers', image: '🖐️', say: 'Fingers.', ask: 'Where are the fingers?', facts: ['Wiggle your fingers!', 'I have ten fingers.'], sounds: ['finger', 'fingers'], picture: 'one open child hand with all five fingers spread wide and wiggling, a tiny smiley face on each fingertip' },
    { id: 'toes', image: '👣', say: 'Toes.', ask: 'Where are the toes?', facts: ['Touch your toes!', 'I have ten toes.'], sounds: ['toe', 'tows', 'toast'], picture: 'pair of bare child feet seen from above, with ten round little toes as the clear focus' },
    { id: 'knees', image: '🦵', say: 'Knees.', ask: 'Where are the knees?', facts: ['Touch your knees!', 'Bend your knees and jump!'], sounds: ['knee', 'niece', 'needs'], picture: 'cheerful child in shorts bending the knees, ready to jump, the knees are the clear focus' },
    { id: 'shoulders', image: '🤷', say: 'Shoulders.', ask: 'Where are the shoulders?', facts: ['Touch your shoulders!', 'Head, shoulders, knees and toes!'], sounds: ['shoulder', 'soldiers', 'sholders'], picture: 'cheerful child from the waist up, touching both shoulders with the hands' },
    { id: 'tummy', image: '😋', say: 'Tummy.', ask: 'Where is the tummy?', facts: ['Rub your tummy!', 'My tummy says yum!'], sounds: ['tommy', 'tamy', 'tummy'], picture: 'happy round-faced child rubbing a round tummy with one hand after eating, the tummy is the clear focus' },
  ],
  commands: true,
  homeMission: ['Wash your hands!', 'Where is your nose?', 'Brush your teeth, open your mouth!'],
} satisfies Topic;
