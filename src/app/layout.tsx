import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";
import Navbar from "./navbar";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}

          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
