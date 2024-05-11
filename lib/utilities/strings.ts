export const textTransforms = (
  value: string,
  transform?: "toUpperCase" | "toLowerCase" | "capitalize" | "titleCase"
): string => {
  switch (transform) {
    case "toUpperCase":
      return value.toUpperCase();
    case "toLowerCase":
      return value.toLowerCase();
    case "capitalize":
      return value.charAt(0).toUpperCase() + value.slice(1);
    case "titleCase":
      return value.replace(/\b\w/g, (char) => char.toUpperCase());
    default:
      return value;
  }
};
