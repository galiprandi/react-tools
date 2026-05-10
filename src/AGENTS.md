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

## Development Guidelines

### Color Contrast and Accessibility
**CRITICAL: Never use light backgrounds with light text or dark backgrounds with dark text.**

When adding inline styles to example components or playground pages:
- **Light backgrounds** (#fff, #e3f2fd, #e8f5e9, #f5f5f5, etc.) MUST have **dark text** (#000 or #333)
- **Dark backgrounds** (#1e3a5f, #2d4a3e, #3d3d3d, etc.) MUST have **light text** (#fff or #f0f0f0)
- Always ensure WCAG AA compliance (minimum 4.5:1 contrast ratio)

**Pico CSS Classes:**
- **DO NOT** use Pico CSS classes like `className="secondary"` when adding custom inline styles with dark backgrounds
- Pico CSS classes have predefined styles that may conflict with your inline styles
- Use inline styles exclusively when you need custom colors for better contrast control
- If you must use Pico CSS classes, ensure the entire component uses the framework's styling consistently

**Common Mistakes to Avoid:**
- Using `background: '#e3f2fd'` (light blue) with `color: '#000'` (black) - OK
- Using `background: '#e3f2fd'` (light blue) with `color: '#fff'` (white) - WRONG (poor contrast)
- Using `background: '#1e3a5f'` (dark blue) with `color: '#000'` (black) - WRONG (poor contrast)
- Using `background: '#1e3a5f'` (dark blue) with `color: '#fff'` (white) - OK
- Mixing Pico CSS classes with custom dark background styles - WRONG (conflicting styles)

**Safe Color Combinations:**
- Light backgrounds (#fff, #f5f5f5, #e3f2fd) + Dark text (#000, #333, #1a1a1a)
- Dark backgrounds (#1e3a5f, #2d4a3e, #3d3d3d, #1a1a1a) + Light text (#fff, #f0f0f0, #e0e0e0)
