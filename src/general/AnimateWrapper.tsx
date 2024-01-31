'use client'

import { motion } from 'framer-motion'

interface AnimateWrapperProps {
  children: React.ReactNode
}

const AnimateWrapper = ({ children }: AnimateWrapperProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      {children}
    </motion.div>
  )
}

export default AnimateWrapper;