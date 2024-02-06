import React from 'react';
import styles from './CheckboxInput.module.scss';

interface CheckboxInputProps {
  name: string;
  value: string | number;
  label: string;
}

const CheckboxInput = ({ name, value, label }: CheckboxInputProps) => {
  return (
    <div className={styles.inputContainer}>
      <input type="checkbox" name={name} value={value} />
      <label className={styles.label}>{label}</label>
    </div>
  );
};

export default CheckboxInput;
