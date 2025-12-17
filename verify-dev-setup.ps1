#  Script de Verificación Completa del Entorno
# INFORIA 2.0 - Actualizado con Node.js y DevOps

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VERIFICACIÓN COMPLETA DEL ENTORNO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js y npm
Write-Host " Verificando herramientas base..." -ForegroundColor Yellow

try {
    $nodeVersion = node --version
    Write-Host "   Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   Node.js no encontrado" -ForegroundColor Red
}

try {
    $npmVersion = npm --version
    Write-Host "   npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   npm no encontrado" -ForegroundColor Red
}

try {
    $pythonVersion = python --version
    Write-Host "   Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "   Python no encontrado" -ForegroundColor Red
}

try {
    $gitVersion = git --version
    Write-Host "   Git: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "   Git no encontrado" -ForegroundColor Red
}

Write-Host ""

# Verificar extensiones instaladas
Write-Host " Verificando extensiones (29 total)..." -ForegroundColor Yellow

$extensions = @(
    'dsznajder.es7-react-js-snippets',
    'bradlc.vscode-tailwindcss',
    'esbenp.prettier-vscode',
    'dbaeumer.vscode-eslint',
    'mattpocock.ts-error-translator',
    'ms-python.python',
    'ms-python.vscode-pylance',
    'ms-python.black-formatter',
    'ms-python.isort',
    'charliermarsh.ruff',
    'ms-toolsai.jupyter',
    'christian-kohler.npm-intellisense',
    'eg2.vscode-npm-script',
    'wix.vscode-import-cost',
    'ms-azuretools.vscode-docker',
    'ms-kubernetes-tools.vscode-kubernetes-tools',
    'github.vscode-github-actions',
    'redhat.vscode-yaml',
    'hashicorp.terraform',
    'ms-vscode-remote.remote-containers',
    'eamodio.gitlens',
    'usernamehw.errorlens',
    'formulahendry.auto-rename-tag',
    'christian-kohler.path-intellisense',
    'wallabyjs.console-ninja',
    'streetsidesoftware.code-spell-checker',
    'gruntfuggly.todo-tree',
    'mikestead.dotenv',
    'editorconfig.editorconfig'
)

$installed = code --list-extensions
$installedCount = 0

foreach ($ext in $extensions) {
    if ($installed -contains $ext) {
        $installedCount++
    }
}

Write-Host "   $installedCount/$($extensions.Count) extensiones instaladas" -ForegroundColor Green

if ($installedCount -lt $extensions.Count) {
    Write-Host "    Faltan $($extensions.Count - $installedCount) extensiones" -ForegroundColor Yellow
}

Write-Host ""

# Verificar archivos de configuración
Write-Host " Verificando archivos de configuración..." -ForegroundColor Yellow

$configFiles = @(
    '.vscode\settings.json',
    '.vscode\extensions.json',
    '.vscode\launch.json',
    '.vscode\tasks.json',
    '.vscode\nextjs.code-snippets',
    '.vscode\README.md'
)

$configCount = 0

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        $configCount++
    }
}

Write-Host "   $configCount/$($configFiles.Count) archivos de configuración" -ForegroundColor Green

Write-Host ""

# Verificar documentación
Write-Host " Verificando documentación..." -ForegroundColor Yellow

$docFiles = @(
    'DEV_SETUP_GUIDE.md',
    'COMANDOS_UTILES.md',
    'NODEJS_GUIDE.md',
    'DEVOPS_GUIDE.md',
    'SETUP_SUMMARY.md',
    'verify-dev-setup.ps1'
)

$docCount = 0

foreach ($file in $docFiles) {
    if (Test-Path $file) {
        $docCount++
    }
}

Write-Host "   $docCount/$($docFiles.Count) archivos de documentación" -ForegroundColor Green

Write-Host ""

# Verificar dependencias del proyecto
Write-Host " Verificando dependencias del proyecto..." -ForegroundColor Yellow

if (Test-Path 'node_modules') {
    Write-Host "   node_modules instalado" -ForegroundColor Green
} else {
    Write-Host "    node_modules no encontrado - ejecuta 'npm install'" -ForegroundColor Yellow
}

if (Test-Path 'package-lock.json') {
    Write-Host "   package-lock.json presente" -ForegroundColor Green
} else {
    Write-Host "    package-lock.json no encontrado" -ForegroundColor Yellow
}

Write-Host ""

# Resumen final
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " RESUMEN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Extensiones: $installedCount/29" -ForegroundColor White
Write-Host "Configuración: $configCount/6" -ForegroundColor White
Write-Host "Documentación: $docCount/6" -ForegroundColor White
Write-Host ""

if ($installedCount -eq 29 -and $configCount -eq 6 -and $docCount -eq 6) {
    Write-Host " ¡Entorno completamente configurado!" -ForegroundColor Green
} else {
    Write-Host "  Algunas configuraciones faltan" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Verificación completada" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
