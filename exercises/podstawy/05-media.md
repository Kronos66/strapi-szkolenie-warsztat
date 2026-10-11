# Ćwiczenie P5 — Biblioteka mediów

## Cel

Wgraj obrazki, podepnij je do treści i odczytaj ich URL w API.

## Kroki

### Krok 1 — Wgraj obrazki

Media Library → **Add new assets** → przeciągnij 2–3 obrazki.

Strapi generuje automatycznie dodatkowe rozmiary obrazka (`thumbnail`, `small`, `medium`, `large` —
zależnie od wielkości oryginału). Oryginał też zostaje.

### Krok 2 — Podepnij obrazek do artykułu

Content Manager → otwórz artykuł → pole `coverImage` → wybierz plik z Media Library → **Save** i **Publish**.

### Krok 3 — URL obrazka w API

Media to relacja — trzeba ją dołączyć przez `populate`:

```
GET /api/articles?populate=coverImage
```

Fragment odpowiedzi:

```json
"coverImage": {
  "url": "/uploads/my_image_abc123.jpg",
  "formats": {
    "thumbnail": { "url": "/uploads/thumbnail_my_image_abc123.jpg" },
    "small": { "url": "/uploads/small_my_image_abc123.jpg" }
  }
}
```

URL jest **względny** wobec hosta Strapi (przy lokalnym uploadzie). We frontendzie:

```js
const imageUrl = `${process.env.STRAPI_URL}${article.coverImage.url}`;
```

> Przy providerze S3/Cloudinary (patrz część o deploymencie w prezentacji) URL jest już pełny.

## Kryteria akceptacji

1. W Media Library są wgrane obrazki
2. Odpowiedź z `populate=coverImage` zawiera `url` i `formats`
3. Obrazek otwiera się w przeglądarce pod `http://localhost:1337/uploads/...`
