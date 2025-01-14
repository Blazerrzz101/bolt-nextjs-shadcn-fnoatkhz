import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedCircleProps {
  className?: string;
}

export const AnimatedCircle: React.FC<AnimatedCircleProps> = ({ className }) => {
  return (
    <motion.div 
      className={className}
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 1, repeat: Infinity }}
    />
  );
}; 