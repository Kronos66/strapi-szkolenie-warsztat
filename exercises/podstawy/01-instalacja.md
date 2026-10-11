# Ćwiczenie P1 — Instalacja i panel admina

## Cel

Każdy ma działającą instancję Strapi, rozumie wygenerowaną strukturę projektu
i potrafi poruszać się po panelu admina.

## Kroki

### Krok 1 — Utwórz projekt

```bash
npx create-strapi@latest my-blog --non-interactive --skip-cloud
cd my-blog
npm run develop
```

- `--non-interactive` przyjmuje ustawienia domyślne: TypeScript i **SQLite** — nie trzeba stawiać
  bazy danych
- `--skip-cloud` pomija logowanie do Strapi Cloud
- Panel admina otworzy się pod `http://localhost:1337/admin` — utwórz konto administratora

> **Port 1337 zajęty?** Uruchom `PORT=1338 npm run develop`.

### Krok 2 — Struktura projektu

Otwórz projekt w edytorze:

```
my-blog/
├── src/
│   ├── api/          ← pliki content types (generowane przez Strapi)
│   ├── components/   ← komponenty (wielokrotnego użytku grupy pól)
│   └── plugins/      ← własne pluginy
├── config/
│   ├── database.ts   ← połączenie z bazą
│   ├── server.ts     ← port, host
│   └── middlewares.ts← CORS, nagłówki bezpieczeństwa
├── public/uploads/   ← wgrane pliki
└── .env              ← sekrety i zmienne środowiskowe (nigdy nie commituj!)
```

Na co dzień większości tych plików nie dotykasz — Strapi zarządza nimi sam.
Warto jednak wiedzieć, gdzie co leży, kiedy przyjdzie czas na customizację.

### Krok 3 — Przegląd panelu admina

Przejdź po kolei przez sekcje w bocznym menu:

| Sekcja                   | Do czego służy                                                                                                               |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------|
| **Content Manager**      | Tworzenie, edycja i publikacja wpisów. Wpisy mają stan Draft lub Published (Draft & Publish)                                 |
| **Content-Type Builder** | Definiowanie kształtu danych — pola, typy, relacje. Zmiany aktualizują schemat bazy i API. Dostępny tylko w trybie `develop` |
| **Media Library**        | Centralne miejsce na pliki. Strapi generuje kilka rozmiarów obrazków                                                         |
| **Settings**             | Role i uprawnienia, API Tokens, Internationalization (i18n jest wbudowane w Strapi 5)                                        |

## Kryteria akceptacji

1. `npm run develop` startuje bez błędów
2. Jesteś zalogowany do panelu admina
3. Otworzyłeś każdą sekcję z menu
