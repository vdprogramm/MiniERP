# Mini ERP System

## Tài khoản mẫu

Dưới đây là danh sách các tài khoản được tạo sẵn để kiểm thử hệ thống:

| Vai trò | Email | Mật khẩu mẫu |
| --- | --- | --- |
| **ADMIN** | `admin@minierp.local` | `Admin123456789` |
| **WAREHOUSE_MANAGER** | `warehouse@minierp.local` | `Warehouse@2026!` |
| **SALES_STAFF** | `sales@minierp.local` | `Sales@2026!` |
| **BRANCH_MANAGER** | `branch@minierp.local` | `Branch@2026!` |

Mini ERP – Retail Chain Management System
Hệ thống quản lý chuỗi bán lẻ được xây dựng nhằm hỗ trợ doanh nghiệp quản lý nhân viên, kho hàng, sản phẩm, bán hàng và theo dõi hoạt động kinh doanh trên một nền tảng tập trung.

Dự án áp dụng kiến trúc RESTful API, phân quyền theo vai trò (RBAC) và giao diện quản trị trực quan.

1. Công nghệ sử dụng
Thành phần	Công nghệ
Backend	C#, ASP.NET Core Web API (.NET 9)
Frontend	React, TypeScript, Vite, Tailwind CSS
Database	PostgreSQL
ORM	Entity Framework Core
Authentication	JWT
Data Visualization	Recharts
API	RESTful API
2. Chức năng chính
Quản lý người dùng và phân quyền
Hệ thống hỗ trợ 4 vai trò:

ADMIN: Quản lý nhân viên, phân công kho, quản lý hệ thống và theo dõi báo cáo.

BRANCH_MANAGER: Theo dõi hoạt động kinh doanh tại các kho được phân công.

WAREHOUSE_MANAGER: Quản lý tồn kho và thực hiện nghiệp vụ điều chỉnh số lượng hàng hóa.

SALES_STAFF: Thực hiện bán hàng, quản lý khách hàng và theo dõi hóa đơn.

Quyền truy cập được kiểm soát ở cả Frontend và Backend.

Quản lý nhân viên và kho hàng
Quản lý thông tin nhân viên.

Phân quyền theo vị trí công việc.

Phân công một nhân viên vào nhiều kho.

Giới hạn dữ liệu kho theo phạm vi được phân công.

Quản lý thông tin các kho hàng.

Quản lý sản phẩm và tồn kho
Quản lý danh mục sản phẩm.

Theo dõi số lượng tồn kho theo từng sản phẩm và kho.

Điều chỉnh số lượng tồn kho.

Kiểm soát số lượng tồn, không cho phép tồn kho âm.

Theo dõi các mặt hàng có tồn kho thấp.

Bán hàng và hóa đơn
Quản lý thông tin khách hàng.

Tạo hóa đơn bán hàng.

Tính tổng giá trị đơn hàng.

Cập nhật tồn kho khi bán hàng.

Theo dõi danh sách và chi tiết hóa đơn.

Dashboard và báo cáo
Thống kê doanh thu, hóa đơn, sản phẩm và khách hàng.

Theo dõi tình trạng tồn kho.

Biểu đồ doanh thu theo thời gian.

Thống kê sản phẩm bán chạy.

Theo dõi hoạt động kinh doanh theo phạm vi phân quyền.

Quản lý nhà cung cấp
Quản lý thông tin nhà cung cấp phục vụ hoạt động kinh doanh.

3. Cấu trúc hệ thống
Frontend (React + TypeScript)
↓ REST API
Backend (ASP.NET Core Web API)
↓ Entity Framework Core
Database (PostgreSQL)

Backend chịu trách nhiệm xác thực, phân quyền, xử lý nghiệp vụ và truy xuất dữ liệu. Frontend cung cấp giao diện tương ứng với từng vai trò.


4. Hướng dẫn chạy dự án
Yêu cầu
.NET SDK 9

Node.js và npm

PostgreSQL

Backend
Cấu hình kết nối PostgreSQL trong cấu hình ứng dụng hoặc biến môi trường.

Khôi phục dependencies và cập nhật database.

Khởi động API.

dotnet restore
dotnet ef database update
dotnet run
Frontend
npm install
npm run dev
Cấu hình địa chỉ Backend API phù hợp với môi trường chạy.

6. Điểm nổi bật
Phân quyền theo 4 vai trò nghiệp vụ.

Hỗ trợ quan hệ nhiều-nhiều giữa nhân viên và kho hàng.

Kiểm soát truy cập dữ liệu theo kho được phân công.

Xử lý giao dịch bán hàng và cập nhật tồn kho.

Dashboard và báo cáo trực quan.

Tách biệt Frontend, Backend và Database.

7. Định hướng phát triển
Quy trình đề xuất và phê duyệt nhập/xuất kho.

Theo dõi lịch sử điều chỉnh tồn kho.

Quản lý phiếu nhập hàng và công nợ nhà cung cấp.

Mở rộng hệ thống báo cáo và cảnh báo.

Triển khai hệ thống trên môi trường production.

Project Type: Full-stack Web Application
Focus: Backend Development, RESTful API, RBAC, Inventory Management