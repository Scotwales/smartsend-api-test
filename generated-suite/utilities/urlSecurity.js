function assertSecureUrl(value, settingName) {
  const url = new URL(value);
  const isLocal = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  const isRoutelink = url.hostname === 'routelinkmfb.com' ||
    url.hostname.endsWith('.routelinkmfb.com');
  if (url.protocol !== 'https:' && !isLocal) {
    throw new Error(`${settingName} must use HTTPS except for local loopback testing.`);
  }
  if (!isLocal && !isRoutelink) {
    throw new Error(`${settingName} must use a Routelink host or local loopback.`);
  }
  if (url.username || url.password) {
    throw new Error(`${settingName} must not include URL credentials.`);
  }
  return url;
}

module.exports = { assertSecureUrl };
