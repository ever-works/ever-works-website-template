#!/bin/bash

# Script d'installation des dépendances Swagger pour Next.js 15
# Compatible avec yarn

echo "🚀 Installing Swagger dependencies for Next.js 15..."

# Installer les dépendances de développement
echo "📦 Installing development dependencies..."
yarn add -D swagger-jsdoc @types/swagger-jsdoc tsx nodemon

# Vérifier l'installation
echo "✅ Checking installation..."
if yarn list swagger-jsdoc > /dev/null 2>&1; then
    echo "✅ swagger-jsdoc installed successfully"
else
    echo "❌ Failed to install swagger-jsdoc"
    exit 1
fi

if yarn list tsx > /dev/null 2>&1; then
    echo "✅ tsx installed successfully"
else
    echo "❌ Failed to install tsx"
    exit 1
fi

if yarn list nodemon > /dev/null 2>&1; then
    echo "✅ nodemon installed successfully"
else
    echo "❌ Failed to install nodemon"
    exit 1
fi

echo "🎉 All dependencies installed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Run 'yarn generate-docs' to generate OpenAPI documentation"
echo "2. Run 'yarn docs:watch' to watch for changes during development"
echo "3. Add Swagger annotations to your route files"
echo ""
echo "📖 Example annotation:"
echo "/**"
echo " * @swagger"
echo " * /api/your-route:"
echo " *   get:"
echo " *     tags: [\"Your Tag\"]"
echo " *     summary: \"Your summary\""
echo " *     description: \"Your description\""
echo " *     responses:"
echo " *       200:"
echo " *         description: \"Success\""
echo " */"
