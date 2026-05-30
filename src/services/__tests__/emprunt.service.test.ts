import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  determineLoanStatus,
  processBorrow,
  processReturn,
  getOverdueLoans,
} from "../emprunt.service";
import * as livreRepo from "@/repositories/livre.repository";
import * as historiqueRepo from "@/repositories/historique.repository";
import type { Livre, Emprunt, EmpruntAvecLivre } from "@/types";

vi.mock("@/repositories/livre.repository", () => {
  return {
    getLivre: vi.fn(),
    updateAvailability: vi.fn(),
    getLivres: vi.fn(),
    getLivresAvecArchives: vi.fn(),
    addLivre: vi.fn(),
    updateLivre: vi.fn(),
    archiveLivre: vi.fn(),
    deleteLivre: vi.fn(),
    getLivresByOwner: vi.fn(),
  };
});

vi.mock("@/repositories/historique.repository", () => {
  return {
    addEmprunt: vi.fn(),
    closeLoan: vi.fn(),
    getActiveLoans: vi.fn(),
    getActiveLoanForBook: vi.fn(),
    getLastLoan: vi.fn(),
    getHistorique: vi.fn(),
    deleteLoansForBook: vi.fn(),
    getEmpruntsByBorrower: vi.fn(),
    getLoansByOwnerBooks: vi.fn(),
  };
});

