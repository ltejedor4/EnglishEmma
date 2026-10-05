import colors from './colors.ts';
import animals from './animals.ts';
import hello from './hello.ts';
import body from './body.ts';
import food from './food.ts';
import numbers from './numbers.ts';
import toys from './toys.ts';
import family from './family.ts';
import actions from './actions.ts';
import clothes from './clothes.ts';
import feelings from './feelings.ts';
import type { Question, Topic } from './types.ts';

/** Temas en el orden en que se desbloquean. */
export const topics: Topic[] = [colors, animals, hello, body, food, numbers, toys, family, actions, clothes, feelings];

/**
 * Orden de los rompecabezas (una ficha por noche, 6 por tema). Es independiente del orden de los temas
 * para que agregar un tema nuevo no cambie el rompecabezas que Emma está armando: los nuevos van al final.
 */
export const puzzleTopics: Topic[] = [colors, animals, body, food, numbers, toys, family, actions, clothes, feelings, hello];

/** Todas las preguntas para conversar, con su tema (las rutas de audio dependen de él). */
export interface QuestionRef {
  topicId: string;
  question: Question;
}
export const questions: QuestionRef[] = topics.flatMap((t) => (t.questions ?? []).map((question) => ({ topicId: t.id, question })));

export * from './common.ts';
