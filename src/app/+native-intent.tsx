export function redirectSystemPath({
  path,
}: {
  path: string;
  initial: boolean;
}) {
  try {
    const host = new URL(path).hostname;
    if (host === "expo-share-intent" || host === "expo-sharing") return "/";
    return path;
  } catch {
    return "/";
  }
}
