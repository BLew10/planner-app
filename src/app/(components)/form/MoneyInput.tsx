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
  min?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  validate?: (value: string) => string | null;
  children?: React.ReactNode;
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
  children,
  min,
}) => {
  const [inputValue, setInputValue] = useState<string>(value || "");

  useEffect(() => {
    // Format the initial value when the component mounts
    setInputValue(formatCurrency(value || ""));
  }, [value]);

  const formatCurrency = (value: string) => {
    if (!value) return "";
  
    let formattedInput = value.replace(/[^0-9.]/g, '');
    const decimalIndex = formattedInput.indexOf('.');
  
    if (decimalIndex !== -1) {
      formattedInput = formattedInput.substring(0, decimalIndex + 3);
    }
  
    return formattedInput;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const formattedValue = formatCurrency(value);
    setInputValue(formattedValue);
    onChange?.(event);
  };

  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>
        {label} {isRequired && <span className={styles.required}>*</span>}{" "}
        {subLabel && <span className={styles.subLabel}>{subLabel}</span>}
      </label>
      <div className={styles.inputWrapper}>
      <input
        type={type}
        placeholder={placeholder}
        pattern={pattern}
        className={`${styles.input}  ${
          isReadOnly ? styles.readOnly : ""
        }`}
        id={id || name || ""}
        name={name || ""}
        autoComplete={autocomplete}
        readOnly={isReadOnly}
        value={inputValue}
        required={isRequired}
        title={title}
        min={min}
        onChange={
          onChange || validate
            ? handleChange
            : (e) => {
                e.preventDefault();
                setInputValue(e.target.value);
              }
        }
      />
      {children}
      </div>
    </div>
  );
};

export default TextInput;
