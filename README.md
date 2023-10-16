# BYBE - Frontend

> Beyond Your Bestiary Explorer (BYBE) provides tools to help Pathfinder 2e Game Masters. Built on top of the [BYBE - Backend](https://github.com/RakuJa/BYBE/)

<p align="center">
  <a href="https://pf2e-encounter-manager.fly.dev/">
    <img src="https://i.imgur.com/xPMRk1u.png" width="1080" alt="BYBE Encounter Builder">
  </a>
</p>

## Features

- Browse and filter a list of all creatures.
- Balance encounters based on your party size and level.
- Generate random encounters based on your requirements.
- Mobile friendly, light/dark theme, accessible.
- More to come...

## Requirements

Built using:

- [Bun](https://bun.sh/)
- [Vue.js](https://vuejs.org/)
- [Quasar](https://quasar.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

## Installation guide

1. Install [Bun](https://bun.sh/) on your machine.
2. Download the [latest release](https://github.com/TheAsel/BYBE-frontend/releases/latest) or clone this repository:

```
git clone https://github.com/TheAsel/BYBE-frontend
```

3. Navigate to the project's main directory.
4. Install the dependencies:

```
bun install
```

5. Run the webpage in development mode:

```
bun run dev
```

6. To instead deploy the production build (needs [Quasar CLI](https://quasar.dev/start/quasar-cli/)), run:

```
bun run build
quasar serve dist/spa --history
```
