# Ломбардный эксперт | Liquid Glass

Профессиональный калькулятор для ломбарда — расчет стоимости золотых изделий, вычетов за вставки, страховки и процентов.

## Быстрый старт

```bash
npm install
npm run dev       # → http://localhost:5173
npm run build     # → dist/
npm run test      # → Vitest (37 тестов)
```

## Архитектура

```
src/
├── domain/            # Чистые функции, типы, константы
│   ├── types.ts       # Operation, Purity, Stone, CalcResult и т.д.
│   ├── constants.ts   # Коэффициенты, ставки, лимиты
│   ├── calculations.ts# Все расчетные формулы
│   └── __tests__/     # Unit-тесты (Vitest)
├── store/             # Zustand (calculatorStore.ts)
├── shared/
│   ├── icons/         # SVG-компоненты камней и форм
│   ├── ui/            # GlassCard, Switch, RadioGroup, CustomSelect
│   └── styles/        # tokens.css, global.css
└── features/
    ├── calculator/    # CalculatorPage — главная страница
    └── stones/        # StoneRow, StonesSection — CRUD вставок
```

## Формулы и коэффициенты

### Цена за грамм

```
actualPrice = round(basePrice × (проба / 585))
amountHand  = round(netWeight × actualPrice)
```

### Страховка (Залог)

```
insurance = round(amountHand × 0.2376)
loanTotal = amountHand + insurance
```

### Маржа (Скупка)

```
retailPrice = round(6500 × (проба / 585))
margin = round((retailPrice - actualPrice) × netWeight)
```

### Проценты (Залог, кусочная ставка)

| Дни  | Ставка/день |
| ---- | ----------- |
| 2–6  | 0.402%      |
| 7–23 | 0.128%      |
| 24+  | 0.578%      |

```
sum = round(loanTotal × (rate / 100))
totalReturn = loanTotal + sum
```

### Коэффициенты камней

| Форма       | Коэфф    |
| ----------- | -------- |
| Круг        | 0.0135   |
| Овал        | 0.015    |
| Багет       | 0.02175  |
| Квадрат     | 0.01725  |
| Маркиз      | 0.012    |
| Груша       | 0.013125 |
| Октагон     | 0.018375 |
| Сердце      | 0.01575  |
| Треугольник | 0.0135   |
| Триллион    | 0.01275  |
| Шар         | 0.019425 |

**Бриллиант**: коэфф × (0.0037 / 0.0081)
**Эмаль**: gram = (L×W/100) × 0.1 × Q
**Жемчуг**: ct = L³ × 0.01295 × Q
**Янтарь**: ct = L×W×H × 0.0065 × Q

### Лимит 7000 ₽ (Залог)

```
checkPrice = insured ? 7000 : 6300
checkTotal = round(netW × round(checkPrice × (проба / 585)))
blocked = checkTotal > 150000
```

### Вычеты веса

- Загрязнение: −0.100 г (всегда)
- Замок: −0.050 г (браслет/цепь)
- Пустотелость: −5% от общего веса
- Свыше 20г: −0.5% от общего веса

## Стек

| Слой   | Технология            |
| ------ | --------------------- |
| UI     | React 18 + TypeScript |
| Сборка | Vite 5                |
| Стейт  | Zustand 4             |
| Стили  | CSS Modules + токены  |
| Тесты  | Vitest + jsdom        |

## Дизайн-токены

Все визуальные переменные в `src/shared/styles/tokens.css`:

- `--glass-bg`, `--glass-border`, `--glass-shadow`
- `--accent`, `--danger`, `--margin-color`
- `--radius-lg/md/sm/pill`

Для изменения стиля редактируйте только `tokens.css` — компоненты наследуют все значения через CSS custom properties.
