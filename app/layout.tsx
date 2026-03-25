import type { Metadata } from "next";
import { WalletContextProvider } from "@/components/WalletProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "simplEncrypt — Private DAO Voting",
  description: "Private DAO governance powered by Arcium MPC on Solana",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-[#F7F5FB] dark:bg-[#110D20] min-h-screen">
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var theme = localStorage.getItem('simplencrypt_theme');
            if (theme === 'light') document.documentElement.classList.remove('dark');
          else document.documentElement.classList.add('dark');
          })();
        `}} />
        <WalletContextProvider>{children}</WalletContextProvider>
      </body>
    </html>
  );
}