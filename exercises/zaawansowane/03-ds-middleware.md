# Ćwiczenie 03 — Document Service Middleware

## Cel

Zarejestruj middleware Document Service w `src/index.ts`, który przy każdym
`create` i `update` artykułu:

1. **Auto-generuje slug** z `title` jeśli `slug` nie został podany
2. **Oblicza czas czytania** (`readTime`) na podstawie liczby słów w `body`
   (przyjmij tempo 200 słów/minutę, zaokrąglij w górę)

## Pliki do edycji

```
src/index.ts   ← zarejestruj middleware w funkcji register()
```

## Kroki

### Krok 1 — Zarejestruj middleware

W `src/index.ts` uzupełnij funkcję `register()`:

```ts
export default {
  register({ strapi }) {
    strapi.documents.use(async (context, next) => {
      // Twoja logika tutaj
      return next();
    });
  },
  bootstrap() {},
};
```

### Krok 2 — Filtruj po content type i akcji

Middleware działa globalnie — filtruj wcześnie żeby nie spowalniać innych operacji:

```ts
if (context.uid !== 'api::article.article') return next();
if (!['create', 'update'].includes(context.action)) return next();
```

### Krok 3 — Auto-slug

Kod modyfikujący `context.params.data` PRZED wywołaniem `next()`:

```ts
const data = context.params.data;
if (data?.title && !data?.slug) {
  // Wygeneruj slug z tytułu:
  // 1. toLowerCase()
  // 2. Normalizacja NFKD + usunięcie znaków diakrytycznych (polskie litery)
  // 3. Zamień znaki niealfanumeryczne na '-'
  // 4. Usuń '-' z początku i końca
}
```

Podpowiedź — zamiana polskich znaków:
```ts
.replace(/ł/g, 'l')        // ł nie rozkłada się w NFKD
.normalize('NFKD')
.replace(/[\u0300-\u036f]/g, '')
```

### Krok 4 — Oblicz readTime

```ts
if (data?.body) {
  const wordCount = data.body.trim().split(/\s+/).length;
  data.readTime = Math.ceil(wordCount / 200);
}
```

## Kryteria akceptacji

1. Uruchom serwer: `npm run develop`
2. Utwórz artykuł przez panel admina lub Postman z `title: "Mój nowy artykuł"` ale **bez** pola `slug`
3. Sprawdź zapisany artykuł — `slug` powinien być automatycznie `moj-nowy-artykul`
4. Utwórz artykuł z `body` zawierającym ~400 słów — `readTime` powinno wynosić `2`

```bash
POST http://localhost:1337/api/articles
Content-Type: application/json
Authorization: Bearer <token>

{
  "data": {
    "title": "Testowy artykuł bez sluga",
    "body": "Słowo ".repeat(400)
  }
}
```

## Wskazówki

- Middleware modyfikuje `context.params.data` **przed** `next()`. Po `next()` dane są już w bazie.
- Zawsze `return next()` lub `return result` — pominięcie przerywa łańcuch i zwraca `undefined`.
- Sprawdź w debuggerze `console.log(context.action, context.uid)` żeby zobaczyć jakie akcje przechodzą przez middleware.
- Middleware jest rejestrowany w `register()`, nie `bootstrap()` — `register()` działa przed załadowaniem tras i serwisów.

## Dodatkowe zasoby

- [Document Service Middleware](https://docs.strapi.io/cms/backend-customization/document-service-middlewares)
- [src/index.ts — register i bootstrap](https://docs.strapi.io/cms/configurations/functions)
