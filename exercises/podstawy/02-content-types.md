# Ćwiczenie P2 — Content Types i relacje

## Cel

Utwórz dwa Content Types i relację między nimi — bez SQL i bez kodu.

Content Type jest jak interfejs TypeScript — definiuje kształt danych.
Strapi sam tworzy tabelę w bazie, endpointy API i formularze w panelu admina.

## Kroki

### Krok 1 — Content Type `Author`

Content-Type Builder → **Create new collection type** → nazwa: `Author`

| Pole | Typ | Opcje |
|---|---|---|
| `name` | Text (Short) | Required |
| `bio` | Text (Long) | |
| `avatar` | Media | Single media, tylko obrazki |
| `email` | Email | |

Kliknij **Save** — Strapi zrestartuje się i zaktualizuje bazę.

### Krok 2 — Content Type `Article`

Content-Type Builder → **Create new collection type** → nazwa: `Article`

| Pole | Typ | Opcje |
|---|---|---|
| `title` | Text (Short) | Required |
| `body` | Rich Text (Blocks) | |
| `slug` | UID | Attached field: `title` |
| `coverImage` | Media | Single media, tylko obrazki |

> **Datę publikacji nie dodajemy.** `publishedAt` to pole systemowe — Strapi ustawia je sam,
> gdy publikujesz wpis (Draft & Publish jest domyślnie włączone).

> **Pole UID** generuje identyfikator przyjazny dla URL: `"Mój pierwszy artykuł"` → `"moj-pierwszy-artykul"`.

### Krok 3 — Relacja Article → Author

Bez relacji każdy artykuł musiałby kopiować dane autora. Relacja to jedno źródło prawdy.

| Typ | Przykład | Znaczenie |
|---|---|---|
| **1:1** | User ↔ Profile | Jeden użytkownik ma dokładnie jeden profil |
| **1:N** | Author → Articles | Autor ma wiele artykułów, artykuł ma jednego autora |
| **N:M** | Articles ↔ Tags | Artykuł ma wiele tagów, tag należy do wielu artykułów |

Content-Type Builder → `Article` → **Add another field** → **Relation**:
- Relacja: **Many-to-One** (wiele artykułów → jeden autor)
- Po prawej: `Author`
- Nazwa pola po stronie Article: `author`

Kliknij **Save**.

### Krok 4 — Dane przykładowe

W Content Manager:
1. Utwórz **2 autorów**
2. Utwórz **2 artykuły** z tytułem, treścią i przypisanym autorem
3. **Opublikuj** oba artykuły (przycisk **Publish**) — publiczne API zwraca tylko opublikowane wpisy

> Strapi nie zapisał danych autora *wewnątrz* artykułu — zapisał referencję.
> Żeby dostać autora w odpowiedzi API, trzeba poprosić o `populate` (ćwiczenie P3).

## Kryteria akceptacji

1. W Content Manager widać 2 autorów i 2 opublikowane artykuły
2. Każdy artykuł ma przypisanego autora
3. Slug wygenerował się z tytułu
