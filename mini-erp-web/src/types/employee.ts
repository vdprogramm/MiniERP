export type Employee = {
  id: number;
  name: string;
  email: string;
  position: string;
  warehouseIds: number[];
};

export type EmployeeRequest = {
  name: string;
  email: string;
  password?: string;
  position: string;
  warehouseIds: number[];
};
