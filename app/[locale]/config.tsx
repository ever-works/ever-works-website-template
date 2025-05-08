'use client'

import type { Config } from "@/lib/content";
import { createContext, useContext } from "react";
import { getAuthConfig } from "@/lib/auth/config";

const ConfigContext = createContext<Config>({});

export function ConfigProvider({ config, children }: { config: Config, children: React.ReactNode }) {
    const authConfig = getAuthConfig();
    const enhancedConfig = { ...config, authConfig };
    return <ConfigContext.Provider value={enhancedConfig}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
    const context = useContext<Config>(ConfigContext);
    if (!context) {
        throw new Error("useConfig must be used within a ConfigProvider");
    }
    return context;
}
