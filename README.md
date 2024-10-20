# BYBE - Frontend

<p align="center">
  <a href="https://bybe.fly.dev/" target="_blank">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/TheAsel/BYBE-frontend/HEAD/.github/logo_dark.png">
      <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/TheAsel/BYBE-frontend/HEAD/.github/logo_light.png">
      <img alt="BYBE" src="https://raw.githubusercontent.com/TheAsel/BYBE-frontend/HEAD/.github/logo_light.png" width="450" height="100" style="max-width: 100%;">
    </picture>
  </a>
</p>

> Beyond Your Bestiary Explorer (BYBE) provides tools to help Pathfinder 2e Game Masters. Built on top of the [BYBE - Backend](https://github.com/RakuJa/BYBE/)

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
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

## 📥 Download

BYBE is also available offline! We currently support Windows and Linux (AppImage). Click on the button below to download the application for your preferred platform.

<p align="center">
  <a href="https://github.com/RakuJa/BYBE-Portable/releases/latest" target="_blank">
    <img src="https://gist.githubusercontent.com/cxmeel/0dbc95191f239b631c3874f4ccf114e2/raw/download-compact.svg" alt="Download" style="max-width: 100%;">
  </a>
</p>

## ✨ Features

- Encounter Builder
  - Browse and filter a list of all creatures
  - Balance encounters based on your party size and level
  - Generate random encounters based on your requirements
- Shop Generator
  - Browse and filter a list of all items
  - Generate random shops with filters and templates
- Fast, mobile friendly, light/dark theme, accessible
- More to come...

![Screenshot of the Encounter Builder page of BYBE](https://raw.githubusercontent.com/TheAsel/BYBE-frontend/HEAD/.github/encounter_builder.png)

<p align="center">
  Encounter Builder 
</p>

---

<br/>

![Screenshot of the Shop Generator page of BYBE](https://raw.githubusercontent.com/TheAsel/BYBE-frontend/HEAD/.github/shop_generator.png)

<p align="center">
  Shop Generator
</p>

## 🖥️ Installation

### Requirements

Built using:

- [Node.js](https://nodejs.org/)
- [Vue.js](https://vuejs.org/)
- [Quasar](https://quasar.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

### Local

1. Install [Node.js](https://nodejs.org/) on your machine.
2. Download the [latest release](https://github.com/TheAsel/BYBE-frontend/releases/latest) or clone this repository:

```
git clone https://github.com/TheAsel/BYBE-frontend
```

3. Navigate to the project's main directory.
4. Install the dependencies:

```
npm install
```

5. Run the webpage in development mode:

```
npm run dev
```

6. To instead deploy the production build, run:

```
npm run build && npm run start
```

### Docker

1. Download the [latest release](https://github.com/TheAsel/BYBE-frontend/releases/latest) or clone this repository:

```
git clone https://github.com/TheAsel/BYBE-frontend
```

2. Navigate to the project's main directory
3. Build the docker image:

```
docker build -t bybe-frontend .
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
