import CrudPage from "../components/crud/CrudPage";
import { supplierApi } from "../api/supplierApi";

import type {
  Supplier,
  SupplierRequest,
} from "../types/supplier";

export default function SuppliersPage() {
  return (
    <CrudPage<Supplier, SupplierRequest>
      title="Quản lý nhà cung cấp"
      description="Quản lý các đơn vị cung cấp hàng hóa"
      entityLabel="nhà cung cấp"
      fields={[
        { key: "name", label: "Tên nhà cung cấp", required: true },
        { key: "phone", label: "Số điện thoại", type: "tel" },
        { key: "address", label: "Địa chỉ" },
      ]}
      emptyForm={{
        name: "",
        phone: "",
        address: "",
      }}
      loadItems={supplierApi.getAll}
      createItem={supplierApi.create}
      updateItem={supplierApi.update}
      deleteItem={supplierApi.remove}
      toForm={(supplier) => ({
        name: supplier.name,
        phone: supplier.phone ?? "",
        address: supplier.address ?? "",
      })}
    />
  );
}
