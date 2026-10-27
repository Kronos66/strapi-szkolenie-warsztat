# Ćwiczenie P5 — Biblioteka mediów

## Cel

Wgraj obrazki, podmień okładkę artykułu i odczytaj URL obrazków w API — także zagnieżdżonych
(avatar autora).

## Kroki

### Krok 1 — Wgraj obrazki

Media Library → **New** → **File upload** → wybierz 2–3 obrazki z dysku (możesz zaznaczyć kilka
naraz). Systemowe okno wyboru plików otwiera się od razu, a postęp i wynik zobaczysz w panelu
w prawym dolnym rogu („Upload successful!”).

Seed wgrał już okładki artykułów i avatary autorów — Twoje pliki pojawią się obok nich.

> Od Strapi 5.54 Media Library ma nowy interfejs. Menu **New** ma trzy pozycje: **New folder**
> (foldery widać w drzewie po lewej), **File upload** i **File upload from URL** (import obrazka
> z adresu). Upload działa w tle, więc możesz w tym czasie przejść w inne miejsce panelu.

Strapi generuje automatycznie dodatkowe rozmiary obrazka (`thumbnail`, `small`, `medium`, `large` —
zależnie od wielkości oryginału). Oryginał też zostaje.

### Krok 2 — Podmień okładkę artykułu

Content Manager → **Article** → otwórz np. „Beautiful picture” → w polu `cover`:

1. Kliknij **Delete** (ikona kosza) — pojawi się pusty slot „Click to add an asset…”.
2. Kliknij slot → w oknie **Add new assets** zaznacz jeden z wgranych obrazków → **Finish**.
3. **Save**, potem **Publish**.

> Okno wyboru mediów w Content Managerze wygląda jeszcze po staremu (zakładki *Browse* / *Selected
> files*) — nowy interfejs ma tylko sama Media Library.

> **Bez Publish** zmiana zostaje tylko w wersji Draft — po samym Save status to *Modified*, a publiczne
> API dalej zwraca starą okładkę.

### Krok 3 — URL obrazka w API

Media to relacja — trzeba ją dołączyć przez `populate`:

```
GET /api/articles?populate=cover
```

Fragment odpowiedzi:

```json
"cover": {
  "name": "my_image.jpg",
  "url": "/uploads/my_image_abc123.jpg",
  "formats": {
    "thumbnail": {
      "url": "/uploads/thumbnail_my_image_abc123.jpg"
    },
    "small": {
      "url": "/uploads/small_my_image_abc123.jpg"
    }
  }
}
```

URL jest **względny** wobec hosta Strapi (przy lokalnym uploadzie). We frontendzie:

```js
const imageUrl = `${process.env.STRAPI_URL}${article.cover.url}`;
const thumbUrl = `${process.env.STRAPI_URL}${article.cover.formats.thumbnail.url}`;
```

> Przy providerze S3/Cloudinary (patrz część o deploymencie w prezentacji) URL jest już pełny.

### Krok 4 — Obrazek w relacji: avatar autora

`populate=author` dołącza autora, ale **nie** jego avatar — populate działa tylko jeden poziom
w głąb. Zagnieżdżone media trzeba wskazać jawnie:

```
GET /api/articles?populate[author][populate]=avatar
```

> **curl a nawiasy `[]`:** w terminalu użyj `curl -g` (albo zakoduj nawiasy jako `%5B` / `%5D`).
> Bez `-g` curl traktuje `[...]` jako zakres, zgłasza `bad range in URL` i w ogóle nie wysyła żądania:
>
> `curl -g "http://localhost:1337/api/articles?populate[author][populate]=avatar"`

Fragment odpowiedzi:

```json
"author": {
  "name": "Sarah Baker",
  "avatar": {
    "url": "/uploads/sarahbaker_strapi_<hash>.jpeg"
  }
}
```

Okładka i avatar w jednym zapytaniu:

```
GET /api/articles?populate[cover]=true&populate[author][populate]=avatar
```

```js
const avatarUrl = `${process.env.STRAPI_URL}${article.author.avatar.url}`;
```

> **Uwaga:** jeśli `author` nie ma avatara, `article.author.avatar` to `null` — we frontendzie
> zabezpiecz się przed tym (`article.author?.avatar?.url`).

## Kryteria akceptacji

1. W Media Library są wgrane Twoje obrazki
2. Odpowiedź z `populate=cover` zawiera `url` i `formats`, a wybrany artykuł ma nową okładkę
3. Odpowiedź z `populate[author][populate]=avatar` zawiera `author.avatar.url`
4. Obrazek otwiera się w przeglądarce pod `http://localhost:1337/uploads/...`

> **Pliki w `/uploads/...` są publiczne.** Strapi serwuje je statycznie — otwierają się bez tokenu,
> nawet gdy rola Public nie ma żadnych uprawnień do **Upload** (wtedy `GET /api/upload/files` zwraca
> 403, ale sam obrazek — 200). Uprawnienia Upload dotyczą tylko API (`/api/upload/...`). Nie wgrywaj
> do biblioteki plików, które nie mogą być publiczne dla każdego, kto zna URL.
