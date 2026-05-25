#!/usr/bin/env bash
# Inicializa un repo con los 4 .md de Capa 1 (excepto BEHAVIOR.md que se genera vía tests)
# Uso: bash skills/context-organizer/scripts/init-repo.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATES_DIR="$SCRIPT_DIR/templates"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

echo "📁 Inicializando Capa 1 en: $REPO_ROOT"

# Copiar plantillas si no existen
for file in README.md AGENTS.md DESIGN.md ADR.md; do
  if [ ! -f "$REPO_ROOT/$file" ]; then
    echo "✨ Creando $file"
    cp "$TEMPLATES_DIR/$file" "$REPO_ROOT/$file"
  else
    echo "⏭️  $file ya existe, saltando"
  fi
done

# Crear .context/ si no existe
if [ ! -d "$REPO_ROOT/.context" ]; then
  echo "📂 Creando .context/"
  mkdir -p "$REPO_ROOT/.context"
  echo "# Directorio para artefactos de context-organizer" > "$REPO_ROOT/.context/.gitkeep"
else
  echo "⏭️  .context/ ya existe, saltando"
fi

# Instalar hook pre-commit si husky está instalado
if [ -d "$REPO_ROOT/.husky" ]; then
  echo "🪝 Instalando hook pre-commit"
  cp "$SCRIPT_DIR/pre-commit.sh" "$REPO_ROOT/.husky/pre-commit"
  chmod +x "$REPO_ROOT/.husky/pre-commit"
else
  echo "⚠️  Husky no instalado, saltando hook pre-commit"
fi

echo "✅ Capa 1 inicializada. Editá los .md según tu proyecto."
