'use client'

import type { Config } from "@/lib/content";
import { createContext, useContext, useMemo } from "react";
import { getAuthConfig } from "@/lib/auth/config";

const ConfigContext = createContext<Config>({});

// Initialize auth config once during module load
const initialAuthConfig = getAuthConfig();

export function ConfigProvider({ config, children }: { config: Config, children: React.ReactNode }) {
 
    const enhancedConfig = useMemo(() => {
        return { ...config, authConfig: initialAuthConfig };
    }, [config]);
    
    return <ConfigContext.Provider value={enhancedConfig}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
    const context = useContext<Config>(ConfigContext);
    if (!context) {
        throw new Error("useConfig must be used within a ConfigProvider");
    }
    return context;
}
