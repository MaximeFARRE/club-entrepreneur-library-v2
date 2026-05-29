import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { lookupISBN } from "../isbn.service";

describe("isbn.service - lookupISBN", () => {
  const fetchSpy = vi.spyOn(globalThis, "fetch");

  beforeEach(() => {
    fetchSpy.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return null immediately and not fetch if the ISBN format is invalid", async () => {
    const result = await lookupISBN("123");
    expect(result).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("should fetch Google Books API and return details on success for a valid 10-digit ISBN", async () => {
    const mockBookData = {
      items: [
        {
          volumeInfo: {
            title: "Le Petit Prince",
            authors: ["Antoine de Saint-Exupéry"],
            description: "Un conte poétique et philosophique...",
            imageLinks: {
              thumbnail: "http://books.google.com/thumbnail.jpg",
            },
          },
        },
      ],
    };

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBookData,
    } as Response);

    const result = await lookupISBN("2070612759");

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://www.googleapis.com/books/v1/volumes?q=isbn:2070612759",
      expect.any(Object)
    );
    expect(result).toEqual({
      titre: "Le Petit Prince",
      auteur: "Antoine de Saint-Exupéry",
      resume: "Un conte poétique et philosophique...",
      couverture: "https://books.google.com/thumbnail.jpg", // http should be replaced with https
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

    fetchSpy.mockResolvedValueOnce({
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
            // authors, description, imageLinks are missing
          },
        },
      ],
    };

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBookData,
    } as Response);

    const result = await lookupISBN("9782070612758");
    expect(result).toEqual({
      titre: "Minimal Book Info",
      auteur: "",
      resume: null,
      couverture: null,
    });
  });

  it("should return null if the fetch response is not ok", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
    } as Response);

    const result = await lookupISBN("9782070612758");
    expect(result).toBeNull();
  });

  it("should return null if fetch throws an error", async () => {
    fetchSpy.mockRejectedValueOnce(new Error("Network Error"));

    const result = await lookupISBN("9782070612758");
    expect(result).toBeNull();
  });

  it("should return null if search returns no items", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [] }),
    } as Response);

    const result = await lookupISBN("9782070612758");
    expect(result).toBeNull();
  });
});
