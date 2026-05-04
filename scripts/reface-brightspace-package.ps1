param(
  [Parameter(Mandatory = $true)]
  [string]$InputZip,

  [Parameter(Mandatory = $true)]
  [string]$OutputZip,

  [string]$ReportJson,

  [string]$ReportMarkdown,

  [switch]$PruneContentServiceObjects,

  [string]$MediaExportDirectory
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$RefacingStyle = @'
<style data-canvas-helper-reface="true">
:root {
  --course-bg: #f5f6f8;
  --course-surface: #ffffff;
  --course-ink: #172033;
  --course-muted: #5d6677;
  --course-line: #d9dee7;
  --course-accent: #34495f;
  --course-accent-soft: #eef2f5;
}

html {
  background: var(--course-bg);
}

body.course-reface-page {
  box-sizing: border-box;
  max-width: 980px;
  margin: 0 auto;
  padding: 32px;
  background: var(--course-surface);
  color: var(--course-ink);
  font-family: "Aptos", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 17px;
  line-height: 1.65;
}

body.course-reface-page *,
body.course-reface-page *::before,
body.course-reface-page *::after {
  box-sizing: border-box;
}

body.course-reface-page h1,
body.course-reface-page h2,
body.course-reface-page h3,
body.course-reface-page h4 {
  color: var(--course-ink);
  line-height: 1.2;
  margin: 1.6rem 0 .75rem;
}

body.course-reface-page h1 {
  font-size: clamp(2rem, 4vw, 3.1rem);
  border-bottom: 2px solid var(--course-line);
  padding-bottom: .6rem;
}

body.course-reface-page h2 {
  font-size: clamp(1.55rem, 3vw, 2.1rem);
}

body.course-reface-page h3 {
  font-size: 1.3rem;
}

body.course-reface-page p,
body.course-reface-page li {
  color: var(--course-ink);
}

body.course-reface-page a {
  color: #254e7b;
  text-decoration-thickness: .08em;
  text-underline-offset: .18em;
}

body.course-reface-page img,
body.course-reface-page video,
body.course-reface-page iframe,
body.course-reface-page object,
body.course-reface-page embed {
  max-width: 100%;
  height: auto;
}

body.course-reface-page img {
  display: block;
  margin: 1rem auto;
  border-radius: 6px;
}

body.course-reface-page table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.25rem 0;
}

body.course-reface-page th,
body.course-reface-page td {
  border: 1px solid var(--course-line);
  padding: .75rem;
  vertical-align: top;
}

body.course-reface-page th {
  background: var(--course-accent-soft);
  text-align: left;
}

body.course-reface-page blockquote {
  margin: 1.25rem 0;
  padding: .85rem 1rem;
  border-left: 4px solid var(--course-accent);
  background: var(--course-accent-soft);
}

body.course-reface-page .container,
body.course-reface-page .container-fluid {
  width: 100%;
  padding: 0;
}

body.course-reface-page .row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin: 1rem 0;
}

body.course-reface-page .col,
body.course-reface-page .col-sm,
body.course-reface-page .col-12,
body.course-reface-page [class*="col-"] {
  min-width: 0;
  padding: 0;
}

body.course-reface-page .card,
body.course-reface-page .jumbotron,
body.course-reface-page .alert,
body.course-reface-page .callout {
  border: 1px solid var(--course-line);
  border-radius: 8px;
  background: #fbfcfd;
  padding: 1rem;
  margin: 1rem 0;
  box-shadow: none;
}

body.course-reface-page .card-body {
  padding: 0;
}

body.course-reface-page .course-reface-injected-title {
  margin: 0 0 1.5rem;
}

body.course-reface-page .course-reface-injected-title h1 {
  margin-top: 0;
}

@media (max-width: 720px) {
  body.course-reface-page {
    padding: 20px;
    font-size: 16px;
  }
}
</style>
'@

function Assert-InputFile {
  param([string]$Path)

  if (!(Test-Path -LiteralPath $Path -PathType Leaf)) {
    throw "Input ZIP not found: $Path"
  }
}

function Ensure-ParentDirectory {
  param([string]$Path)

  $parent = Split-Path -Parent $Path
  if ($parent -and !(Test-Path -LiteralPath $parent)) {
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
  }
}

