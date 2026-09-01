import { offset } from "@floating-ui/dom";
import { useShepherd } from "vue-shepherd";

import type { StepOptions, Tour } from "shepherd.js";

function firstButtons(tour: Tour): (
  | {
      action(): Promise<void>;
      secondary: boolean;
      text: string;
    }
  | {
      action(): void;
      text: string;
      secondary?: never;
    }
)[] {
  return [
    {
      async action(): Promise<void> {
        await tour.cancel();
      },
      secondary: true,
      text: "CLOSE"
    },
    {
      action(): void {
        tour.next(); // oxlint-disable-line no-floating-promises
      },
      text: "NEXT"
    }
  ];
}

function lastButtons(tour: Tour): (
  | {
      action(): void;
      secondary: boolean;
      text: string;
    }
  | {
      action(): void;
      text: string;
      secondary?: never;
    }
)[] {
  return [
    {
      action(): void {
        tour.back(); // oxlint-disable-line no-floating-promises
      },
      secondary: true,
      text: "PREVIOUS"
    },
    {
      action(): void {
        tour.complete();
      },
      text: "FINISH"
    }
  ];
}

function defaultButtons(tour: Tour): (
  | {
      action(): Promise<void>;
      secondary: boolean;
      text: string;
    }
  | {
      action(): void;
      text: string;
      secondary?: never;
    }
)[] {
  return [
    {
      async action(): // oxlint-disable-line require-await
      Promise<void> {
        return tour.cancel();
      },
      secondary: true,
      text: "CLOSE"
    },
    {
      action(): void {
        tour.back(); // oxlint-disable-line no-floating-promises
      },
      text: "PREVIOUS"
    },
    {
      action(): void {
        tour.next(); // oxlint-disable-line no-floating-promises
      },
      text: "NEXT"
    }
  ];
}

export function createTourEncounter(): Tour {
  const tour: Tour = useShepherd({
    defaultStepOptions: {
      floatingUIOptions: {
        middleware: [offset(16)]
      },
      modalOverlayOpeningPadding: 5,
      modalOverlayOpeningRadius: 10,
      scrollTo: true
    },
    useModalOverlay: true
  });

  const tourSteps: StepOptions[] = [
    {
      attachTo: { element: "#shepherd-0", on: "auto" },
      buttons: firstButtons(tour),
      text: "Double click on a row to add it to the Encounter List to the right.",
      title: "Creature & Hazard Table"
    },
    {
      attachTo: { element: "#shepherd-1", on: "auto" },
      buttons: defaultButtons(tour),
      text: "Here you can change your party size and the level of the individual players. You can also add multiple parties and select the active one.",
      title: "Party Builder"
    },
    {
      attachTo: { element: "#shepherd-2", on: "auto" },
      buttons: defaultButtons(tour),
      text: "From this window you can define your preferred settings for the random encounter generator.",
      title: "Generator Settings"
    },
    {
      attachTo: { element: "#shepherd-3", on: "auto" },
      buttons: defaultButtons(tour),
      text: "Clicking this button will generate a new random encounter, based on the generator settings previously described and the currently active party_store.",
      title: "Random Generator"
    },
    {
      attachTo: { element: "#shepherd-4", on: "auto" },
      buttons: defaultButtons(tour),
      text: "Click these buttons to toggle between the Creatures and Hazards Tables.",
      title: "Creatures / Hazards toggle"
    },
    {
      attachTo: { element: "#shepherd-5", on: "auto" },
      buttons: defaultButtons(tour),
      text: "From this dropdown you can select which columns of the table to show and hide.",
      title: "Display columns"
    },
    {
      attachTo: { element: ".shepherd-6", on: "auto" },
      buttons: defaultButtons(tour),
      text: "Here you can sort the columns and narrow your search with the various filters_store.",
      title: "Filters"
    },
    {
      attachTo: { element: "#shepherd-7", on: "auto" },
      buttons: defaultButtons(tour),
      text: "This is where the creatures and hazards you added will be displayed.",
      title: "Encounter List"
    },
    {
      attachTo: { element: "#shepherd-8", on: "auto" },
      buttons: defaultButtons(tour),
      text: "You can increase or decrease the number creatures and hazards.",
      title: "Creature numbers"
    },
    {
      attachTo: { element: "#shepherd-9", on: "auto" },
      buttons: defaultButtons(tour),
      text: "You can also change creatures to their Weak/Elite variant.",
      title: "Change variant"
    },
    {
      attachTo: { element: "#shepherd-10", on: "auto" },
      buttons: defaultButtons(tour),
      text: "Clicking this button will generate a link to your current encounter that you can copy and share.",
      title: "Share"
    },
    {
      attachTo: { element: "#shepherd-11", on: "auto" },
      buttons: defaultButtons(tour),
      text: "This is where the challenge of the encounter will be displayed, adjusted according to your party level and size.",
      title: "Encounter Challenge"
    },
    {
      attachTo: { element: "#shepherd-12", on: "auto" },
      buttons: defaultButtons(tour),
      text: "This button starts the encounter tracker with the currently active party and encounter_store.",
      title: "Tracker"
    },
    {
      attachTo: { element: "#shepherd-13", on: "auto" },
      buttons: defaultButtons(tour),
      text: "Click here to show or hide the selected item's description.",
      title: "Show / Hide Sheet"
    },
    {
      attachTo: { element: "#shepherd-14", on: "auto" },
      buttons: lastButtons(tour),
      text: 'You can enable the variant rule for Proficiency without Level by clicking here and going to the "Encounter" tab.',
      title: "Settings"
    }
  ];

  tour.addSteps(tourSteps);

  return tour;
}

