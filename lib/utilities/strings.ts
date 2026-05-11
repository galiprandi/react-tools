export const valueTransforms = (
  value: string,
  transform?:
    | "toUpperCase"
    | "toLowerCase"
    | "capitalize"
    | "titleCase"
    | "snakeCase"
    | "camelCase"
    | "kebabCase"
    | "onlyNumbers"
    | "onlyLetters"
    | "onlyEmail"
    | "onlyAlphanumeric"
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
    case "camelCase":
      return value
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_-]/g, " ")
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
          index === 0 ? word.toLowerCase() : word.toUpperCase(),
        )
        .replace(/\s+/g, "");
    case "kebabCase":
      return value
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .replace(/[\s_]+/g, "-")
        .toLowerCase();
    case "onlyNumbers":
      return value.replace(/\D/g, "");
    case "onlyLetters":
      return value.replace(/[^a-zA-Z]/g, "");
    case "onlyEmail":
      return value.replace(/[^a-zA-Z0-9@._-]/g, "");
    case "onlyAlphanumeric":
      return value.replace(/[^a-zA-Z0-9]/g, "");
    default:
      return value;
  }
};
