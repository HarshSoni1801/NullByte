import React, { useEffect, useState } from 'react';
import Logo from '../assets/Logo';

const ANIMATION_SPEED = 200;
const DISPLAY_AFTER_TEXT = 600;
const INITIAL_DELAY = 100;

const SplashScreen = ({ onFinish }) => {
  const fullText = 'NullByte';
  const [visibleCount, setVisibleCount] = useState(0);
  const [fade, setFade] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
      
      // Start showing letters immediately after becoming visible
      const showLetters = () => {
        for (let i = 0; i <= fullText.length; i++) {
          setTimeout(() => {
            if (i < fullText.length) {
              setVisibleCount(i + 1);
            } else {
              // All letters shown, start fade sequence
              setTimeout(() => setFade(true), DISPLAY_AFTER_TEXT);
              setTimeout(onFinish, DISPLAY_AFTER_TEXT + 600);
            }
          }, i * ANIMATION_SPEED);
        }
      };
      
      showLetters();
    }, INITIAL_DELAY);

    return () => clearTimeout(initialTimer);
  }, [onFinish]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className='bg-zinc-900'>
      <div className={`fixed inset-0 flex items-center justify-center bg-zinc-900 z-50 transition-opacity duration-800 ${fade ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex flex-col items-center space-y-6">
          <Logo className="h-60 w-60 text-red-500 animate-pulse" />
          <h1
            className="text-6xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-white to-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)] leading-relaxed"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {fullText.split('').map((char, i) => (
              <span 
                key={i} 
                className={`inline-block transition-opacity duration-300 ${
                  i < visibleCount ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {char}
              </span>
            ))}
          </h1>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
