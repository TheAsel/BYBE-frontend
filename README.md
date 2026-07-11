# BYBE - Frontend

<p align="center">
  <a href="https://bybe.app/" target="_blank">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/TheAsel/BYBE-frontend/HEAD/.github/logo_dark.png">
      <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/TheAsel/BYBE-frontend/HEAD/.github/logo_light.png">
      <img alt="BYBE" src="https://raw.githubusercontent.com/TheAsel/BYBE-frontend/HEAD/.github/logo_light.png" width="450" height="100" style="max-width: 100%;">
    </picture>
  </a>
</p>

> Beyond Your Bestiary Explorer (BYBE) provides tools to help Pathfinder 2e and Starfinder 2e Game Masters. Built on top of the [BYBE - Backend](https://github.com/RakuJa/BYBE-backend/)

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#-ai-notice">AI Notice</a></li>
    <li><a href="#-download">Download</a></li>
    <li><a href="#-features">Features</a></li>
    <li>
      <a href="#️-installation">Installation</a>
      <ul>
        <li><a href="#requirements">Requirements</a></li>
        <li><a href="#local">Local</a></li>
        <li><a href="#docker">Docker</a></li>
      </ul>
    </li>
    <li><a href="#️-support-me">Support Me</a></li>

  </ol>
</details>

## 🤖 AI Notice

This project does NOT make use of AI to generate the code. Everything in this repository, the good (and especially the bad!), was written by me.

The emojis used in the commits are an inside joke between me and my friend [RakuJa](https://github.com/RakuJa), using the [gitmoji](https://gitmoji.dev/) "standard". Don't take them too seriously.

## 📥 Download

BYBE is also available offline! We currently support Windows, MacOS and Linux (AppImage). Click on the button below to download the application for your preferred platform.

<p align="center">
  <a href="https://github.com/RakuJa/BYBE-Portable/releases/latest" target="_blank">
    <img src="https://gist.githubusercontent.com/cxmeel/0dbc95191f239b631c3874f4ccf114e2/raw/download-compact.svg" alt="Download" style="max-width: 100%;">
  </a>
</p>

## ✨ Features

- Encounter Builder
  - Browse and filter a list of all creatures and hazards
  - Balance encounters based on your party size and level
  - Generate random encounters based on your requirements
  - Run your encounters with the tracker
- Shop Generator
  - Browse and filter a list of all items
  - Generate random shops with filters and templates
- NPC Generator
  - Randomly generate NPC features (name, class, job, etc.)
  - Manually describe a character description, personality and more
  - Generate a sheet for your character
- Fast, mobile friendly, light/dark theme, accessible
- More to come...

![Screenshot of the Encounter Builder page of BYBE](https://raw.githubusercontent.com/TheAsel/BYBE-frontend/HEAD/.github/encounter_builder.png)

<p align="center">
  Encounter Builder
</p>

---

<br/>

![Screenshot of the Tracker page of BYBE](https://raw.githubusercontent.com/TheAsel/BYBE-frontend/HEAD/.github/encounter_tracker.png)

<p align="center">
    Tracker
</p>

---

<br/>

![Screenshot of the Shop Generator page of BYBE](https://raw.githubusercontent.com/TheAsel/BYBE-frontend/HEAD/.github/shop_generator.png)

<p align="center">
  Shop Generator
</p>

---

<br/>

![Screenshot of the NPC Generator page of BYBE](https://raw.githubusercontent.com/TheAsel/BYBE-frontend/HEAD/.github/npc_generator.png)

<p align="center">
  NPC Generator
</p>

## 🖥️ Installation

### Requirements

Built using:

- [Bun](https://bun.com/)
- [Vue.js](https://vuejs.org/)
- [Quasar](https://quasar.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shepherd.js](https://www.shepherdjs.dev/)

### Local

1. Install [Bun](https://bun.com/) on your machine.
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

6. To instead deploy the production build, run:

```
bun run build && bun run start
```

### Docker

Docker images are available [HERE](https://github.com/theasel/BYBE-frontend/pkgs/container/bybe-frontend). If you want to build them yourself:

1. Download the [latest release](https://github.com/TheAsel/BYBE-frontend/releases/latest) or clone this repository:

```
git clone https://github.com/TheAsel/BYBE-frontend
```

2. Navigate to the project's main directory
3. Build the docker image:

```
docker build --build-arg API_URL=https://api.bybe.app -t bybe-frontend .
```

4. Run the docker image:

```
docker run --name bybe-frontend -p 3000:8080 --rm bybe-frontend
```

## ❤️ Support me

If you like this tool, consider supporting me:

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/B0B0Q8YOL)

Also consider supporting [RakuJa](https://github.com/RakuJa), the backend developer. Thank you!

<p align="right"><a href="#bybe---frontend">🔼 Back to top</a></p>
