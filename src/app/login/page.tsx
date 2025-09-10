import { handleSignIn } from '@/app/actions';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  await handleSignIn();
  redirect('/'); // This redirect might not be reached, as handleSignIn should redirect to Logto.
}
