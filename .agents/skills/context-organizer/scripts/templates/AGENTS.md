# AGENTS.md

## Matriz de Consulta Documental
- Para entender restricciones de arquitectura antes de codificar: Consultar obligatoriamente `ADR.md`
- Para asegurar la consistencia estética y reusabilidad de componentes visuales: Consultar y actualizar `DESIGN.md`
- Para validar el impacto en la lógica de negocio existente: Consultar y sincronizar `BEHAVIOR.md`
- Para dudas de stack o bootstrap: Consultar `README.md`

## Restricciones Operativas Locales
- Prohibido el uso de librerías externas no listadas en package.json sin aprobación previa vía ADR.
- Todo cambio de lógica debe incluir su respectivo test unitario que valide la regla de negocio.
- `context-organizer` corre en pre-commit y mantiene `BEHAVIOR.md` automáticamente.

## Skills/Tools Disponibles
- `context-organizer`: Herramienta para mantener los documentos de contexto organizados y actualizados.
- <listado de skills y herramientas disponibles en el repo>
