# DESIGN.md - UI/UX Specifications (Google Labs Std)

## Tokens de Diseño Centralizados
- Primary Brand Color: <ej. #0055FF> (usar variable CSS `--color-primary`)
- Background Surface: <ej. #FFFFFF> / <ej. #121212> (soporte nativo para Dark Mode)

## Catálogo de Componentes Consolidados
### [Nombre del Componente]
- Ubicación: <ej. /src/components/ui/Button.tsx>
- Variantes permitidas: <ej. primary, secondary, danger>
- Restricciones: <ej. Debe incluir siempre la propiedad aria-label si el contenido es un icono>

## Gestión de Estados Globales
Toda vista de datos asíncrona debe implementar el componente <SkeletonLoader /> durante la fase de fetching, mapeando los errores mediante el Error Boundary global <ej. /src/components/errors/GlobalBoundary.tsx>.
