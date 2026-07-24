/**
 * services/identity/DemoIdentityProvider.js
 *
 * Fixture-data implementation of IdentityProvider — simulates a
 * parent's Google sign-in without touching real Firebase Auth. Signing
 * in "succeeds" immediately with a fixed demo identity; there's no
 * real account, no real credential, and this must never be mistaken
 * for a working auth mechanism. A production GoogleIdentityProvider
 * (wrapping Firebase Auth's GoogleAuthProvider, the same pattern
 * services/authService.js already uses for teachers) is not part of
 * this phase — swapping this class for that one is the only change
 * StudentIdentityService's callers should ever need.
 */

import { IdentityProvider } from './IdentityProvider.js';

const DEMO_PROVIDER_USER = {
  id: 'demo-parent-google-uid',
  displayName: 'Demo Parent',
  email: 'demo.parent@example.com',
};

export class DemoIdentityProvider extends IdentityProvider {
  constructor() {
    super();
    this._currentUser = null;
    this._listeners = new Set();
  }

  async signIn() {
    this._currentUser = { ...DEMO_PROVIDER_USER };
    this._listeners.forEach((callback) => callback(this._currentUser));
    return this._currentUser;
  }

  async signOut() {
    this._currentUser = null;
    this._listeners.forEach((callback) => callback(null));
  }

  getCurrentProviderUser() {
    return this._currentUser;
  }

  onAuthStateChange(callback) {
    this._listeners.add(callback);
    callback(this._currentUser);
    return () => this._listeners.delete(callback);
  }
}
