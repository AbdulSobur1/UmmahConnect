import Image from "next/image";
import { avatarColor, initials } from "@/lib/utils/avatar";

type AvatarProps = {
  name: string;
  size?: number;
  src?: string | null;
};

export function Avatar({ name, size = 44, src }: AvatarProps) {
  if (src) {
    return (
      <span
        className="avatar"
        style={{ width: size, height: size, overflow: "hidden" }}
        aria-label={name}
      >
        <Image
          src={src}
          alt={name}
          width={size}
          height={size}
          style={{ objectFit: "cover", borderRadius: "50%" }}
        />
      </span>
    );
  }

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
