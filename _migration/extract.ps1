# ============================================================
#  plumbernow.co.il -> content inventory extractor
#  Pulls all pages via WP REST (clean body) + live HTML HEAD
#  (Rank Math title/description/canonical/OG + JSON-LD schema)
#  Saves everything as UTF-8 for faithful 1:1 migration.
# ============================================================

$ErrorActionPreference = "Stop"
$root    = Split-Path -Parent $MyInvocation.MyCommand.Path
$rawDir  = Join-Path $root "raw"
$htmlDir = Join-Path $rawDir "html"
New-Item -ItemType Directory -Force -Path $rawDir  | Out-Null
New-Item -ItemType Directory -Force -Path $htmlDir | Out-Null

$utf8 = New-Object System.Text.UTF8Encoding $false
function Save-Utf8($path, $text){ [System.IO.File]::WriteAllText($path, $text, $utf8) }
function Get-Url($url){
  $wc = New-Object System.Net.WebClient
  $wc.Encoding = [System.Text.Encoding]::UTF8
  $wc.Headers.Add("User-Agent","Mozilla/5.0 (migration-inventory)")
  $wc.Headers.Add("Accept-Charset","utf-8")
  return $wc.DownloadString($url)
}
function Match1($html, $pattern){
  $m = [regex]::Match($html, $pattern, "IgnoreCase, Singleline")
  if($m.Success){ return $m.Groups[1].Value.Trim() } else { return "" }
}

$base = "https://plumbernow.co.il/wp-json/wp/v2"

# ---- 1. Pull all pages (REST) ----
Write-Output "Fetching all pages via REST..."
$pagesJson = Get-Url "$base/pages?per_page=100&orderby=id&order=asc"
Save-Utf8 (Join-Path $rawDir "pages-rest.json") $pagesJson
$pages = $pagesJson | ConvertFrom-Json
Write-Output ("  pages fetched: {0}" -f $pages.Count)

# ---- 2. Per-page: save HTML + extract head meta + schema ----
$inventory = @()
$i = 0
foreach($pg in $pages){
  $i++
  $url = $pg.link
  $id  = $pg.id
  Write-Output ("[{0}/{1}] id={2}  {3}" -f $i, $pages.Count, $id, $pg.title.rendered)
  $html = ""
  try { $html = Get-Url $url } catch { Write-Output ("    ! HTML fetch failed: " + $_.Exception.Message) }

  if($html){
    Save-Utf8 (Join-Path $htmlDir "$id.html") $html
  }

  # head extraction (Rank Math output)
  $seoTitle = Match1 $html '<title>(.*?)</title>'
  $desc     = Match1 $html '<meta\s+name="description"\s+content="(.*?)"'
  $canon    = Match1 $html '<link\s+rel="canonical"\s+href="(.*?)"'
  $robots   = Match1 $html '<meta\s+name="robots"\s+content="(.*?)"'
  $ogTitle  = Match1 $html '<meta\s+property="og:title"\s+content="(.*?)"'
  $ogDesc   = Match1 $html '<meta\s+property="og:description"\s+content="(.*?)"'
  $ogImage  = Match1 $html '<meta\s+property="og:image"\s+content="(.*?)"'
  $ogType   = Match1 $html '<meta\s+property="og:type"\s+content="(.*?)"'

  # all JSON-LD blocks
  $ld = @()
  foreach($m in [regex]::Matches($html, '<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', "IgnoreCase, Singleline")){
    $ld += $m.Groups[1].Value.Trim()
  }

  $inventory += [ordered]@{
    id            = $id
    slug          = $pg.slug
    url           = $url
    rest_title    = $pg.title.rendered
    seo_title     = $seoTitle
    description   = $desc
    canonical     = $canon
    robots        = $robots
    og_title      = $ogTitle
    og_description= $ogDesc
    og_image      = $ogImage
    og_type       = $ogType
    date          = $pg.date
    modified      = $pg.modified
    parent        = $pg.parent
    menu_order    = $pg.menu_order
    featured_media= $pg.featured_media
    template      = $pg.template
    content_len   = $pg.content.rendered.Length
    jsonld_count  = $ld.Count
    jsonld        = $ld
  }
}

# ---- 3. Save combined inventory ----
$invJson = $inventory | ConvertTo-Json -Depth 8
Save-Utf8 (Join-Path $root "inventory.json") $invJson
Write-Output ""
Write-Output ("DONE. Inventory: {0} pages -> inventory.json" -f $inventory.Count)
Write-Output ("Raw HTML saved to: {0}" -f $htmlDir)
