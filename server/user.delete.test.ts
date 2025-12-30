import { describe, it, expect } from "vitest";
import { deleteUser } from "./db";

describe("User Delete Functionality", () => {
  it("deve ter função deleteUser disponível", () => {
    expect(typeof deleteUser).toBe("function");
  });

  it("deleteUser deve aceitar userId como parâmetro", () => {
    expect(deleteUser.length).toBe(1);
  });
});
