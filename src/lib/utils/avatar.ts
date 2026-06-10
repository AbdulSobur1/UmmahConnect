const avatarColors = ["#1A6B5C", "#C9A84C", "#132420", "#5ECDB5", "#0D1B1E"];

export function initials(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[parts.length - 1]?.[0] || "")).toUpperCase();
}

export function avatarColor(fullName: string) {
  let hash = 0;
  for (let index = 0; index < fullName.length; index += 1) {
    hash = (hash * 31 + fullName.charCodeAt(index)) | 0;
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}
