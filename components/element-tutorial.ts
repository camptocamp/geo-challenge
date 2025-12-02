import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";

import "@awesome.me/webawesome/dist/components/dialog/dialog.js";
import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/icon/icon.js";

import { LocalizeController } from "@shoelace-style/localize";
import { Closable } from "../closable";

interface TutorialStep {
  titleKey: string;
  descriptionKey: string;
  image: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    titleKey: "tutorial_step1_title",
    descriptionKey: "tutorial_step1_description",
    image: "./images/tutorial/step1-country-selector.png",
  },
  {
    titleKey: "tutorial_step2_title",
    descriptionKey: "tutorial_step2_description",
    image: "./images/tutorial/step2-explore.png",
  },
  {
    titleKey: "tutorial_step3_title",
    descriptionKey: "tutorial_step3_description",
    image: "./images/tutorial/step3-guess.png",
  },
  {
    titleKey: "tutorial_step4_title",
    descriptionKey: "tutorial_step4_description",
    image: "./images/tutorial/step4-result.png",
  },
];

@customElement("element-tutorial")
export default class ElementTutorial extends Closable(LitElement) {
  private readonly localize = new LocalizeController(this);
  @state() currentStep = 0;

  render() {
    const step = TUTORIAL_STEPS[this.currentStep];
    const isLastStep = this.currentStep === TUTORIAL_STEPS.length - 1;
    const isFirstStep = this.currentStep === 0;

    return html`
      <wa-dialog without-header class="tutorial-dialog">
        <div class="wa-stack wa-align-items-center tutorial-content">
          <div class="wa-cluster wa-gap-xs">
            ${TUTORIAL_STEPS.map(
              (_, i) => html`
                <span
                  class="step-dot ${i === this.currentStep ? "active" : ""} ${i < this.currentStep ? "completed" : ""}"
                ></span>
              `
            )}
          </div>

          <div class="wa-stack wa-gap-s wa-align-items-center">
            <img
              class="tutorial-image"
              src="${step.image}"
              alt="${this.localize.term(step.titleKey)}"
            />
            <h2>${this.localize.term(step.titleKey)}</h2>
            <p>${this.localize.term(step.descriptionKey)}</p>
          </div>
        </div>

        <div slot="footer" class="wa-split">
          ${!isFirstStep
            ? html`
                <wa-button
                  variant="brand"
                  appearance="outlined"
                  size="small"
                  pill
                  @click=${this.previousStep}
                >
                  <wa-icon slot="start" name="arrow-left"></wa-icon>
                  ${this.localize.term("tutorial_back")}
                </wa-button>
              `
            : html`<span></span>`}

          ${!isLastStep
            ? html`
                <wa-button
                  variant="brand"
                  size="small"
                  pill
                  @click=${this.nextStep}
                >
                  ${this.localize.term("tutorial_next")}
                  <wa-icon slot="end" name="arrow-right"></wa-icon>
                </wa-button>
              `
            : html`
                <wa-button
                  variant="brand"
                  size="small"
                  pill
                  @click=${this.finish}
                >
                  ${this.localize.term("tutorial_start")}
                  <wa-icon slot="end" name="play"></wa-icon>
                </wa-button>
              `}
        </div>
      </wa-dialog>
    `;
  }

  private nextStep() {
    if (this.currentStep < TUTORIAL_STEPS.length - 1) {
      this.currentStep++;
    }
  }

  private previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  private finish() {
    this.currentStep = 0;
    this.open = false;
    this.dispatchEvent(new CustomEvent("tutorial-complete"));
  }

  override createRenderRoot() {
    return this;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "element-tutorial": ElementTutorial;
  }
}
