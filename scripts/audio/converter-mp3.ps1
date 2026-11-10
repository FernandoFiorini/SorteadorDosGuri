# Converte um vídeo/áudio (mp4, etc.) para MP3 usando o conversor que já
# vem no Windows (Media Foundation). Não precisa instalar nada.
#
# Uso (PowerShell, na pasta do projeto):
#   powershell -NoProfile -ExecutionPolicy Bypass -File scripts\audio\converter-mp3.ps1 `
#       -InPath "C:\caminho\completo\clip.mp4" -OutPath "C:\caminho\completo\nome.mp3"
#
# Os dois caminhos precisam ser completos (absolutos).

param([string]$InPath, [string]$OutPath)

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

$profile = [Windows.Media.MediaProperties.MediaEncodingProfile]::CreateMp3([Windows.Media.MediaProperties.AudioEncodingQuality]::Medium)

$transcoder = New-Object Windows.Media.Transcoding.MediaTranscoder
$prep = Await ($transcoder.PrepareFileTranscodeAsync($inFile, $outFile, $profile)) ([Windows.Media.Transcoding.PrepareTranscodeResult])

if (-not $prep.CanTranscode) { throw "Nao foi possivel converter: $($prep.FailureReason)" }

AwaitProgress ($prep.TranscodeAsync()) ([double])

"ok: " + (Get-Item $OutPath).Length + " bytes"
