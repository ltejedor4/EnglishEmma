import { test } from 'node:test';
import assert from 'node:assert/strict';
import { topics } from '../content/index.ts';
import { matchAnswer, matchSpoken } from './speechMatch.ts';

const word = (topicId: string, id: string) => topics.find((t) => t.id === topicId)!.words.find((w) => w.id === id)!;

test('acepta la palabra dicha tal cual, con artículo o en una frase', () => {
  assert.ok(matchSpoken(word('animals', 'dog'), ['dog']));
  assert.ok(matchSpoken(word('animals', 'dog'), ['the dog']));
  assert.ok(matchSpoken(word('animals', 'dog'), ['it is a dog']));
  assert.ok(matchSpoken(word('colors', 'red'), ['Red!']));
});

test('acepta si cualquiera de las alternativas del reconocedor se parece', () => {
  assert.ok(matchSpoken(word('animals', 'cat'), ['cut', 'cap', 'cat']));
  assert.ok(matchSpoken(word('animals', 'cat'), ['kat']));
});

test('palabras de dos partes: teddy bear', () => {
  assert.ok(matchSpoken(word('toys', 'teddy-bear'), ['teddy bear']));
  assert.ok(matchSpoken(word('toys', 'teddy-bear'), ['teddybear']));
  assert.ok(matchSpoken(word('toys', 'teddy-bear'), ['my teddy bear']));
});

test('acento hispano y errores típicos del reconocedor', () => {
  assert.ok(matchSpoken(word('colors', 'yellow'), ['jelou']), 'jelou');
  assert.ok(matchSpoken(word('colors', 'yellow'), ['jello']), 'jello');
  assert.ok(matchSpoken(word('colors', 'yellow'), ['hello']), 'hello');
  assert.ok(matchSpoken(word('colors', 'blue'), ['blew']), 'blew');
  assert.ok(matchSpoken(word('colors', 'green'), ['grin']), 'grin');
  assert.ok(matchSpoken(word('animals', 'fish'), ['fis']), 'fis');
  assert.ok(matchSpoken(word('clothes', 'shoes'), ['chus']), 'chus');
  assert.ok(matchSpoken(word('family', 'mom'), ['mam']), 'mam');
});

test('homófonos de los números', () => {
  assert.ok(matchSpoken(word('numbers', 'two'), ['to']), 'to');
  assert.ok(matchSpoken(word('numbers', 'two'), ['too']), 'too');
  assert.ok(matchSpoken(word('numbers', 'one'), ['won']), 'won');
  assert.ok(matchSpoken(word('numbers', 'four'), ['for']), 'for');
  assert.ok(matchSpoken(word('numbers', 'eight'), ['ate']), 'ate');
});

test('rechaza otra palabra o silencio', () => {
  assert.equal(matchSpoken(word('animals', 'dog'), ['cat']), false);
  assert.equal(matchSpoken(word('animals', 'dog'), ['banana']), false);
  assert.equal(matchSpoken(word('colors', 'yellow'), ['blue']), false);
  assert.equal(matchSpoken(word('food', 'apple'), ['milk']), false);
  assert.equal(matchSpoken(word('animals', 'dog'), []), false);
  assert.equal(matchSpoken(word('animals', 'dog'), ['']), false);
});

const hello = topics.find((t) => t.id === 'hello')!;
const byId = Object.fromEntries(topics.map((t) => [t.id, t]));
const q = (id: string) => hello.questions!.find((x) => x.id === id)!;
const answers = (id: string, alts: string[]) => matchAnswer(q(id), alts, byId);

test('preguntas: nombre y de dónde es', () => {
  assert.ok(answers('name', ['my name is Emma']));
  assert.ok(answers('name', ['Emma']));
  assert.ok(answers('name', ['my name is ema']));
  assert.equal(answers('name', ['my name is Lucas']), false);
  assert.ok(answers('from', ['I am from Colombia']));
  assert.ok(answers('from', ['Columbia']));
  assert.equal(answers('from', ['I am from Spain']), false);
});

test('preguntas: edad acepta cualquier número, pero "fine" no es "five"', () => {
  assert.ok(answers('age', ['I am five']));
  assert.ok(answers('age', ['5']));
  assert.ok(answers('age', ["I'm six"]));
  assert.ok(answers('age', ['four']));
  assert.equal(answers('age', ['I am fine']), false);
  assert.equal(answers('age', ['banana']), false);
});

test('preguntas: cualquier color, cualquier emoción, sí o no', () => {
  assert.ok(answers('favorite-color', ['pink']));
  assert.ok(answers('favorite-color', ['my favorite color is blue']));
  assert.ok(answers('favorite-color', ['purple']));
  assert.equal(answers('favorite-color', ['banana']), false);
  assert.ok(answers('how-are-you', ['I am happy']));
  assert.ok(answers('how-are-you', ['fine']));
  assert.ok(answers('how-are-you', ['tired']));
  assert.ok(answers('like-apples', ['yes']));
  assert.ok(answers('like-apples', ['no']));
  assert.ok(answers('like-dogs', ['yes I do']));
  assert.ok(answers('like-dogs', ['yeah']));
  assert.equal(answers('like-dogs', ['banana']), false);
});
