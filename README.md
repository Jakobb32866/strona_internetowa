# FormNest · strona internetowa

Statyczna strona (HTML, CSS, JS bez zależności i bez kroku budowania). Z prezentacji `../v5-prezentacja` pochodzą marka (logo, krój Archivo, kolory), makiety aplikacji w `js/ui.js` i język opisu produktu.

## Podgląd

```bash
python3 -m http.server 4173 --directory .
```

Potem http://localhost:4173. Pliki otwarte bezpośrednio z dysku też działają.

## Podstrony

- `index.html` – strona główna: hasło, demo planu z podpowiedzią podobnego kodu, aplikacja mobilna i desktopowa, porównanie z dokumentacją papierową, podgląd prezentacji, wdrożenie, zaproszenie na spotkanie.
- `produkt.html` – ekrany aplikacji mobilnej, przegląd aplikacji desktopowej w zakładkach, suwak „rysunek z programu CAD i plan po wczytaniu”.
- `prezentacja/` – prezentacja w wersji na stronę (23 slajdy). Logo w lewym górnym rogu prowadzi z powrotem na stronę.
- `kontakt.html` – formularz z prośbą o spotkanie i budynek, który rośnie z każdym wpisanym znakiem.

## Prezentacja: zmiany względem `v5-prezentacja`

- Usunięte slajdy: porównanie pomyłki z abonamentem, cennik, oferta dla pierwszych wdrożeń, kalkulator. Slajd o koszcie pomyłki zostaje.
- „Wydruk planu” zamienione na „dokumentację papierową”, „plik DXF” na „projekt CAD”.
- Ostatni slajd zaprasza na spotkanie zamiast na okres testowy.
- Na telefonie trzymanym pionowo prezentacja jest obrócona o 90°, żeby czytało się ją poziomo. Przesuwanie palcem działa w kierunkach obróconego ekranu.

## Pliki

- `css/style.css` – style strony, na końcu style makiet aplikacji.
- `js/ui.js` – makiety aplikacji desktopowej i mobilnej, generator planu.
- `js/site.js` – makiety na stronach (`data-mock`), demo planu, zakładki, przegląd aplikacji desktopowej, suwak rysunku, formularz, menu.
- `sitemap.xml` – mapa witryny dla Google Search Console. Przy dodaniu podstrony trzeba dopisać jej adres, a przy większej zmianie treści zaktualizować `lastmod`.
- `robots.txt` – pozwala indeksować całą stronę i wskazuje mapę witryny.

## Do uzupełnienia przed publikacją

- Formularz kontaktowy wysyła wiadomości przez FormSubmit (formsubmit.co). Na razie główny adres to jaszoch@gmail.com, a kontakt@formnest.pl dostaje kopię (stałe `ENDPOINT` i `COPY` w sekcji formularza w `js/site.js`). Przed publikacją trzeba raz wysłać formularz i kliknąć link aktywacyjny, który przyjdzie na jaszoch@gmail.com. Do tego czasu wysyłka kończy się komunikatem o błędzie. Po założeniu skrzynki kontakt@formnest.pl można zamienić adresy z powrotem (wtedy aktywacja przyjdzie na nowy główny adres).
- Dane z formularza przechodzą przez FormSubmit, więc warto to opisać w polityce prywatności.
- Brak danych firmy w stopce (nazwa spółki, adres, NIP) i polityki prywatności.
- Brak obrazka do udostępniania (`og:image`).
