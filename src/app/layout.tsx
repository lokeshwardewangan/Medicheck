import type { Metadata } from "next";
import { Overpass } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";


const overpass = Overpass({
  variable: "--font-overpass",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "MediCheck - AI Symptom Checker",
  description:
    "Describe your symptoms naturally and get instant AI-powered guidance on the appropriate level of care.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={` ${overpass.variable} h-full antialiased`}>
        <body className="font-sans min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
