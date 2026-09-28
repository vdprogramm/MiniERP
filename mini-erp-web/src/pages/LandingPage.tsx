import { Link } from "react-router-dom";
import { Store, BarChart3, Users, Box, ShieldCheck, Zap, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
              <Store size={20} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">MiniERP</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              Đăng nhập
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-medium text-sm mb-8">
              <Zap size={16} className="text-blue-500" />
              <span>Nền tảng quản lý thế hệ mới</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
              Quản lý chuỗi bán lẻ <br className="hidden lg:block"/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">thông minh hơn</span>
            </h1>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed font-medium">
              Tối ưu hóa quy trình vận hành, quản lý kho hàng, doanh thu và nhân sự 
              tất cả trong một nền tảng duy nhất, dễ sử dụng và hiệu quả cao.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login" className="flex items-center gap-2 px-8 py-4 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1">
                Bắt đầu ngay <ArrowRight size={18} />
              </Link>
              <a href="#features" className="px-8 py-4 rounded-full bg-white text-slate-700 font-semibold border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all">
                Tìm hiểu thêm
              </a>
            </div>
          </div>
          
          {/* Dashboard Preview mockup */}
          <div className="mt-20 relative mx-auto max-w-5xl">
            <div className="rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-xl p-3 shadow-2xl">
              <div className="rounded-xl overflow-hidden border border-slate-100 bg-white aspect-[16/9] relative shadow-inner">
                {/* Dashboard Header */}
                <div className="h-14 border-b border-slate-100 flex items-center justify-between px-6 bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-800 text-lg flex items-center gap-2">
                      <Store size={18} className="text-blue-600" />
                      Tổng quan
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium bg-white px-3 py-1.5 rounded-full border border-slate-200">
                      <span>Tháng này</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-200">
                      AD
                    </div>
                  </div>
                </div>
                
                {/* Dashboard Content */}
                <div className="p-6 flex h-[calc(100%-3.5rem)] gap-6">
                  {/* Sidebar */}
                  <div className="w-48 flex-shrink-0 flex flex-col gap-2">
                    <div className="h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center px-3 text-blue-700 font-semibold text-sm gap-3 transition-colors">
                      <BarChart3 size={18} />
                      Bảng điều khiển
                    </div>
                    <div className="h-10 rounded-lg hover:bg-slate-50 flex items-center px-3 text-slate-600 font-medium text-sm gap-3 transition-colors cursor-default">
                      <Box size={18} />
                      Sản phẩm
                    </div>
                    <div className="h-10 rounded-lg hover:bg-slate-50 flex items-center px-3 text-slate-600 font-medium text-sm gap-3 transition-colors cursor-default">
                      <Store size={18} />
                      Kho hàng
                    </div>
                    <div className="h-10 rounded-lg hover:bg-slate-50 flex items-center px-3 text-slate-600 font-medium text-sm gap-3 transition-colors cursor-default">
                      <Users size={18} />
                      Khách hàng
                    </div>
                  </div>
                  
                  {/* Main content */}
                  <div className="flex-1 flex flex-col gap-6">
                    {/* Stat cards */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-5 rounded-xl border border-slate-100 bg-white shadow-sm flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-slate-500 text-sm font-medium">Doanh thu</span>
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <BarChart3 size={16} />
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-slate-800">128.5M ₫</span>
                        <span className="text-emerald-500 text-xs font-semibold mt-1">+12.5% so với tháng trước</span>
                      </div>
                      <div className="p-5 rounded-xl border border-slate-100 bg-white shadow-sm flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-slate-500 text-sm font-medium">Đơn hàng</span>
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Box size={16} />
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-slate-800">1,248</span>
                        <span className="text-emerald-500 text-xs font-semibold mt-1">+8.2% so với tháng trước</span>
                      </div>
                      <div className="p-5 rounded-xl border border-slate-100 bg-white shadow-sm flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-slate-500 text-sm font-medium">Khách hàng mới</span>
                          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                            <Users size={16} />
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-slate-800">342</span>
                        <span className="text-red-500 text-xs font-semibold mt-1">-2.4% so với tháng trước</span>
                      </div>
                    </div>
                    
                    {/* Charts area */}
                    <div className="flex-1 flex gap-4">
                      <div className="flex-[2] rounded-xl border border-slate-100 bg-white shadow-sm p-5 flex flex-col">
                        <span className="font-bold text-slate-700 mb-6">Biểu đồ doanh thu 7 ngày qua</span>
                        <div className="flex-1 flex items-end justify-between gap-2 px-2 pb-2 border-b border-slate-100 relative">
                          {/* Y-axis lines */}
                          <div className="absolute left-0 right-0 bottom-1/3 border-t border-slate-50 border-dashed"></div>
                          <div className="absolute left-0 right-0 bottom-2/3 border-t border-slate-50 border-dashed"></div>
                          <div className="w-full bg-blue-100 rounded-t-md h-[40%] hover:bg-blue-200 transition-colors cursor-pointer relative group"></div>
                          <div className="w-full bg-blue-200 rounded-t-md h-[60%] hover:bg-blue-300 transition-colors cursor-pointer"></div>
                          <div className="w-full bg-blue-500 rounded-t-md h-[85%] hover:bg-blue-600 transition-colors cursor-pointer"></div>
                          <div className="w-full bg-blue-200 rounded-t-md h-[50%] hover:bg-blue-300 transition-colors cursor-pointer"></div>
                          <div className="w-full bg-blue-300 rounded-t-md h-[70%] hover:bg-blue-400 transition-colors cursor-pointer"></div>
                          <div className="w-full bg-blue-600 rounded-t-md h-[95%] hover:bg-blue-700 transition-colors cursor-pointer"></div>
                          <div className="w-full bg-blue-400 rounded-t-md h-[80%] hover:bg-blue-500 transition-colors cursor-pointer"></div>
                        </div>
                        <div className="flex justify-between px-2 pt-2 text-xs text-slate-400 font-medium">
                          <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
                        </div>
                      </div>
                      <div className="flex-1 rounded-xl border border-slate-100 bg-white shadow-sm p-5 flex flex-col items-center justify-center relative">
                         <span className="font-bold text-slate-700 absolute top-5 left-5">Tỷ trọng</span>
                        <div className="w-32 h-32 rounded-full border-[12px] border-slate-50 border-t-blue-500 border-r-indigo-500 border-b-purple-500 relative flex items-center justify-center shadow-inner">
                          <span className="font-bold text-slate-700">100%</span>
                        </div>
                        <div className="flex gap-4 mt-6 text-xs text-slate-500">
                          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div>Bán lẻ</div>
                          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"></div>Sỉ</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent opacity-80 pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4">Tính năng nổi bật</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">Trang bị đầy đủ công cụ để quản lý doanh nghiệp bán lẻ của bạn từ mọi quy mô.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                <Box size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Quản lý Kho</h3>
              <p className="text-slate-600 leading-relaxed">Kiểm soát tồn kho theo thời gian thực, quản lý đa chi nhánh và tự động cảnh báo sắp hết hàng.</p>
            </div>
            
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
                <BarChart3 size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Báo cáo Doanh thu</h3>
              <p className="text-slate-600 leading-relaxed">Phân tích chuyên sâu với biểu đồ trực quan, giúp bạn đưa ra quyết định kinh doanh chính xác.</p>
            </div>
            
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                <Users size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Quản lý Nhân sự</h3>
              <p className="text-slate-600 leading-relaxed">Phân quyền chi tiết, theo dõi hiệu suất nhân viên và quản lý thông tin khách hàng đồng bộ.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Store size={16} />
            </div>
            <span className="text-xl font-bold text-white">MiniERP</span>
          </div>
          <p>© {new Date().getFullYear()} MiniERP. Tất cả quyền được bảo lưu.</p>
          <div className="flex gap-4">
            <ShieldCheck size={20} className="hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
      </footer>
    </div>
  );
}