function Ensure-Directory {
  param([string]$Path)

  if ($Path -and !(Test-Path -LiteralPath $Path)) {
    New-Item -ItemType Directory -Path $Path -Force | Out-Null
  }
}

function ConvertTo-ZipPathKey {
  param([string]$Path)

  return (($Path -replace "\\", "/").TrimStart("/"))
}

function Test-IsContentServiceObjectEntry {
  param([string]$EntryName)

  return (ConvertTo-ZipPathKey -Path $EntryName).StartsWith("contentservice_objects/", [System.StringComparison]::OrdinalIgnoreCase)
}

function Read-ZipEntryText {
  param([System.IO.Compression.ZipArchiveEntry]$Entry)

  $stream = $Entry.Open()
  try {
    $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8, $true)
    try {
      return $reader.ReadToEnd()
    } finally {
      $reader.Dispose()
    }
  } finally {
    $stream.Dispose()
  }
}

function Get-Sha256Text {
  param([string]$Text)

  $sha = [System.Security.Cryptography.SHA256]::Create()
  try {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($Text)
    return ([BitConverter]::ToString($sha.ComputeHash($bytes)) -replace "-", "").ToLowerInvariant()
  } finally {
    $sha.Dispose()
  }
}

function Replace-FirstRegex {
  param(
    [string]$InputText,
    [string]$Pattern,
    [string]$Replacement
  )

  $regex = New-Object System.Text.RegularExpressions.Regex($Pattern)
  return $regex.Replace($InputText, $Replacement, 1)
}

function Copy-ZipEntryStream {
  param(
    [System.IO.Compression.ZipArchiveEntry]$SourceEntry,
    [System.IO.Compression.ZipArchiveEntry]$TargetEntry
  )

  $source = $SourceEntry.Open()
  $target = $TargetEntry.Open()
  try {
    $source.CopyTo($target)
  } finally {
    $target.Dispose()
    $source.Dispose()
  }
}

function Export-ZipEntryFile {
  param(
    [System.IO.Compression.ZipArchiveEntry]$Entry,
    [string]$Directory
  )

  $root = [System.IO.Path]::GetFullPath($Directory)
  Ensure-Directory -Path $root

  $relativePath = (ConvertTo-ZipPathKey -Path $Entry.FullName) -replace "/", [System.IO.Path]::DirectorySeparatorChar
  $targetPath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($root, $relativePath))
  $requiredPrefix = $root.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
  if (!$targetPath.StartsWith($requiredPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to export ZIP entry outside media directory: $($Entry.FullName)"
  }

  Ensure-ParentDirectory -Path $targetPath
  $source = $Entry.Open()
  $target = [System.IO.File]::Open($targetPath, [System.IO.FileMode]::Create, [System.IO.FileAccess]::Write, [System.IO.FileShare]::None)
  try {
    $source.CopyTo($target)
  } finally {
    $target.Dispose()
    $source.Dispose()
  }
}

function Write-ZipEntryText {
  param(
    [System.IO.Compression.ZipArchiveEntry]$TargetEntry,
    [string]$Text
  )

  $stream = $TargetEntry.Open()
  try {
    $encoding = New-Object System.Text.UTF8Encoding($false)
    $writer = New-Object System.IO.StreamWriter($stream, $encoding)
    try {
      $writer.Write($Text)
    } finally {
      $writer.Dispose()
    }
  } finally {
    $stream.Dispose()
  }
}

function ConvertTo-SafePlaceholderFileName {
  param([string]$Name)

  $safe = [regex]::Replace($Name, "[^A-Za-z0-9._-]+", "_").Trim("_")
  if (!$safe) {
    $safe = [System.Guid]::NewGuid().ToString("N")
  }
  return $safe
}

