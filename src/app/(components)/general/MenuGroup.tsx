import React from 'react';
import styles from './MenuGroup.module.scss';

interface MenuGroupProps {
  title: string;
  children: React.ReactNode;
}

export const MenuGroup: React.FC<MenuGroupProps> = ({ title, children }) => {
  return (
    <div className={styles.menuGroup}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.items}>{children}</div>
    </div>
  );
};