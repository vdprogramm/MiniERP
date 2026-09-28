export type Warehouse = {
  id: number;
  name: string;
  location: string;
  managerId: number | null;
  managerName: string | null;
};

export type WarehouseRequest = {
  name: string;
  location: string;
  managerId: number | null;
};

export type EmployeeOption = {
  id: number;
  name: string;
};