function Convert-ContentServiceResourcesInManifest {
  param([string]$ManifestXml)

  $doc = New-Object System.Xml.XmlDocument
  $doc.PreserveWhitespace = $true
  $doc.LoadXml($ManifestXml)

  $titleByIdentifierRef = @{}
  foreach ($item in @($doc.SelectNodes("//*[local-name()='item' and @identifierref]"))) {
    $identifierRef = $item.GetAttribute("identifierref")
    $titleNode = $item.SelectSingleNode("./*[local-name()='title']")
    if ($identifierRef -and $titleNode -and $titleNode.InnerText.Trim()) {
      $titleByIdentifierRef[$identifierRef] = $titleNode.InnerText.Trim()
    }
  }

  $rewritten = New-Object System.Collections.Generic.List[object]
  foreach ($resource in @($doc.SelectNodes("//*[local-name()='resource']"))) {
    $hrefs = New-Object System.Collections.Generic.List[string]
    $contentServiceFiles = New-Object System.Collections.Generic.List[object]

    foreach ($fileNode in @($resource.SelectNodes(".//*[local-name()='file']"))) {
      $href = $fileNode.GetAttribute("href")
      if (!$href) {
        continue
      }

      $hrefs.Add($href)
      if ((ConvertTo-ZipPathKey -Path $href).StartsWith("contentservice_objects/", [System.StringComparison]::OrdinalIgnoreCase)) {
        $contentServiceFiles.Add($fileNode)
      }
    }

    if ($contentServiceFiles.Count -gt 0) {
      $identifier = $resource.GetAttribute("identifier")
      $placeholderHref = "contentservice_placeholders/" + (ConvertTo-SafePlaceholderFileName -Name $identifier) + ".html"
      $firstFile = $contentServiceFiles[0]
      $firstFile.SetAttribute("href", $placeholderHref)

      for ($index = 1; $index -lt $contentServiceFiles.Count; $index += 1) {
        [void]$contentServiceFiles[$index].ParentNode.RemoveChild($contentServiceFiles[$index])
      }

      $title = if ($titleByIdentifierRef.ContainsKey($identifier)) { $titleByIdentifierRef[$identifier] } else { $identifier }
      $rewritten.Add([ordered]@{
        identifier = $identifier
        title = $title
        originalHrefs = @($hrefs.ToArray())
        placeholderHref = $placeholderHref
      })
    }
  }

  return [ordered]@{
    text = $doc.OuterXml
    rewrittenResources = @($rewritten.ToArray())
  }
}

function New-ExternalizedMediaPlaceholderHtml {
  param(
    [string]$Title,
    [string[]]$OriginalHrefs
  )

  $safeTitle = [System.Net.WebUtility]::HtmlEncode($Title)
  $items = New-Object System.Collections.Generic.List[string]
  foreach ($href in @($OriginalHrefs)) {
    $safeHref = [System.Net.WebUtility]::HtmlEncode($href)
    $items.Add("<li><code>$safeHref</code></li>")
  }

  return @(
    "<!doctype html>",
    "<html>",
    "<head>",
    "  <meta charset=`"utf-8`">",
    "  <meta name=`"viewport`" content=`"width=device-width, initial-scale=1`">",
    "  <title>$safeTitle</title>",
    $RefacingStyle,
    "</head>",
    "<body class=`"course-reface-page`" data-canvas-helper-refaced=`"true`">",
    "  <header class=`"course-reface-injected-title`"><h1>$safeTitle</h1></header>",
    "  <p>The original video for this Brightspace topic was externalized because the full course package exceeds the Brightspace upload limit.</p>",
    "  <p>Use the matching file from the externalized media folder if this video needs to be uploaded or hosted separately.</p>",
    "  <h2>Externalized media file</h2>",
    "  <ul>",
    ($items.ToArray() -join "`n"),
    "  </ul>",
    "</body>",
    "</html>"
  ) -join "`n"
}

function Test-IsContentHtmlEntry {
  param([string]$EntryName)

  $normalized = $EntryName -replace "\\", "/"
  $cyrillicContentRoot = ([string][char]0x0441) + "ontent/"
  return (
    $normalized -match "(?i)\.html?$" -and
    ($normalized.StartsWith("content/") -or $normalized.StartsWith($cyrillicContentRoot))
  )
}

function Test-IsHtmlEntry {
  param([string]$EntryName)

  return (($EntryName -replace "\\", "/") -match "(?i)\.html?$")
}

