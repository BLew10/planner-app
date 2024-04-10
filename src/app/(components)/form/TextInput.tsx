"use client";

import React, { useState, useEffect } from "react";
import styles from "./TextInput.module.scss";

interface TextInputProps {
  name: string | null;
  value?: string | null;
  label: string;
  subLabel?: string;
  type?: string;
  placeholder?: string;
  pattern?: string;
  id?: string;
  autocomplete?: string;
  isReadOnly?: boolean;
  isRequired?: boolean;
  title?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  validate?: (value: string) => string | null;
}

const TextInput: React.FC<TextInputProps> = ({
  name,
  value,
  label,
  subLabel,
  id,
  type = "text",
  placeholder = "",
  pattern,
  autocomplete = "on",
  isReadOnly = false,
  isRequired = false,
  title,
  onChange,
  validate,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>(value || "");

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

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
      <label className={styles.label}>{label} {isRequired && <span className={styles.required}>*</span>} {subLabel && <span className={styles.subLabel}>{subLabel}</span>}</label>
      <input
        type={type}
        placeholder={placeholder}
        pattern={pattern}
        className={`${styles.input} ${error ? styles.errorInput : ""} ${
          isReadOnly ? styles.readOnly : ""
        }`}
        id={id || name || ""}
        name={name || ""}
        autoComplete={autocomplete}
        readOnly={isReadOnly}
        value={inputValue}
        required={isRequired}
        title={title}
        onChange={onChange || validate ? handleChange : (e) => {
          e.preventDefault();
          setInputValue(e.target.value);
        }}
      />

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default TextInput;
