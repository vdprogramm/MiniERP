using MiniERP.API.DTOs.Reports;

namespace MiniERP.API.Services;

public interface IReportService
{
    Task<DashboardResponse> GetDashboardAsync(
        IEnumerable<int>? warehouseIds);

    Task<List<RevenueByDayResponse>> GetRevenueAsync(
        DateTime from,
        DateTime to,
        IEnumerable<int>? warehouseIds);

    Task<List<TopProductResponse>> GetTopProductsAsync(
        IEnumerable<int>? warehouseIds,
        int limit);
}
