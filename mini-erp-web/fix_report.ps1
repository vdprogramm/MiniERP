$filePath = "E:\MiniERP\MiniERP.API\Services\ReportService.cs"
$lines = Get-Content -Path $filePath
$newLines = @()

for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($i -eq 86) {
        $newLines += "        var rawData = await query"
        $newLines += "            .Select(x => new { x.CreatedAt, x.TotalAmount })"
        $newLines += "            .ToListAsync();"
        $newLines += ""
        $newLines += "        return rawData"
        $newLines += "            .GroupBy(x => x.CreatedAt.Date)"
        $newLines += "            .Select(g => new RevenueByDayResponse("
        $newLines += "                g.Key,"
        $newLines += "                g.Sum(x => x.TotalAmount),"
        $newLines += "                g.Count()"
        $newLines += "            ))"
        $newLines += "            .OrderBy(x => x.Date)"
        $newLines += "            .ToList();"
        $i += 8 
    } else {
        $newLines += $lines[$i]
    }
}
$newLines | Set-Content -Path $filePath
