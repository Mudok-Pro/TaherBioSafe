import React from 'react';

// No need to wrap with AppShell here, as the root layout already does.
// This layout component simply passes children through, but could be used
// for context providers or elements specific to the authenticated part of the app
// that should reside *within* the AppShell's main content area.
export default function AuthenticatedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
