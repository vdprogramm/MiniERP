import api from "./axios";
import type { Employee, EmployeeRequest } from "../types/employee";

function extractEmployees(data: unknown): Employee[] {
  if (Array.isArray(data)) return data;

  if (data && typeof data === "object") {
    const result = data as Record<string, unknown>;

    if (Array.isArray(result.items)) {
      return result.items as Employee[];
    }

    if (Array.isArray(result.data)) {
      return result.data as Employee[];
    }
  }

  throw new Error("Dữ liệu nhân viên không đúng định dạng.");
}

export const employeeApi = {
  getAll: async (search = ""): Promise<Employee[]> => {
    const response = await api.get<Employee[]>("/employees");

    const employees = extractEmployees(response.data);
    const keyword = search.trim().toLowerCase();

    if (!keyword) return employees;

    return employees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(keyword) ||
        employee.email.toLowerCase().includes(keyword)
    );
  },

  create: async (data: EmployeeRequest): Promise<Employee> => {
    const response = await api.post<Employee>("/employees", data);
    return response.data;
  },

  updateRole: async (
    id: number,
    position: string
  ): Promise<Employee> => {
    const response = await api.patch<Employee>(
      `/employees/${id}/role`,
      { position }
    );

    return response.data;
  },

  updateWarehouses: async (
    id: number,
    warehouseIds: number[]
  ): Promise<Employee> => {
    const response = await api.put<Employee>(
      `/employees/${id}/warehouses`,
      { warehouseIds }
    );

    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/employees/${id}`);
  },
};
