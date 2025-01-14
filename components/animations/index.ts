import { motion } from 'framer-motion';

export const animationConfig = {
  transition: {
    duration: 0.8,
    ease: "easeOut"
  }
};

export const fadeInAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export const slideUpAnimation = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -20, opacity: 0 }
}; 