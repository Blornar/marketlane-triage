import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Submission Triage — Market Lane Insurance Group",
  description: "AI-Powered Insurance Submission Processing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="ml-noise">
        {children}
      </body>
    </html>
  );
}
