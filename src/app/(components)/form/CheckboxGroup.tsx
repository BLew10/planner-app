import React from "react";
import CheckboxInput from "./CheckboxInput";
import styles from "./CheckboxGroup.module.scss";

interface CheckboxGroupProps {
  name: string;
  options: { label: any; value: any; checked: boolean }[];
  useGrid?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CheckboxGroup = ({ name, options, useGrid = true, onChange }: CheckboxGroupProps) => {
  return (
    <div className={`${useGrid ? styles.checkboxGrid : ''}`}>
      {options.map((option, index) => (
        <CheckboxInput
          key={index}
          name={name}
          value={option.value}
          label={option.label}
          checked={option.checked}
          onChange={onChange}
        />
      ))}
    </div>
  );
};

export default CheckboxGroup;
