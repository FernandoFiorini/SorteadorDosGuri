# Deixa um vídeo leve para o site (tutoriais): 720p, sem som, bitrate baixo.
# Usa o conversor que já vem no Windows (Media Foundation). Não precisa instalar nada.
#
# Uso (PowerShell, na pasta do projeto):
#   powershell -NoProfile -ExecutionPolicy Bypass -File scripts\video\comprimir-video.ps1 `
#       -InPath "D:\Tutoriais LOL\Katarina\Q.mp4" -OutPath "C:\...\tutoriais\katarina\q.mp4"
#
# Os dois caminhos precisam ser completos (absolutos).
# -Bitrate em bits por segundo (padrão 1,2 Mbps: nítido o bastante para ver as skills).

param([string]$InPath, [string]$OutPath, [int]$Bitrate = 1200000)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Runtime.WindowsRuntime

$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and
    $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]

$asTaskProgress = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and
    $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncActionWithProgress`1' })[0]

function Await($op, [Type]$type) {
    $task = $asTaskGeneric.MakeGenericMethod($type).Invoke($null, @($op))
    $task.Wait() | Out-Null
    $task.Result
}

function AwaitProgress($op, [Type]$progressType) {
    $task = $asTaskProgress.MakeGenericMethod($progressType).Invoke($null, @($op))
    $task.Wait() | Out-Null
}

[Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime] | Out-Null
[Windows.Storage.StorageFolder, Windows.Storage, ContentType = WindowsRuntime] | Out-Null
[Windows.Media.Transcoding.MediaTranscoder, Windows.Media.Transcoding, ContentType = WindowsRuntime] | Out-Null
[Windows.Media.MediaProperties.MediaEncodingProfile, Windows.Media.MediaProperties, ContentType = WindowsRuntime] | Out-Null

$inFile = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($InPath)) ([Windows.Storage.StorageFile])

$outDir = Split-Path $OutPath -Parent
$outName = Split-Path $OutPath -Leaf
$folder = Await ([Windows.Storage.StorageFolder]::GetFolderFromPathAsync($outDir)) ([Windows.Storage.StorageFolder])
$outFile = Await ($folder.CreateFileAsync($outName, [Windows.Storage.CreationCollisionOption]::ReplaceExisting)) ([Windows.Storage.StorageFile])

$profile = [Windows.Media.MediaProperties.MediaEncodingProfile]::CreateMp4([Windows.Media.MediaProperties.VideoEncodingQuality]::HD720p)
$profile.Video.Bitrate = $Bitrate
$profile.Audio = $null

$transcoder = New-Object Windows.Media.Transcoding.MediaTranscoder
$prep = Await ($transcoder.PrepareFileTranscodeAsync($inFile, $outFile, $profile)) ([Windows.Media.Transcoding.PrepareTranscodeResult])

if (-not $prep.CanTranscode) { throw "Nao foi possivel converter: $($prep.FailureReason)" }

AwaitProgress ($prep.TranscodeAsync()) ([double])

"ok: " + [math]::Round((Get-Item $OutPath).Length / 1MB, 2) + " MB"
