import posthog from 'posthog-js';

/**
 * PostHog project key (starts with phc_). It's a public key, safe to ship in the page.
 * Empty means analytics stays off.
 */
const POSTHOG_KEY = '';
/** 'https://eu.i.posthog.com' or 'https://us.i.posthog.com', matching the project's region. */
const POSTHOG_HOST = 'https://eu.i.posthog.com';

let started = false;

/** Starts PostHog on the live site only, without cookies, so no consent banner is needed. */
export function startAnalytics() {
  if (started || !POSTHOG_KEY || typeof window === 'undefined') return;
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1' || /^192\.168\./.test(host)) return;
  started = true;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    // Nothing stored on the visitor's device: no cookies, no local storage.
    persistence: 'memory',
    // Anonymous visitors only; no person profiles.
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
  });
}

type Props = Record<string, string | number | boolean>;

/** Records one moment in the deck (a draw, a keep, dark mode...). Does nothing if analytics is off. */
export function track(event: string, props?: Props) {
  if (!started) return;
  try {
    posthog.capture(event, props);
  } catch {
    /* analytics must never break the deck */
  }
}
