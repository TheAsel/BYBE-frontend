import type { VTourCallbacks, VTourOptions } from 'vue3-tour';

export function getTourOptions() {
  return {
    highlight: true,
    labels: {
      buttonSkip: 'Close Help',
      buttonPrevious: 'Previous',
      buttonNext: 'Next',
      buttonStop: 'Finish'
    }
  } as VTourOptions;
}

export function getTourCallbacks(start: () => void, stop: () => void) {
  return {
    onStart: start,
    onStop: stop
  } as VTourCallbacks;
}
