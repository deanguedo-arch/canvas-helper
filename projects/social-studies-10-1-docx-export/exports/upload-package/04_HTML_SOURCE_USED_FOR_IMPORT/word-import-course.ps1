$ErrorActionPreference = 'Stop'
$jobs = Get-Content -LiteralPath 'C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\social-studies-10-1-docx-export\exports\upload-package\04_HTML_SOURCE_USED_FOR_IMPORT\word-import-jobs.json' -Raw | ConvertFrom-Json
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
  foreach ($job in $jobs) {
    $doc = $word.Documents.Open($job.html, $false, $true)
    foreach ($shape in @($doc.InlineShapes)) {
      try {
        $link = $shape.LinkFormat
        if ($null -ne $link) {
          $link.SavePictureWithDocument = $true
          $link.BreakLink()
        }
      } catch {
      }
    }
    foreach ($shape in @($doc.Shapes)) {
      try {
        $link = $shape.LinkFormat
        if ($null -ne $link) {
          $link.SavePictureWithDocument = $true
          $link.BreakLink()
        }
      } catch {
      }
    }
    $doc.SaveAs([ref]$job.docx, [ref]16)
    $doc.Close($false)
  }
} finally {
  $word.Quit()
}