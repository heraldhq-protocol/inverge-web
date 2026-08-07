// Client-safe env. Only NEXT_PUBLIC_* vars reach the browser bundle (Next 16).
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000',
  privyAppId: process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? '',
  // Canonical origin for metadataBase / OpenGraph absolute URLs. Override per environment;
  // defaults to production so social cards resolve correctly without extra config.
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://inverge.africa',
  // Mode switcher: set NEXT_PUBLIC_USE_FIXTURES=false to use live backend API.
  // Defaults to true so rich demo data works out-of-the-box when backend is not running.
  useFixtures: process.env.NEXT_PUBLIC_USE_FIXTURES === 'false' ? false : true,
};

export const isPrivyConfigured = env.privyAppId.length > 0;
