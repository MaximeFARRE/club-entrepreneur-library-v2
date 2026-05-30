interface ISBNLookupResult {
  titre: string;
  auteur: string;
  categorie: string | null;
  resume: string | null;
  couverture: string | null;
}

export async function lookupISBN(isbn: string): Promise<ISBNLookupResult | null> {
  const clean = isbn.replace(/[-\s]/g, "").toUpperCase();
  if (!/^\d{9}[\dX]$/.test(clean) && !/^\d{13}$/.test(clean)) return null;

  // Try Google Books API first
  try {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    const googleUrl = apiKey
      ? `https://www.googleapis.com/books/v1/volumes?q=isbn:${clean}&key=${apiKey}`
      : `https://www.googleapis.com/books/v1/volumes?q=isbn:${clean}`;

    const res = await fetch(googleUrl, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      const item = data.items?.[0];
      if (item) {
        const info = item.volumeInfo;
        return {
          titre: info.title ?? "",
          auteur: (info.authors ?? []).join(", "),
          categorie: null,
          resume: info.description ?? null,
          couverture: info.imageLinks?.thumbnail?.replace("http://", "https://") ?? null,
        };
      }
    }
  } catch (err) {
    console.error("Google Books API error:", err);
  }

  // Fallback to Open Library API
  try {
    const openLibraryUrl = `https://openlibrary.org/api/books?bibkeys=ISBN:${clean}&format=json&jscmd=data`;
    const res = await fetch(openLibraryUrl);
    if (res.ok) {
      const data = await res.json();
      const bookKey = `ISBN:${clean}`;
      const bookInfo = data[bookKey];
      if (bookInfo) {
        return {
          titre: bookInfo.title ?? "",
          auteur: (bookInfo.authors ?? []).map((a: { name: string }) => a.name).join(", "),
          categorie: null,
          resume: bookInfo.notes ?? bookInfo.description ?? null,
          couverture: (bookInfo.cover?.large ?? bookInfo.cover?.medium ?? bookInfo.cover?.small ?? null)?.replace("http://", "https://") ?? null,
        };
      }
    }
  } catch (err) {
    console.error("Open Library API error:", err);
  }

  return null;
}
