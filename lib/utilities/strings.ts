export const valueTransforms = (
  value: string,
  transform?:
    | "toUpperCase"
    | "toLowerCase"
    | "capitalize"
    | "titleCase"
    | "snakeCase"
    | "onlyNumbers"
    | "onlyLetters"
    | "onlyEmail"
): string => {
  switch (transform) {
    case "toUpperCase":
      return value.toUpperCase();
    case "toLowerCase":
      return value.toLowerCase();
    case "capitalize":
      return value.toLowerCase().charAt(0).toUpperCase() + value.slice(1);
    case "titleCase":
      return value.toLowerCase().replace(/\b\w/g, (ch) => ch.toUpperCase());
    case "snakeCase":
      return value.toLowerCase().replace(/\s/g, "_");
    case "onlyNumbers":
      return value.replace(/\D/g, "");
    case "onlyLetters":
      return value.replace(/[^a-zA-Z]/g, "");
    case "onlyEmail":
      return value.replace(/[^a-zA-Z0-9@._-]/g, "");
    default:
      return value;
  }
};
