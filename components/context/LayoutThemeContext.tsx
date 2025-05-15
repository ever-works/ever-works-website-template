"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { LayoutKey } from "@/components/layouts";

type LayoutThemeContextType = {
  layoutKey: LayoutKey;
  setLayoutKey: (key: LayoutKey) => void;
  themeKey: string;
  setThemeKey: (key: string) => void;
};

const LayoutThemeContext = createContext<LayoutThemeContextType | undefined>(
  undefined
);

export const LayoutThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [layoutKey, setLayoutKeyState] = useState<LayoutKey>("classic");
  const [themeKey, setThemeKeyState] = useState("everworks");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLayout =
        (window.localStorage.getItem("layoutKey") as LayoutKey) || "classic";
      setLayoutKeyState(savedLayout);
      setThemeKeyState(window.localStorage.getItem("themeKey") || "everworks");
    }
  }, []);

  const setLayoutKey = (key: LayoutKey) => {
    setLayoutKeyState(key);
    if (typeof window !== "undefined")
      window.localStorage.setItem("layoutKey", key);
  };
  const setThemeKey = (key: string) => {
    setThemeKeyState(key);
    if (typeof window !== "undefined")
      window.localStorage.setItem("themeKey", key);
  };

  return (
    <LayoutThemeContext.Provider
      value={{ layoutKey, setLayoutKey, themeKey, setThemeKey }}
    >
      {children}
    </LayoutThemeContext.Provider>
  );
};

export const useLayoutTheme = () => {
  const ctx = useContext(LayoutThemeContext);
  if (!ctx)
    throw new Error("useLayoutTheme must be used within a LayoutThemeProvider");
  return ctx;
};
