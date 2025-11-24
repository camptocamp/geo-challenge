import { customElement, query, state } from "lit/decorators.js";
import { provide } from "@lit/context";
import { randomPositionInCountry } from "../utils";
import { html, LitElement } from "lit";
import { LocalizeController } from "@shoelace-style/localize";

import CesiumSphereCamera from "@geoblocks/cesium-sphere-camera";

import "@awesome.me/webawesome/dist/components/button/button.js";

import "@geoblocks/cesium-compass-bar";
import "./element-guess";
import "./element-result";
import "./element-country-selector";
import "./element-scores";
import "./element-about";

import {addBonusModelClickCallback, createCesiumWidget, setCameraPosition} from "../cesium";
import {
  endRound,
  gameStateContext,
  roundInProgress,
  startGame,
  startRound,
} from "../game-state";
import { trackEvent, trackPageView } from "../matomo";
import type { Coordinate } from "ol/coordinate";
import type { GameState } from "../game-state";
import type { CesiumWidget } from "@cesium/engine";
import type ElementResult from "./element-result";
import type ElementScores from "./element-scores";
import type ElementAbout from "./element-about";

@customElement("element-app")
export class ElementApp extends LitElement {
  private readonly localize = new LocalizeController(this);
  @provide({ context: gameStateContext })
  @state()
  gameState: GameState = {
    country: null,
    cameraPosition: null,
    guessedPosition: null,
    score: null,
    distance: null,
    scores: [],
    roundPerGame: 3,
  };
  private viewer: CesiumWidget | null = null;

  @query('element-result') resultElement!: ElementResult;
  @query('element-scores') scoresElement!: ElementScores;
  @query('element-about') aboutElement!: ElementAbout;

  updated() {
    if (this.gameState.country !== null && !roundInProgress(this.gameState)) {
      // First game round after country selection
      this.gameState = startRound(
        this.gameState,
        randomPositionInCountry(this.gameState.country)
      );
      setCameraPosition(this.viewer!, this.gameState.cameraPosition);
    }
  }

  render() {
    return html`
      <element-about></element-about>
      <element-country-selector .open="${this.gameState.country == null}"
        @country-selected="${this.handleCountrySelected}"
      ></element-country-selector>
      <div id="cesium"></div>
      <div class="header">
        <a href="https://camptocamp.com/" target="_blank" class="header-logo">
          <img src="./images/C2C_2022_RGB_square_logo.svg" alt="C2C Logo" />
        </a>
        <cesium-compass-bar></cesium-compass-bar>
        <div class="buttons">
          <wa-button variant="brand" pill @click=${this.openAboutDialog}>
            <wa-icon slot="end" name="arrow-right"></wa-icon>
            ${this.localize.term("about_us")}
          </wa-button>
          <wa-button variant="brand" pill @click=${this.newGame}>
            <wa-icon name="earth-europe"></wa-icon>
          </wa-button>
        </div>
      </div>
      <element-guess ?hidden="${!roundInProgress(this.gameState)}" @guess="${this.handleGuess}"></element-guess>
      <element-result @close="${this.handleCloseResult}" @gameOver="${this.handleGameOver}"></element-result>
      <element-scores @close="${this.handleCloseScores}"></element-scores>
    `;
  }

  async firstUpdated() {
    this.viewer = await createCesiumWidget(
      this.querySelector<HTMLDivElement>("#cesium")!
    );
    addBonusModelClickCallback(this.viewer, () => {
      this.gameState.score = 5;
    });

    const sphereMode = new CesiumSphereCamera(this.viewer);
    sphereMode.active = true;
    const compassBar = this.querySelector("cesium-compass-bar");
    compassBar.scene = this.viewer.scene;
  }

  handleCountrySelected(event: CustomEvent) {
    this.gameState = {
      ...this.gameState,
      country: event.detail,
    };

    trackEvent("Game", "country_selected", event.detail);
    trackEvent("Game", "language_selected", document.documentElement.lang);
  }

  newGame() {
    // if game in progress, confirm
    // reload the page for simplicity
    if (this.gameState.scores.length > 0) {
      const confirmNewGame = confirm("A game is already in progress. Do you want to start a new game?");
      if (!confirmNewGame) {
        return;
      }
    }
    window.location.reload();
  }

  openAboutDialog() {
    this.aboutElement.open = true;
    trackPageView("About Dialog");
  }

  handleGuess(event: CustomEvent<Coordinate>) {
    this.resultElement.open = true;
    // FIXME: hide element-guess ?
    this.gameState = endRound(this.gameState, event.detail);
  }

  handleGameOver() {
    this.scoresElement.open = true;
  }

  handleCloseResult() {
    if (roundInProgress(this.gameState)) {
      // Start a new round
      this.gameState = startRound(
        this.gameState,
        randomPositionInCountry(this.gameState.country)
      );
      setCameraPosition(this.viewer!, this.gameState.cameraPosition);
    }
  }

  handleCloseScores() {
    // FIXME: choose country again ?
    this.gameState = startGame(this.gameState);
  }

  override createRenderRoot() {
    return this;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "element-app": ElementApp;
  }
}