function Get-ManifestTitleMap {
  param([string]$ManifestXml)

  $titleMap = @{}

  try {
    [xml]$xml = $ManifestXml
    $namespaceManager = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
    $namespaceManager.AddNamespace("imscp", "http://www.imsglobal.org/xsd/imsccv1p3/imscp_v1p1")

    $resourceHrefById = @{}
    foreach ($resource in $xml.SelectNodes("//imscp:resource", $namespaceManager)) {
      $identifier = $resource.GetAttribute("identifier")
      $fileNode = $resource.SelectSingleNode("imscp:file", $namespaceManager)
      if ($identifier -and $fileNode) {
        $href = $fileNode.GetAttribute("href")
        if ($href) {
          $resourceHrefById[$identifier] = $href
        }
      }
    }

    foreach ($item in $xml.SelectNodes("//imscp:item[@identifierref]", $namespaceManager)) {
      $identifierRef = $item.GetAttribute("identifierref")
      if (!$identifierRef -or !$resourceHrefById.ContainsKey($identifierRef)) {
        continue
      }

      $titleNode = $item.SelectSingleNode("imscp:title", $namespaceManager)
      if ($titleNode -and $titleNode.InnerText.Trim()) {
        $titleMap[$resourceHrefById[$identifierRef]] = $titleNode.InnerText.Trim()
      }
    }
  } catch {
    return @{}
  }

  return $titleMap
}

function Get-FallbackTitle {
  param(
    [string]$Html,
    [string]$EntryName,
    [hashtable]$TitleMap
  )

  if ($TitleMap.ContainsKey($EntryName)) {
    return $TitleMap[$EntryName]
  }

  $h1Match = [regex]::Match($Html, "(?is)<h1\b[^>]*>(.*?)</h1>")
  if ($h1Match.Success) {
    $h1 = [regex]::Replace($h1Match.Groups[1].Value, "<[^>]+>", "").Trim()
    if ($h1) {
      return [System.Net.WebUtility]::HtmlDecode($h1)
    }
  }

  $titleMatch = [regex]::Match($Html, "(?is)<title\b[^>]*>(.*?)</title>")
  if ($titleMatch.Success) {
    $title = [System.Net.WebUtility]::HtmlDecode(($titleMatch.Groups[1].Value -replace "\s+", " ").Trim())
    if ($title -and $title -notmatch "^(basic page|untitled)$") {
      return $title
    }
  }

  $fileName = [System.IO.Path]::GetFileNameWithoutExtension($EntryName)
  try {
    $fileName = [System.Uri]::UnescapeDataString($fileName)
  } catch {
    # Keep the raw filename.
  }

  return ($fileName -replace "[-_]+", " ").Trim()
}

function Ensure-HeadWithStyle {
  param(
    [string]$Html,
    [string]$Title
  )

  $safeTitle = [System.Net.WebUtility]::HtmlEncode($Title)
  $withoutOldStyle = [regex]::Replace(
    $Html,
    "(?is)<style\b[^>]*data-canvas-helper-reface=['""]true['""][^>]*>.*?</style>",
    ""
  )

  if ($withoutOldStyle -match "(?is)<title\b[^>]*>.*?</title>") {
    $withoutOldStyle = Replace-FirstRegex -InputText $withoutOldStyle -Pattern "(?is)<title\b[^>]*>.*?</title>" -Replacement "<title>$safeTitle</title>"
  }

  $headPayload = "<meta charset=`"utf-8`">`n<meta name=`"viewport`" content=`"width=device-width, initial-scale=1`">`n<title>$safeTitle</title>`n$RefacingStyle`n"

  if ($withoutOldStyle -match "(?is)<head\b[^>]*>") {
    $withoutDuplicateTitle = Replace-FirstRegex -InputText $withoutOldStyle -Pattern "(?is)<title\b[^>]*>.*?</title>" -Replacement ""
    return Replace-FirstRegex -InputText $withoutDuplicateTitle -Pattern "(?is)<head\b[^>]*>" -Replacement "`$0`n$headPayload"
  }

  if ($withoutOldStyle -match "(?is)<html\b[^>]*>") {
    return Replace-FirstRegex -InputText $withoutOldStyle -Pattern "(?is)<html\b[^>]*>" -Replacement "`$0`n<head>`n$headPayload</head>"
  }

  return "<!doctype html>`n<html>`n<head>`n$headPayload</head>`n<body>$withoutOldStyle</body>`n</html>"
}

