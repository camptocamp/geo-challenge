/**
 * Matomo Tag Manager analytics tracking utilities
 */

declare global {
  interface Window {
    _mtm: Array<Record<string, unknown>>;
  }
}

/**
 * Track a custom event in Matomo Tag Manager
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
  if (typeof window !== "undefined" && window._mtm) {
    const eventData: Record<string, unknown> = {
      event: "trackEvent",
      eventCategory: category,
      eventAction: action,
    };
    if (name !== undefined) {
      eventData.eventName = name;
    }
    if (value !== undefined) {
      eventData.eventValue = value;
    }
    window._mtm.push(eventData);
  }
}

/**
 * Track a page view in Matomo Tag Manager
 * @param customTitle - Optional custom page title
 */
export function trackPageView(customTitle?: string): void {
  if (typeof window !== "undefined" && window._mtm) {
    const eventData: Record<string, unknown> = {
      event: "trackPageView",
    };
    if (customTitle) {
      eventData.documentTitle = customTitle;
    }
    window._mtm.push(eventData);
  }
}

/**
 * Set a custom dimension in Matomo Tag Manager
 * @param id - The dimension ID
 * @param value - The dimension value
 */
export function setCustomDimension(id: number, value: string): void {
  if (typeof window !== "undefined" && window._mtm) {
    window._mtm.push({
      event: "setCustomDimension",
      dimensionId: id,
      dimensionValue: value,
    });
  }
}
