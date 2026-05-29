import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { lookupISBN } from "../isbn.service";

describe("isbn.service - lookupISBN", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockClear();
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("should return null immediately and not fetch if the ISBN format is invalid", async () => {
    const result = await lookupISBN("123");
    expect(result).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("should fetch Google Books API and return details on success for a valid 10-digit ISBN", async () => {
    const mockBookData = {
      items: [
        {
          volumeInfo: {
            title: "Le Petit Prince",
            authors: ["Antoine de Saint-Exupéry"],
            categories: ["Jeunesse", "Classique"],
            description: "Un conte poétique et philosophique...",
            imageLinks: {
              thumbnail: "http://books.google.com/thumbnail.jpg",
            },
          },
        },
      ],
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBookData,
    } as Response);

    const result = await lookupISBN("2070612759");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://www.googleapis.com/books/v1/volumes?q=isbn:2070612759",
      expect.any(Object)
    );
    expect(result).toEqual({
      titre: "Le Petit Prince",
      auteur: "Antoine de Saint-Exupéry",
      categorie: "Jeunesse, Classique",
      resume: "Un conte poétique et philosophique...",
      couverture: "https://books.google.com/thumbnail.jpg",
    });
  });

  it("should join multiple authors with a comma", async () => {
    const mockBookData = {
      items: [
        {
          volumeInfo: {
            title: "Co-authored Book",
            authors: ["Author One", "Author Two"],
            description: "Some description",
          },
        },
      ],
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBookData,
    } as Response);

    const result = await lookupISBN("9782070612758");
    expect(result?.auteur).toBe("Author One, Author Two");
  });

  it("should handle missing optional fields gracefully", async () => {
    const mockBookData = {
      items: [
        {
          volumeInfo: {
            title: "Minimal Book Info",
          },
        },
      ],
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBookData,
    } as Response);

    const result = await lookupISBN("9782070612758");
    expect(result).toEqual({
      titre: "Minimal Book Info",
      auteur: "",
      categorie: null,
      resume: null,
      couverture: null,
    });
  });

  it("should return null if the fetch response is not ok", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
    } as Response);

    const result = await lookupISBN("9782070612758");
    expect(result).toBeNull();
  });

  it("should return null if fetch throws an error", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Network Error"));

    const result = await lookupISBN("9782070612758");
    expect(result).toBeNull();
  });

  it("should return null if search returns no items", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [] }),
    } as Response);

    const result = await lookupISBN("9782070612758");
    expect(result).toBeNull();
  });

  it("should accept valid 10-digit ISBN ending with X or x", async () => {
    const mockBookData = {
      items: [
        {
          volumeInfo: {
            title: "Père riche, père pauvre",
            authors: ["Robert T. Kiyosaki"],
            description: "Some description",
          },
        },
      ],
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBookData,
    } as Response);

    const result = await lookupISBN("289225955X");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://www.googleapis.com/books/v1/volumes?q=isbn:289225955X",
      expect.any(Object)
    );
    expect(result?.titre).toBe("Père riche, père pauvre");
  });

  it("should fallback to Open Library API when Google Books fails", async () => {
    // 1. Google Books fails (429 or other)
    fetchMock.mockResolvedValueOnce({
      ok: false,
    } as Response);

    // 2. Open Library succeeds
    const mockOLData = {
      "ISBN:289225955X": {
        title: "Père riche, père pauvre",
        authors: [{ name: "Robert T. Kiyosaki" }],
        subjects: [{ name: "Finance" }],
        description: "Notes on wealth",
        cover: { large: "https://covers.openlibrary.org/b/id/8751298-L.jpg" }
      }
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockOLData,
    } as Response);

    const result = await lookupISBN("289225955X");
    expect(result).toEqual({
      titre: "Père riche, père pauvre",
      auteur: "Robert T. Kiyosaki",
      categorie: "Finance",
      resume: "Notes on wealth",
      couverture: "https://covers.openlibrary.org/b/id/8751298-L.jpg",
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
