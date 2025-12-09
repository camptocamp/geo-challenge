import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

import "@awesome.me/webawesome/dist/components/dialog/dialog.js";
import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/icon/icon.js";

import { Closable } from "../closable";
import { LocalizeController } from "@shoelace-style/localize";

@customElement("element-about")
export default class ElementAbout extends Closable(LitElement) {
  private readonly localize = new LocalizeController(this);
  render() {
    return html`
      <wa-dialog label="${this.localize.term("about_us")}">
        ${unsafeHTML(this.localize.term("about_content"))}

        <div slot="footer">
          <wa-button variant="brand" appearance="outlined" size="small" data-dialog="close" pill>
            <wa-icon slot="end" name="arrow-right"></wa-icon>
            ${this.localize.term("close")}
          </wa-button>
        </div>
      </wa-dialog>
    `;
  }

  override createRenderRoot() {
    return this;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "element-about": ElementAbout;
  }
}
