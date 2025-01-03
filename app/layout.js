import localFont from "next/font/local";
import "./globals.css";
import Header from "./components/Header";
import DynamicTitle from "./components/DynamicTitle";
import Footer from "./components/Footer";
import { Toaster } from "sonner";
import LenisProvider from "./components/providers/LenisProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "www.socialitup.in",
  description: "Social it up -- A Marketing Agency",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="lenis lenis-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex flex-col min-h-screen">
          <DynamicTitle />
          <Header />
          <main className="flex-grow">
            <LenisProvider>
              {children}
            </LenisProvider>
          </main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}