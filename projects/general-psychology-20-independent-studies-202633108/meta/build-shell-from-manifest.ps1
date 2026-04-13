param(
  [string]$Slug = "general-psychology-20-independent-studies-202633108"
)

$ErrorActionPreference = "Stop"

function Get-RepoRoot {
  return Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))
}

function Get-ChildrenByName {
  param(
    [System.Xml.XmlNode]$Node,
    [string]$LocalName
  )

  if (-not $Node) {
    return @()
  }

  $matches = @($Node.ChildNodes | Where-Object { ($_.NodeType -eq [System.Xml.XmlNodeType]::Element) -and ($_.LocalName -eq $LocalName) })
  return ,$matches
}

function Get-FirstChildByName {
  param(
    [System.Xml.XmlNode]$Node,
    [string]$LocalName
  )

  $children = @(Get-ChildrenByName -Node $Node -LocalName $LocalName)
  if ($children.Count -gt 0) {
    return $children[0]
  }

  return $null
}

function Get-ItemTitle {
  param([System.Xml.XmlNode]$Node)

  $titleNode = Get-FirstChildByName -Node $Node -LocalName "title"
  if (-not $titleNode) {
    return ""
  }

  return ($titleNode.InnerText -replace "\s+", " ").Trim()
}

function Get-ResourceKind {
  param([hashtable]$Resource)

  if (-not $Resource) {
    return "other"
  }

  $type = [string]$Resource.type
  $href = [string]$Resource.href
  $lowerHref = $href.ToLowerInvariant()

  if ($type -match "assignment") {
    return "assignment"
  }
  if ($type -match "assessment") {
    return "quiz"
  }
  if ($lowerHref.EndsWith(".pdf")) {
    return "pdf"
  }
  if ($lowerHref.EndsWith(".html") -or $lowerHref.EndsWith(".htm")) {
    return "html"
  }

  return "other"
}

function Get-RenderHint {
  param(
    [string]$Kind,
    [string]$ResourceKind
  )

  if ($Kind -eq "assessment") {
    return "assessment"
  }
  if ($ResourceKind -eq "html") {
    return "reading"
  }

  return "fallback"
}

function Get-ModuleOverline {
  param(
    [string]$Title,
    [int]$Sequence
  )

  if ($Title -match "(?i)\bmodule\s*(\d+)\b") {
    return "Module $($Matches[1])"
  }
  if ($Title -match "^\s*(\d+)\s*[\.:]") {
    return "Module $($Matches[1])"
  }
  if ($Title -match "(?i)^course information") {
    return "Course"
  }
  if ($Title -match "(?i)^student resource materials") {
    return "Resources"
  }

  return "Module $Sequence"
}

function ShouldSkipTopLevelModule {
  param([string]$Title)

  $normalized = ($Title -replace "\s+", " ").Trim().ToLowerInvariant()
  return $normalized -in @(
    "course information",
    "student resource materials"
  )
}

function Encode-PathForUrl {
  param([string]$Value)

  if (-not $Value) {
    return ""
  }

  return (($Value -replace "\\", "/" -split "/") | Where-Object { $_ } | ForEach-Object {
    [System.Uri]::EscapeDataString($_)
  }) -join "/"
}

function New-OverviewActivity {
  param(
    [string]$Slug,
    [string]$ModuleId,
    [string]$ModuleTitle,
    [int]$ModuleSequence
  )

  return [ordered]@{
    id = "$Slug::$ModuleId::overview"
    kind = "overview"
    title = $ModuleTitle
    description = "Module overview"
    order = 0
    linkedAssessmentIds = @()
    linkedOutcomeIds = @()
    status = "pending"
    moduleTitle = $ModuleTitle
    moduleSequence = $ModuleSequence
    moduleVisibilityLabel = "visible"
    sourceHref = ""
    resourceKind = "other"
    contentBody = ""
    contentPreview = ""
    renderHint = "fallback"
  }
}

function New-Activity {
  param(
    [string]$Slug,
    [System.Xml.XmlNode]$ItemNode,
    [hashtable]$Resource,
    [string]$ModuleTitle,
    [int]$ModuleSequence,
    [string]$SectionTitle,
    [int]$Order
  )

  $itemId = [string]$ItemNode.Attributes["identifier"].Value
  $resourceKind = Get-ResourceKind -Resource $Resource
  $kind = if ($resourceKind -eq "assignment" -or $resourceKind -eq "quiz") { "assessment" } else { "lesson" }
  $missingNote = ""
  if ($kind -eq "assessment" -and -not $Resource.exists) {
    $missingNote = "This assessment is referenced in the D2L export, but the cartridge bundle on this computer did not include the source file."
  }

  return [ordered]@{
    id = "$Slug::$itemId"
    kind = $kind
    title = (Get-ItemTitle -Node $ItemNode)
    description = if ($kind -eq "assessment") { "Assessment item" } else { "Course content item" }
    order = $Order
    linkedAssessmentIds = @()
    linkedOutcomeIds = @()
    status = "pending"
    sectionTitle = $SectionTitle
    moduleTitle = $ModuleTitle
    moduleSequence = $ModuleSequence
    moduleVisibilityLabel = "visible"
    sourceHref = if ($Resource.exists) { $Resource.href } else { "" }
    resourceKind = $resourceKind
    contentBody = $missingNote
    contentPreview = $missingNote
    renderHint = (Get-RenderHint -Kind $kind -ResourceKind $resourceKind)
  }
}

