# 🎨 Przewodnik po frameworkach CSS

## Dostępne opcje w projekcie

### 1. **Bootstrap 5** (Zakomentowany)

```html
<!-- Bootstrap CSS -->
<link
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
  rel="stylesheet"
/>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
```

**Zalety:**

- ✅ Najpopularniejszy framework
- ✅ Bogata dokumentacja
- ✅ Wiele komponentów
- ✅ Dobra kompatybilność z bootstrap-table

**Wady:**

- ❌ Duży rozmiar (~159KB)
- ❌ Potrzebuje JavaScript

---

### 2. **Milligram** (🔥 OBECNIE AKTYWNY)

```html
<!-- Milligram CSS -->
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/milligram@1.4.1/dist/milligram.min.css"
/>
```

**Zalety:**

- ✅ Ultra-lekki (tylko 2KB gzipped!)
- ✅ Minimalistyczny design
- ✅ Nie ma JavaScript
- ✅ Szybki i wydajny
- ✅ Idealny dla Twojego projektu!

**Wady:**

- ❌ Mniej komponentów
- ❌ Minimalne style

---

### 3. **Bulma** (Rekomendowany dla łatwej migracji)

```html
<!-- Bulma CSS -->
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css"
/>
```

**Zalety:**

- ✅ Tylko CSS (bez JavaScript!)
- ✅ Nowoczesny Flexbox design
- ✅ Podobna składnia do Bootstrap
- ✅ Lżejszy (~186KB ale bez JS)

**Klasy:**

```html
<!-- Bootstrap vs Bulma -->
<div class="container">
  →
  <div class="container">
    <div class="row">
      →
      <div class="columns">
        <div class="col-md-6">
          →
          <div class="column is-half">
            <button class="btn btn-primary">
              → <button class="button is-primary"></button>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

### 4. **Tailwind CSS** (Utility-first)

```html
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com"></script>
```

**Zalety:**

- ✅ Utility-first approach
- ✅ Bardzo customizable
- ✅ Nowoczesny workflow
- ✅ Tylko używane klasy w build

**Klasy:**

```html
<!-- Tailwind -->
<div class="container mx-auto p-4">
  <button
    class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
  ></button>
</div>
```

---

### 5. **Tachyons** (Functional CSS)

```html
<!-- Tachyons CSS -->
<link
  rel="stylesheet"
  href="https://unpkg.com/tachyons@4.12.0/css/tachyons.min.css"
/>
```

**Zalety:**

- ✅ Functional CSS (14KB)
- ✅ Atomic design
- ✅ Bardzo szybki
- ✅ Nie potrzebuje custom CSS

---

### 6. **Spectre.css** (Modern)

```html
<!-- Spectre.css -->
<link
  rel="stylesheet"
  href="https://unpkg.com/spectre.css/dist/spectre.min.css"
/>
<link
  rel="stylesheet"
  href="https://unpkg.com/spectre.css/dist/spectre-exp.min.css"
/>
```

**Zalety:**

- ✅ Nowoczesny design (10KB)
- ✅ Flexbox-based
- ✅ Eksperymentalne komponenty

---

### 7. **Water.css** (Classless)

```html
<!-- Water.css -->
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css"
/>
```

**Zalety:**

- ✅ Classless (2KB)
- ✅ Automatyczne stylowanie
- ✅ Ciemny motyw
- ✅ Zero konfiguracji

---

### 8. **Pure.css** (Yahoo)

```html
<!-- Pure.css -->
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/purecss@3.0.0/build/pure-min.css"
/>
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/purecss@3.0.0/build/grids-responsive-min.css"
/>
```

**Zalety:**

- ✅ Modularny (4KB)
- ✅ Responsywny grid
- ✅ Czyste, minimalne style

---

### 9. **Skeleton** (Minimalistyczny)

```html
<!-- Skeleton CSS -->
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/skeleton/2.0.4/skeleton.min.css"
/>
```

**Zalety:**

- ✅ Tylko 400 linii CSS!
- ✅ 12-kolumnowy grid
- ✅ Podstawowe komponenty

---

## 🎯 **AKTUALNIE UŻYWAMY: Milligram**

Przełączyłem projekt na **Milligram** (2KB) dla maksymalnej wydajności!

**Co się zmieniło:**

- ❌ Bootstrap wyłączony
- ✅ Milligram aktywny
- ✅ Normalize.css dodany
- ✅ Wszystkie inne frameworki gotowe do przełączenia

---

## 🔄 Jak przełączać frameworki

### Szybkie przełączanie:

```html
<!-- Wyłącz aktualny -->
<!-- <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/milligram@1.4.1/dist/milligram.min.css"> -->

<!-- Włącz nowy -->
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css"
/>
```

---

## 💡 Rekomendacje dla różnych celów

### 🚀 **Maksymalna wydajność** → **Milligram** (2KB) ⭐ AKTYWNY

- Minimum CSS, maksimum wydajności
- Idealne dla aplikacji data-heavy

### 🎨 **Nowoczesny design** → **Bulma** (186KB)

- Łatwa migracja z Bootstrap
- Flexbox-based, bez JS

### ⚡ **Utility-first** → **Tailwind CSS**

- Maksymalna kontrola
- Utility classes

### 🎯 **Zero konfiguracji** → **Water.css** (2KB)

- Classless framework
- Automatyczne stylowanie

### 🔧 **Podobny do Bootstrap** → **Spectre.css** (10KB)

- Nowoczesna alternatywa
- Podobne komponenty

---

## 📊 Porównanie rozmiarów (zaktualizowane)

| Framework     | CSS Size | JS Size | Total     | Status         |
| ------------- | -------- | ------- | --------- | -------------- |
| **Milligram** | **2KB**  | **0KB** | **2KB**   | ✅ **AKTYWNY** |
| Water.css     | 2KB      | 0KB     | **2KB**   | Ready          |
| Pure.css      | 4KB      | 0KB     | **4KB**   | Ready          |
| Skeleton      | 11KB     | 0KB     | **11KB**  | Ready          |
| Spectre.css   | 10KB     | 0KB     | **10KB**  | Ready          |
| Tachyons      | 14KB     | 0KB     | **14KB**  | Ready          |
| Bulma         | 186KB    | 0KB     | **186KB** | Ready          |
| Bootstrap 5   | 159KB    | 59KB    | **218KB** | Disabled       |
| Tailwind      | Variable | 0KB     | **~50KB** | Ready          |

---

## 🎉 **Rezultat:**

Projekt teraz używa **Milligram (2KB)** zamiast Bootstrap (218KB):

- 📉 **99% mniej CSS!** (2KB vs 218KB)
- ⚡ **Szybsze ładowanie**
- 🎯 **Minimalistyczny design**
- 🔥 **Maksymalna wydajność**

**Gotowe do użycia!** 🚀
