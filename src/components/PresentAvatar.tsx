"use client";

import Avatar from "./Avatar";
import { usePresence } from "./PresenceProvider";

export default function PresentAvatar({
  userId,
  url,
  name,
  size,
}: {
  userId: string;
  url: string | null | undefined;
  name: string;
  size?: number;
}) {
  const online = usePresence(userId);
  return <Avatar url={url} name={name} size={size} online={online} />;
}
