import { useState } from 'react';
import { motion } from 'motion/react';
import { Screen } from '../components/Screen.tsx';

/** Suma de dos cifras con llevada: fácil para un adulto, imposible para una niña de 5 años. */
function newProblem() {
  const a = 15 + Math.floor(Math.random() * 35);
  const b = 15 + Math.floor(Math.random() * 35);
  return { a, b };
}

interface Props {
  onPass: () => void;
  onCancel: () => void;
}

/** Puerta de la zona de padres: hay que resolver la suma para entrar. */
export function ParentGate({ onPass, onCancel }: Props) {
  const [problem, setProblem] = useState(newProblem);
  const [answer, setAnswer] = useState('');
  const [wrong, setWrong] = useState(0);

  function press(key: string) {
    if (key === '⌫') return setAnswer(answer.slice(0, -1));
    if (key === 'OK') {
      if (Number(answer) === problem.a + problem.b) return onPass();
      // Error: otra suma distinta, para que no se pueda adivinar probando.
      setWrong(wrong + 1);
      setProblem(newProblem());
      setAnswer('');
      return;
    }
    if (answer.length < 3) setAnswer(answer + key);
  }

  return (
    <Screen className="gap-5">
      <button
        className="absolute top-[max(20px,env(safe-area-inset-top))] left-5 size-14 rounded-full bg-white/12 text-2xl"
        onClick={onCancel}
        aria-label="Volver"
      >
        ✕
      </button>
      <p className="text-lg text-cream/80">Solo para papá y mamá</p>
      <motion.div
        key={wrong}
        className="flex items-center gap-3 text-5xl font-bold tabular-nums"
        animate={wrong ? { x: [0, -12, 12, -8, 8, 0] } : undefined}
        data-gate={`${problem.a}+${problem.b}`}
      >
        <span>
          {problem.a} + {problem.b} =
        </span>
        <span className="min-w-[3ch] rounded-xl bg-white/12 px-3 py-1 text-moon">{answer || ' '}</span>
      </motion.div>
      <div className="grid grid-cols-3 gap-3">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'OK'].map((key) => (
          <button
            key={key}
            className={`h-16 w-20 rounded-2xl text-2xl font-semibold active:scale-95 ${
              key === 'OK' ? 'bg-moon text-night' : 'bg-white/12'
            }`}
            onClick={() => press(key)}
          >
            {key}
          </button>
        ))}
      </div>
    </Screen>
  );
}
