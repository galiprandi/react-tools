# About This Playground

This directory contains a **playground/development site** for the `@galiprandi/react-tools` library.

## Important Notes

### Dependency-Free Library
The `@galiprandi/react-tools` library itself is **dependency-free**. This is a core design principle to ensure:
- Minimal bundle size impact for consumers
- No version conflicts with consumer dependencies
- Maximum flexibility for users to choose their own dependencies

### This Playground's Dependencies
The playground site in this directory **may include dependencies** that are **NOT** part of the library:
- **Pico CSS**: Used for styling this playground via CDN (not bundled with the library)
- **React Router**: Previously used for navigation in this playground (not part of the library)
- **ReactMarkdown**: Previously used for rendering markdown in this playground (not part of the library)

**These dependencies are NOT included in the published library package.**

### Styling
This playground uses **Pico CSS** (class-less CSS framework) loaded via CDN:
```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.slate.min.css"
>
```

This is **only for the playground** and is **not** required or bundled with the library.

## Library vs Playground

- **Library (`lib/`)**: Contains the actual hooks and components that are published. No external dependencies.
- **Playground (`src/`)**: Contains demo applications and examples that showcase the library. May use external dependencies for demonstration purposes.

When using `@galiprandi/react-tools` in your own project, you will only get the dependency-free hooks and components from the library.
