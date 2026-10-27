# Ćwiczenie P1 — Uruchomienie projektu i panel administratora

## Cel

Każdy ma działającą instancję Strapi z danymi przykładowymi, rozumie strukturę projektu
i potrafi poruszać się po panelu administratora.

## Kroki

### Krok 1 — Uruchom projekt startowy

Cały warsztat robimy na projekcie `starter/` — gotowym blogu w Strapi 5.57 (TypeScript, baza
**SQLite**, więc nie trzeba stawiać bazy danych).

```bash
cd starter
npm install
npm run seed:example
npm run develop
```

- `npm install` instaluje zależności — to trwa kilka minut, najlepiej zrób to przed warsztatem
- `npm run seed:example` wgrywa dane przykładowe: 5 artykułów, 2 autorów, 5 kategorii i obrazki.
  Uruchom go **przed** `develop`, przy zatrzymanym serwerze. Działa tylko raz — żeby wgrać dane
  ponownie, usuń bazę `.tmp/data.db`
- Panel administratora otworzy się pod `http://localhost:1337/admin` — utwórz konto administratora

> **Port 1337 zajęty?** Uruchom `PORT=1338 npm run develop`.

> **Masz już `.env` z wcześniejszego uruchomienia?** Dopisz do niego
> `STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE=pl` (albo usuń `.env`) i usuń `.tmp/data.db` przed `seed:example` —
> domyślna lokalizacja `pl` tworzy się tylko przy pustej bazie.

> **Okienko „Step 1 of 4”** przy pierwszym wejściu do Content Managera to samouczek Strapi —
> kliknij **Skip**.

> **Nowy projekt od zera?** Na co dzień zaczniesz od `npx create-strapi@latest my-blog`. Na warsztacie
> korzystamy ze startera, żeby od razu mieć dane i nie tracić czasu na instalację na żywo.

### Krok 2 — Struktura projektu

Otwórz `starter/` w edytorze:

```
starter/
├── src/
│   ├── api/              ← content types: article, author, category, about, global, search-log
│   │   └── article/
│   │       ├── content-types/article/schema.json  ← definicja pól (zapisuje ją Content-Type Builder)
│   │       ├── controllers/  services/  routes/   ← logika API (customizacja w części zaawansowanej)
│   ├── components/shared/ ← komponenty (wielokrotnego użytku grupy pól)
│   └── index.ts          ← register() i bootstrap() aplikacji
├── config/
│   ├── database.ts       ← połączenie z bazą
│   ├── server.ts         ← port, host
│   └── middlewares.ts    ← CORS, nagłówki bezpieczeństwa
├── data/                 ← dane przykładowe dla seed:example
├── public/uploads/       ← wgrane pliki
├── types/generated/      ← typy TS generowane z content types
├── .tmp/data.db          ← baza SQLite
└── .env                  ← sekrety i zmienne środowiskowe (nigdy nie commituj!)
```

Na co dzień większości tych plików nie dotykasz — Strapi zarządza nimi sam.
Warto jednak wiedzieć, gdzie co leży, kiedy przyjdzie czas na customizację.

### Krok 3 — Przegląd panelu administratora

Przejdź po kolei przez sekcje w bocznym menu:

| Sekcja                   | Do czego służy                                                                                                               |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------|
| **Content Manager**      | Tworzenie, edycja i publikacja wpisów. Wpisy mają stan Draft lub Published (Draft & Publish)                                 |
| **Content-Type Builder** | Definiowanie kształtu danych — pola, typy, relacje. Zmiany aktualizują schemat bazy i API. Dostępny tylko w trybie `develop` |
| **Media Library**        | Centralne miejsce na pliki. Strapi generuje kilka rozmiarów obrazków                                                         |
| **Settings**             | Role i uprawnienia, API Tokens, Internationalization (i18n jest wbudowane w Strapi 5)                                        |

W **Content Manager → Article** zwróć uwagę na przełącznik języka — Article ma włączone i18n,
a domyślna lokalizacja projektu to `pl`.

## Kryteria akceptacji

1. `npm run develop` startuje bez błędów
2. Jesteś zalogowany do panelu administratora
3. W Content Manager widać 5 opublikowanych artykułów, 2 autorów i 5 kategorii
4. Otworzyłeś każdą sekcję z menu
