import { html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { Closable } from "../closable";
import { LocalizeController } from "@shoelace-style/localize";

import "@awesome.me/webawesome/dist/components/dialog/dialog.js";
import "@awesome.me/webawesome/dist/components/input/input.js";
import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/icon/icon.js";

import type WaInput from "@awesome.me/webawesome/dist/components/input/input.js";
import type { Leaderboard } from "../leaderboard";

@customElement("element-username")
export default class ElementUsername extends Closable(LitElement) {
  private readonly localize = new LocalizeController(this);
  @property({ type: Object }) leaderboard!: Leaderboard;
  @query("wa-input") username!: WaInput;

  valid: boolean = false;

  render() {
    return html`
      <wa-dialog>
        <wa-input autofocus placeholder=${this.localize.term("username")}></wa-input>
        <wa-button slot="footer" variant="brand" @click="${this.save}" size="small" pill>
          <wa-icon slot="end" name="arrow-right"></wa-icon>
          ${this.localize.term("save")}
        </wa-button>
      </wa-dialog>
    `;
  }

  async save() {
    const inputValue = this.username.value?.trim();
    if (!inputValue || inputValue.length == 0) {
      this.username.hint = this.localize.term("no_username");
      return;
    }
    const userId = await this.leaderboard.getUserId(inputValue);
    if (userId) {
      this.username.hint = this.localize.term("username_taken");
      return;
    }
    this.valid = true;
    this.dispatchEvent(new CustomEvent("username", {
      detail: inputValue
    }));
    this.open = false;
  }

  override canClose(): boolean {
    return this.valid;
  }

  override createRenderRoot() {
    return this;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "element-username": ElementUsername;
  }
}
