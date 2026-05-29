import { describe, it, expect, vi, beforeEach } from "vitest";
import * as livreRepo from "@/repositories/livre.repository";
import { createLivre } from "../livre.service";
import type { InsertLivre, Livre } from "@/types";

vi.mock("@/repositories/livre.repository", () => {
  return {
    addLivre: vi.fn(),
    getLivres: vi.fn(),
    getLivresAvecArchives: vi.fn(),
    getLivre: vi.fn(),
    updateLivre: vi.fn(),
    archiveLivre: vi.fn(),
    deleteLivre: vi.fn(),
  };
});

describe("livre.service - createLivre", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validData: InsertLivre = {
    titre: "L'Étranger",
    auteur: "Albert Camus",
    proprietaire: "Maxime",
    proprietaire_email: "maxime@example.com",
    categorie: "Classique",
    resume: "A story about Meursault...",
    couverture: "https://example.com/cover.jpg",
  };

  it("should successfully validate and call repo.addLivre when data is valid", async () => {
    const mockCreatedLivre: Livre = {
      id: 1,
      titre: validData.titre!,
      auteur: validData.auteur!,
      proprietaire: validData.proprietaire!,
      proprietaire_email: validData.proprietaire_email!,
      categorie: validData.categorie ?? null,
      resume: validData.resume ?? null,
      couverture: validData.couverture ?? null,
      disponibilite: "Disponible",
      emprunte_par: null,
      date_ajout: new Date().toISOString(),
    };

    vi.mocked(livreRepo.addLivre).mockResolvedValueOnce(mockCreatedLivre);

    const result = await createLivre(validData);

    expect(livreRepo.addLivre).toHaveBeenCalledWith({
      ...validData,
      disponibilite: "Disponible",
      emprunte_par: null,
    });
    expect(result).toEqual(mockCreatedLivre);
  });

  it("should throw an error if title is missing or empty", async () => {
    const invalidData = { ...validData, titre: "" };
    await expect(createLivre(invalidData)).rejects.toThrow("Le titre est requis.");
    expect(livreRepo.addLivre).not.toHaveBeenCalled();
  });

  it("should throw an error if title is only whitespace", async () => {
    const invalidData = { ...validData, titre: "   " };
    await expect(createLivre(invalidData)).rejects.toThrow("Le titre est requis.");
    expect(livreRepo.addLivre).not.toHaveBeenCalled();
  });

  it("should throw an error if author is missing or empty", async () => {
    const invalidData = { ...validData, auteur: " " };
    await expect(createLivre(invalidData)).rejects.toThrow("L'auteur est requis.");
    expect(livreRepo.addLivre).not.toHaveBeenCalled();
  });

  it("should throw an error if owner is missing or empty", async () => {
    const invalidData = { ...validData, proprietaire: "  " };
    await expect(createLivre(invalidData)).rejects.toThrow("Le propriétaire est requis.");
    expect(livreRepo.addLivre).not.toHaveBeenCalled();
  });

  it("should throw an error if owner email is missing or empty", async () => {
    const invalidData = { ...validData, proprietaire_email: "" };
    await expect(createLivre(invalidData)).rejects.toThrow("L'email du propriétaire est requis.");
    expect(livreRepo.addLivre).not.toHaveBeenCalled();
  });

  it("should throw an error if owner email is invalid format", async () => {
    const invalidData = { ...validData, proprietaire_email: "not-an-email" };
    await expect(createLivre(invalidData)).rejects.toThrow("L'email du propriétaire est invalide.");
    expect(livreRepo.addLivre).not.toHaveBeenCalled();
  });
});
