import React, { useState, useEffect } from 'react';

interface TypingTextProps {
  text: string;
  speed?: number;
}

const TypingText: React.FC<TypingTextProps> = ({ text, speed = 100 }) => {
  const [displayedText, setDisplayedText] = useState<string>('');
  const [index, setIndex] = useState<number>(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex(index + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else {
      // Reset the text after it finishes typing with a 3-second pause
      const resetTimeout = setTimeout(() => {
        setDisplayedText('');
        setIndex(0);
      }, 3000); // 3-second pause before resetting
      return () => clearTimeout(resetTimeout);
    }
  }, [index, text, speed]);

  return <div className="typing-text">{displayedText}</div>;
};

export default TypingText;
