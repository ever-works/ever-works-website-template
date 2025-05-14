"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type LayoutThemeContextType = {
  layoutKey: string;
  setLayoutKey: (key: string) => void;
  themeKey: string;
  setThemeKey: (key: string) => void;
};

const LayoutThemeContext = createContext<LayoutThemeContextType | undefined>(undefined);

export const LayoutThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [layoutKey, setLayoutKeyState] = useState("classic");
  const [themeKey, setThemeKeyState] = useState("everworks");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLayoutKeyState(window.localStorage.getItem("layoutKey") || "classic");
      setThemeKeyState(window.localStorage.getItem("themeKey") || "everworks");
    }
  }, []);

  const setLayoutKey = (key: string) => {
    setLayoutKeyState(key);
    if (typeof window !== "undefined") window.localStorage.setItem("layoutKey", key);
  };
  const setThemeKey = (key: string) => {
    setThemeKeyState(key);
    if (typeof window !== "undefined") window.localStorage.setItem("themeKey", key);
  };

  return (
    <LayoutThemeContext.Provider value={{ layoutKey, setLayoutKey, themeKey, setThemeKey }}>
      {children}
    </LayoutThemeContext.Provider>
  );
};

export const useLayoutTheme = () => {
  const ctx = useContext(LayoutThemeContext);
  if (!ctx) throw new Error("useLayoutTheme must be used within a LayoutThemeProvider");
  return ctx;
};