export function createTourShop(): Tour {
  const tour = useShepherd({
    defaultStepOptions: {
      floatingUIOptions: {
        middleware: [offset(16)]
      },
      modalOverlayOpeningPadding: 5,
      modalOverlayOpeningRadius: 10,
      scrollTo: true
    },
    useModalOverlay: true
  });

  const tourSteps: StepOptions[] = [
    {
      attachTo: { element: "#shepherd-0", on: "auto" },
      buttons: firstButtons(tour),
      text: "Click on a row to show its description and double click it to add it to the shop to the right.",
      title: "Shop Table"
    },
    {
      attachTo: { element: "#shepherd-1", on: "auto" },
      buttons: defaultButtons(tour),
      text: "From this window you can define your preferred settings for the random shop generator and create custom templates.",
      title: "Generator Settings"
    },
    {
      attachTo: { element: "#shepherd-2", on: "auto" },
      buttons: defaultButtons(tour),
      text: "Clicking this button will generate a new random shop, based on the generator settings previously described.",
      title: "Random Generator"
    },
    {
      attachTo: { element: ".shepherd-3", on: "auto" },
      buttons: defaultButtons(tour),
      text: "Here you can sort the columns and narrow your search with the various filters_store.",
      title: "Filters"
    },
    {
      attachTo: { element: "#shepherd-4", on: "auto" },
      buttons: defaultButtons(tour),
      text: "This is where the items you added or randomly generated will be displayed. You can also increase or decrease the number of each individual item.",
      title: "Shop List"
    },
    {
      attachTo: { element: "#shepherd-5", on: "auto" },
      buttons: defaultButtons(tour),
      text: "Clicking this button will generate a link to your current shop that you can copy and share.",
      title: "Share"
    },
    {
      attachTo: { element: "#shepherd-6", on: "auto" },
      buttons: lastButtons(tour),
      text: "Click here to show or hide the selected item's description.",
      title: "Show / Hide Sheet"
    }
  ];

  tour.addSteps(tourSteps);

  return tour;
}

