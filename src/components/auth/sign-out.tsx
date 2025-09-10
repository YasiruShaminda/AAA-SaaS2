'use client';

export function SignOut({ handleSignOut }: { handleSignOut: () => Promise<void> }) {
  return (
    <form action={handleSignOut}>
      <button type="submit" className="button">Sign Out</button>
    </form>
  );
}
