import { useState, useEffect } from 'react';

export default function PollBlock({ question = '', options = [], style = 'cards', pollId = null }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [results, setResults] = useState({});

  // Si la encuesta no trae id se deriva de la pregunta, así el voto guardado sigue valiendo
  const stablePollId = pollId || `poll_${btoa(question).replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)}`;
  const storageKey = `poll_${stablePollId}`;

  useEffect(() => {
    // Comprueba si esta persona ya votó (se recuerda en localStorage)
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        setSelectedOption(data.selectedOption);
        setHasVoted(true);
        setResults(data.results || {});
      }
    } catch (err) {
      console.error('Error al cargar los datos de la encuesta:', err);
    }
  }, [storageKey]);

  if (!question || !options || options.length === 0) {
    return null;
  }

  const handleVote = () => {
    if (selectedOption === null) return;

    // Generate mock results
    const mockResults = {};
    let total = 0;

    options.forEach((opt) => {
      if (opt.id === selectedOption) {
        // Voted option gets base + random boost
        const votes = Math.floor(Math.random() * 50) + 30;
        mockResults[opt.id] = votes;
        total += votes;
      } else {
        // El resto de opciones reciben votos aleatorios, son datos de muestra
        const votes = Math.floor(Math.random() * 40) + 10;
        mockResults[opt.id] = votes;
        total += votes;
      }
    });

    // Calculate percentages
    const percentages = {};
    Object.keys(mockResults).forEach((optId) => {
      percentages[optId] = Math.round((mockResults[optId] / total) * 100);
    });

    setResults(percentages);
    setHasVoted(true);

    // Guarda el voto en localStorage
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          selectedOption,
          results: percentages,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      console.error('Error al guardar el voto de la encuesta:', err);
    }
  };

  const handleChangeVote = () => {
    setHasVoted(false);
    setSelectedOption(null);
    setResults({});
    try {
      localStorage.removeItem(storageKey);
    } catch (err) {
      console.error('Error al borrar el voto de la encuesta:', err);
    }
  };

  const getPercentage = (optionId) => {
    return results[optionId] || 0;
  };

  const gridClasses = 
    style === 'grid' ? 'grid grid-cols-2 gap-3' : 
    style === 'list' ? 'flex flex-col gap-3' : 
    'grid grid-cols-1 sm:grid-cols-2 gap-3';

  return (
    <div className="my-10" data-poll="">
      <div className="rounded-none border border-[var(--border-color)] bg-[var(--bg-elevated)]/50 p-6 shadow-[var(--shadow-md)]">
        {/* Question */}
        <div className="mb-6 flex items-start gap-3">
          <span className="text-3xl">📊</span>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              {question}
            </h3>
          </div>
        </div>

        {/* Options */}
        {!hasVoted ? (
          <div className={gridClasses}>
            {options.map((option, idx) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedOption(option.id)}
                className={`
 relative overflow-hidden rounded-none border-2 p-4 transition-all duration-200
 ${style === 'cards' ? 'shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-md)]' : ''}
 ${
 option.id === selectedOption
 ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 ring-2 ring-[var(--accent-primary)]/30'
 : 'border-[var(--border-color)] bg-[var(--bg-surface)]/50 hover:border-[var(--accent-primary)]/50 hover:bg-[var(--accent-primary)]/5'
 }
 `}
              >
                <div className="relative z-10 flex items-center gap-3">
                  <span
                    className={`
 flex h-8 w-8 shrink-0 items-center justify-center rounded-none font-semibold transition-all
 ${
 option.id === selectedOption
 ? 'bg-[var(--accent-primary)] text-white'
 : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'
 }
 `}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <p className="flex-1 text-left text-sm font-medium text-[var(--text-primary)]">
                    {option.text}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {options.map((option, idx) => {
              const percentage = getPercentage(option.id);
              const isUserVote = option.id === selectedOption;

              return (
                <div
                  key={option.id}
                  className={`
 relative overflow-hidden rounded-none border-2 p-4 transition-all
 ${
 isUserVote
 ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5'
 : 'border-[var(--border-color)] bg-[var(--bg-surface)]/30'
 }
 `}
                >
                  {/* Progress bar background */}
                  <div
                    className="absolute left-0 top-0 h-full transition-all duration-1000"
                    style={{ width: `${percentage}%` }}
                  />

                  {/* Content */}
                  <div className="relative z-10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`
 flex h-8 w-8 shrink-0 items-center justify-center rounded-none font-semibold
 ${
 isUserVote
 ? 'bg-[var(--accent-primary)] text-white'
 : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'
 }
 `}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {option.text}
                        {isUserVote && (
                          <span className="ml-2 text-xs text-[var(--accent-primary)]">(Tu voto)</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-[var(--accent-primary)]">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-6 flex justify-center gap-3">
          {!hasVoted ? (
            <button
              type="button"
              onClick={handleVote}
              disabled={selectedOption === null}
              className="rounded-none px-6 py-3 font-semibold text-[#1c1b3a] shadow-[var(--shadow-md)] transition-all hover:shadow-[var(--shadow-md)] disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale bg-[var(--accent-primary)]"
            >
              Votar
            </button>
          ) : (
            <button
              type="button"
              onClick={handleChangeVote}
              className="rounded-none border-2 border-[var(--accent-primary)]/50 bg-[var(--accent-primary)]/10 px-6 py-3 font-semibold text-[var(--accent-primary)] transition-all hover:bg-[var(--accent-primary)]/20"
            >
              Cambiar voto
            </button>
          )}
        </div>

        {/* Results summary */}
        {hasVoted && (
          <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
            Resultados de la encuesta • Los datos son simulados localmente
          </p>
        )}
      </div>
    </div>
  );
}
