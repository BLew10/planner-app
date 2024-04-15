import React, { useEffect, useState } from "react";
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
  const [isChecked, setIsChecked] = useState<boolean>(checked || false);

  useEffect(() => {
    setIsChecked(checked || false);
  }, [checked]);
  return (
    <div className={styles.inputContainer}>
      <input
        type="checkbox"
        name={name}
        value={value}
        checked={isChecked}
        onChange={(e) =>{
          setIsChecked(!isChecked);
          if (onChange) {
            onChange(e);
          }
        }}
        disabled={isReadOnly}
      />
      <label className={styles.label}>{label}</label>
    </div>
  );
};

export default CheckboxInput;
