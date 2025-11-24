# geo-challenge

This project is a web-based geography guessing game. The user is shown a fixed location in a 3D map view and has to guess where it is on a 2D map.

[online demo](https://geo-challenge.labs.camptocamp.com/)

## Game Features

- **Country Selection**: Players can choose a country to play in. The game will then present locations within the selected country.
- **Leaderboard**: The game includes an online leaderboard per country.
- **i18n Support**: The game is translated into English, French, and German.

## Building and Running

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository.
2. Install the dependencies:

    ```bash
    npm install
    ```

### Running the Development Server

To run the application locally with a development server and hot-reloading, use the following command:

```bash
npm start
```

This will start the Vite development server, and you can access the application at `http://localhost:5173`.

### Building for Production

To build the application for production, which creates an optimized and minified version of the code, run:

```bash
npm run build
```

The output will be placed in the `dist` directory.

## Deployment

[ArgoCD](hhttps://argocd.apps.green.gs-ch-prod.camptocamp.com/applications?proj=plg-geo-challenge-prod)

Pipeline:

1. On push to the `master` branch, GitHub Actions automatically builds and publishes a Docker image to `ghcr.io/camptocamp/geo-challenge:latest`.
2. `camptocamp/argocd-gs-plg-apps:update-geo-challenge-image.yaml` is triggered to update the image in the argocd configuration.

## Libraries used

- [Lit](https://lit.dev/) + [Lit context](https://lit.dev/docs/data/context/)
- [CesiumJS](https://cesium.com/platform/cesiumjs/)
- [OpenLayers](https://openlayers.org/)
- [Web Awesome](https://webawesome.com/)
- [Shoelace localize](https://github.com/shoelace-style/localize/)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
