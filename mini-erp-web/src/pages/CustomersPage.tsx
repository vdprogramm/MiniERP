import CrudPage from "../components/crud/CrudPage";
import { customerApi } from "../api/customerApi";

import type {
  Customer,
  CustomerRequest,
} from "../types/customer";

export default function CustomersPage() {
  return (
    <CrudPage<Customer, CustomerRequest>
      title="Quản lý khách hàng"
      description="Quản lý thông tin khách hàng trong hệ thống"
      entityLabel="khách hàng"
      fields={[
        { key: "name", label: "Họ tên", required: true },
        { key: "phone", label: "Số điện thoại", type: "tel" },
        { key: "email", label: "Email", type: "email" },
        { key: "address", label: "Địa chỉ" },
      ]}
      emptyForm={{
        name: "",
        phone: "",
        email: "",
        address: "",
      }}
      loadItems={customerApi.getAll}
      createItem={customerApi.create}
      updateItem={customerApi.update}
      deleteItem={customerApi.remove}
      toForm={(customer) => ({
        name: customer.name,
        phone: customer.phone ?? "",
        email: customer.email ?? "",
        address: customer.address ?? "",
      })}
    />
  );
}
