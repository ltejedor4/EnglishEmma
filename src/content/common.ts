import type { Line } from './types.ts';

/** Frases de Buddy que no pertenecen a un tema. Varias celebraciones para que no se repita. */
export const greetings: Line[] = [
  { id: 'hello-emma', text: 'Hello, Emma!', mood: 'cheerful' },
  { id: 'im-buddy', text: "Hi! I'm Buddy!", mood: 'cheerful' },
  { id: 'lets-play', text: "Let's play!", mood: 'cheerful' },
];

export const celebrations: Line[] = [
  { id: 'great-job', text: 'Great job!', mood: 'cheerful' },
  { id: 'awesome', text: 'Awesome!', mood: 'cheerful' },
  { id: 'you-did-it', text: 'You did it!', mood: 'cheerful' },
  { id: 'well-done', text: 'Well done!', mood: 'cheerful' },
  { id: 'yay-right', text: "Yay! That's right!", mood: 'cheerful' },
  { id: 'super', text: 'Super!', mood: 'cheerful' },
];

/** Tras un error: sin castigo, solo mostrar la respuesta. Va seguido del clip de la palabra. */
export const gentleRetry: Line[] = [
  { id: 'look-here-it-is', text: 'Look, here it is!', mood: 'calm' },
  { id: 'listen-again', text: 'Listen again.', mood: 'calm' },
  { id: 'this-one', text: 'This one!', mood: 'calm' },
];

export const instructions: Line[] = [
  { id: 'listen-and-touch', text: 'Listen and touch!' },
  { id: 'touch-to-listen', text: 'Touch to listen!' },
  { id: 'find-in-picture', text: 'Find it in the picture!' },
  { id: 'find-the-pairs', text: 'Find the pairs!' },
  { id: 'simon-says', text: 'Simon says:' },
  { id: 'pop-the-balloons', text: 'Pop the balloons!' },
];

export const session: Line[] = [
  { id: 'lets-review', text: "Let's review!" },
  { id: 'new-words', text: 'New words!', mood: 'cheerful' },
  { id: 'lets-play-a-game', text: "Let's play a game!", mood: 'cheerful' },
  { id: 'new-puzzle-piece', text: 'You got a new puzzle piece!', mood: 'cheerful' },
  { id: 'put-the-piece', text: 'Put the piece in the puzzle!' },
  { id: 'puzzle-finished', text: 'You finished the puzzle!', mood: 'cheerful' },
  { id: 'good-night-emma', text: 'Good night, Emma!', mood: 'sleepy' },
  { id: 'see-you-tomorrow', text: 'See you tomorrow!', mood: 'sleepy' },
  { id: 'sweet-dreams', text: 'Sweet dreams!', mood: 'sleepy' },
];
