import type { Topic } from './types.ts';

export default {
  id: 'animals',
  title: 'Animals',
  sayTitle: 'Animals!',
  icon: '🐶',
  words: [
    { id: 'dog', image: '🐶', say: 'Dog.', ask: 'Where is the dog?', facts: ['The dog says woof!', 'The dog is happy.'] },
    { id: 'cat', image: '🐱', say: 'Cat.', ask: 'Where is the cat?', facts: ['The cat says meow!', 'The cat is sleeping.'] },
    { id: 'fish', image: '🐟', say: 'Fish.', ask: 'Where is the fish?', facts: ['The fish can swim.', 'The fish is in the water.'] },
    { id: 'bird', image: '🐦', say: 'Bird.', ask: 'Where is the bird?', facts: ['The bird can fly.', 'The bird says tweet tweet!'] },
    { id: 'cow', image: '🐮', say: 'Cow.', ask: 'Where is the cow?', facts: ['The cow says moo!', 'The cow is big.'] },
    { id: 'lion', image: '🦁', say: 'Lion.', ask: 'Where is the lion?', facts: ['The lion says roar!', 'The lion is big and yellow.'] },
    // Segunda tanda: no están en la escena del rompecabezas, así que llevan su descripción (picture).
    { id: 'horse', image: '🐴', say: 'Horse.', ask: 'Where is the horse?', facts: ['The horse can run fast.', 'The horse says neigh!'], sounds: ['hors', 'hoarse'], picture: 'friendly brown horse with a dark mane, standing' },
    { id: 'pig', image: '🐷', say: 'Pig.', ask: 'Where is the pig?', facts: ['The pig says oink!', 'The pig is pink.'], sounds: ['pick', 'peek'], picture: 'cute round pink pig with a curly tail' },
    { id: 'duck', image: '🦆', say: 'Duck.', ask: 'Where is the duck?', facts: ['The duck says quack!', 'The duck can swim.'], sounds: ['dock', 'dak'], picture: 'cute yellow duck with an orange beak' },
    { id: 'sheep', image: '🐑', say: 'Sheep.', ask: 'Where is the sheep?', facts: ['The sheep says baa!', 'The sheep is white and fluffy.'], sounds: ['ship', 'chip', 'cheap'], picture: 'fluffy white sheep with a smiling face' },
    { id: 'chicken', image: '🐔', say: 'Chicken.', ask: 'Where is the chicken?', facts: ['The chicken says cluck!', 'The chicken has an egg.'], sounds: ['chiken', 'chicken'], picture: 'cute white chicken with a red comb, next to one egg' },
    { id: 'rabbit', image: '🐰', say: 'Rabbit.', ask: 'Where is the rabbit?', facts: ['The rabbit can jump.', 'The rabbit eats a carrot.'], sounds: ['rabit', 'rabbi'], picture: 'cute grey rabbit with long ears, holding a carrot' },
    { id: 'frog', image: '🐸', say: 'Frog.', ask: 'Where is the frog?', facts: ['The frog can jump.', 'The frog is green.'], sounds: ['frock', 'frogue'], picture: 'cute green frog sitting with a big smile' },
    { id: 'elephant', image: '🐘', say: 'Elephant.', ask: 'Where is the elephant?', facts: ['The elephant is very big.', 'The elephant has a long nose.'], sounds: ['elefant', 'elephan'], picture: 'friendly grey baby elephant with big ears, trunk raised' },
    { id: 'monkey', image: '🐵', say: 'Monkey.', ask: 'Where is the monkey?', facts: ['The monkey eats a banana.', 'The monkey can climb.'], sounds: ['monki', 'mankey'], picture: 'cheerful brown monkey holding a banana' },
    { id: 'giraffe', image: '🦒', say: 'Giraffe.', ask: 'Where is the giraffe?', facts: ['The giraffe is very tall.', 'The giraffe has a long neck.'], sounds: ['jiraf', 'giraf'], picture: 'cute tall giraffe with brown spots, full body' },
  ],
  homeMission: ['What does the dog say?', 'Look! A cat!', "Let's feed the fish."],
} satisfies Topic;
