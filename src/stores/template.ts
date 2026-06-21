import { defineStore } from "pinia";

import type { template, template_data } from "@/types/template";

export const templateStore = defineStore("template_store", {
  state: (): {
    templates: template[];
    activeTemplate: number;
    defaultTemplates: number;
  } => ({
    activeTemplate: 0,
    defaultTemplates: 0,
    templates: []
  }),
  actions: {
    addDefaultTemplates(defaultTemplates: template_data[]) {
      const newTemplates: template[] = [];
      for (const template of defaultTemplates) {
        newTemplates.push({
          armor_percentage: template.armor_percentage!,
          default: true,
          description: template.description,
          equipment_percentage: template.equipment_percentage!,
          name: template.name,
          rarity_filter: template.item_rarities!,
          shield_percentage: template.shield_percentage!,
          source_filter: [],
          trait_blacklist_filter: template.item_traits_blacklist,
          trait_whitelist_filter: template.item_traits_whitelist,
          type_filter: template.item_types!,
          weapon_percentage: template.weapon_percentage!
        });
      }
      this.defaultTemplates = newTemplates.length;
      newTemplates.sort((a, b) => a.name.localeCompare(b.name));
      for (const template of this.templates) {
        newTemplates.push(template);
      }
      this.templates = newTemplates;
      this.changeActiveTemplate(this.getTemplateIndex("General"));
    },
    addTemplate(newTemplate: template) {
      this.templates.push(newTemplate);
      this.activeTemplate = this.templates.length - 1;
    },
    changeActiveTemplate(templateIndex: number) {
      if (templateIndex >= this.templates.length || templateIndex < 0) {
        this.activeTemplate = 0;
      } else {
        this.activeTemplate = templateIndex;
      }
    },
    getTemplateIndex(templateName: string): number {
      const index = this.templates
        .map(template => template.name)
        .indexOf(templateName);
      return index;
    },
    removeTemplate() {
      this.templates.splice(this.activeTemplate, 1);
      this.changeActiveTemplate(this.getTemplateIndex("General"));
    },
    updateTemplate(oldName: string, newTemplate: template) {
      const templateIndex = this.getTemplateIndex(oldName);
      if (templateIndex >= this.defaultTemplates - 1) {
        this.templates[templateIndex] = newTemplate;
      }
    },
    updateTemplates(newTemplates: template[]) {
      this.templates = newTemplates;
    }
  }
});
