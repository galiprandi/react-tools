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

**IMPORTANT:** Pico CSS is designed to be classless, meaning it styles HTML elements directly without requiring classes. **DO NOT use Pico CSS classes** like `className="container"`, `className="grid"`, `className="secondary"`, `className="success"`, `className="error"`, etc. in playground pages or examples. Instead:
- Let Pico CSS style elements by their semantic HTML tags (main, article, section, header, nav, etc.)
- Use inline styles ONLY for layouts (grid, gap, padding, etc.)
- **DO NOT add custom colors unless explicitly requested**
- Let Pico CSS handle all colors and styling by default

## Library vs Playground

- **Library (`lib/`)**: Contains the actual hooks and components that are published. No external dependencies.
- **Playground (`src/`)**: Contains demo applications and examples that showcase the library. May use external dependencies for demonstration purposes.

When using `@galiprandi/react-tools` in your own project, you will only get the dependency-free hooks and components from the library.

## Development Guidelines

### Color Contrast and Accessibility
**CRITICAL: Never use light backgrounds with light text or dark backgrounds with dark text.**

**DO NOT add custom background colors unless explicitly requested by the user.**
- Let Pico CSS handle all colors and styling by default
- Only add custom colors when the user explicitly asks for them
- If custom colors are requested, ensure WCAG AA compliance (minimum 4.5:1 contrast ratio)

**Pico CSS Classes:**
- **NEVER use Pico CSS classes** like `className="container"`, `className="grid"`, `className="secondary"`, `className="success"`, `className="error"`, etc.
- Pico CSS is designed to be classless - it styles HTML elements directly without classes
- Use semantic HTML tags (main, article, section, header, nav, etc.) and let Pico CSS style them
- Use inline styles ONLY for layouts (grid, gap, padding, etc.)
- Do not mix Pico CSS classes with inline styles - use one approach consistently

**Common Mistakes to Avoid:**
- Using `className="secondary"` or any Pico CSS class - WRONG (classless framework)
- Adding custom background colors without user request - WRONG
- Mixing Pico CSS classes with inline styles - WRONG (conflicting styles)
