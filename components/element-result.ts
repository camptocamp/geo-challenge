import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

import "@awesome.me/webawesome/dist/components/dialog/dialog.js";
import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/icon/icon.js";

import "./element-map";

import { consume } from "@lit/context";
import { gameOver, gameStateContext } from "../game-state";
import { Closable } from "../closable";
import { LocalizeController } from "@shoelace-style/localize";

import "@awesome.me/webawesome/dist/components/progress-bar/progress-bar.js";
import type { GameState } from "../game-state";

@customElement("element-result")
export default class ElementResult extends Closable(LitElement) {
  private readonly localize = new LocalizeController(this);
  @consume({ context: gameStateContext, subscribe: true })
  gameState!: GameState;

  shouldUpdate() {
    return this.gameState.score != null;
  }

  render() {
    const isGameOver = gameOver(this.gameState);
    return html`
      <wa-dialog label="${this.localize.term("round")} ${this.gameState.scores.length}/${this.gameState.roundPerGame}" open>
        <div class="wa-stack wa-gap-2xs">
          <element-map show-result></element-map>
          <div class="wa-body-xl">${Math.round(this.gameState.score)} ${this.localize.term("points")}</div>
          <!-- <wa-progress-bar value="${(this.gameState.score / 5000) * 100}" style="--track-height: 6px;"></wa-progress-bar> -->
          <div>${this.formatDistance(this.gameState.distance)}</div>
        </div>
        <div slot="footer">
          <wa-button variant="brand" size="small" pill data-dialog="close" class="${isGameOver ? 'hidden' : ''}">
            <wa-icon slot="end" name="arrow-right" variant="solid"></wa-icon>
            ${this.localize.term("next_round")}
          </wa-button>
          <wa-button variant="brand" size="small" pill data-dialog="close" class="${isGameOver ? '' : 'hidden'}">
            <wa-icon slot="end" name="trophy" variant="solid"></wa-icon>
            ${this.localize.term("scores")}
          </wa-button>
        </div>
      </wa-dialog>
        `;
  }

  formatDistance(distance: number): string {
    return this.localize.number(distance / 1000, {
      style: "unit",
      unit: "kilometer",
      maximumFractionDigits: 1,
    });
  }

  override createRenderRoot() {
    return this;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "element-result": ElementResult;
  }
}
