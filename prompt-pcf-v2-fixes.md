# PCF SchedulePlanner — Comprehensive Fix (V2)

Major refactor needed for both weekly and monthly views. Please address ALL of the following issues in one pass.

---

## 1. RESPONSIVE GRID — Fixed column widths

The grid columns must have FIXED widths that don't change based on content. Currently the grid shrinks when cells are empty and stretches when content is added or the copy button appears.

Fix the CSS grid to use fixed widths:
```css
.schedule-grid {
  display: grid;
  grid-template-columns: 180px repeat(5, 1fr) 70px 70px;
  width: 100%;
  min-width: 900px;
  table-layout: fixed;
}

.grid-cell {
  min-height: 70px;
  overflow: hidden;
}
```

The grid must look identical whether cells are empty, filled with 1 entry, or filled with 4 entries. The only thing that changes is the ROW HEIGHT (grows vertically for multiple entries). Column widths are ALWAYS the same.

---

## 2. COPY BUTTON — Position and behavior

Current problem: The copy button appears INSIDE each schedule card, next to the cost center name, which stretches the card width.

Fix: The copy button must be positioned in the **top-right corner of the CELL** (not the card), and it copies ALL entries in that cell (all entries for that employee on that day).

```tsx
<div className="day-cell" onClick={handleCellClick} onMouseEnter={...} onMouseLeave={...}>
  {hasEntries && isHovered && !isCopyMode && (
    <button className="copy-btn" onClick={(e) => { e.stopPropagation(); handleCopy(); }}>
      <CopyIcon />
    </button>
  )}
  
  {entries.map(entry => (
    <div className="schedule-card" key={entry.id}>
      <div className="schedule-card-name">{entry.costCenterName}</div>
      <div className="schedule-card-time">{formatTime(entry)}</div>
    </div>
  ))}
  
  {absences.map(absence => (
    <div className="absence-tag" key={absence.id}>...</div>
  ))}
</div>
```

Copy button CSS:
```css
.day-cell {
  position: relative;
}

.copy-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background: #E5E7EB;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
}

.copy-btn:hover {
  background: #D1D5DB;
}

.copy-btn svg {
  width: 14px;
  height: 14px;
  color: #6B7280;
}
```

---

## 3. HOVER EFFECT — Entire cell, not individual cards

Current problem: Hovering over a filled cell highlights only the individual schedule-card, not the whole cell.

Fix: The hover effect must highlight the ENTIRE cell background:

```css
.schedule-card:hover {
  /* REMOVE any background change here */
}

.day-cell:hover {
  background: #F9FAFB;
  cursor: pointer;
}

.day-cell.has-entries:hover {
  background: #F5F7F0;
}
```

---

## 4. PASTE ICON — Only on hover, not always visible

Current problem: When copy mode is active, paste icons appear in ALL empty cells permanently, cluttering the grid.

Fix: Paste icons should ONLY appear when hovering over an empty cell while copy mode is active:

```tsx
{isCopyMode && isEmpty && isHovered && (
  <div className="paste-target">
    <PasteIcon />
  </div>
)}
```

```css
.paste-target {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 44px;
}

.paste-target svg {
  width: 18px;
  height: 18px;
  color: #9CA3AF;
}
```

---

## 5. ABSENCE TAGS — Span across date range + styling + click behavior

### Bug: Absence only shows on start date
An absence from 30.03 to 03.04 only shows on 30.03. It must appear in EVERY day cell within the date range.

Fix the absence-to-cell mapping:
```typescript
function getAbsencesForCell(
  absences: AbsenceEntry[],
  employeeId: string,
  cellDate: Date
): AbsenceEntry[] {
  return absences.filter(a => {
    if (a.employeeId !== employeeId) return false;
    const start = new Date(a.dateStart);
    const end = new Date(a.dateEnd);
    return cellDate >= start && cellDate <= end;
  });
}
```

### Absence text styling
Make absence tag text match the schedule card cost center name styling:
```css
.absence-tag {
  font-size: 13px;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 4px;
}
```

### click_empty when cell has only absences
A cell that contains ONLY absence tags (no schedule entries) must fire `click_empty`, not `click_filled`:
```typescript
const hasScheduleEntries = cellScheduleEntries.length > 0;
const action = hasScheduleEntries ? "click_filled" : "click_empty";
```

### Absence type labels (German)
```typescript
const absenceLabels: Record<string, string> = {
  "U": "Urlaub",
  "K": "Krank",
  "UF": "Unentschuldigt",
  "KK": "Kind krank",
  "SU": "Sonderurlaub",
  "SO": "Sonstiges"
};
```

---

## 6. SACHSEN HOLIDAYS — Highlight + exclude from Soll

Hardcode Sachsen holidays and use them in both views:

