# 📊 CSV Sortowanie i Kategoryzacja

## 🌟 Opis aplikacji

**CSV Sortowanie i Kategoryzacja** to zaawansowana aplikacja webowa do analizy, kategoryzacji i wizualizacji danych CSV. Aplikacja automatycznie klasyfikuje dane logistyczne według predefiniowanych kategorii oraz oferuje bogate możliwości analizy i eksportu.

## 🎯 Główne funkcjonalności

### 📁 **Wczytywanie i przetwarzanie danych**

- **Wieloformatowe wczytywanie**: CSV, TXT z automatyczną detekcją separatorów (`,`, `;`, tabulator)
- **Drag & Drop**: Możliwość przeciągania plików bezpośrednio do edytora
- **Live parsing**: Natychmiastowe przetwarzanie danych podczas wpisywania
- **Walidacja danych**: Automatyczne sprawdzanie poprawności formatów

### 🏷️ **Inteligentna kategoryzacja**

- **🟢 IB (Inbound)**: Rekordy zawierające '0994' w polu VRID
- **🟡 OB (Outbound)**: Pozostałe rekordy z VRID (bez '0994')
- **🔵 ATSEU**: Rekordy zawierające 'VS' w polu TRAILER (pierwszeństwo)
- **⚪ OTHER**: Rekordy bez pola VRID

### 📊 **Zaawansowana analiza**

- **Wykresy interaktywne**: Pie, Doughnut, Bar, Radar, Timeline
- **Analiza aktywności użytkowników**: Top 10 najbardziej aktywnych
- **Statystyki czasowe**: Rozkład aktywności w ciągu dnia
- **Porównania**: Analiza podobieństwa między różnymi zestawami danych

### 💾 **System buforowania**

- **Lokalne przechowywanie**: Automatyczne zapisywanie w localStorage
- **Metadane**: Śledzenie daty utworzenia, ostatniego dostępu, rozmiaru
- **Import/Export**: Możliwość eksportu buforów do plików CSV
- **Porównania**: Analiza różnic między buforami

### 🎨 **System motywów**

- **Ciemny/Jasny motyw**: Automatyczne przełączanie
- **Synchronizacja**: Motyw synchronizowany między kartami przeglądarki
- **Responsive**: Pełna obsługa urządzeń mobilnych
- **Handsontable themes**: Niezależne motywy dla edytora tabelowego

## 🗂️ Struktura aplikacji

### 📋 **Zakładki główne**

#### 1. **Edytor CSV** 📝

- **CodeMirror editor**: Syntax highlighting dla CSV
- **Live preview**: Natychmiastowa kategoryzacja podczas edycji
- **Statystyki**: Licznik wierszy, znaków, kategorii
- **Walidacja**: Sprawdzanie poprawności formatów danych

#### 2. **Edytor Tabelowy** 📊

- **Handsontable**: Zaawansowany edytor spreadsheet
- **Edycja inline**: Bezpośrednia edycja komórek
- **Sortowanie i filtrowanie**: Zaawansowane opcje sortowania
- **Import/Export**: Synchronizacja z edytorem CSV

#### 3. **Bufory** 🗄️

- **Lista buforów**: Przegląd wszystkich zapisanych zestawów danych
- **Metadane**: Data utworzenia, ostatni dostęp, rozmiar, liczba rekordów
- **Operacje**: Ładowanie, eksport, usuwanie buforów
- **Status**: Oznaczenie surowych vs. przetworzonych danych

#### 4. **Analiza** 📈

- **Panel kontrolny**: Opcje ukrywania/pokazania sekcji
  - ✅ **Tabele kategorii**: Interaktywne tabele dla każdej kategorii
  - ✅ **Statystyki**: Szczegółowe dane o użytkownikach i pojazdach
- **Eksport**: Możliwość eksportu każdej kategorii do CSV
- **Transfer**: Przesyłanie danych do edytora tabelowego

#### 5. **Chart** 📊

- **Wykresy aktualnych danych**: Pie, Doughnut, Bar, Timeline
- **Analiza użytkowników**: Top 15 i Top 10 w różnych formatach
- **Porównania buforów**: Szczegółowa analiza różnic między zestawami
- **Eksport wyników**: Wspólne, unikalne rekordy, pełne raporty

## 🛠️ Technologie

### **Frontend**