function Flatten-Activities {
  param(
    [string]$Slug,
    [System.Xml.XmlNode]$ParentNode,
    [hashtable]$ResourcesById,
    [string]$ModuleTitle,
    [int]$ModuleSequence,
    [string]$SectionTitle,
    [ref]$OrderRef
  )

  $items = New-Object System.Collections.ArrayList
  foreach ($child in (Get-ChildrenByName -Node $ParentNode -LocalName "item")) {
    $identifierRef = [string]$child.Attributes["identifierref"].Value
    if ($identifierRef) {
      [void]$items.Add((New-Activity `
        -Slug $Slug `
        -ItemNode $child `
        -Resource $ResourcesById[$identifierRef] `
        -ModuleTitle $ModuleTitle `
        -ModuleSequence $ModuleSequence `
        -SectionTitle $SectionTitle `
        -Order $OrderRef.Value))
      $OrderRef.Value++
    }

    $grandchildren = Get-ChildrenByName -Node $child -LocalName "item"
    if ($grandchildren.Count -gt 0) {
      $nextSectionTitle = if ($identifierRef) { $SectionTitle } else { (Get-ItemTitle -Node $child) }
      foreach ($entry in (Flatten-Activities `
        -Slug $Slug `
        -ParentNode $child `
        -ResourcesById $ResourcesById `
        -ModuleTitle $ModuleTitle `
        -ModuleSequence $ModuleSequence `
        -SectionTitle $nextSectionTitle `
        -OrderRef $OrderRef)) {
        [void]$items.Add($entry)
      }
    }
  }

  return @($items)
}

$repoRoot = Get-RepoRoot
$projectRoot = Split-Path -Parent $PSScriptRoot
$workspaceRoot = Join-Path $projectRoot "workspace"
$metaRoot = Join-Path $projectRoot "meta"
$resourcesRoot = Join-Path $repoRoot "projects/resources/$Slug"
$manifestPath = Join-Path $resourcesRoot "imsmanifest.xml"

[xml]$manifestXml = Get-Content -LiteralPath $manifestPath -Raw
$manifestNode = $manifestXml.DocumentElement
$metadataNode = Get-FirstChildByName -Node $manifestNode -LocalName "metadata"
$lomNode = Get-FirstChildByName -Node $metadataNode -LocalName "lom"
$generalNode = Get-FirstChildByName -Node $lomNode -LocalName "general"
$titleNode = Get-FirstChildByName -Node (Get-FirstChildByName -Node $generalNode -LocalName "title") -LocalName "string"
$courseTitle = if ($titleNode) { ($titleNode.InnerText -replace "\s+", " ").Trim() } else { $Slug }

$resourcesById = @{}
foreach ($resourceNode in (Get-ChildrenByName -Node (Get-FirstChildByName -Node $manifestNode -LocalName "resources") -LocalName "resource")) {
  $resourceId = [string]$resourceNode.Attributes["identifier"].Value
  $resourceHrefNode = Get-FirstChildByName -Node $resourceNode -LocalName "file"
  $resourceHref = if ($resourceHrefNode) { [string]$resourceHrefNode.Attributes["href"].Value } else { "" }
  $resourcePath = if ($resourceHref) { Join-Path $resourcesRoot ($resourceHref -replace "/", [System.IO.Path]::DirectorySeparatorChar) } else { "" }
  $resourcesById[$resourceId] = @{
    identifier = $resourceId
    type = [string]$resourceNode.Attributes["type"].Value
    href = $resourceHref
    exists = [bool]($resourcePath -and (Test-Path -LiteralPath $resourcePath))
  }
}

$organizationNode = Get-FirstChildByName -Node (Get-FirstChildByName -Node (Get-FirstChildByName -Node $manifestNode -LocalName "organizations") -LocalName "organization") -LocalName "item"
$moduleNodes = Get-ChildrenByName -Node $organizationNode -LocalName "item"

$modules = New-Object System.Collections.ArrayList
$assessmentDelivery = New-Object System.Collections.ArrayList
$mapModules = New-Object System.Collections.ArrayList
$sequence = 1