export function createTourNpc(): Tour {
  const tour = useShepherd({
    defaultStepOptions: {
      floatingUIOptions: {
        middleware: [offset(16)]
      },
      modalOverlayOpeningPadding: 5,
      modalOverlayOpeningRadius: 10,
      scrollTo: true
    },
    useModalOverlay: true
  });

  const tourSteps: StepOptions[] = [
    {
      attachTo: { element: "#shepherd-0", on: "auto" },
      buttons: firstButtons(tour),
      text: "Here you can define your preferred setting for generating a random NPC.",
      title: "NPC Generator"
    },
    {
      attachTo: { element: "#shepherd-1", on: "auto" },
      buttons: defaultButtons(tour),
      text: "After having picked your settings of choice, click here to generate an NPC.",
      title: "Random Generator"
    },
    {
      attachTo: { element: "#shepherd-2", on: "auto" },
      buttons: defaultButtons(tour),
      text: "From here you can modify the individual parameters of your NPC. You can also save or remove the NPCs you created.",
      title: "NPC Editor"
    },
    {
      attachTo: { element: "#shepherd-3", on: "auto" },
      buttons: defaultButtons(tour),
      text: "Clicking this button will generate a link to your current NPC that you can copy and share.",
      title: "Share"
    },
    {
      attachTo: { element: "#shepherd-4", on: "auto" },
      buttons: defaultButtons(tour),
      text: "Each of these fields can be manually locked, edited or randomly generated.",
      title: "Generated fields"
    },
    {
      attachTo: { element: "#shepherd-5", on: "auto" },
      buttons: defaultButtons(tour),
      text: "These fields can only be manually edited instead.",
      title: "Extra fields"
    },
    {
      attachTo: { element: "#shepherd-6", on: "auto" },
      buttons: defaultButtons(tour),
      text: 'Here you can modify custom fields. Add new ones by clicking the "+" button.',
      title: "Custom fields"
    },
    {
      attachTo: { element: "#shepherd-7", on: "auto" },
      buttons: lastButtons(tour),
      text: "This is where the final result of your NPC will be displayed. Click on the icon to the left of the name to open a new page with the fullscreen sheet.",
      title: "NPC Sheet"
    }
  ];

  tour.addSteps(tourSteps);

  return tour;
}

export function createTourTracker(): Tour {
  const tour = useShepherd({
    defaultStepOptions: {
      floatingUIOptions: {
        middleware: [offset(16)]
      },
      modalOverlayOpeningPadding: 5,
      modalOverlayOpeningRadius: 10,
      scrollTo: true
    },
    useModalOverlay: true
  });

  const tourSteps: StepOptions[] = [
    {
      attachTo: { element: "#shepherd-0", on: "auto" },
      buttons: firstButtons(tour),
      text: "This is the Tracker List, containing all creatures, hazards and players in the encounter.",
      title: "Tracker List"
    },
    {
      attachTo: { element: "#shepherd-1", on: "auto" },
      buttons: defaultButtons(tour),
      text: "Here you can roll initiative for everyone or just NPCs, see the current round and add new players.",
      title: "Tracker Header"
    },
    {
      attachTo: { element: "#shepherd-2", on: "auto" },
      buttons: defaultButtons(tour),
      text: "Depending on the element's type you can modify its health, initiative, name and disable status. Clicking the row will display its sheet on the right. Clicking the magnifying glass icon will pin its details on the dashboard in the middle",
      title: "Tracked elements"
    },
    {
      attachTo: { element: "#shepherd-3", on: "auto" },
      buttons: defaultButtons(tour),
      text: "Use these buttons or the arrow keys to advance turns and rounds. Dead or disabled elements will be skipped and conditions will be automatically reduced.",
      title: "Encounter controls"
    },
    {
      attachTo: { element: "#shepherd-4", on: "auto" },
      buttons: defaultButtons(tour),
      text: "This is the Tracker Dashboard, where you can check and modify the finer details for a tracked element.",
      title: "Tracker Dashboard"
    },
    {
      attachTo: { element: "#shepherd-5", on: "auto" },
      buttons: lastButtons(tour),
      text: "This is where the creature or hazard sheet is displayed. Click on the lock in the top right corner to prevent the sheet from changing to the active element.",
      title: "Tracker Sheet"
    }
  ];

  tour.addSteps(tourSteps);

  return tour;
}
