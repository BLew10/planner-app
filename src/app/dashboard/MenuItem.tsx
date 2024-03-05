import React from "react";
import Link from "next/link";
import { IconType } from "react-icons";
import styles from "./MenuItem.module.scss";

interface MenuItemProps {
  icon: IconType;
  label: string;
  urlPath: string;
}

export const MenuItem: React.FC<MenuItemProps> = ({ icon: Icon, label, urlPath }) => {
  return (
    <Link className={styles.item} href={urlPath}>
      <Icon className={styles.icon}/>
      <span className={styles.label}>{label}</span>
    </Link>
  );
};
