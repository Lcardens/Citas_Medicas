param(
    [string]$LlaveSsh = "C:\Users\lcard\.ssh\id_rsa",
    [string]$Servidor = "root@142.93.204.48",
    [string]$Directorio = "/var/www/html"
)

$ErrorActionPreference = "Stop"

Write-Host "===== DEPLOY SISTEMA DE CITAS =====" -ForegroundColor Cyan

# 1. Build de produccion
Write-Host "" 
Write-Host "[1/5] Generando build de produccion..." -ForegroundColor Yellow
Push-Location "C:\Users\lcard\Desktop\Bootcamp\Proyectos\Proyecto_Final\Frontend"
npx ng build
if ($LASTEXITCODE -ne 0) { Write-Host "Build fallo." -ForegroundColor Red; Pop-Location; exit 1 }
Pop-Location
Write-Host "Build OK." -ForegroundColor Green

$buildDir = "C:\Users\lcard\Desktop\Bootcamp\Proyectos\Proyecto_Final\Frontend\dist\frontend\browser"

# 2. Verificar que las fuentes de iconos existan en el build
Write-Host ""
Write-Host "[2/5] Verificando fuentes de iconos en el build..." -ForegroundColor Yellow
$font = Get-ChildItem "$buildDir\media\bootstrap-icons-*.woff2" -ErrorAction SilentlyContinue
if (-not $font) {
    Write-Host "ADVERTENCIA: no se encuentran las fuentes bootstrap-icons en media/." -ForegroundColor Red
} else {
    Write-Host "Fuentes encontradas: $($font.Name)" -ForegroundColor Green
}

# 3. Vaciar el directorio destino en el servidor (elimina archivos viejos)
Write-Host ""
Write-Host "[3/5] Vaciando el directorio destino en el servidor..." -ForegroundColor Yellow
ssh -i $LlaveSsh $Servidor "rm -rf $Directorio/*"
if ($LASTEXITCODE -ne 0) { Write-Host "No se pudo vaciar el directorio." -ForegroundColor Red; exit 1 }
Write-Host "Directorio vaciado." -ForegroundColor Green

# 4. Copiar el build al servidor
Write-Host ""
Write-Host "[4/5] Copiando el build al servidor..." -ForegroundColor Yellow
scp -i $LlaveSsh -r "$buildDir\*" "${Servidor}:${Directorio}"
if ($LASTEXITCODE -ne 0) { Write-Host "Falló la copia." -ForegroundColor Red; exit 1 }
Write-Host "Copia completada." -ForegroundColor Green

# 5. Arreglar permisos (clave para los iconos) y recargar Nginx
Write-Host ""
Write-Host "[5/5] Arreglando permisos y recargando Nginx..." -ForegroundColor Yellow
ssh -i $LlaveSsh $Servidor "chmod -R a+rX $Directorio && nginx -s reload"
if ($LASTEXITCODE -ne 0) { Write-Host "Advertencia al aplicar permisos." -ForegroundColor Yellow }
Write-Host "Permisos OK y Nginx recargado." -ForegroundColor Green

Write-Host ""
Write-Host "===== DEPLOY COMPLETADO =====" -ForegroundColor Cyan
Write-Host "Recuerda: si cambiaste el backend, en el servidor corre: cd /var/www/Citas_Medicas && git pull origin main && pm2 restart mi-api-medico" -ForegroundColor DarkGray
