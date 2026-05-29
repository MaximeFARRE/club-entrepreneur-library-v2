interface ISBNLookupResult {
  titre: string;
  auteur: string;
  resume: string | null;
  couverture: string | null;
}

export async function lookupISBN(isbn: string): Promise<ISBNLookupResult | null> {
  const clean = isbn.replace(/[-\s]/g, "");
  if (!/^\d{10}(\d{3})?$/.test(clean)) return null;

  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${clean}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const item = data.items?.[0];
    if (!item) return null;

    const info = item.volumeInfo;
    return {
      titre: info.title ?? "",
      auteur: (info.authors ?? []).join(", "),
      resume: info.description ?? null,
      couverture: info.imageLinks?.thumbnail?.replace("http://", "https://") ?? null,
    };
  } catch {
    return null;
  }
}
