import { LogtoNextConfig } from '@logto/next';

export const logtoConfig: LogtoNextConfig = {
  appId: 'svu41eint7n4djzv2trwk',
  appSecret: 'zr8rPdYWJ1cJd8BbGWfh5nKSkcbOrP8e',
  endpoint: 'https://7o8itu.logto.app/',
  baseUrl: 'http://localhost:9002',
  cookieSecret: 'a_very_long_and_complex_secret_at_least_32_characters',
  cookieSecure: process.env.NODE_ENV === 'production',
};
