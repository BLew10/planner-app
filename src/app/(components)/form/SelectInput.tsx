"use client";

import React, { useState } from "react";
import styles from "./SelectInput.module.scss";

interface SelectInputProps {
  name: string;
  value?: string | null;
  label: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  validate?: (value: string) => string | null;
  options: Array<{ label: string; value: string }>;
  usesState?: boolean;
}

const SelectInput: React.FC<SelectInputProps> = ({
  name,
  value,
  label,
  onChange,
  validate,
  options,
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (validate) {
      const validationError = validate(e.target.value);
      setError(validationError);
    }
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className={styles.inputWrapper}>
      <label className={styles.label}>{label}</label>
      <select
        className={styles.select}
        name={name}
        value={(onChange || validate) && (value || options[0].value)}
        onChange={(onChange || validate) ? handleChange : () => {}}
      >
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default SelectInput;
