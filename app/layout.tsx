import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-display",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Ummah Connect - Where your deen and career thrive together",
  description:
    "Professional networking for Muslim professionals and creatives. Launching in Nigeria.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body>
        <div className="app-shell">
          <Providers>
            {children}
            <footer className="app-footer">
              <span lang="ar" dir="rtl">بسم الله الرحمن الرحيم</span>
            </footer>
          </Providers>
        </div>
      </body>
    </html>
  );
}
