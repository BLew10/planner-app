import React from "react";
import styles from "./LoadingSpinner.module.scss";
import { TailSpin } from "react-loading-icons";
const LoadingSpinner: React.FC = () => {
  return (
      <TailSpin className={styles.spinner} />
  );
};

export default LoadingSpinner;
