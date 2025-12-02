import { html, LitElement } from "lit";
import { customElement, queryAll, state } from "lit/decorators.js";

import "@awesome.me/webawesome/dist/components/dialog/dialog.js";
import "@awesome.me/webawesome/dist/components/card/card.js";
import "@awesome.me/webawesome/dist/components/select/select.js";
import "@awesome.me/webawesome/dist/components/option/option.js";
import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/icon/icon.js";

import { LocalizeController } from "@shoelace-style/localize";
import { Closable } from "../closable";
import type WaCard from "@awesome.me/webawesome/dist/components/card/card.js";

@customElement("element-country-selector")
export default class ElementCountrySelector extends Closable(LitElement) {
  private readonly localize = new LocalizeController(this);
  @state() selectedCountry: string | null = null;

  @queryAll(".country-cards wa-card") countryCards!: WaCard[];

  render() {
    const lang = this.localize.lang();
    return html`
      <wa-dialog without-header>
        <h2>${this.localize.term("choose_country")}</h2>
        <div class="wa-stack">
          <div class="wa-grid country-cards" style="--min-column-size: 20px;">
            <wa-card
              data-country="ch"
              class="wa-stack wa-align-items-center"
              @click=${this.selectCountry}
            >
              <div class="wa-stack wa-align-items-center">
                <div class="flag">🇨🇭</div>
                <div>${this.localize.term("switzerland")}</div>
              </div>
            </wa-card>
            <wa-card
              data-country="fr"
              class="wa-stack wa-align-items-center"
              @click=${this.selectCountry}
            >
              <div class="wa-stack wa-align-items-center">
                <div class="flag">🇫🇷</div>
                <div>${this.localize.term("france")}</div>
              </div>
            </wa-card>
            <wa-card
              data-country="de"
              class="wa-stack wa-align-items-center"
              @click=${this.selectCountry}
            >
              <div class="wa-stack wa-align-items-center">
                <div class="flag">🇩🇪</div>
                <div>${this.localize.term("germany")}</div>
              </div>
            </wa-card>
          </div>

          <wa-select @change="${this.selectLanguage}">
            <wa-option value="fr" ?selected=${lang === "fr"}>Français</wa-option>
            <wa-option value="de" ?selected=${lang === "de"}>Deutsch</wa-option>
            <wa-option value="en" ?selected=${lang === "en"}>English</wa-option>
          </wa-select>
        </div>
        <div slot="footer" class="country-selector-footer">
          <wa-button appearance="plain" @click=${this.showTutorial}>
            <wa-icon name="circle-question"></wa-icon>
          </wa-button>
          <wa-button variant="brand" size="small" pill @click=${this.confirm} ?disabled=${!this.selectedCountry}>
            <wa-icon slot="end" name="arrow-right"></wa-icon>
            ${this.localize.term("play")}
          </wa-button>
        </div>
      </wa-dialog>
    `;
  }

  selectCountry(event: Event) {
    this.countryCards.forEach((card) => card.classList.remove("selected"));
    const target = event.currentTarget as HTMLElement;
    target.classList.add("selected");
    this.selectedCountry = target.getAttribute("data-country");
  }

  confirm() {
    this.open = false;
    this.dispatchEvent(
      new CustomEvent("country-selected", { detail: this.selectedCountry })
    );

  }

  selectLanguage(event: Event) {
    const langCode = (event.target as HTMLSelectElement).value;
    document.documentElement.lang = langCode;
  }

  showTutorial() {
    this.dispatchEvent(new CustomEvent("show-tutorial"));
  }

  firstUpdated(): void {
    this.firstElementChild?.addEventListener("wa-hide", (event) => {
      if (!this.selectedCountry) {
        event.preventDefault();
      }
    });
  }

  override createRenderRoot() {
    return this;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "element-country-selector": ElementCountrySelector;
  }
}
