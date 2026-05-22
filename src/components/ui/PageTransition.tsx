import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

const variants = {
  initial: { opacity: 0, y: 8 },
  enter:   { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -4 },
};

/**
 * Wraps page content with a smooth fade+slide transition.
 * Use inside route components as the outermost wrapper.
 */
export const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => (
  <motion.div
    variants={variants}
    initial="initial"
    animate="enter"
    exit="exit"
    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
    className={`page-transition w-full ${className}`}
  >
    {children}
  </motion.div>
);

export default PageTransition;
