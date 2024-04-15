"use client";

import MainMenu from "@/app/dashboard/MainMenu";
import styles from "./layout.module.scss";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <div className={styles.container}>
        <MainMenu />
        {children}
      </div>
  );
}
