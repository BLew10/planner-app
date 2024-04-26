import React from "react";
import styles from "./LoadingSpinner.module.scss";
import { TailSpin } from "react-loading-icons";

interface LoadingSpinnerProps {
  className?: string;
}
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({className}) => {
  return (
    <div className={`${styles.wrapper} ${className}`}>
      <TailSpin className={`${styles.spinner}`} width="50px" height="50px" stroke="var(--text-secondary)" />
    </div>
  );
};

export default LoadingSpinner;
