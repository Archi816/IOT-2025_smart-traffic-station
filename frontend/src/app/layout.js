import "./globals.css";

export const metadata = {
  title: "IoT Sensor Station",
  description: "Real-time IoT monitoring dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}