import type { Metadata } from "next";
import "@/styles/globals.scss";
import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = {
  title: "Planner",
  description: "Create your planner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
