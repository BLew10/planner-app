import React from "react";
import styles from "./CheckboxInput.module.scss";

interface CheckboxInputProps {
  name: string;
  value?: string | number;
  label: string;
  checked?: boolean;
  isReadOnly?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CheckboxInput = ({
  name,
  value,
  label,
  checked,
  onChange,
  isReadOnly = false,
}: CheckboxInputProps) => {
  return (
    <div className={styles.inputContainer}>
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={checked}
        disabled={isReadOnly}
        onChange={onChange}
      />
      <label className={styles.label}>{label}</label>
    </div>
  );
};

export default CheckboxInput;
