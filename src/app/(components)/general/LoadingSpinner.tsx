import React from "react";
import styles from "./LoadingSpinner.module.scss";
import { TailSpin } from "react-loading-icons";
const LoadingSpinner: React.FC = () => {
  return (
    <div className={styles.wrapper}>
      <TailSpin className={styles.spinner} width="50px" height="50px" stroke="var(--text-secondary)" />
    </div>
  );
};

export default LoadingSpinner;
