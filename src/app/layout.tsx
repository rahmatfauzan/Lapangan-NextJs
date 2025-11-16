("");
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";
import Navbar from "./(public)/navbar";
import { Rubik } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";

const rubik = Rubik({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700"], // Pilih ketebalan yang dibutuhkan
  variable: "--font-rubik", // Deklarasikan sebagai variabel CSS
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={rubik.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
