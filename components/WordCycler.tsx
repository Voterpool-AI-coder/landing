'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const WORDS = ['without humans', 'without blockchain', 'without hierarchy'];

export default function WordCycler() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % WORDS.length), 3400);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="relative inline-grid align-bottom">
      {WORDS.map((word, i) => (
        <motion.span
          key={word}
          aria-hidden={i !== index}
          className="col-start-1 row-start-1 whitespace-nowrap bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 16 }}
          animate={{
            opacity: i === index ? 1 : 0,
            y: i === index ? 0 : i < index ? -18 : 18,
          }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}