```typescript
const SACHSEN_HOLIDAYS: { date: string; name: string }[] = [
  // 2025
  { date: "2025-01-01", name: "Neujahr" },
  { date: "2025-04-18", name: "Karfreitag" },
  { date: "2025-04-21", name: "Ostermontag" },
  { date: "2025-05-01", name: "Tag der Arbeit" },
  { date: "2025-05-29", name: "Christi Himmelfahrt" },
  { date: "2025-06-09", name: "Pfingstmontag" },
  { date: "2025-10-03", name: "Tag der Dt. Einheit" },
  { date: "2025-10-31", name: "Reformationstag" },
  { date: "2025-11-19", name: "Buß- und Bettag" },
  { date: "2025-12-25", name: "1. Weihnachtsfeiertag" },
  { date: "2025-12-26", name: "2. Weihnachtsfeiertag" },
  // 2026
  { date: "2026-01-01", name: "Neujahr" },
  { date: "2026-04-03", name: "Karfreitag" },
  { date: "2026-04-06", name: "Ostermontag" },
  { date: "2026-05-01", name: "Tag der Arbeit" },
  { date: "2026-05-14", name: "Christi Himmelfahrt" },
  { date: "2026-05-25", name: "Pfingstmontag" },
  { date: "2026-10-03", name: "Tag der Dt. Einheit" },
  { date: "2026-10-31", name: "Reformationstag" },
  { date: "2026-11-18", name: "Buß- und Bettag" },
  { date: "2026-12-25", name: "1. Weihnachtsfeiertag" },
  { date: "2026-12-26", name: "2. Weihnachtsfeiertag" },
  // 2027
  { date: "2027-01-01", name: "Neujahr" },
  { date: "2027-03-26", name: "Karfreitag" },
  { date: "2027-03-29", name: "Ostermontag" },
  { date: "2027-05-01", name: "Tag der Arbeit" },
  { date: "2027-05-06", name: "Christi Himmelfahrt" },
  { date: "2027-05-17", name: "Pfingstmontag" },
  { date: "2027-10-03", name: "Tag der Dt. Einheit" },
  { date: "2027-10-31", name: "Reformationstag" },
  { date: "2027-11-17", name: "Buß- und Bettag" },
  { date: "2027-12-25", name: "1. Weihnachtsfeiertag" },
  { date: "2027-12-26", name: "2. Weihnachtsfeiertag" },
];

function isHoliday(date: Date): boolean {
  const dateStr = date.toISOString().split('T')[0];
  return SACHSEN_HOLIDAYS.some(h => h.date === dateStr);
}

function getHolidayName(date: Date): string | null {
  const dateStr = date.toISOString().split('T')[0];
  const holiday = SACHSEN_HOLIDAYS.find(h => h.date === dateStr);
  return holiday ? holiday.name : null;
}
```

**Weekly view**: Holiday weekday columns get light blue background `#E0F2FE`, tooltip with holiday name on header.
**Monthly view**: Holiday day cells get `#E0F2FE`. Weekend cells stay `#F5F5F3`.

```css
.day-cell.holiday { background: #E0F2FE; }
.grid-header-cell.holiday { background: #E0F2FE; }
.monthly-cell.holiday { background: #E0F2FE; }
.monthly-cell.weekend { background: #F5F5F3; }
```

---

## 7. SOLL COLUMN — Dynamic calculation for both views

### Core rule
**Soll = dailyHours × (workDays − absenceDays)**
Where:
- dailyHours = weeklyHours / 5
- workDays = weekdays (Mon-Fri) that are NOT holidays
- absenceDays = days with ANY absence type, but ONLY on workDays (absences on weekends/holidays never reduce Soll)

### Weekly Soll
```typescript
function calculateWeeklyTargetHours(
  employee: Employee,
  absences: AbsenceEntry[],
  weekStartDate: Date
): number {
  const dailyHours = parseFloat(employee.weeklyHours || "0") / 5;
  const weekEnd = new Date(weekStartDate);
  weekEnd.setDate(weekEnd.getDate() + 4);
  
  const employeeAbsences = absences.filter(a => a.employeeId === employee.employeeId);
  let workDays = 0;
  let absenceDays = 0;
  
  for (let d = new Date(weekStartDate); d <= weekEnd; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    if (isHoliday(d)) continue;
    workDays++;
    
    const isAbsent = employeeAbsences.some(a => {
      const start = new Date(a.dateStart);
      const end = new Date(a.dateEnd);
      return d >= start && d <= end;
    });
    if (isAbsent) absenceDays++;
  }
  
  return (workDays - absenceDays) * dailyHours;
}
```

