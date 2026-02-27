/* eslint-disable no-console */

export type TelemetryEvent =
  | 'share_received'
  | 'parse_success'
  | 'parse_failure'
  | 'confirm_shown'
  | 'save_success'
  | 'save_failure'
  | 'open_video'
  | 'category_actions';

export function trackEvent(event: TelemetryEvent, payload?: Record<string, unknown>): void {
  console.log(`[telemetry] ${event}`, payload ?? {});
}
