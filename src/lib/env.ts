// Client-safe env. Only NEXT_PUBLIC_* vars reach the browser bundle (Next 16).
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000',
  privyAppId: process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? '',
};

export const isPrivyConfigured = env.privyAppId.length > 0;
