/**
 * services/identity/IdentityProvider.js
 *
 * The contract for "who is this authenticated user" — deliberately
 * the ONLY thing an identity provider is responsible for. It does not
 * know what a student is, does not know about PINs or invitation
 * links, and does not touch Firestore. That separation is the whole
 * point of this architecture: Google answers "who is this user,"
 * Bloom Labs (via StudentIdentityService) answers "which student(s)
 * is this user linked to." Mixing those two responsibilities into one
 * class is exactly what would make adding Microsoft Sign-In, Parent
 * OTP, or School SSO later require touching the Student Portal itself
 * — this interface exists so it never does.
 *
 * A production implementation (GoogleIdentityProvider, wrapping
 * Firebase Auth) is intentionally not part of this phase — see
 * DemoIdentityProvider.js for the fixture-data stand-in used to build
 * and review this whole architecture today. Swapping one for the
 * other later is the *only* change needed; every consumer of this
 * interface (StudentIdentityService, and everything above it) only
 * ever calls these four methods, never anything Firebase-specific.
 */

export class IdentityProvider {
  /** Resolves to a plain { id, displayName, email } object for the signed-in user, or throws/rejects if sign-in fails or is cancelled. */
  // eslint-disable-next-line no-unused-vars
  async signIn() {
    throw new Error('IdentityProvider.signIn() must be implemented by a subclass');
  }

  async signOut() {
    throw new Error('IdentityProvider.signOut() must be implemented by a subclass');
  }

  /** Returns the current provider user synchronously (no pending sign-in), or null if nobody is signed in. */
  getCurrentProviderUser() {
    throw new Error('IdentityProvider.getCurrentProviderUser() must be implemented by a subclass');
  }

  /** Registers a callback fired whenever the signed-in user changes (sign-in, sign-out) — mirrors Firebase Auth's own onAuthStateChanged shape, but any provider can implement it however it needs to. */
  // eslint-disable-next-line no-unused-vars
  onAuthStateChange(callback) {
    throw new Error('IdentityProvider.onAuthStateChange() must be implemented by a subclass');
  }
}