### Monthly Soll
```typescript
function calculateMonthlyTargetHours(
  employee: Employee,
  absences: AbsenceEntry[],
  monthStart: Date
): number {
  const dailyHours = parseFloat(employee.weeklyHours || "0") / 5;
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
  
  const employeeAbsences = absences.filter(a => a.employeeId === employee.employeeId);
  let workDays = 0;
  let absenceDays = 0;
  
  for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    if (isHoliday(d)) continue;
    workDays++;
    
    const isAbsent = employeeAbsences.some(a => {
      const start = new Date(a.dateStart);
      const end = new Date(a.dateEnd);
      return d >= start && d <= end;
    });
    if (isAbsent) absenceDays++;
  }
  
  return (workDays - absenceDays) * dailyHours;
}
```

---

## 8. MONTHLY VIEW — Ist column must calculate from entries

Current problem: Ist shows "–" or "0h" even when entries exist in that month.

Fix: Calculate from scheduleDataSet:
```typescript
function calculateMonthlyActualHours(
  employeeId: string,
  scheduleEntries: ScheduleEntry[],
  monthStart: Date
): number {
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
  
  return scheduleEntries
    .filter(entry => {
      if (entry.employeeId !== employeeId) return false;
      const entryDate = new Date(entry.dateFrom);
      return entryDate >= monthStart && entryDate <= monthEnd;
    })
    .reduce((sum, entry) => sum + parseFloat(entry.duration || "0"), 0);
}
```

Diff = Ist - Soll. Red if negative, green if positive.

---

## 9. SCROLLING — Both views must be fully scrollable

### Problem
The PCF component doesn't fit within the Canvas App container. Employees are cut off vertically, monthly columns are cut off horizontally.

### Fix
The component must fill 100% of the allocated Canvas App space. Read dimensions from `context.mode.allocatedHeight` and `context.mode.allocatedWidth` in index.ts:

```typescript
const allocatedWidth = context.mode.allocatedWidth;
const allocatedHeight = context.mode.allocatedHeight;
```

Root container:
```tsx
<div 
  className="schedule-planner-root" 
  style={{ width: props.width, height: props.height, overflow: 'auto' }}
>
  {viewMode === "week" ? <WeeklyView ... /> : <MonthlyView ... />}
</div>
```

**Weekly view**: Vertical scroll for employees. Header row (Mo, Di, Mi...) sticky at the top:
```css
.schedule-container {
  max-height: 100%;
  overflow-y: auto;
}

.grid-header-cell {
  position: sticky;
  top: 0;
  z-index: 3;
  background: white;
}
```

**Monthly view**: Horizontal scroll for day columns. Employee + Soll + Ist + Diff columns sticky on the left:
```css
.monthly-container {
  overflow-x: auto;
  overflow-y: auto;
  max-height: 100%;
  max-width: 100%;
}

.monthly-grid .employee-cell,
.monthly-grid .soll-cell,
.monthly-grid .ist-cell,
.monthly-grid .diff-cell {
  position: sticky;
  left: 0;
  z-index: 2;
  background: white;
}
```

---

## Summary checklist

**Grid & Layout:**
- [ ] Fixed column widths — never changes based on content
- [ ] Component fills allocated Canvas App space (100% width + height)
- [ ] Weekly view: vertical scroll, sticky header
- [ ] Monthly view: horizontal scroll, sticky left columns

**Copy/Paste:**
- [ ] Copy button in top-right corner of the CELL (not card), only on hover
- [ ] Hover highlights entire cell, not individual cards
- [ ] Paste icon only on hover over empty cells during copy mode (not always visible)

**Absences:**
- [ ] Absences span their full date range (show in every day cell between dateStart and dateEnd)
- [ ] Cells with only absences fire click_empty (not click_filled)
- [ ] Absence tag text is semi-bold 13px, same size as cost center names
- [ ] German labels: U=Urlaub, K=Krank, UF=Unentschuldigt, KK=Kind krank, SU=Sonderurlaub, SO=Sonstiges

**Holidays:**
- [ ] Sachsen holidays hardcoded 2025-2027 (11 per year incl. Buß- und Bettag)
- [ ] Holiday cells highlighted light blue #E0F2FE in both views
- [ ] Holiday name as tooltip on column header (weekly) or cell (monthly)

**Soll Calculation (both views):**
- [ ] Soll = dailyHours × (workDays − absenceDays)
- [ ] workDays exclude weekends AND holidays
- [ ] absenceDays only count on workDays (absences on weekends/holidays ignored)
- [ ] Updates dynamically when navigating between weeks/months

**Ist Calculation:**
- [ ] Weekly: calculated from schedule entries in the displayed week
- [ ] Monthly: calculated from schedule entries in the displayed month
- [ ] Updates dynamically when navigating

Please apply ALL fixes. Refer to @pcf-schedule-grid-reference.html for the target design.