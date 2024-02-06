"use client"

import { motion } from 'framer-motion'
import styles from './AnimateWrapper.module.scss'

interface AnimateWrapperProps {
  children: React.ReactNode
}

const AnimateWrapper = ({ children }: AnimateWrapperProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={styles.animateWrapper}
    >
      {children}
    </motion.div>
  )
}

export default AnimateWrapper;