/**
 * services/identity/ConsentProvider.js
 *
 * The contract for parental/guardian consent — deliberately a
 * placeholder. Per explicit direction, this phase does NOT implement
 * real consent capture: no disclosure screen, no affirmative "I am
 * this child's parent/guardian" step, no consent record. That is a
 * distinct, still-open compliance question (see this project's
 * CHANGELOG for the full reasoning around Bloom Labs' student data
 * generally) — separate from, and not resolved by, this architecture
 * work.
 *
 * The interface exists now specifically so that building real consent
 * capture later is a matter of implementing this one class — swapping
 * DemoConsentProvider for a real one — without touching
 * StudentIdentityService, the Student Portal, or any linking UI. Every
 * call site in this architecture already checks consent through this
 * interface, even though today's implementation (DemoConsentProvider)
 * always answers "yes" — the check exists, it's just not load-bearing
 * yet.
 *
 * IMPORTANT: DemoConsentProvider's automatic approval must not be
 * mistaken for a real gate. Nothing in this phase should be read as
 * "consent has been handled" — it has not.
 */

export class ConsentProvider {
  /** Resolves true if consent is already on file for this provider user + student, false otherwise. */
  // eslint-disable-next-line no-unused-vars
  async hasConsent(providerUserId, studentRef) {
    throw new Error('ConsentProvider.hasConsent() must be implemented by a subclass');
  }

  /**
   * Resolves true if consent was captured (a real implementation would
   * show a disclosure + affirmative parent/guardian confirmation here);
   * false if declined or abandoned. Never assume this method's mere
   * existence means consent is meaningfully being asked for — check
   * the concrete provider in use.
   */
  // eslint-disable-next-line no-unused-vars
  async requestConsent(providerUserId, studentRef) {
    throw new Error('ConsentProvider.requestConsent() must be implemented by a subclass');
  }
}
