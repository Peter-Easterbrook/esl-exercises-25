import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Downloadable files and the premium paywall are hidden on iOS until this
 * version ships.
 *
 * The App Store launch goes out without them: the in-app purchase cannot be
 * tested in Apple's sandbox without a physical iPhone, and shipping a paywall
 * that has never been exercised invites both a rejection and refund requests.
 * Android is unaffected — the feature is live there and stays live.
 *
 * To turn downloads on for iOS: ship a build whose `version` in app.json is at
 * or above this value. Bump both together in the same commit.
 */
export const IOS_DOWNLOADS_MIN_VERSION = '2.1.0';

/**
 * Compares dotted numeric versions. Returns a negative number when `a` is
 * older than `b`, zero when they match, positive when `a` is newer.
 * Missing segments count as zero, so '2.1' and '2.1.0' compare equal.
 */
const compareVersions = (a: string, b: string): number => {
  const parse = (value: string) =>
    value
      .split('.')
      .map((segment) => Number.parseInt(segment, 10))
      .map((segment) => (Number.isNaN(segment) ? 0 : segment));

  const left = parse(a);
  const right = parse(b);
  const length = Math.max(left.length, right.length);

  for (let i = 0; i < length; i += 1) {
    const diff = (left[i] ?? 0) - (right[i] ?? 0);
    if (diff !== 0) return diff;
  }

  return 0;
};

/**
 * True when the downloadable files section and the purchase flow should be
 * shown. Always true off iOS. On iOS it gates on the running app version, and
 * fails closed if the version cannot be read — a hidden feature is recoverable,
 * a paywall we cannot test is not.
 *
 * Note: with expo-updates the version comes from the update manifest rather
 * than the binary. The `fingerprint` runtimeVersion policy keeps updates on
 * matching native builds, so an update that flips this on cannot land on a
 * build without the IAP module.
 */
export const areDownloadsAvailable = (): boolean => {
  if (Platform.OS !== 'ios') return true;

  const version = Constants.expoConfig?.version;
  if (!version) return false;

  return compareVersions(version, IOS_DOWNLOADS_MIN_VERSION) >= 0;
};