- **React 18**: Biblioteka UI z hooks
- **Bootstrap 5**: Responsive framework CSS
- **Bootstrap Icons**: Zestaw ikon
- **CodeMirror**: Edytor kodu z podświetlaniem składni
- **Handsontable**: Zaawansowany edytor spreadsheet
- **Chart.js**: Biblioteka do tworzenia wykresów

### **Przetwarzanie danych**

- **PapaParse**: Parser CSV z obsługą różnych formatów
- **Custom DataTransformer**: Zaawansowane przekształcenia danych
- **DataBuffer**: System buforowania w localStorage

### **Stylowanie**

- **CSS Variables**: System motywów z zmiennymi CSS
- **Share Tech Mono**: Czcionka monospace dla danych
- **Responsive Design**: Media queries dla różnych urządzeń
- **Animacje CSS**: Smooth transitions i hover effects

## 📂 Struktura plików

```
📁 CSV-Sortowanie-Kategoryzacja/
├── 📄 index.html              # Główny plik HTML
├── 📄 script.js               # Główna logika React
├── 📄 styles.css              # Style CSS z systemem motywów
├── 📄 edytor.css              # Style dla edytora Handsontable
├── 📄 theme.js                # Zarządzanie motywami
├── 📄 csvLoader.js            # Ładowanie i parsowanie CSV
├── 📄 dataTransformer.js      # Przekształcenia danych
├── 📄 dataBuffer.js           # System buforowania
├── 📄 editableTable.js        # Edytor tabelowy
└── 📄 README.md               # Dokumentacja projektu
```

## 🚀 Instalacja i uruchomienie

### **Wymagania**

- Nowoczesna przeglądarka (Chrome, Firefox, Safari, Edge)
- Obsługa JavaScript ES6+
- LocalStorage dla funkcji buforowania

### **Uruchomienie**

1. Pobierz wszystkie pliki projektu
2. Umieść w jednym folderze
3. Otwórz `index.html` w przeglądarce
4. Aplikacja gotowa do użycia!

## 💡 Instrukcja użytkowania

### **1. Wczytywanie danych**

```
1. Przejdź do zakładki "Edytor CSV"
2. Kliknij "Wybierz plik CSV" lub przeciągnij plik
3. Alternatywnie: wklej dane bezpośrednio do edytora
4. Obserwuj automatyczną kategoryzację w statystykach
```

### **2. Analiza danych**

```
1. Po wczytaniu danych przejdź do "Analiza"
2. Użyj panelu kontrolnego do ukrycia/pokazania sekcji
3. Sprawdź szczegółowe statystyki transformacji
4. Eksportuj wybrane kategorie do CSV
```

### **3. Zarządzanie buforami**

```
1. Zapisz aktualne dane: "Zapisz do bufora"
2. Przejdź do zakładki "Bufory"
3. Przeglądaj zapisane zestawy danych
4. Ładuj, eksportuj lub usuń bufory
```

### **4. Porównywanie danych**

```
1. Przejdź do zakładki "Chart"
2. Wybierz dwa bufory do porównania
3. Kliknij "Porównaj bufory"
4. Analizuj wykresy i statystyki
5. Eksportuj wyniki porównania
```

## 🎨 System motywów

### **Funkcjonalności**

- **🌙 Ciemny motyw**: Przyjazny dla oczu w słabym oświetleniu
- **☀️ Jasny motyw**: Czytelny w jasnym oświetleniu
- **🔄 Auto-detekcja**: Automatyczne dopasowanie do preferencji systemu
- **💾 Zapamiętywanie**: Motyw zapisywany między sesjami
- **🔄 Synchronizacja**: Motyw synchronizowany między kartami

### **Przełączanie**

- Kliknij przycisk motywu w prawym górnym rogu nav-tabs
- Ikona zmienia się: 🌙 → ☀️
- Motyw przełącza się natychmiastowo

## 📊 Format danych

### **Oczekiwany format CSV**

```csv
Data UTC,User ID,VRID,SCAC,TRAKTOR,TRAILER
2024-01-15 08:30:00,USER123,0994ABC,SCAC01,TR001,TL001
2024-01-15 09:15:00,USER456,VR789,SCAC02,TR002,VS123
```

### **Pola danych**

- **Data UTC**: Format ISO 8601 lub czytelny dla człowieka
- **User ID**: Identyfikator użytkownika
- **VRID**: Vehicle Record ID (podstawa kategoryzacji IB/OB)
- **SCAC**: Standard Carrier Alpha Code
- **TRAKTOR**: Identyfikator traktora
- **TRAILER**: Identyfikator naczepy (wpływa na kategorię ATSEU)

