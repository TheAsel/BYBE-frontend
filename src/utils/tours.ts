import { offset } from "@floating-ui/dom";
import { useShepherd } from "vue-shepherd";

import type { StepOptions, Tour } from "shepherd.js";

function firstButtons(tour: Tour) {
  return [
    {
      text: "CLOSE",
      secondary: true,
      action() {
        return tour.cancel();
      }
    },
    {
      text: "NEXT",
      action() {
        return tour.next();
      }
    }
  ];
}

function lastButtons(tour: Tour) {
  return [
    {
      text: "PREVIOUS",
      secondary: true,
      action() {
        return tour.back();
      }
    },
    {
      text: "FINISH",
      action() {
        return tour.complete();
      }
    }
  ];
}

function defaultButtons(tour: Tour) {
  return [
    {
      text: "CLOSE",
      secondary: true,
      action() {
        return tour.cancel();
      }
    },
    {
      text: "PREVIOUS",
      action() {
        return tour.back();
      }
    },
    {
      text: "NEXT",
      action() {
        return tour.next();
      }
    }
  ];
}

export function createTourEncounter() {
  const tour: Tour = useShepherd({
    useModalOverlay: true,
    defaultStepOptions: {
      scrollTo: true,
      modalOverlayOpeningPadding: 5,
      modalOverlayOpeningRadius: 10,
      floatingUIOptions: {
        middleware: [offset(16)]
      }
    }
  });

  const tourSteps: StepOptions[] = [
    {
      attachTo: { element: "#shepherd-0", on: "auto" },
      title: "Creature & Hazard Table",
      text: "Double click on a row to add it to the Encounter List to the right.",
      buttons: firstButtons(tour)
    },
    {
      attachTo: { element: "#shepherd-1", on: "auto" },
      title: "Party Builder",
      text: "Here you can change your party size and the level of the individual players. You can also add multiple parties and select the active one.",
      buttons: defaultButtons(tour)
    },
    {
      attachTo: { element: "#shepherd-2", on: "auto" },
      title: "Generator Settings",
      text: "From this window you can define your preferred settings for the random encounter generator.",
      buttons: defaultButtons(tour)
    },
    {
      attachTo: { element: "#shepherd-3", on: "auto" },
      title: "Random Generator",
      text: "Clicking this button will generate a new random encounter, based on the generator settings previously described and the currently active party.",
      buttons: defaultButtons(tour)
    },
    {
      attachTo: { element: "#shepherd-4", on: "auto" },
      title: "Creatures / Hazards toggle",
      text: "Click these buttons to toggle between the Creatures and Hazards Tables.",
      buttons: defaultButtons(tour)
    },
    {
      attachTo: { element: "#shepherd-5", on: "auto" },
      title: "Display columns",
      text: "From this dropdown you can select which columns of the table to show and hide.",
      buttons: defaultButtons(tour)
    },
    {
      attachTo: { element: ".shepherd-6", on: "auto" },
      title: "Filters",
      text: "Here you can sort the columns and narrow your search with the various filters.",
      buttons: defaultButtons(tour)
    },
    {
      attachTo: { element: "#shepherd-7", on: "auto" },
      title: "Encounter List",
      text: "This is where the creatures and hazards you added will be displayed.",
      buttons: defaultButtons(tour)
    },
    {
      attachTo: { element: "#shepherd-8", on: "auto" },
      title: "Creature numbers",
      text: "You can increase or decrease the number creatures and hazards.",
      buttons: defaultButtons(tour)
    },
    {
      attachTo: { element: "#shepherd-9", on: "auto" },
      title: "Change variant",
      text: "You can also change creatures to their Weak/Elite variant.",
      buttons: defaultButtons(tour)
    },
    {
      attachTo: { element: "#shepherd-10", on: "auto" },
      title: "Share",
      text: "Clicking this button will generate a link to your current encounter that you can copy and share.",
      buttons: defaultButtons(tour)
    },
    {
      attachTo: { element: "#shepherd-11", on: "auto" },
      title: "Encounter Challenge",
      text: "This is where the challenge of the encounter will be displayed, adjusted according to your party level and size.",
      buttons: defaultButtons(tour)
    },
    {
      attachTo: { element: "#shepherd-12", on: "auto" },
      title: "Tracker",
      text: "This button starts the encounter tracker with the currently active party and encounter.",
      buttons: defaultButtons(tour)
    },
    {
      attachTo: { element: "#shepherd-13", on: "auto" },
      title: "Show / Hide Sheet",
      text: "Click here to show or hide the selected item's description.",
      buttons: defaultButtons(tour)
    },
    {
      attachTo: { element: "#shepherd-14", on: "auto" },
      title: "Settings",
      text: 'You can enable the variant rule for Proficiency without Level by clicking here and going to the "Encounter" tab.',
      buttons: lastButtons(tour)
    }
  ];

  tour.addSteps(tourSteps);

  return tour;
}

