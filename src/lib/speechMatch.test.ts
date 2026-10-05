import { test } from 'node:test';
import assert from 'node:assert/strict';
import { topics } from '../content/index.ts';
import { matchSpoken } from './speechMatch.ts';

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
