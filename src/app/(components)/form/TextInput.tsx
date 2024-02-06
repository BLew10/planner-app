"use client";

import React, { useState } from "react";
import styles from "./TextInput.module.scss";
import { type } from "os";

interface TextInputProps {
  name: string | null;
  value?: string | null;
  label: string;
  type?: string;
  placeholder?: string;
  pattern?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  validate?: (value: string) => string | null;
}

const TextInput: React.FC<TextInputProps> = ({
  name,
  value,
  label,
  type="text",
  placeholder = "",
  pattern,
  onChange,
  validate,
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      <input
        type={type}
        placeholder={placeholder}
        pattern={pattern}
        className={styles.input}
        name={name || ""}
        value={(onChange || validate) && (value || "")}
        onChange={(onChange || validate) ? handleChange : () => {}}
      />

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default TextInput;
