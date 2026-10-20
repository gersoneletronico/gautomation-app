# Instalador G Automation (local)
# Uso: clique direito > "Executar com PowerShell"  (ou: powershell -ExecutionPolicy Bypass -File instalar.ps1)
$ErrorActionPreference = 'Stop'
$app = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $app

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js nao encontrado. Instale em https://nodejs.org (versao LTS) e rode de novo." -ForegroundColor Red
    exit 1
}

Write-Host "Instalando dependencias..." -ForegroundColor Cyan
npm install
Write-Host "Gerando versao de producao..." -ForegroundColor Cyan
npm run build

# .env.local com AUTH_SECRET aleatorio (so cria se nao existir)
if (-not (Test-Path .env.local)) {
    $bytes = New-Object byte[] 32
    [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    "AUTH_SECRET=$([Convert]::ToBase64String($bytes))" | Set-Content .env.local -Encoding ascii
}

# Script de inicializacao
$iniciar = Join-Path $app 'iniciar.bat'
"@echo off`r`ncd /d `"$app`"`r`nnpm start" | Set-Content $iniciar -Encoding ascii

# Inicia sozinho ao entrar no Windows (pasta Inicializar, sem precisar de administrador)
$vbs = Join-Path ([Environment]::GetFolderPath('Startup')) 'GAutomationApp.vbs'
"CreateObject(`"WScript.Shell`").Run `"cmd /c `"`"$iniciar`"`"`", 0, False" | Set-Content $vbs -Encoding ascii

# Atalho na area de trabalho
$lnk = Join-Path ([Environment]::GetFolderPath('Desktop')) 'G Automation.url'
"[InternetShortcut]`r`nURL=http://localhost:3000/admin" | Set-Content $lnk -Encoding ascii

Start-Process wscript.exe -ArgumentList "`"$vbs`""
Write-Host "`nPronto! Acesse http://localhost:3000/admin (atalho criado na area de trabalho)." -ForegroundColor Green
Write-Host "O sistema inicia automaticamente ao entrar no Windows."
