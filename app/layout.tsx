import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "InsightPilot — AI-Powered Business Intelligence",
  description:
    "Upload messy CSV/Excel files or paste business notes and get instant AI-powered insights, risks, and recommended actions.",
  keywords: ["business intelligence", "AI analytics", "CSV analysis", "business insights"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
