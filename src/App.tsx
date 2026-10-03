import { useState } from 'react';
import { playSequence } from './lib/audio.ts';
import './App.css';

export default function App() {
  const [started, setStarted] = useState(false);

  // El primer toque desbloquea el audio en tablets y celulares.
  async function start() {
    setStarted(true);
    await playSequence(['common/hello-emma', 'common/im-buddy', 'common/lets-play']);
  }

  return (
    <main className="home">
      <div className="buddy" aria-hidden>🐶</div>
      {started ? (
        <p className="hint">🌙</p>
      ) : (
        <button className="play" onClick={start} aria-label="Play">
          ▶
        </button>
      )}
    </main>
  );
}
