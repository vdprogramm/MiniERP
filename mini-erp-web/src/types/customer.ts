export type Customer = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
};

export type CustomerRequest = {
  name: string;
  phone: string;
  email: string;
  address: string;
};
