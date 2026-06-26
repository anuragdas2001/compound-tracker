import { api } from "./api";

import type {
  SignupFormValues,
  LoginFormValues,
} from "../../types/auth/schemas";

export const authService = {
  register: (data: SignupFormValues) =>
    api.post("/auth/register", data),

  login: (data: LoginFormValues) =>
    api.post("/auth/login", data),

  me: () => api.get("/auth/me"),

  logout: () => api.post("/auth/logout"),
};