describe("emprunt.service - determineLoanStatus", () => {
  describe("when book is returned (dateRetour is provided)", () => {
    it("should return 'green' if returned on the exact due date", () => {
      const status = determineLoanStatus(
        "2026-05-29T12:00:00.000Z",
        "2026-05-29T12:00:00.000Z"
      );
      expect(status).toBe("green");
    });

    it("should return 'green' if returned before the due date", () => {
      const status = determineLoanStatus(
        "2026-05-28T12:00:00.000Z",
        "2026-05-29T12:00:00.000Z"
      );
      expect(status).toBe("green");
    });

    it("should return 'red' if returned after the due date", () => {
      const status = determineLoanStatus(
        "2026-05-30T12:00:00.000Z",
        "2026-05-29T12:00:00.000Z"
      );
      expect(status).toBe("red");
    });
  });

  describe("when book is not returned yet (dateRetour is null)", () => {
    const fixedNow = new Date("2026-05-20T12:00:00.000Z");

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(fixedNow);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return 'green' if the due date is more than 7 days in the future", () => {
      const due = new Date(fixedNow.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString();
      const status = determineLoanStatus(null, due);
      expect(status).toBe("green");
    });

    it("should return 'orange' if the due date is exactly 7 days in the future", () => {
      const due = new Date(fixedNow.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const status = determineLoanStatus(null, due);
      expect(status).toBe("orange");
    });

    it("should return 'orange' if the due date is 1 day in the future", () => {
      const due = new Date(fixedNow.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString();
      const status = determineLoanStatus(null, due);
      expect(status).toBe("orange");
    });

    it("should return 'red' if the due date is in the past", () => {
      const due = new Date(fixedNow.getTime() - 1000).toISOString();
      const status = determineLoanStatus(null, due);
      expect(status).toBe("red");
    });
  });
});

describe("emprunt.service - processBorrow", () => {
  const fixedNow = new Date("2026-05-20T12:00:00.000Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockLivre: Livre = {
    id: 101,
    titre: "L'Étranger",
    auteur: "Albert Camus",
    proprietaire: "Maxime",
    proprietaire_email: "maxime@example.com",
    categorie: "Roman",
    resume: "L'histoire de Meursault...",
    couverture: null,
    disponibilite: "Disponible",
    emprunte_par: null,
    date_ajout: "2026-05-01T12:00:00.000Z",
  };

  it("should succeed when book exists and is available", async () => {
    vi.mocked(livreRepo.getLivre).mockResolvedValueOnce(mockLivre);
    vi.mocked(livreRepo.updateAvailability).mockResolvedValueOnce();
    vi.mocked(historiqueRepo.addEmprunt).mockResolvedValueOnce({} as Emprunt);

    await processBorrow(101, "BorrowerName", "borrower@example.com", "0612345678", "Some comments");

    // Expect book availability to be updated
    expect(livreRepo.updateAvailability).toHaveBeenCalledWith(101, "Indisponible", "BorrowerName");

    // Expect loan record to be added
    const expectedDueDate = new Date(fixedNow);
    expectedDueDate.setDate(expectedDueDate.getDate() + 30);

    expect(historiqueRepo.addEmprunt).toHaveBeenCalledWith({
      id_livre: 101,
      emprunteur: "BorrowerName",
      emprunteur_email: "borrower@example.com",
      emprunteur_telephone: "0612345678",
      date_emprunt: fixedNow.toISOString(),
      date_retour_prevue: expectedDueDate.toISOString(),
      commentaire: "Some comments",
    });
  });

  it("should throw an error if book does not exist", async () => {
    vi.mocked(livreRepo.getLivre).mockResolvedValueOnce(null);

    await expect(
      processBorrow(999, "BorrowerName", "borrower@example.com", "0612345678")
    ).rejects.toThrow("Livre introuvable.");

    expect(livreRepo.updateAvailability).not.toHaveBeenCalled();
    expect(historiqueRepo.addEmprunt).not.toHaveBeenCalled();
  });

  it("should throw an error if book is already borrowed (Indisponible)", async () => {
    const unavailableLivre = { ...mockLivre, disponibilite: "Indisponible" as const };
    vi.mocked(livreRepo.getLivre).mockResolvedValueOnce(unavailableLivre);

    await expect(
      processBorrow(101, "BorrowerName", "borrower@example.com", "0612345678")
    ).rejects.toThrow("Ce livre n'est pas disponible (statut : Indisponible).");

    expect(livreRepo.updateAvailability).not.toHaveBeenCalled();
    expect(historiqueRepo.addEmprunt).not.toHaveBeenCalled();
  });
});

describe("emprunt.service - processReturn", () => {
  const fixedNow = new Date("2026-05-20T12:00:00.000Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockBorrowedLivre: Livre = {
    id: 102,
    titre: "1984",
    auteur: "George Orwell",
    proprietaire: "Maxime",
    proprietaire_email: "maxime@example.com",
    categorie: "Dystopie",
    resume: "Big Brother is watching you...",
    couverture: null,
    disponibilite: "Indisponible",
    emprunte_par: "BorrowerName",
    date_ajout: "2026-05-01T12:00:00.000Z",
  };

  it("should succeed when book exists and is borrowed", async () => {
    vi.mocked(livreRepo.getLivre).mockResolvedValueOnce(mockBorrowedLivre);
    vi.mocked(livreRepo.updateAvailability).mockResolvedValueOnce();
    vi.mocked(historiqueRepo.closeLoan).mockResolvedValueOnce();

    await processReturn(102, "Book was in perfect condition.");

    expect(livreRepo.updateAvailability).toHaveBeenCalledWith(102, "Disponible", null);
    expect(historiqueRepo.closeLoan).toHaveBeenCalledWith(
      102,
      fixedNow.toISOString(),
      "Book was in perfect condition."
    );
  });

  it("should throw an error if book does not exist", async () => {
    vi.mocked(livreRepo.getLivre).mockResolvedValueOnce(null);

    await expect(processReturn(999)).rejects.toThrow("Livre introuvable.");

    expect(livreRepo.updateAvailability).not.toHaveBeenCalled();
    expect(historiqueRepo.closeLoan).not.toHaveBeenCalled();
  });

  it("should throw an error if book does not have an active loan (Disponible)", async () => {
    const availableLivre = { ...mockBorrowedLivre, disponibilite: "Disponible" as const };
    vi.mocked(livreRepo.getLivre).mockResolvedValueOnce(availableLivre);

    await expect(processReturn(102)).rejects.toThrow("Ce livre n'a pas d'emprunt actif.");

    expect(livreRepo.updateAvailability).not.toHaveBeenCalled();
    expect(historiqueRepo.closeLoan).not.toHaveBeenCalled();
  });
});

describe("emprunt.service - getOverdueLoans", () => {
  const fixedNow = new Date("2026-05-20T12:00:00.000Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return only overdue active loans sorted by due date ascending", async () => {
    const mockLoans: EmpruntAvecLivre[] = [
      {
        id: 1,
        id_livre: 101,
        emprunteur: "Alice",
        emprunteur_email: "alice@example.com",
        date_emprunt: "2026-04-10T12:00:00.000Z",
        date_retour_prevue: "2026-05-10T12:00:00.000Z", // OVERDUE (10 days late)
        date_retour: null,
        commentaire: "",
        livres: { id: 101, titre: "Book A", auteur: "Author A", couverture: null },
      },
      {
        id: 2,
        id_livre: 102,
        emprunteur: "Bob",
        emprunteur_email: "bob@example.com",
        date_emprunt: "2026-04-15T12:00:00.000Z",
        date_retour_prevue: "2026-05-15T12:00:00.000Z", // OVERDUE (5 days late)
        date_retour: null,
        commentaire: "",
        livres: { id: 102, titre: "Book B", auteur: "Author B", couverture: null },
      },
      {
        id: 3,
        id_livre: 103,
        emprunteur: "Charlie",
        emprunteur_email: "charlie@example.com",
        date_emprunt: "2026-04-25T12:00:00.000Z",
        date_retour_prevue: "2026-05-25T12:00:00.000Z", // NOT OVERDUE (5 days left)
        date_retour: null,
        commentaire: "",
        livres: { id: 103, titre: "Book C", auteur: "Author C", couverture: null },
      },
    ];

    vi.mocked(historiqueRepo.getActiveLoans).mockResolvedValueOnce(mockLoans);

    const result = await getOverdueLoans();

    // Expect only Loan 1 and Loan 2 (overdue ones)
    expect(result).toHaveLength(2);

    // Sorted by due date ascending: Loan 1 (due May 10) comes before Loan 2 (due May 15)
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(2);
  });
});
