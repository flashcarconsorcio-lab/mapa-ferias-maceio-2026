$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$stages = @("casa","uber","tiete","congonhas","maceio")
$result = @{}

foreach ($stage in $stages) {
  $photos = @()
  $videos = @()

  $photoDir = Join-Path $root "media\$stage\fotos"
  $videoDir = Join-Path $root "media\$stage\videos"

  if (Test-Path $photoDir) {
    Get-ChildItem $photoDir -File | Where-Object {
      $_.Extension.ToLower() -in @(".jpg",".jpeg",".png",".webp",".gif")
    } | Sort-Object Name | ForEach-Object {
      $photos += "media/$stage/fotos/$($_.Name)"
    }
  }

  if (Test-Path $videoDir) {
    Get-ChildItem $videoDir -File | Where-Object {
      $_.Extension.ToLower() -in @(".mp4",".webm",".mov",".m4v")
    } | Sort-Object Name | ForEach-Object {
      $videos += "media/$stage/videos/$($_.Name)"
    }
  }

  $result[$stage] = @{ fotos = $photos; videos = $videos }
}

$json = $result | ConvertTo-Json -Depth 5 -Compress
Set-Content -Path (Join-Path $root "data\midias.json") -Value $json -Encoding UTF8
Set-Content -Path (Join-Path $root "data\midias.js") -Value ("window.MIDIAS = " + $json + ";") -Encoding UTF8

Write-Host ""
Write-Host "Galerias atualizadas com sucesso!" -ForegroundColor Green
Write-Host "Agora envie a pasta inteira novamente para a Vercel."
