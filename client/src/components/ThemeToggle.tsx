"use client";

import { Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <div
      className="cursor-pointer"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <Moon
        className="w-6 h-6"
        style={{
          color: isDark ? "white" : "black",  
        }}
      />
    </div>
  );
}
