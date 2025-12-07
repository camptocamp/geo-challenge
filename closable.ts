import { LitElement } from "lit";
import { property } from "lit/decorators.js";
import type { PropertyValues } from "lit";

import type WaDialog from "@awesome.me/webawesome/dist/components/dialog/dialog";

type Constructor<T> = new (...args: any[]) => T;

export declare class ClosableInterface {
  open: boolean;
  dialog: WaDialog;
  canClose(): boolean;
}

// Mixin to add open property and open/close events to a LitElement wrapping a wa-dialog
export const Closable = <T extends Constructor<LitElement>>(superClass: T) => {
  class ClosableElement extends superClass {
    @property({ type: Boolean, reflect: true }) open = false;

    get dialog(): WaDialog {
      return this.firstElementChild as WaDialog;
    }

    canClose(): boolean {
      return true;
    }

    protected updated(changedProperties: PropertyValues): void {
      if (changedProperties.has("open")) {
        if (this.dialog.open !== this.open) {
          this.dialog.open = this.open;
        }
      }
    }

    protected firstUpdated(): void {
      this.dialog.addEventListener("wa-hide", (originalEvent) => {
        if (this.dialog !== originalEvent.target) {
          return;
        }
        if (originalEvent.defaultPrevented) {
          return;
        }
        // If open is already false, this was triggered programmatically - allow it
        // Otherwise check canClose() for user-initiated close (Escape key, overlay click)
        if (this.open && !this.canClose()) {
          originalEvent.preventDefault();
          originalEvent.stopPropagation();
          return;
        }
        this.open = false;
        this.dispatchEvent(new CustomEvent("close"));
      });
      this.dialog.addEventListener("wa-show", (originalEvent) => {
        if (this.dialog !== originalEvent.target) {
          return;
        }
        if (originalEvent.defaultPrevented) {
          return;
        }
        this.open = true;
        this.dispatchEvent(new CustomEvent("open"));
      });
    }
  }
  return ClosableElement as Constructor<ClosableInterface> & T;
};
