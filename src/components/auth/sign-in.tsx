'use client';

export function SignIn({ handleSignIn }: { handleSignIn: () => Promise<void> }) {
  return (
    <form action={handleSignIn}>
      <button type="submit" className="button">Sign In</button>
    </form>
  );
}