function Add-BodyMarker {
  param([string]$Html)

  $bodyMatch = [regex]::Match($Html, "(?is)<body\b[^>]*>")
  if (!$bodyMatch.Success) {
    return $Html -replace "(?is)</head>", "</head>`n<body class=`"course-reface-page`" data-canvas-helper-refaced=`"true`">"
  }

  $bodyTag = $bodyMatch.Value
  if ($bodyTag -match "course-reface-page") {
    return $Html
  }

  $newBodyTag = $bodyTag
  if ($newBodyTag -match "\bclass\s*=\s*`"") {
    $newBodyTag = Replace-FirstRegex -InputText $newBodyTag -Pattern "\bclass\s*=\s*`"([^`"]*)`"" -Replacement 'class="$1 course-reface-page"'
  } elseif ($newBodyTag -match "\bclass\s*=\s*'") {
    $newBodyTag = Replace-FirstRegex -InputText $newBodyTag -Pattern "\bclass\s*=\s*'([^']*)'" -Replacement "class='`$1 course-reface-page'"
  } else {
    $newBodyTag = $newBodyTag -replace ">$", " class=`"course-reface-page`">"
  }

  if ($newBodyTag -notmatch "data-canvas-helper-refaced") {
    $newBodyTag = $newBodyTag -replace ">$", " data-canvas-helper-refaced=`"true`">"
  }

  return $Html.Substring(0, $bodyMatch.Index) + $newBodyTag + $Html.Substring($bodyMatch.Index + $bodyMatch.Length)
}

function Add-InjectedTitleWhenMissing {
  param(
    [string]$Html,
    [string]$Title
  )

  if ($Html -match "(?is)<body\b[^>]*>.*?<h1\b") {
    return $Html
  }

  $safeTitle = [System.Net.WebUtility]::HtmlEncode($Title)
  $header = "`n<header class=`"course-reface-injected-title`"><h1>$safeTitle</h1></header>`n"
  return Replace-FirstRegex -InputText $Html -Pattern "(?is)<body\b[^>]*>" -Replacement "`$0$header"
}

function Convert-ContentHtml {
  param(
    [string]$Html,
    [string]$EntryName,
    [hashtable]$TitleMap
  )

  $title = Get-FallbackTitle -Html $Html -EntryName $EntryName -TitleMap $TitleMap
  $cleaned = [regex]::Replace($Html, "\sstyle\s*=\s*(`"[^`"]*`"|'[^']*'|[^\s>]+)", "", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
  $cleaned = [regex]::Replace($cleaned, "(?is)</?font\b[^>]*>", "")
  $cleaned = Ensure-HeadWithStyle -Html $cleaned -Title $title
  $cleaned = Add-BodyMarker -Html $cleaned
  $cleaned = Add-InjectedTitleWhenMissing -Html $cleaned -Title $title
  return $cleaned
}

function Resolve-ZipRelativePath {
  param(
    [string]$EntryName,
    [string]$Reference
  )

  $entryDir = ""
  $lastSlash = $EntryName.LastIndexOf("/")
  if ($lastSlash -ge 0) {
    $entryDir = $EntryName.Substring(0, $lastSlash)
  }

  $combined = if ($entryDir) { "$entryDir/$Reference" } else { $Reference }
  $parts = New-Object System.Collections.Generic.List[string]
  foreach ($segment in ($combined -split "/")) {
    if (!$segment -or $segment -eq ".") {
      continue
    }
    if ($segment -eq "..") {
      if ($parts.Count -gt 0) {
        $parts.RemoveAt($parts.Count - 1)
      }
      continue
    }
    $parts.Add($segment)
  }

  return ($parts -join "/")
}

function Get-LocalReferences {
  param([string]$Html)

  $references = New-Object System.Collections.Generic.List[string]
  foreach ($match in [regex]::Matches($Html, "(?is)\b(?:src|href)\s*=\s*(['""])(.*?)\1")) {
    $value = $match.Groups[2].Value.Trim()
    if (
      !$value -or
      $value.StartsWith("#") -or
      $value.StartsWith("?") -or
      $value.StartsWith("/") -or
      $value.StartsWith("//") -or
      $value -match "^[a-z][a-z0-9+.-]*:"
    ) {
      continue
    }

    $withoutFragment = ($value -split "[?#]", 2)[0]
    if (!$withoutFragment) {
      continue
    }

    try {
      $withoutFragment = [System.Uri]::UnescapeDataString($withoutFragment)
    } catch {
      # Keep the raw reference if decoding fails.
    }

    $references.Add($withoutFragment)
  }

  return $references
}

function Write-ReportFiles {
  param(
    [hashtable]$Report,
    [string]$JsonPath,
    [string]$MarkdownPath
  )

  if ($JsonPath) {
    Ensure-ParentDirectory -Path $JsonPath
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($JsonPath, (($Report | ConvertTo-Json -Depth 8) + "`n"), $utf8NoBom)
  }

  if ($MarkdownPath) {
    Ensure-ParentDirectory -Path $MarkdownPath
    $missingPreview = @()
    foreach ($missing in @($Report.missingLocalReferences | Select-Object -First 20)) {
      $missingPreview += ('- `' + $missing.source + '` -> `' + $missing.reference + '`')
    }
    if ($missingPreview.Count -eq 0) {
      $missingPreview += "- none"
    }

    $markdown = @(
      "# Brightspace Package Reface Report",
      "",
      ('- Input ZIP: `' + $Report.inputZip + '`'),
      ('- Output ZIP: `' + $Report.outputZip + '`'),
      ("- Total entries: " + $Report.totalEntries),
      ("- Output entries: " + $Report.outputEntryCount),
      ("- Transformed HTML pages: " + $Report.transformedHtmlCount),
      ("- Skipped HTML pages: " + $Report.skippedHtmlCount),
      ("- Non-HTML entries stream-copied: " + $Report.copiedNonHtmlCount),
      ("- Manifest unchanged: " + $Report.manifestUnchanged),
      ("- Content-service pruning enabled: " + $Report.pruneContentServiceObjects),
      ("- Pruned content-service objects: " + $Report.prunedContentServiceObjectCount),
      ("- Rewritten content-service resources: " + $Report.rewrittenContentServiceResourceCount),
      ("- Missing local references: " + $Report.missingLocalReferenceCount),
      "",
      "## Missing Local References",
      "",
      ($missingPreview -join "`n"),
      "",
      "## Size-Limit Media Split",
      "",
      ('- Media export directory: `' + $Report.mediaExportDirectory + '`'),
      ("- Pruned content-service bytes: " + $Report.prunedContentServiceObjectBytes),
      ("- Rewritten manifest resources: " + $Report.rewrittenContentServiceResourceCount),
      "",
      "## Notes",
      "",
      '- `imsmanifest.xml` is modified only when content-service pruning is explicitly enabled.',
      '- Media, PDFs, XML, and non-content folders are otherwise copied without payload rewrites.',
      '- Root-relative Brightspace template paths such as `/shared/...` and external URLs were ignored during local link validation.',
      "- Built-in LMS package structure was preserved; only content-root HTML payloads were refaced."
    ) -join "`n"

    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($MarkdownPath, ($markdown + "`n"), $utf8NoBom)
  }
}

Assert-InputFile -Path $InputZip
Ensure-ParentDirectory -Path $OutputZip
if (Test-Path -LiteralPath $OutputZip) {
  Remove-Item -LiteralPath $OutputZip -Force
}

$entryNames = New-Object "System.Collections.Generic.HashSet[string]"
$availableEntryNames = New-Object "System.Collections.Generic.HashSet[string]"
$outputEntryNames = New-Object "System.Collections.Generic.HashSet[string]"
$transformedEntries = New-Object System.Collections.Generic.List[object]
$skippedHtmlEntries = New-Object System.Collections.Generic.List[string]
$missingReferences = New-Object System.Collections.Generic.List[object]
$prunedContentServiceObjects = New-Object System.Collections.Generic.List[object]
$rewrittenContentServiceResources = @()
$copiedNonHtmlCount = 0
$transformedHtmlCount = 0
$inputManifestHash = ""
$outputManifestHash = ""
$titleMap = @{}
$manifestOutputText = ""

$inputStream = [System.IO.File]::Open($InputZip, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::Read)
$outputStream = [System.IO.File]::Open($OutputZip, [System.IO.FileMode]::CreateNew, [System.IO.FileAccess]::ReadWrite, [System.IO.FileShare]::None)

try {
  $inputArchive = New-Object System.IO.Compression.ZipArchive($inputStream, [System.IO.Compression.ZipArchiveMode]::Read, $false)
  $outputArchive = New-Object System.IO.Compression.ZipArchive($outputStream, [System.IO.Compression.ZipArchiveMode]::Create, $false)

  try {
    foreach ($entry in $inputArchive.Entries) {
      [void]$entryNames.Add($entry.FullName)
      if (!($PruneContentServiceObjects -and (Test-IsContentServiceObjectEntry -EntryName $entry.FullName))) {
        [void]$availableEntryNames.Add($entry.FullName)
      }
    }

    $manifestEntry = $inputArchive.GetEntry("imsmanifest.xml")
    if ($manifestEntry) {
      $manifestText = Read-ZipEntryText -Entry $manifestEntry
      $inputManifestHash = Get-Sha256Text -Text $manifestText
      $titleMap = Get-ManifestTitleMap -ManifestXml $manifestText
      $manifestOutputText = $manifestText

      if ($PruneContentServiceObjects) {
        $manifestRewrite = Convert-ContentServiceResourcesInManifest -ManifestXml $manifestText
        $manifestOutputText = $manifestRewrite.text
        $rewrittenContentServiceResources = @($manifestRewrite.rewrittenResources)
      }
    }

    foreach ($entry in $inputArchive.Entries) {
      if ($PruneContentServiceObjects -and (Test-IsContentServiceObjectEntry -EntryName $entry.FullName)) {
        if (!$entry.FullName.EndsWith("/")) {
          $prunedContentServiceObjects.Add([ordered]@{
            path = $entry.FullName
            bytes = $entry.Length
            compressedBytes = $entry.CompressedLength
          })

          if ($MediaExportDirectory) {
            Export-ZipEntryFile -Entry $entry -Directory $MediaExportDirectory
          }
        }
        continue
      }

      $targetEntry = $outputArchive.CreateEntry($entry.FullName, [System.IO.Compression.CompressionLevel]::NoCompression)
      $targetEntry.LastWriteTime = $entry.LastWriteTime
      [void]$outputEntryNames.Add($entry.FullName)

      if ($entry.FullName.EndsWith("/")) {
        continue
      }

      if ($entry.FullName -eq "imsmanifest.xml" -and $PruneContentServiceObjects) {
        Write-ZipEntryText -TargetEntry $targetEntry -Text $manifestOutputText
        $copiedNonHtmlCount += 1
      } elseif (Test-IsContentHtmlEntry -EntryName $entry.FullName) {
        $sourceHtml = Read-ZipEntryText -Entry $entry
        $transformedHtml = Convert-ContentHtml -Html $sourceHtml -EntryName $entry.FullName -TitleMap $titleMap
        Write-ZipEntryText -TargetEntry $targetEntry -Text $transformedHtml
        $transformedHtmlCount += 1
        $transformedEntries.Add([ordered]@{
          path = $entry.FullName
          title = Get-FallbackTitle -Html $sourceHtml -EntryName $entry.FullName -TitleMap $titleMap
        })

        foreach ($reference in Get-LocalReferences -Html $transformedHtml) {
          $resolved = Resolve-ZipRelativePath -EntryName $entry.FullName -Reference $reference
          if (!$availableEntryNames.Contains($resolved)) {
            $missingReferences.Add([ordered]@{
              source = $entry.FullName
              reference = $reference
              resolved = $resolved
            })
          }
        }
      } else {
        Copy-ZipEntryStream -SourceEntry $entry -TargetEntry $targetEntry
        if (Test-IsHtmlEntry -EntryName $entry.FullName) {
          $skippedHtmlEntries.Add($entry.FullName)
        } else {
          $copiedNonHtmlCount += 1
        }
      }
    }

    if ($PruneContentServiceObjects) {
      foreach ($resourceRewrite in @($rewrittenContentServiceResources)) {
        $placeholderHref = $resourceRewrite.placeholderHref
        if ($outputEntryNames.Contains($placeholderHref)) {
          continue
        }

        $placeholderEntry = $outputArchive.CreateEntry($placeholderHref, [System.IO.Compression.CompressionLevel]::NoCompression)
        [void]$outputEntryNames.Add($placeholderHref)
        $placeholderHtml = New-ExternalizedMediaPlaceholderHtml -Title $resourceRewrite.title -OriginalHrefs $resourceRewrite.originalHrefs
        Write-ZipEntryText -TargetEntry $placeholderEntry -Text $placeholderHtml
      }
    }
  } finally {
    $outputArchive.Dispose()
    $inputArchive.Dispose()
  }
} finally {
  $outputStream.Dispose()
  $inputStream.Dispose()
}

$verifyStream = [System.IO.File]::Open($OutputZip, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::Read)
try {
  $verifyArchive = New-Object System.IO.Compression.ZipArchive($verifyStream, [System.IO.Compression.ZipArchiveMode]::Read, $false)
  try {
    $outputManifestEntry = $verifyArchive.GetEntry("imsmanifest.xml")
    if ($outputManifestEntry) {
      $outputManifestHash = Get-Sha256Text -Text (Read-ZipEntryText -Entry $outputManifestEntry)
    }
  } finally {
    $verifyArchive.Dispose()
  }
} finally {
  $verifyStream.Dispose()
}

$report = [ordered]@{}
$report.inputZip = (Resolve-Path -LiteralPath $InputZip).Path
$report.outputZip = (Resolve-Path -LiteralPath $OutputZip).Path
$report.createdAt = (Get-Date).ToUniversalTime().ToString("o")
$prunedContentServiceObjectBytes = [int64]0
foreach ($prunedObject in @($prunedContentServiceObjects.ToArray())) {
  $prunedContentServiceObjectBytes += [int64]$prunedObject["bytes"]
}
$report.totalEntries = $entryNames.Count
$report.outputEntryCount = $outputEntryNames.Count
$report.transformedHtmlCount = $transformedHtmlCount
$report.skippedHtmlCount = $skippedHtmlEntries.Count
$report.copiedNonHtmlCount = $copiedNonHtmlCount
$report.manifestInputSha256 = $inputManifestHash
$report.manifestOutputSha256 = $outputManifestHash
$report.manifestUnchanged = [bool]($inputManifestHash -and $inputManifestHash -eq $outputManifestHash)
$report.pruneContentServiceObjects = [bool]$PruneContentServiceObjects
$report.mediaExportDirectory = if ($MediaExportDirectory) { [System.IO.Path]::GetFullPath($MediaExportDirectory) } else { "" }
$report.prunedContentServiceObjectCount = $prunedContentServiceObjects.Count
$report.prunedContentServiceObjectBytes = $prunedContentServiceObjectBytes
$report.rewrittenContentServiceResourceCount = $rewrittenContentServiceResources.Count
$report.prunedManifestResourceCount = 0
$report.missingLocalReferenceCount = $missingReferences.Count
$report.transformedHtml = @($transformedEntries.ToArray())
$report.skippedHtml = @($skippedHtmlEntries.ToArray())
$report.prunedContentServiceObjects = @($prunedContentServiceObjects.ToArray())
$report.rewrittenContentServiceResources = @($rewrittenContentServiceResources)
$report.missingLocalReferences = @($missingReferences.ToArray())

Write-ReportFiles -Report $report -JsonPath $ReportJson -MarkdownPath $ReportMarkdown

Write-Host "Refaced Brightspace package written to $OutputZip"
Write-Host "Transformed HTML pages: $transformedHtmlCount"
Write-Host "Skipped HTML pages: $($skippedHtmlEntries.Count)"
Write-Host "Pruned content-service objects: $($prunedContentServiceObjects.Count)"
Write-Host "Missing local references: $($missingReferences.Count)"
