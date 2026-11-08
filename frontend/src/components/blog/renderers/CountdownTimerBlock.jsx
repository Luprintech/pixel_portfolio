import { useState, useEffect } from 'react';

export default function CountdownTimerBlock({ 
  targetDate, 
  title = 'Event Countdown', 
  description = '', 
  theme = 'default' 
}) {
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    if (!targetDate) return;

    function updateCountdown() {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;
      
      if (diff <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds, expired: false });
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  // Rellena con un cero a la izquierda (5 pasa a 05)
  const pad = (num) => String(num).padStart(2, '0');

  if (!timeRemaining) {
    return (
      <div className="my-10 text-center">
        <div className="inline-block animate-spin rounded-none h-8 w-8 border-b-2 border-[var(--accent-primary)]"></div>
      </div>
    );
  }

  // Lo que se muestra cuando la cuenta atrás ya ha terminado
  if (timeRemaining.expired) {
    return (
      <div className="my-10 text-center py-12 rounded-none border border-[var(--border-color)] ">
        {title && (
          <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{title}</h3>
        )}
        <p className="text-3xl font-bold text-[var(--text-primary)] ">
          Event Started!
        </p>
      </div>
    );
  }

  const { days, hours, minutes, seconds } = timeRemaining;

  // Compact theme - inline format
  if (theme === 'compact') {
    return (
      <div className="my-10 text-center" data-countdown-timer="" data-theme={theme}>
        {title && (
          <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{title}</h3>
        )}
        {description && (
          <p className="text-sm text-[var(--text-muted)] mb-6 max-w-2xl mx-auto">{description}</p>
        )}
        <div 
          className="flex justify-center items-center gap-1 text-4xl font-mono font-bold text-[var(--text-primary)]"
          role="timer"
          aria-live="polite"
          aria-label={`${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds remaining`}
        >
          <span>{pad(days)}</span>
          <span className="text-[var(--text-muted)]">:</span>
          <span>{pad(hours)}</span>
          <span className="text-[var(--text-muted)]">:</span>
          <span>{pad(minutes)}</span>
          <span className="text-[var(--text-muted)]">:</span>
          <span>{pad(seconds)}</span>
        </div>
        <div className="flex justify-center items-center gap-8 mt-3 text-xs uppercase text-[var(--text-muted)]">
          <span>Days</span>
          <span>Hours</span>
          <span>Minutes</span>
          <span>Seconds</span>
        </div>
      </div>
    );
  }

  // Bold theme - large gradient numbers
  if (theme === 'bold') {
    return (
      <div className="my-10 text-center" data-countdown-timer="" data-theme={theme}>
        {title && (
          <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-2">{title}</h3>
        )}
        {description && (
          <p className="text-sm text-[var(--text-muted)] mb-8 max-w-2xl mx-auto">{description}</p>
        )}
        <div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          role="timer"
          aria-live="polite"
          aria-label={`${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds remaining`}
        >
          {[
            { value: days, label: 'Days' },
            { value: hours, label: 'Hours' },
            { value: minutes, label: 'Minutes' },
            { value: seconds, label: 'Seconds' }
          ].map((unit, idx) => (
            <div key={idx}>
              <div 
                className="text-6xl md:text-7xl font-black text-[var(--text-primary)] leading-none"
                aria-label={`${unit.value} ${unit.label}`}
              >
                {pad(unit.value)}
              </div>
              <div className="text-xs uppercase text-[var(--text-muted)] mt-3 font-semibold tracking-wider">
                {unit.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Neon theme - glowing numbers
  if (theme === 'neon') {
    return (
      <div className="my-10 text-center" data-countdown-timer="" data-theme={theme}>
        {title && (
          <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-2">{title}</h3>
        )}
        {description && (
          <p className="text-sm text-[var(--text-muted)] mb-8 max-w-2xl mx-auto">{description}</p>
        )}
        <div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          role="timer"
          aria-live="polite"
          aria-label={`${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds remaining`}
        >
          {[
            { value: days, label: 'Days' },
            { value: hours, label: 'Hours' },
            { value: minutes, label: 'Minutes' },
            { value: seconds, label: 'Seconds' }
          ].map((unit, idx) => (
            <div key={idx}>
              <div 
                className="text-5xl md:text-6xl font-bold text-[var(--accent-secondary)] animate-pulse leading-none"
                style={{ 
                  textShadow: '0 0 10px rgba(6, 182, 212, 0.8), 0 0 20px rgba(6, 182, 212, 0.5), 0 0 30px rgba(6, 182, 212, 0.3)' 
                }}
                aria-label={`${unit.value} ${unit.label}`}
              >
                {pad(unit.value)}
              </div>
              <div className="text-xs uppercase text-[var(--accent-secondary)] mt-3 font-semibold tracking-wider">
                {unit.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default theme - cards
  return (
    <div className="my-10 text-center" data-countdown-timer="" data-theme={theme}>
      {title && (
        <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-[var(--text-muted)] mb-6 max-w-2xl mx-auto">{description}</p>
      )}
      <div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
        role="timer"
        aria-live="polite"
        aria-label={`${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds remaining`}
      >
        {[
          { value: days, label: 'Days' },
          { value: hours, label: 'Hours' },
          { value: minutes, label: 'Minutes' },
          { value: seconds, label: 'Seconds' }
        ].map((unit, idx) => (
          <div 
            key={idx}
            className="flex flex-col items-center justify-center p-6 rounded-none border border-[var(--border-color)] "
          >
            <div 
              className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] leading-none"
              aria-label={`${unit.value} ${unit.label}`}
            >
              {pad(unit.value)}
            </div>
            <div className="text-xs uppercase text-[var(--text-muted)] mt-3 font-medium tracking-wider">
              {unit.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
