import { html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { Closable } from "../closable";
import { LocalizeController } from "@shoelace-style/localize";

import "@awesome.me/webawesome/dist/components/dialog/dialog.js";
import "@awesome.me/webawesome/dist/components/input/input.js";
import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/icon/icon.js";
import "@awesome.me/webawesome/dist/components/checkbox/checkbox.js";

import type WaInput from "@awesome.me/webawesome/dist/components/input/input.js";
import type WaCheckbox from "@awesome.me/webawesome/dist/components/checkbox/checkbox.js";
import type { Leaderboard } from "../leaderboard";

@customElement("element-username")
export default class ElementUsername extends Closable(LitElement) {
  private readonly localize = new LocalizeController(this);
  @property({ type: Object }) leaderboard!: Leaderboard;
  @query("wa-input[name='username']") username!: WaInput;
  @query("wa-input[name='email']") email!: WaInput;
  @query("wa-checkbox[name='wantContact']") wantContact!: WaCheckbox;

  valid: boolean = false;

  render() {
    return html`
      <wa-dialog>
        <form class="input-validation-required">
          <wa-input autofocus label=${this.localize.term("username")} name="username" required></wa-input>
          <br/>
          <wa-input label=${this.localize.term("email")} name="email" type="email" required></wa-input>
          <br/>
          ${unsafeHTML(this.localize.term("contact_me_content"))}
          <wa-checkbox name="wantContact">${this.localize.term("want_contact")}</wa-checkbox>
        </form>
        <wa-button slot="footer" variant="brand" @click="${this.save}" size="small" pill>
          <wa-icon slot="end" name="arrow-right"></wa-icon>
          ${this.localize.term("save")}
        </wa-button>
      </wa-dialog>
    `;
  }

  async save() {
     const usernameValue = this.username.value?.trim();
     if (!usernameValue || usernameValue.length == 0) {
       this.username.hint = this.localize.term("no_username");
       return;
     }
     const emailValue = this.email.value?.trim();
     if (!emailValue || emailValue.length == 0) {
       this.email.hint = this.localize.term("email_required");
       return;
     }
     const userId = await this.leaderboard.getUserId(usernameValue);
     if (userId) {
       this.username.hint = this.localize.term("username_taken");
       return;
     }
     // Validation passed - set valid flag and dispatch event
     this.valid = true;
     this.dispatchEvent(new CustomEvent("username", {
       detail: {
         username: usernameValue,
         email: emailValue,
         wantContact: this.wantContact.checked || false
       }
     }));
     // Reset valid flag and allow dialog to close
     await this.requestUpdate();
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
