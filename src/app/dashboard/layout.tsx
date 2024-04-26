"use client";

import styles from "./layout.module.scss";
import dynamic from "next/dynamic";

const MainMenu = dynamic(() => import("../(components)/general/MainMenu"), { ssr: false });
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
