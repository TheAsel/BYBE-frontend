import _ from 'lodash';

export const cleanEffect = (description: string) => {
  const effectRegex =
    /@UUID\[Compendium\.([\w\-\s]*)\.([\w\-\s]*)\.([\w\-\s]*)\.([\w\-\s]*): ([\w\s\-'()]*)\](?:{([\w\s']*)})?/g;

  return description.replaceAll(effectRegex, '');
};

export const cleanCompendium = (description: string) => {
  const compendiumRegex =
    /@UUID\[Compendium\.([\w\-\s]*)\.([\w\-\s]*)\.([\w\-\s]*)\.([\w\-\s'.()+]*)\](?:{([\w\s'()+-]*)})?/g;

  const compendium = description.matchAll(compendiumRegex);
  for (const i of compendium) {
    if (i) {
      if (i[5]) {
        description = description.replace(i[0], i[5].toLowerCase());
      } else {
        description = description.replace(i[0], i[4].toLowerCase());
      }
    }
  }
  return description;
};

export const cleanDamage = (description: string) => {
  const damageRegex =
    /@Damage\[\(?([\w+]*)\)?\[(\w*),?(\w+)?\]?,?(\w+)?\[?(\w+)?\]?(?:[\w|:,[\]-]+)?\](?:\{([\w\s,+]*)\})?/g;

  const damage = description.matchAll(damageRegex);
  for (const i of damage) {
    if (i) {
      if (i[6]) {
        description = description.replace(i[0], i[6]);
      } else if (i[4]) {
        description = description.replace(i[0], i[1] + ' ' + i[2] + ' plus ' + i[4] + ' ' + i[5]);
      } else if (i[3]) {
        description = description.replace(i[0], i[1] + ' ' + i[2] + ' ' + i[3]);
      } else {
        description = description.replace(i[0], i[1] + ' ' + i[2]);
      }
    }
  }
  return description;
};

export const cleanTemplate = (description: string) => {
  const templateRegex =
    /@Template\[type:(\w*)\|distance:(\d*)\|?(?:traits:([\w\-,]*))?\](?:{([\w\s-]*)})?/g;

  const template = description.matchAll(templateRegex);
  for (const i of template) {
    if (i) {
      description = description.replace(i[0], i[2] + '-foot ' + i[1]);
    }
  }
  return description;
};

export const cleanSave = (description: string) => {
  const checkRegex =
    /@Check\[type:(\w*)(?:[\w\s\-|]*dc:([\w\s,:+@.()]*))?(?:[\w\s\-,:|()]*basic:(\w*))?[\w\s\-,:|()]*\](?:{([\w\s'+()]*)})?/g;

  const save = description.matchAll(checkRegex);
  for (const i of save) {
    if (i) {
      if (i[2] && Number(i[2])) {
        if (i[3] === 'true') {
          if (i[4]) {
            description = description.replace(
              i[0],
              'DC ' + i[2] + ' basic ' + _.upperFirst(i[1]) + ' ' + i[4]
            );
          } else {
            description = description.replace(i[0], 'DC ' + i[2] + ' basic ' + _.upperFirst(i[1]));
          }
        } else if (i[4]) {
          if ('DC ' + i[2] + ' ' + _.upperFirst(i[1]) === i[4]) {
            description = description.replace(i[0], i[4]);
          } else {
            description = description.replace(
              i[0],
              'DC ' + i[2] + ' ' + _.upperFirst(i[1]) + ' ' + i[4]
            );
          }
        } else {
          description = description.replace(i[0], 'DC ' + i[2] + ' ' + _.upperFirst(i[1]));
        }
      } else if (i[4]) {
        description = description.replace(i[0], _.upperFirst(i[1]) + ' ' + i[4]);
      } else {
        description = description.replace(i[0], _.upperFirst(i[1]));
      }
    }
  }
  return description;
};

export const cleanSymbols = (description: string) => {
  const symbolsRegex = /<span class="action-glyph">(\w)<\/span>/g;

  const symbol = description.matchAll(symbolsRegex);
  for (const i of symbol) {
    if (i) {
      description = description.replaceAll(
        i[0],
        '<span style="font-family: Pathfinder2eActions, sans-serif" class="tw-text-2xl">' +
          i[1] +
          '</span>'
      );
    }
  }
  return description;
};

export const cleanRoll = (description: string) => {
  const rollRegex =
    /\[\[\/b?r \(?{?(\d?\*?\d*d?[\d\s\-+]*\d*)\[?\w*\]?,?\d*}?\)?[\w\s]*\[?#?[\w\s,]*\]\]\]?(?:{([\w\s\-+;]*)})?/g;

  const roll = description.matchAll(rollRegex);
  for (const i of roll) {
    if (i) {
      if (i[2]) {
        description = description.replace(i[0], i[2]);
      } else {
        description = description.replace(i[0], i[1]);
      }
    }
  }
  return description;
};
