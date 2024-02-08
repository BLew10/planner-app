import React from "react";
import CheckboxInput from "./CheckboxInput";
import styles from "./CheckboxGroup.module.scss";

interface CheckboxGroupProps {
  name: string;
  options: { label: any; value: any; checked: boolean }[];
}

const CheckboxGroup = ({ name, options }: CheckboxGroupProps) => {
  return (
    <div className={styles.checkboxGrid}>
      {options.map((option, index) => (
        <CheckboxInput
          key={index}
          name={name}
          value={option.value}
          label={option.label}
          checked={option.checked}
        />
      ))}
    </div>
  );
};

export default CheckboxGroup;
