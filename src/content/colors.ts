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
    // Segunda tanda. Las frases no nombran otros colores del tema (así sirven como pregunta);
    // "light blue" y "dark green" siempre nombran "blue"/"green", así que se preguntan solo de forma directa.
    { id: 'purple', image: '🟣', say: 'Purple.', ask: 'Find the purple one!', facts: ['The grapes are purple.', 'The purple flower is pretty.'], sounds: ['purpel', 'puple'], picture: 'in pure bright purple' },
    { id: 'brown', image: '🟤', say: 'Brown.', ask: 'Find the brown one!', facts: ['The bear is brown.', 'Chocolate is brown.'], sounds: ['braun', 'brawn'], picture: 'in warm chocolate brown' },
    { id: 'black', image: '⚫', say: 'Black.', ask: 'Find the black one!', facts: ['The cat is black.', 'The black bird can fly.'], sounds: ['blak', 'block'], picture: 'in glossy pure black, its little face with white eyes and a white smile so it shows clearly' },
    { id: 'white', image: '⚪', say: 'White.', ask: 'Find the white one!', facts: ['The snow is white.', 'Milk is white.'], sounds: ['wait', 'guait', 'wite'], picture: 'in pure white, with a soft light-grey outline and shading so it stands out on a cream background' },
    { id: 'gray', image: '🩶', say: 'Gray.', ask: 'Find the gray one!', facts: ['The elephant is gray.', 'The cloud is gray.'], sounds: ['grey', 'grei', 'grain'], picture: 'in medium neutral gray' },
    { id: 'gold', image: '🥇', say: 'Gold.', ask: 'Find the gold one!', facts: ['The star is gold.', 'The crown is gold.'], sounds: ['golden', 'goal'], picture: 'in shiny metallic gold with little sparkles' },
    { id: 'silver', image: '🥈', say: 'Silver.', ask: 'Find the silver one!', facts: ['The spoon is silver.', 'The key is silver.'], sounds: ['silber', 'sylver'], picture: 'in shiny metallic silver with little sparkles' },
    { id: 'turquoise', image: '🩵', say: 'Turquoise.', ask: 'Find the turquoise one!', facts: ['The water is turquoise.', 'The turquoise bead is pretty.'], sounds: ['turkoise', 'turquoys', 'turkey'], picture: 'in bright turquoise (blue-green)' },
    { id: 'light-blue', image: '🩵', say: 'Light blue.', ask: 'Find the light blue one!', facts: ['The sky is light blue.', 'My shirt is light blue.'], sounds: ['lightblue', 'lait blue'], picture: 'in pale light blue, like a clear sky' },
    { id: 'dark-green', image: '🌲', say: 'Dark green.', ask: 'Find the dark green one!', facts: ['The pine tree is dark green.', 'The leaf is dark green.'], sounds: ['darkgreen', 'dark grin'], picture: 'in deep dark green, like a pine forest' },
  ],
  homeMission: ['What color is it?', 'Your shirt is blue!', 'Find something red!'],
} satisfies Topic;
