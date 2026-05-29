import { describe, it, expect, vi, beforeEach } from "vitest";
import * as livreRepo from "@/repositories/livre.repository";
import {
  createLivre,
  getAllLivres,
  getAllLivresAvecArchives,
  getLivre,
  updateLivre,
  archiveLivre,
  deleteLivre,
  getLivresByOwner,
} from "../livre.service";
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
    getLivresByOwner: vi.fn(),
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

describe("livre.service - remaining operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockLivre: Livre = {
    id: 42,
    titre: "1984",
    auteur: "George Orwell",
    proprietaire: "Maxime",
    proprietaire_email: "maxime@example.com",
    categorie: "Dystopie",
    resume: "Big Brother...",
    couverture: null,
    disponibilite: "Disponible",
    emprunte_par: null,
    date_ajout: "2026-05-01T12:00:00.000Z",
  };

  it("should fetch all livres with optional availability filter", async () => {
    vi.mocked(livreRepo.getLivres).mockResolvedValueOnce([mockLivre]);

    const result = await getAllLivres("Disponible");

    expect(livreRepo.getLivres).toHaveBeenCalledWith("Disponible");
    expect(result).toEqual([mockLivre]);
  });

  it("should fetch all livres including archives", async () => {
    vi.mocked(livreRepo.getLivresAvecArchives).mockResolvedValueOnce([mockLivre]);

    const result = await getAllLivresAvecArchives();

    expect(livreRepo.getLivresAvecArchives).toHaveBeenCalled();
    expect(result).toEqual([mockLivre]);
  });

  it("should fetch a single livre by ID", async () => {
    vi.mocked(livreRepo.getLivre).mockResolvedValueOnce(mockLivre);

    const result = await getLivre(42);

    expect(livreRepo.getLivre).toHaveBeenCalledWith(42);
    expect(result).toEqual(mockLivre);
  });

  it("should update a livre", async () => {
    const updateData = { titre: "New Title" };
    const updatedLivre = { ...mockLivre, titre: "New Title" };
    vi.mocked(livreRepo.updateLivre).mockResolvedValueOnce(updatedLivre);

    const result = await updateLivre(42, updateData);

    expect(livreRepo.updateLivre).toHaveBeenCalledWith(42, updateData);
    expect(result).toEqual(updatedLivre);
  });

  it("should archive a livre", async () => {
    vi.mocked(livreRepo.archiveLivre).mockResolvedValueOnce();

    await archiveLivre(42);

    expect(livreRepo.archiveLivre).toHaveBeenCalledWith(42);
  });

  it("should delete a livre", async () => {
    vi.mocked(livreRepo.deleteLivre).mockResolvedValueOnce();

    await deleteLivre(42);

    expect(livreRepo.deleteLivre).toHaveBeenCalledWith(42);
  });

  it("should get livres owned by email", async () => {
    vi.mocked(livreRepo.getLivresByOwner).mockResolvedValueOnce([mockLivre]);

    const result = await getLivresByOwner("maxime@example.com");

    expect(livreRepo.getLivresByOwner).toHaveBeenCalledWith("maxime@example.com");
    expect(result).toEqual([mockLivre]);
  });
});
