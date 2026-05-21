import { avatarColor, initials } from "@/lib/mock";

type AvatarProps = {
  name: string;
  size?: number;
};

export function Avatar({ name, size = 44 }: AvatarProps) {
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, background: avatarColor(name), fontSize: Math.max(13, size / 3) }}
      aria-label={name}
    >
      {initials(name)}
    </span>
  );
}
