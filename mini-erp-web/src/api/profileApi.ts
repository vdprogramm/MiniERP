import api from "./axios";

export interface Profile {
  id: number;
  name: string;
  email: string;
  position: string;
  warehouses: {
    id: number;
    name: string;
  }[];
}

export const profileApi = {
  get: async (): Promise<Profile> => {
    const response = await api.get<Profile>("/profile");
    return response.data;
  },
};
