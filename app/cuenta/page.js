import Account from "./Account";

export const metadata = { title: "Mi cuenta — 304" };

// `?next=/admin…` comes from proxy.js; only paths inside this site are followed.
export default async function Page({ searchParams }) {
  const { next } = await searchParams;
  const safeNext = typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : null;
  return <Account next={safeNext} />;
}
