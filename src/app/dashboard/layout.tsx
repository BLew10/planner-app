"use client";

import { SessionProvider } from 'next-auth/react';
import MainMenu from '@/app/dashboard/MainMenu';
import styles from './layout.module.scss';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider >
      <div className={styles.container}>
      <MainMenu />
      {children}
      </div>
    </SessionProvider>
  );
}
