/**
 * services/identity/DemoConsentProvider.js
 *
 * Always answers "consent granted," instantly, with no disclosure and
 * no real affirmative action from anyone. This is NOT consent capture
 * — it exists purely so the linking flow can be exercised end-to-end
 * on fixture data. A production ConsentProvider (a real disclosure
 * screen plus an affirmative parent/guardian confirmation, with a
 * stored consent record) is a separate, still-open piece of work —
 * see ConsentProvider.js's own doc comment, and this project's
 * CHANGELOG for why it hasn't been built.
 */

import { ConsentProvider } from './ConsentProvider.js';

export class DemoConsentProvider extends ConsentProvider {
  async hasConsent() {
    return true;
  }

  async requestConsent() {
    return true;
  }
}