foreach ($moduleNode in $moduleNodes) {
  $moduleId = [string]$moduleNode.Attributes["identifier"].Value
  $moduleTitle = Get-ItemTitle -Node $moduleNode
  if (ShouldSkipTopLevelModule -Title $moduleTitle) {
    continue
  }
  $moduleActivities = New-Object System.Collections.ArrayList
  [void]$moduleActivities.Add((New-OverviewActivity -Slug $Slug -ModuleId $moduleId -ModuleTitle $moduleTitle -ModuleSequence $sequence))

  $orderRef = [ref]1
  foreach ($activity in (Flatten-Activities `
    -Slug $Slug `
    -ParentNode $moduleNode `
    -ResourcesById $resourcesById `
    -ModuleTitle $moduleTitle `
    -ModuleSequence $sequence `
    -SectionTitle "" `
    -OrderRef $orderRef)) {
    [void]$moduleActivities.Add($activity)
    if ($activity.resourceKind -eq "assignment") {
      $hasSource = -not [string]::IsNullOrWhiteSpace($activity.sourceHref)
      [void]$assessmentDelivery.Add([ordered]@{
        activityId = $activity.id
        deliveryMode = "document-handin"
        ctaLabel = if ($hasSource) { "Open assignment source" } else { "Assignment source missing from export" }
        ctaUrl = if ($hasSource) { "/preview/references/raw/$([System.Uri]::EscapeDataString($Slug))/$(Encode-PathForUrl -Value $activity.sourceHref)" } else { "" }
        statusText = if ($hasSource) {
          "Review the original assignment source, complete the work using your usual classroom submission flow, and submit it outside the workspace."
        } else {
          "The export references this assignment, but the actual assignment source file was missing from the bundle on this computer."
        }
        summary = if ($hasSource) {
          "This hand-in assignment stays external on the first conversion pass so the original course flow is preserved."
        } else {
          "This assignment is listed in the D2L structure, but its source file was not included in the cartridge bundle."
        }
        handInNote = if ($hasSource) {
          "Use the linked assignment source and the module readings as support, then submit the finished work through your classroom hand-in flow."
        } else {
          "Use the surrounding module materials for now. If the missing assignment files are recovered later, this card can be upgraded."
        }
      })
    }
  }

  $activityArray = @($moduleActivities)
  $lessonCount = @($activityArray | Where-Object { $_.kind -eq "lesson" }).Count
  $assessmentCount = @($activityArray | Where-Object { $_.kind -eq "assessment" }).Count

  [void]$modules.Add([ordered]@{
    id = $moduleId
    title = $moduleTitle
    overline = (Get-ModuleOverline -Title $moduleTitle -Sequence $sequence)
    summary = ""
    sequence = $sequence
    lessonCount = $lessonCount
    assessmentCount = $assessmentCount
    activityCount = $activityArray.Count
    completedCount = 0
    activities = $activityArray
  })

  [void]$mapModules.Add([ordered]@{
    id = $moduleId
    title = $moduleTitle
    sequence = $sequence
    activities = @($activityArray | Where-Object { $_.kind -ne "overview" } | ForEach-Object {
      [ordered]@{
        id = $_.id
        title = $_.title
        sectionTitle = $_.sectionTitle
        kind = $_.kind
        resourceKind = $_.resourceKind
        sourceHref = $_.sourceHref
      }
    })
  })

  $sequence++
}

$courseShellData = [ordered]@{
  projectSlug = $Slug
  title = $courseTitle
  subtitle = "$courseTitle course shell"
  overview = "Use the reusable shell to navigate modules, review source lessons, and keep assessments organized in one place."
  storageKey = "$Slug::workspace-state::v1"
  stats = [ordered]@{
    moduleCount = @($modules).Count
  }
  modules = @($modules)
}

$mapJson = [ordered]@{
  projectSlug = $Slug
  courseTitle = $courseTitle
  generatedAt = (Get-Date).ToString("o")
  modules = @($mapModules)
}

$markdown = New-Object System.Collections.Generic.List[string]
$markdown.Add("# D2L Course Map")
$markdown.Add("")
$markdown.Add("- Project: $Slug")
$markdown.Add("- Course: $courseTitle")
$markdown.Add("- Generated: $((Get-Date).ToString("o"))")
$markdown.Add("")
foreach ($module in $mapModules) {
  $markdown.Add("## $($module.sequence). $($module.title)")
  $markdown.Add("")
  foreach ($activity in $module.activities) {
    $prefix = if ($activity.sectionTitle) { "$($activity.sectionTitle) -> " } else { "" }
    $markdown.Add("- $prefix$($activity.title) [$($activity.resourceKind)]")
  }
  $markdown.Add("")
}

Set-Content -LiteralPath (Join-Path $workspaceRoot "course-shell-data.js") -Value ("export default " + ($courseShellData | ConvertTo-Json -Depth 100) + ";" + [Environment]::NewLine) -Encoding UTF8
Set-Content -LiteralPath (Join-Path $workspaceRoot "assessment-delivery.js") -Value ("const assessmentDelivery = " + (@($assessmentDelivery) | ConvertTo-Json -Depth 20) + ";" + [Environment]::NewLine + [Environment]::NewLine + "export default assessmentDelivery;" + [Environment]::NewLine) -Encoding UTF8
Set-Content -LiteralPath (Join-Path $metaRoot "d2l-course-map.json") -Value (($mapJson | ConvertTo-Json -Depth 100) + [Environment]::NewLine) -Encoding UTF8
Set-Content -LiteralPath (Join-Path $metaRoot "d2l-course-map.md") -Value (($markdown -join [Environment]::NewLine) + [Environment]::NewLine) -Encoding UTF8
