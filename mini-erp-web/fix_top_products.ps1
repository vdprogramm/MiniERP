$filePath = "E:\MiniERP\MiniERP.API\Services\ReportService.cs"
$lines = Get-Content -Path $filePath
$newLines = @()

for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($i -eq 117) {
        $newLines += "        var result = await details"
        $newLines += "            .GroupBy(x => new"
        $newLines += "            {"
        $newLines += "                x.ProductId,"
        $newLines += "                x.Product.Name"
        $newLines += "            })"
        $newLines += "            .Select(g => new"
        $newLines += "            {"
        $newLines += "                ProductId = g.Key.ProductId,"
        $newLines += "                ProductName = g.Key.Name,"
        $newLines += "                QuantitySold = g.Sum(x => x.Quantity),"
        $newLines += "                Revenue = g.Sum(x => x.UnitPrice * x.Quantity)"
        $newLines += "            })"
        $newLines += "            .OrderByDescending(x => x.QuantitySold)"
        $newLines += "            .Take(limit)"
        $newLines += "            .ToListAsync();"
        $newLines += ""
        $newLines += "        return result"
        $newLines += "            .Select(x => new TopProductResponse("
        $newLines += "                x.ProductId,"
        $newLines += "                x.ProductName,"
        $newLines += "                x.QuantitySold,"
        $newLines += "                x.Revenue"
        $newLines += "            ))"
        $newLines += "            .ToList();"
        $i += 14 
    } else {
        $newLines += $lines[$i]
    }
}
$newLines | Set-Content -Path $filePath
