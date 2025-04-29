# 创建发布目录
$releaseDir = "release"
if (Test-Path $releaseDir) {
    Remove-Item -Recurse -Force $releaseDir
}
New-Item -ItemType Directory -Path $releaseDir

# 复制必要文件
$filesToCopy = @(
    "manifest.json",
    "background.js",
    "content.js",
    "content.css",
    "popup.html",
    "popup.js"
)

foreach ($file in $filesToCopy) {
    if (Test-Path $file) {
        Copy-Item $file $releaseDir
    }
}

# 复制图标目录
if (Test-Path "icons") {
    Copy-Item -Recurse "icons" "$releaseDir/icons"
}

# 复制字典目录
if (Test-Path "dict") {
    Copy-Item -Recurse "dict" "$releaseDir/dict"
}

# 复制构建目录
if (Test-Path "build") {
    Copy-Item -Recurse "build" "$releaseDir/build"
}

# 创建 ZIP 文件
$zipFile = "EZkanji-release.zip"
if (Test-Path $zipFile) {
    Remove-Item $zipFile
}
Compress-Archive -Path $releaseDir/* -DestinationPath $zipFile

# 清理临时目录
Remove-Item -Recurse -Force $releaseDir

Write-Host "发布包已创建: $zipFile" 