## 🔧 Konfiguracja

### **Zmienne CSS (styles.css)**

```css
/* Kolory kategorii - ciemny motyw */
--category-ib: #10b981; /* Zielony dla IB */
--category-ob: #f59e0b; /* Żółty dla OB */
--category-atseu: #3b82f6; /* Niebieski dla ATSEU */
--category-other: #6b7280; /* Szary dla OTHER */

/* Kolory kategorii - jasny motyw */
--category-ib: #059669; /* Ciemniejszy zielony */
--category-ob: #d97706; /* Ciemniejszy żółty */
--category-atseu: #2563eb; /* Ciemniejszy niebieski */
--category-other: #64748b; /* Ciemniejszy szary */
```

### **Reguły kategoryzacji (script.js)**

```javascript
// Logika kategoryzacji w kategorizeData()
if (trailer.includes("VS")) {
  atseu.push(row); // ATSEU ma pierwszeństwo
} else if (!vrid) {
  other.push(row); // Brak VRID = OTHER
} else if (vrid.includes("0994")) {
  ib.push(row); // Zawiera '0994' = IB
} else {
  ob.push(row); // Pozostałe = OB
}
```

## 📈 Funkcjonalności analityczne

### **Wykresy dostępne**

- **📊 Pie Chart**: Rozkład procentowy kategorii
- **🍩 Doughnut Chart**: Alternatywny widok procentowy
- **📊 Bar Chart**: Porównanie liczby rekordów
- **🕷️ Radar Chart**: Analiza wielowymiarowa kategorii
- **📈 Line Chart**: Aktywność w czasie (timeline)

### **Statystyki**

- **👥 Użytkownicy**: Liczba unikalnych, najaktywniejszy
- **🚛 Pojazdy**: Liczba traktorów, naczep, naczep VS
- **📊 Jakość danych**: Procent poprawnych rekordów
- **⏰ Aktywność czasowa**: Rozkład w ciągu dnia

## 🔒 Bezpieczeństwo i prywatność

- **Lokalne przetwarzanie**: Wszystkie dane pozostają w przeglądarce
- **Brak wysyłania danych**: Żadne informacje nie są przekazywane na serwery
- **LocalStorage**: Dane zapisywane lokalnie w przeglądarce
- **User-select: none**: Ochrona przed przypadkowym kopiowaniem

## 🐛 Rozwiązywanie problemów

### **Dane nie ładują się**

- Sprawdź format CSV (przecinki, średniki, tabulatory)
- Upewnij się, że pierwsza linia to nagłówki
- Sprawdź kodowanie pliku (UTF-8 zalecane)

### **Przycisk motywu nie działa**

- Odśwież stronę (F5)
- Sprawdź konsolę przeglądarki (F12)
- Wyczyść localStorage: `localStorage.clear()`

### **Wykresy nie wyświetlają się**

- Sprawdź czy masz dane w tabeli
- Upewnij się, że Chart.js się załadował
- Sprawdź konsolę na błędy JavaScript

### **Problemy z edytorem tabelowym**

- Sprawdź czy Handsontable się załadował
- Wyczyść cache przeglądarki
- Spróbuj w trybie incognito

## 📝 Historia zmian

### **v2.1** (Aktualna)

- ✅ Dodano panel kontrolny analizy z opcjami ukrywania/pokazania
- ✅ Naprawiono przycisk przełączania motywu w nav-tabs
- ✅ Dodano kolory kategorii do zmiennych CSS
- ✅ Ulepszone animacje i responsywność

### **v2.0**

- ✅ System motywów ciemny/jasny
- ✅ Edytor tabelowy Handsontable
- ✅ System buforowania danych
- ✅ Porównywanie buforów

### **v1.0**

- ✅ Podstawowa funkcjonalność CSV
- ✅ Kategoryzacja IB/OB/ATSEU/OTHER
- ✅ Wykresy Chart.js
- ✅ Eksport do CSV

## 🤝 Wsparcie

Dla problemów technicznych lub sugestii ulepszeń:

1. Sprawdź konsolę przeglądarki (F12) na błędy
2. Przetestuj w trybie incognito
3. Sprawdź kompatybilność przeglądarki

## 📄 Licencja

Projekt jest open-source i dostępny do modyfikacji według potrzeb.

---

**Utworzono z ❤️ dla efektywnej analizy danych CSV**
