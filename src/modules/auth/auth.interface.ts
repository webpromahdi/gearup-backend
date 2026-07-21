import { Role } from "../../../generated/prisma/enums.js";

export interface TRegisterPayload {
  name: string;
  email: string;
  password: string;
  role: Extract<Role, "CUSTOMER" | "PROVIDER">;
  phone?: string;
  address?: string;
  profileImage?: string;
  bio?: string;
}

export interface TLoginUser {
  email: string;
  password: string;
}
