import { describe, expect, it } from "vitest";
import { validateLogin } from "../login-validation";

describe("login validation", () => {
  it("accepts editable credentials with a valid format", () => {
    expect(
      validateLogin({
        email: "asesora@colsubsidio.com",
        password: "segura123",
      }),
    ).toEqual({});
  });

  it("returns specific errors without exposing or preloading credentials", () => {
    expect(validateLogin({ email: "correo-invalido", password: "123" })).toEqual({
      email: "Ingresa un correo válido.",
      password: "La contraseña debe tener al menos 6 caracteres.",
    });
  });
});
