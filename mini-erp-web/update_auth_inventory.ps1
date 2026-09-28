$filePath = "E:\MiniERP\MiniERP.API\Controllers\InventoryController.cs"
$content = Get-Content -Path $filePath -Raw
$content = $content -replace '(?m)^\[Authorize\]\r?$', '[Authorize(Roles = Roles.Admin + "," + Roles.WarehouseManager)]'
Set-Content -Path $filePath -Value $content
