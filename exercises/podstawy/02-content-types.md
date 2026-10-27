# Ćwiczenie P2 — Content Types i relacje

## Cel

Zrozum model danych startera, a potem dodaj własny Content Type `Tag` z relacją
wiele-do-wielu do `Article` — bez SQL i bez kodu.

Content Type jest jak interfejs TypeScript — definiuje kształt danych.
Strapi sam tworzy tabelę w bazie, endpointy API i formularze w panelu administratora.

## Kroki

### Krok 1 — Przegląd istniejącego modelu

Content-Type Builder → **Article**. Starter ma już gotowy model bloga:

| Pole          | Typ                 | Uwagi                                                       |
|---------------|---------------------|-------------------------------------------------------------|
| `title`       | Text (Short)        |                                                             |
| `description` | Text (Long)         | Max 80 znaków                                               |
| `slug`        | UID                 | Attached field: `title`                                     |
| `cover`       | Media               | Single media                                                |
| `author`      | Relation            | Many-to-One → `Author`                                      |
| `category`    | Relation            | Many-to-One → `Category`                                    |
| `blocks`      | Dynamic Zone        | Komponenty `shared.media`, `quote`, `rich-text`, `slider`   |
| `body`        | Text (Long)         | Zwykły tekst (nie Rich Text Blocks)                         |
| `featured`    | Boolean             | Domyślnie `false`                                           |
| `readTime`    | Number (integer)    |                                                             |

> **Datę publikacji nie ma na liście.** `publishedAt` to pole systemowe — Strapi ustawia je sam,
> gdy publikujesz wpis (Article ma włączone Draft & Publish).

> **Pole UID** generuje identyfikator przyjazny dla URL: `"Mój pierwszy artykuł"` →
> `"moj-pierwszy-artykul"`.

**Relacje.** Bez relacji każdy artykuł musiałby kopiować dane autora. Relacja to jedno źródło prawdy.

| Typ     | Przykład          | Znaczenie                                             |
|---------|-------------------|-------------------------------------------------------|
| **1:1** | User ↔ Profile    | Jeden użytkownik ma dokładnie jeden profil            |
| **1:N** | Author → Articles | Autor ma wiele artykułów, artykuł ma jednego autora   |
| **N:M** | Articles ↔ Tags   | Artykuł ma wiele tagów, tag należy do wielu artykułów |

Kliknij pole `author` w Article — to **Many-to-One** (wiele artykułów → jeden autor).
Otwórz teraz **Author** i **Category**: po ich stronie ta sama relacja widnieje jako `articles`
(**One-to-Many**). To jedna relacja oglądana z dwóch stron.

**Komponenty i Dynamic Zone.** W sekcji **Components** (kategoria `shared`) są grupy pól
wielokrotnego użytku — np. `shared.quote` (`title` + `body`). Pole `blocks` to **Dynamic Zone**:
redaktor układa treść z dowolnych komponentów w dowolnej kolejności — jak lista
`Array<Media | Quote | RichText | Slider>` w TypeScript.

### Krok 2 — Nowy Content Type `Tag`

Content-Type Builder → ikona **+** przy „Collection types” → **New Collection-Type** →
Display name: `Tag` → **Continue**. W zakładce **Advanced settings** zostaw zaznaczone
Draft & publish, a Internationalization odznaczone.

> Przy pierwszym wejściu do Content-Type Builder pojawia się samouczek („Step 1 of 7”) —
> zamknij go przyciskiem **Skip**.

| Pole   | Typ          | Opcje                  |
|--------|--------------|------------------------|
| `name` | Text (Short) | Required               |
| `slug` | UID          | Attached field: `name` |

**Add new field** → **Text** → Name: `name` (Short text) → zakładka **Advanced settings** →
zaznacz **Required field** → **Add another field** → **UID** → Name: `slug`,
Attached field: `name` → **Finish**.

Kliknij **Save** w lewym panelu Content-Type Builder (nad wyszukiwarką). Do tego momentu zmiany
(oznaczenia **N** / **NEW**) istnieją tylko w przeglądarce — przeładowanie strony je kasuje.

> **Nazwa musi być nowa.** Article, Author i Category już istnieją — Content-Type Builder
> nie pozwoli utworzyć drugiego typu o tej samej nazwie.

### Krok 3 — Relacja Article ↔ Tag

Content-Type Builder → `Article` → **Add another field** → **Relation**:

- Po prawej z listy (domyślnie „Article”) wybierz **Tag**
- Kliknij piątą ikonę — **has and belongs to many** (Many-to-Many: artykuł ma wiele tagów,
  tag ma wiele artykułów). Pod ikonami pojawi się zdanie „Articles has and belongs to many Tags”
- Nazwy pól Strapi uzupełni sam: po stronie Article `tags`, po stronie Tag `articles`

**Finish** → **Save** w lewym panelu — Strapi zrestartuje się i zaktualizuje bazę.
Poczekaj, aż panel się przeładuje.

> **Co się stało w kodzie?** Content-Type Builder zapisał pliki w `src/api/tag/`
> (`schema.json` + controller, service, routes) i dopisał pole `tags` do schematu Article.
> Każdy zapis restartuje serwer, dlatego CTB działa tylko w trybie `develop` — na produkcji
> model zmienia się przez commit tych plików.

### Krok 4 — Dane

W Content Manager:

1. **Tag** → **Create new entry** → utwórz 3 tagi: „JavaScript”, „API”, „Strapi”.
   Jeśli pole `slug` zostanie puste, kliknij ikonę **Regenerate** (↻) w tym polu — inaczej tag
   zapisze się bez sluga. „JavaScript” daje slug `java-script`; możesz go poprawić ręcznie
2. **Opublikuj** każdy tag — nowe typy z CTB mają domyślnie włączone Draft & Publish,
   a publiczne API zwraca tylko opublikowane wpisy. **Publish** od razu zapisuje i publikuje —
   wcześniejsze **Save** nie jest potrzebne
3. **Article** → przypisz tagi do co najmniej 2 artykułów (pole `tags`)
4. **Opublikuj** te artykuły ponownie — po samym **Save** status zmienia się na **Modified**,
   a opublikowana wersja zostaje bez tagów, dopóki nie klikniesz **Publish**

> **Article ma i18n.** Edytujesz wersję `pl` (domyślną — etykieta „Polish (pl)” pod tytułem
> wpisu). Pola z ikoną 🌐 są tłumaczone. Relacje (`tags`, `author`, `category`) ikony nie mają,
> ale Strapi zapisuje je osobno dla każdej wersji językowej.

> Strapi nie zapisał tagów *wewnątrz* artykułu — zapisał referencje.
> Żeby dostać tagi w odpowiedzi API, trzeba poprosić o `populate` (ćwiczenie P3) i dać roli Public
> dostęp do Tag (ćwiczenie P4). Bez uprawnienia **find** dla Tag `populate=tags` nie zgłasza
> błędu — pole `tags` po prostu znika z odpowiedzi, a filtr `filters[tags][name]` zwraca
> 400 „Invalid key tags”.

## Kryteria akceptacji

1. Potrafisz wskazać w Content-Type Builder relacje Article → Author i Article → Category
   oraz pole Dynamic Zone `blocks`
2. Istnieje Content Type `Tag` z polami `name` i `slug`, a w `src/api/tag/` są jego pliki
3. W Content Manager widać 3 opublikowane tagi, każdy z wypełnionym slugiem
4. Co najmniej 2 artykuły (wersja `pl`) mają przypisane tagi i są ponownie opublikowane
