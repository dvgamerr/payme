## PayMe: ความรู้พื้นฐานที่ต้องเข้าใจก่อนเริ่มทำงาน (สรุปเฉพาะใจความ)

### 1) ภาพรวมสถาปัตยกรรม

- Full-stack: **Bun.js + Astro (API Routes/SSR) + Svelte (UI interactive)**
- Routing หลักด้วย **Astro**, ส่วน UI เป็น **Svelte components**
- DB: **SQLite (`payme.db`)** ใช้ **better-sqlite3 (sync)**

### 2) กฎเหล็กด้านภาษา/สไตล์โค้ด

- ใช้ **Vanilla JavaScript เท่านั้น** (ไม่ใช้ TypeScript, ไม่ใช้ JSDoc)
- Format ต้องผ่าน **Prettier เท่านั้น** (single source of truth)
  - `semi: false`, `singleQuote: true`

- ฟังก์ชันใช้ **`const` + arrow function** เป็นหลัก (หลีกเลี่ยง `function` declarations)
- ก่อน commit ต้อง format (Husky + lint-staged ทำ format-on-commit)

### 3) UI: หลักการทำงานและข้อห้าม

- **ห้ามสร้าง UI component ซ้ำ** ก่อนทำอะไรให้เช็ค **`src/components/ui/`** ก่อนเสมอ
- ห้ามสร้าง `<input>`, `<button>`, modal/dialog เอง → ใช้ `Input.svelte`, `Button.svelte`, `Modal.svelte`
- ใช้ Tailwind + theme tokens เช่น `text-foreground`, `bg-background` (ต้องรองรับ Dark/Light)

### 4) API: แพทเทิร์นมาตรฐาน (ห้ามทำให้เป็นหนี้เทคนิค)

- ทุก endpoint ต้องใช้:
  - `export const METHOD = async () => { ... }`
  - wrap ด้วย `handleApiRequest()`
  - protected ใช้ `requireAuth()`
  - validation ใช้ `validateRequired()`, parse int ใช้ `parseIntParam()`
  - response ใช้ `jsonSuccess()` หรือ **throw Error** (ห้ามสร้าง `new Response(JSON.stringify(...))` เอง)

- ห้ามเขียน try-catch ซ้ำๆ / validation ซ้ำๆ / ownership verification ซ้ำๆ

### 5) Auth/Session

- มีหน้า Login/Register
- ใช้ **Cookie-based session** + middleware สำหรับ protected routes
- state ผู้ใช้จัดการด้วย Svelte store

### 6) Data & Features หลักที่ระบบต้องรองรับ

- REST CRUD ครบสำหรับ: **Income, Fixed Expenses, Budgets, Spending Items**
- Month management: สร้างเดือนใหม่ / ปิดงบเดือน
- Dashboard/Stats + กราฟ (เลือกใช้ **LayerCake** เพราะเป็น Svelte-native)
- Import/Export JSON, Analytics (รวม variance), Savings

### 7) Migration (DB)

- แก้ **schema ก่อนเสมอ** → generate ด้วย **drizzle-kit** → review SQL → execute แบบ controlled → commit ทั้ง schema + migration

### 8) ไฟล์/โฟลเดอร์ที่ต้องรู้จัก (สำคัญสุด)

- `src/components/ui/` (reuse components ก่อนสร้างใหม่)
- `src/lib/api-utils.js` (jsonSuccess/jsonError/validate/handleApiRequest/ฯลฯ)
- `src/lib/db-helpers.js` (ownership + helper DB)
- `src/lib/middleware.js` (requireAuth/withAuth)

### 9) หลักปฏิบัติระหว่างทำงาน

- ทำตาม checklist ทุกครั้ง (ลดหลุด/ลืมมาตรฐาน)
- โค้ดใหม่ต้อง “เข้ากรอบเดิม” ก่อน: reuse, DRY, utilities-first, consistent patterns
