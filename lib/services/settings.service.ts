import { PricingPlanConfig } from "../content";
import { defaultPricingConfig } from "../types";
import { FileService } from "./file.service";

interface SettingsTheme {
  type:'everworks' | 'corporate' | 'material' | 'funny';
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}



export enum LayoutKey {
  CLASSIC = 'classic',
  GRID = 'grid',
  CARDS = 'cards',
  MASONRY = 'masonry'
}

export enum LayoutHome {
  HOME_ONE = 'Home_One',
  HOME_TWO = 'Home_Two',
  HOME_THREE = 'Home_Three'
}

interface SettingsPagination {
  type: 'standard' | 'infinite';
  itemsPerPage: number;
}

export interface Settings {
  layoutHome: LayoutHome;
  theme: SettingsTheme;
  pagination: SettingsPagination;
  layoutKey: LayoutKey;
  pricing: PricingPlanConfig;
}

export class SettingsService {
  private settings: FileService<Settings & { id: string }>;

  constructor() {
    this.settings = new FileService<Settings & { id: string }>('settings');
    this.initializeSettings();
  }

  private async initializeSettings() {
    const existingSettings = await this.settings.findById('settings');
    if (!existingSettings) {
      await this.settings.addItem({
        id: 'settings',
        theme: this.getSettingsTheme(),
        pagination: this.getSettingsPagination(),
        layoutHome: this.getSettingsLayoutHome(),
        layoutKey: this.getSettingsLayoutKey(),
        pricing: this.getSettingsPricingConfig(),
      });
    }
  }

  private getSettingsTheme(): SettingsTheme {
    return {
      type: 'everworks',
      primary: "#0070f3",
      secondary: "#00c853",
      accent: "#0056b3",
      background: "#ffffff",
      surface: "#f8f9fa",
      text: "#1a1a1a",
      textSecondary: "#6c757d",
    };
  }

  private getSettingsLayoutKey(): LayoutKey {
    return LayoutKey.CLASSIC;
  }

  private getSettingsPagination(): SettingsPagination {
    return {    
      type: 'standard',
      itemsPerPage: 12,
    };
  }
  private getSettingsPricingConfig(): PricingPlanConfig { 
    return defaultPricingConfig;
    
  }
  private getSettingsLayoutHome(): LayoutHome {
    return LayoutHome.HOME_ONE;
  }

  async getSettings() {
    return await this.settings.findById('settings');
  }

  async updateSettings(settings: Settings) {
    await this.settings.updateById('settings', settings);
  }

  async updateSettingsLayoutHome(layoutHome: LayoutHome) {
    await this.settings.updateById('settings', { layoutHome });
  }

  async deleteSettings() {
    await this.settings.deleteById('settings');
  }

  async updateSettingsPagination(pagination: SettingsPagination) {
    await this.settings.updateById('settings', { pagination });
  }

  async updateSettingsLayoutKey(layoutKey: LayoutKey) {
    await this.settings.updateById('settings', { layoutKey });
  }

  async updateSettingsTheme(theme: SettingsTheme) {
    await this.settings.updateById('settings', { theme });
  }
  
  async addSettings(settings: Settings) {
    await this.settings.addItem({ ...settings, id: 'settings' });
  }

}

export const settingsService = new SettingsService();