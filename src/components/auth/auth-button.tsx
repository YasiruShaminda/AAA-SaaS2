import { getLogtoContext } from '@logto/next/server-actions';
import { logtoConfig } from '@/lib/logto';
import { SignIn } from './sign-in';
import { SignOut } from './sign-out';
import { handleSignIn, handleSignOut } from '@/app/actions';

export async function AuthButton() {
  const { isAuthenticated } = await getLogtoContext(logtoConfig);

  if (isAuthenticated) {
    return <SignOut handleSignOut={handleSignOut} />;
  }

  return <SignIn handleSignIn={handleSignIn} />;
}
