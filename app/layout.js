import { Poppins } from "next/font/google";
import { TasksProvider } from "@/context/TasksContext";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata = {
  title: {
    default: "To-Do",
    template: "%s | To-Do",
  },
  description: "Create, edit, and track tasks by week.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable} h-full`}>
      <body className="min-h-full antialiased">
        <TasksProvider>
          <div className="mx-auto min-h-dvh w-full max-w-[640px]">{children}</div>
        </TasksProvider>
      </body>
    </html>
  );
}
