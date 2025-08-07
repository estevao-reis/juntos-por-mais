"use client";

import { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
}: {
  words: string;
  className?: string;
}) => {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");

  useEffect(() => {
    animate(
      "span",
      {
        opacity: 1,
      },
      {
        duration: 2,
        delay: stagger(0.2),
      }
    );
  }, [scope, animate]);

  const renderWords = () => {
    return (
      <motion.div ref={scope}>
        {wordsArray.map((word, idx) => (
          <motion.span
            key={word + idx}
            // A cor agora é herdada do className, e a opacidade inicial é 0
            className="opacity-0"
          >
            {word}{" "}
          </motion.span>
        ))}
      </motion.div>
    );
  };

  return (
    // CORREÇÃO: As classes de estilo (incluindo tamanho e cor) agora são aplicadas diretamente
    // no contêiner do texto, removendo o div interno que tinha o tamanho fixo.
    <div className={cn(className)}>
      <div className="mt-4">
        {renderWords()}
      </div>
    </div>
  );
};