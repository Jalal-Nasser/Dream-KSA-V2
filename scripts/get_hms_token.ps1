param(
  [string]$RoomId = "58e2f186-591d-425d-8832-57d2666f0e8c",
  [string]$Role   = "speaker",
  [string]$UserId = "3e0f33e4-b6ef-474a-a84e-e6d4070d2dcc"
)

# read anon token from env
$anon = $env:SUPABASE_ANON
if (-not $anon) { Write-Host "Warning: SUPABASE_ANON not set in environment." }

$body = @{ room_id = $RoomId; role = $Role; user_id = $UserId } | ConvertTo-Json

try {
  $resp = Invoke-RestMethod -Uri 'https://kgcpeoidouajwytndtqi.supabase.co/functions/v1/hms-token' `
    -Method Post `
    -Headers @{ 'Content-Type' = 'application/json'; 'Authorization' = "Bearer $anon" } `
    -Body $body -ErrorAction Stop

  # Pretty-print JSON response
  $resp | ConvertTo-Json -Depth 5
}
catch {
  $ex = $_.Exception
  if ($ex.Response -ne $null) {
    $status = $ex.Response.StatusCode.value__ 2>$null
    $stream = $ex.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $bodyText = $reader.ReadToEnd()
    "HTTP status: $status"
    "RESPONSE BODY:"
    $bodyText
  } else {
    "ERROR (no HTTP response object):"
    $_ | Format-List -Force
  }
}

