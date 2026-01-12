import { html, LitElement } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { gameScore, gameStateContext } from "../game-state";
import { consume } from "@lit/context";

import "@awesome.me/webawesome/dist/components/dialog/dialog.js";
import "@awesome.me/webawesome/dist/components/icon/icon.js";
import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/input/input.js";

import "./element-leaderboard";
import "./element-username";

import { Closable } from "../closable";
import { LocalizeController } from "@shoelace-style/localize";
import { betterScore, Leaderboard } from "../leaderboard";
import { getUserInfo, setUsername } from "../userinfo";
import type { PropertyValues } from "lit";
import type { GameState } from "../game-state";
import type { ScoreEntry } from "../leaderboard";
import type { UserInfo } from "../userinfo";
import type ElementUsername from "./element-username";
import type WaButton from "@awesome.me/webawesome/dist/components/button/button.js";

@customElement("element-scores")
export default class ElementScores extends Closable(LitElement) {
  private readonly localize = new LocalizeController(this);
  @consume({ context: gameStateContext, subscribe: true })
  @state()
  gameState!: GameState;

  @state()
  userInfo: UserInfo = getUserInfo();

  @state()
  scores: ScoreEntry[] = [];

  @state()
  allowedToSubmitScore: boolean = false;

  @query("element-username") usernameElement!: ElementUsername;
  @query(".save_score") saveScoreButton!: WaButton;

  private leaderboard!: Leaderboard;

  async willUpdate(changedProperties: PropertyValues) {
    if (changedProperties.has("gameState")) {
      if (this.gameState.country && this.leaderboard?.collection !== this.gameState.country) {
        this.leaderboard = new Leaderboard(this.gameState.country, betterScore);
        this.scores = await this.leaderboard.getLeaderboard();
      }
      if (this.leaderboard && this.userInfo) {
        this.allowedToSubmitScore = await this.leaderboard.allowedToSubmitScore(this.userInfo, this.gameState);
      }
    }
  }

  render() {
    return html`
      <wa-dialog label="${this.localize.term("game_over")}">
        <div class="wa-stack wa-gap-xl">
          <h4>
            ${this.localize.term("your_score")}: <span style="color: var(--wa-color-brand)">${gameScore(this.gameState)}</span>
          </h4>
          <!-- FIXME: check allowedToSubmitScore -->
          <wa-button class="save_score" size="small" pill variant="brand" @click="${this.saveScore}" ?disabled="${!!this.userInfo.username && !this.allowedToSubmitScore}">
            <wa-icon slot="end" name="arrow-right"></wa-icon>
            ${this.localize.term("submit_score")}
          </wa-button>
          <element-leaderboard .scores="${this.scores}" .username="${this.userInfo.username}"></element-leaderboard>
        </div>
        <wa-button slot="footer" variant="brand" appearance="outlined" size="small" pill data-dialog="close">
          <wa-icon slot="end" name="arrow-right"></wa-icon>
          ${this.localize.term("new_game")}
        </wa-button>
      </wa-dialog>
      <element-username .leaderboard="${this.leaderboard}" @username="${this.handleUsernameSet}"></element-username>
    `;
  }

  private async handleUsernameSet(event: CustomEvent) {
    const { username, email, wantContact } = event.detail;
    this.userInfo = { ...this.userInfo, username };
    setUsername(username);
    this.allowedToSubmitScore = await this.leaderboard.allowedToSubmitScore(this.userInfo, this.gameState);
    await this.saveScoreToLeaderboard();

    // Save email if provided
    if (email) {
      await this.leaderboard.saveEmail(this.userInfo.userId, email, wantContact);
    }
  }

  private async saveScore() {
    if (this.userInfo.username === null) {
      this.usernameElement.open = true;
      // will continue in handleUsernameSet
    } else {
      await this.saveScoreToLeaderboard();
    }
  }

  private async saveScoreToLeaderboard() {
    if (this.allowedToSubmitScore) {
      await this.leaderboard.saveScore(this.userInfo.userId, this.userInfo.username, gameScore(this.gameState));
      this.allowedToSubmitScore = await this.leaderboard.allowedToSubmitScore(this.userInfo, this.gameState);
      // refresh scores after saving
      this.scores = await this.leaderboard.getLeaderboard();
    }
  }

  override createRenderRoot() {
    return this;
  }

  override canClose(): boolean {
    return !this.usernameElement.open;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "element-scores": ElementScores;
  }
}
