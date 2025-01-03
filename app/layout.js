import localFont from "next/font/local";
import "./globals.css";
import Header from "./components/Header";
import DynamicTitle from "./components/DynamicTitle";
import Footer from "./components/Footer";
import { Toaster } from "sonner";
import { LenisProvider } from "../app/components/providers/LenisProvider";

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
        <LenisProvider
          options={{
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
          }}
        >
          <div className="flex flex-col min-h-screen">
            <DynamicTitle />
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </LenisProvider>
      </body>
    </html>
  );
}