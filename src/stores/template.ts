import { defineStore } from "pinia";

import type { template, template_data } from "@/types/template";

export const templateStore = defineStore("template_store", {
  state: (): {
    default_templates: template[];
    custom_templates: template[];
    all_templates: template[];
    activeTemplate: number;
  } => ({
    default_templates: [],
    custom_templates: [],
    all_templates: [],
    activeTemplate: 0
  }),
  actions: {
    concatAllTemplates() {
      this.all_templates = this.default_templates.concat(this.custom_templates);
    },
    addDefaultTemplates(defaultTemplates: template_data[]) {
      const newTemplates: template[] = [];
      for (const template of defaultTemplates) {
        newTemplates.push({
          name: template.name,
          description: template.description,
          default: true,
          item_sources: [],
          item_rarities: template.item_rarities,
          item_traits_blacklist: template.item_traits_blacklist,
          item_traits_whitelist: template.item_traits_whitelist,
          item_types: template.item_types,
          armor_percentage: template.armor_percentage,
          equipment_percentage: template.equipment_percentage,
          shield_percentage: template.shield_percentage,
          weapon_percentage: template.weapon_percentage
        });
      }
      newTemplates.sort((a, b) => a.name.localeCompare(b.name));
      this.default_templates = newTemplates;
      this.concatAllTemplates();
      this.changeActiveTemplate(this.getAllTemplateIndex("General"));
    },
    addCustomTemplate(newTemplate: template) {
      this.custom_templates.push(newTemplate);
      this.concatAllTemplates();
      this.activeTemplate = this.all_templates.length - 1;
    },
    changeActiveTemplate(templateIndex: number) {
      if (templateIndex >= this.all_templates.length || templateIndex < 0) {
        this.activeTemplate = 0;
      } else {
        this.activeTemplate = templateIndex;
      }
    },
    getAllTemplateIndex(templateName: string): number {
      const index = this.all_templates
        .map(template => template.name)
        .indexOf(templateName);
      return index;
    },
    getCustomTemplateIndex(templateName: string): number {
      const index = this.custom_templates
        .map(template => template.name)
        .indexOf(templateName);
      return index;
    },
    removeTemplate() {
      const templateName = this.all_templates[this.activeTemplate]?.name;
      this.all_templates.splice(this.activeTemplate, 1);
      this.changeActiveTemplate(this.getAllTemplateIndex("General"));
      if (templateName) {
        const customTemplateIndex = this.getCustomTemplateIndex(templateName);
        this.custom_templates.splice(customTemplateIndex, 1);
      }
    },
    updateCustomTemplate(oldName: string, newTemplate: template) {
      const allTemplateIndex = this.getAllTemplateIndex(oldName);
      if (
        this.all_templates[allTemplateIndex] &&
        !this.all_templates[allTemplateIndex].default
      ) {
        this.all_templates[allTemplateIndex] = newTemplate;
      }
      const customTemplateIndex = this.getCustomTemplateIndex(oldName);
      if (
        this.custom_templates[customTemplateIndex] &&
        !this.custom_templates[customTemplateIndex].default
      ) {
        this.custom_templates[customTemplateIndex] = newTemplate;
      }
    },
    updateCustomTemplates(newTemplates: template[]) {
      this.custom_templates = newTemplates;
      this.concatAllTemplates();
    }
  }
});
