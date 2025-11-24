/**
 * Matomo analytics tracking utilities
 */

declare global {
  interface Window {
    _paq: Array<Array<string | number | object>>;
  }
}

/**
 * Track a custom event in Matomo
 * @param category - The event category (e.g., "Game", "UI", "Navigation")
 * @param action - The event action (e.g., "country_selected", "guess_submitted")
 * @param name - Optional event name for additional context
 * @param value - Optional numeric value associated with the event
 */
export function trackEvent(
  category: string,
  action: string,
  name?: string,
  value?: number
): void {
  if (typeof window !== "undefined" && window._paq) {
    const eventData: Array<string | number> = ["trackEvent", category, action];
    if (name !== undefined) {
      eventData.push(name);
    }
    if (value !== undefined) {
      eventData.push(value);
    }
    window._paq.push(eventData);
  }
}

/**
 * Track a page view in Matomo
 * @param customTitle - Optional custom page title
 */
export function trackPageView(customTitle?: string): void {
  if (typeof window !== "undefined" && window._paq) {
    if (customTitle) {
      window._paq.push(["setDocumentTitle", customTitle]);
    }
    window._paq.push(["trackPageView"]);
  }
}

/**
 * Set a custom dimension in Matomo
 * @param id - The dimension ID
 * @param value - The dimension value
 */
export function setCustomDimension(id: number, value: string): void {
  if (typeof window !== "undefined" && window._paq) {
    window._paq.push(["setCustomDimension", id, value]);
  }
}
