import localFont from "next/font/local";
import "./globals.css";
import WhatsAppButton from "@/components/WhatsAppButton";

const ibmPlexSansArabic = localFont({
  src: [
    {
      path: "./fonts/IBMPlexSansArabic-Thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "./fonts/IBMPlexSansArabic-ExtraLight.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "./fonts/IBMPlexSansArabic-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/IBMPlexSansArabic-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/IBMPlexSansArabic-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/IBMPlexSansArabic-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/IBMPlexSansArabic-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-ibm-plex",
});

export const metadata = {
  title: "صفوة عنان | للتسويق والتطوير العقاري",
  description:
    "شركة صفوة عنان للتسويق والتطوير العقاري، نقدم حلولاً عقارية متكاملة تشمل إدارة الأملاك، التسويق، التشغيل، والصيانة.",
  verification: {
    google: "",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={ibmPlexSansArabic.variable}>
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}
