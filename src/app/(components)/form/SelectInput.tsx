"use client";

import React, { useState, useEffect } from "react";
import styles from "./SelectInput.module.scss";

interface SelectInputProps {
  name: string;
  value?: string | null;
  label: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  validate?: (value: string) => string | null;
  options: { label: string | undefined; value: string | undefined }[];
  usesState?: boolean;
  id?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({
  name,
  value,
  label,
  onChange,
  validate,
  options,
  id,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [valueState, setValueState] = useState<string | null>(value || options[0]?.value || null);
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (validate) {
      const validationError = validate(e.target.value);
      setError(validationError);
    }
    if (onChange) {
      setValueState(e.target.value);
      onChange(e);
    }
  };

  useEffect(() => {
    setValueState(value || options[0]?.value || null);
  }, [value, options])

  return (
    <div className={styles.inputWrapper}>
      <label className={styles.label}>{label}</label>
      <select
        className={styles.select}
        name={name}
        value={valueState || options[0]?.value}
        id={id}
        onChange={(onChange || validate) ? handleChange : e => setValueState(e.target.value)}
      >
        {options.map((option, index) => (
          <option key={index} value={option?.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default SelectInput;