export function createTourShop() {
  const tour = useShepherd({
    useModalOverlay: true,
    defaultStepOptions: {
      scrollTo: true,
      modalOverlayOpeningPadding: 5,
      modalOverlayOpeningRadius: 10,
      floatingUIOptions: {
        middleware: [offset(16)]
      }
    }
  });

  const tourSteps: StepOptions[] = [
    {
      attachTo: { element: "#shepherd-0", on: "auto" },
      title: "Shop Table",
      text: "Click on a row to show its description and double click it to add it to the shop to the right.",
      buttons: firstButtons(tour)
    },
    {
      attachTo: { element: "#shepherd-1", on: "auto" },
      title: "Generator Settings",
      text: "From this window you can define your preferred settings for the random shop generator and create custom templates.",
      buttons: defaultButtons(tour)
    },
    {
      attachTo: { element: "#shepherd-2", on: "auto" },
      title: "Random Generator",
      text: "Clicking this button will generate a new random shop, based on the generator settings previously described.",
      buttons: defaultButtons(tour)
    },
    {
      attachTo: { element: ".shepherd-3", on: "auto" },
      title: "Filters",
      text: "Here you can sort the columns and narrow your search with the various filters.",
      buttons: defaultButtons(tour)
    },
    {
      attachTo: { element: "#shepherd-4", on: "auto" },
      title: "Shop List",
      text: "This is where the items you added or randomly generated will be displayed. You can also increase or decrease the number of each individual item.",
      buttons: defaultButtons(tour)
    },
    {
      attachTo: { element: "#shepherd-5", on: "auto" },
      title: "Share",
      text: "Clicking this button will generate a link to your current shop that you can copy and share.",
      buttons: defaultButtons(tour)
    },
    {
      attachTo: { element: "#shepherd-6", on: "auto" },
      title: "Show / Hide Sheet",
      text: "Click here to show or hide the selected item's description.",
      buttons: lastButtons(tour)
    }
  ];

  tour.addSteps(tourSteps);

  return tour;
}

export function createTourNpc() {
  const tour = useShepherd({
    useModalOverlay: true,
    defaultStepOptions: {
      scrollTo: true,
      modalOverlayOpeningPadding: 5,
      modalOverlayOpeningRadius: 10,
      floatingUIOptions: {
        middleware: [offset(16)]
      }
    }
  });

  const tourSteps: StepOptions[] = [
    {
      attachTo: { element: "#shepherd-0", on: "auto" },
      title: "NPC Generator",
      text: "Here you can define your preferred setting for generating a random NPC.",
      buttons: firstButtons(tour)
    },
    {
      attachTo: { element: "#shepherd-1", on: "auto" },
      title: "Random Generator",
      text: "After having picked your settings of choice, click here to generate an NPC.",
      buttons: defaultButtons(tour)
    },
    {
      attachTo: { element: "#shepherd-2", on: "auto" },
      title: "NPC Editor",
      text: "From here you can modify the individual parameters of your NPC. You can also save or delete the NPCs you created.",
      buttons: defaultButtons(tour)
    },
    {
      attachTo: { element: "#shepherd-3", on: "auto" },
      title: "Share",
      text: "Clicking this button will generate a link to your current NPC that you can copy and share.",
      buttons: defaultButtons(tour)
    },
    {
      attachTo: { element: "#shepherd-4", on: "auto" },
      title: "Generated fields",
      text: "Each of these fields can be manually locked, edited or randomly generated.",
      buttons: defaultButtons(tour)
    },
    {
      attachTo: { element: "#shepherd-5", on: "auto" },
      title: "Extra fields",
      text: "These fields can only be manually edited instead.",
      buttons: defaultButtons(tour)
    },
    {
      attachTo: { element: "#shepherd-6", on: "auto" },
      title: "Custom fields",
      text: 'Here you can modify custom fields. Add new ones by clicking the "+" button.',
      buttons: defaultButtons(tour)
    },
    {
      attachTo: { element: "#shepherd-7", on: "auto" },
      text: "This is where the final result of your NPC will be displayed. Click on the icon to the left of the name to open a new page with the fullscreen sheet.",
      buttons: lastButtons(tour)
    }
  ];

  tour.addSteps(tourSteps);

  return tour;
}
