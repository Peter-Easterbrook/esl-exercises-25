// Raised when the user backs out of the Google account sheet. Callers swallow it
// so that dismissing the picker is not reported as a failure.
export const GOOGLE_SIGN_IN_CANCELLED = 'google-sign-in/cancelled';

/**
 * Raised when the Google account's email already belongs to an email/password
 * account. The user owns both, so rather than stranding them on a second empty
 * account we ask for their existing password and link the two.
 *
 * Firebase only raises the underlying error when "One account per email address"
 * is enabled in Auth settings. With that setting off it silently creates a
 * duplicate account instead, and this flow never triggers.
 */
export const GOOGLE_LINK_REQUIRED = 'google-sign-in/link-required';
