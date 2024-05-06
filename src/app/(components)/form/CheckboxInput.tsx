import React, { useEffect, useState } from "react";
import styles from "./CheckboxInput.module.scss";

interface CheckboxInputProps {
  name: string;
  value?: string | number;
  label: string | React.ReactNode;
  labelLocation?: "left" | "right" | "top";
  checked?: boolean;
  isReadOnly?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const CheckboxInput = ({
  name,
  value,
  label,
  checked,
  onChange,
  isReadOnly = false,
  labelLocation = "right",
  disabled = false,
}: CheckboxInputProps) => {
  const [isChecked, setIsChecked] = useState<boolean>(checked || false);

  useEffect(() => {
    setIsChecked(checked || false);
  }, [checked]);
  return (
    <div className={`${styles.inputContainer} ${labelLocation === "top" ? styles.top : ""}`}>
      {(labelLocation === "top" || labelLocation === "left") && <label className={styles.label}>{label}</label>}
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
        disabled={isReadOnly || disabled}
      />
      {labelLocation === "right" && <label className={styles.label}>{label}</label>}
    </div>
  );
};

export default CheckboxInput;
