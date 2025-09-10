'use server';

import { signIn, signOut } from '@logto/next/server-actions';
import { logtoConfig } from '@/lib/logto';

export async function handleSignIn() {
  await signIn(logtoConfig);
}

export async function handleSignOut() {
  await signOut(logtoConfig);
}
