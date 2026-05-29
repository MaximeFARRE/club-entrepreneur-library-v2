import { describe, it, expect, vi, beforeEach } from "vitest";
import * as profileRepo from "@/repositories/profile.repository";
import { updateProfileName } from "../profile.service";

vi.mock("@/repositories/profile.repository", () => {
  return {
    updateProfileName: vi.fn(),
  };
});

describe("profile.service - updateProfileName", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully validate and call repo.updateProfileName when name is valid", async () => {
    vi.mocked(profileRepo.updateProfileName).mockResolvedValueOnce();

    await updateProfileName("user-123", "   Maxime Farre   ");

    expect(profileRepo.updateProfileName).toHaveBeenCalledWith("user-123", "Maxime Farre");
  });

  it("should throw an error if the name is empty", async () => {
    await expect(updateProfileName("user-123", "")).rejects.toThrow("Le nom ne peut pas être vide.");
    expect(profileRepo.updateProfileName).not.toHaveBeenCalled();
  });

  it("should throw an error if the name is only whitespace", async () => {
    await expect(updateProfileName("user-123", "    ")).rejects.toThrow("Le nom ne peut pas être vide.");
    expect(profileRepo.updateProfileName).not.toHaveBeenCalled();
  });

  it("should throw an error if the name is too short (less than 2 characters)", async () => {
    await expect(updateProfileName("user-123", "A")).rejects.toThrow("Le nom doit contenir au moins 2 caractères.");
    expect(profileRepo.updateProfileName).not.toHaveBeenCalled();
  });
});
