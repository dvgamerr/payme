# PayMe - Full-Stack Budget Tracker

## 📋 ภาพรวม (Overview)

เอกสารนี้รวบรวมรายละเอียดโครงสร้างและความสามารถของ **PayMe** ระบบบันทึกรายรับรายจ่ายที่พัฒนาด้วย **Bun.js + Astro.js + Svelte** (Vanilla JavaScript) ซึ่งเน้นประสิทธิภาพการทำงานและความง่ายในการดูแลรักษา

### รายการเทคโนโลยี (Technology Stack)

| ส่วนประกอบ (Component) | เทคโนโลยีที่ใช้ (Technology)  |
| ---------------------- | ----------------------------- |
| **Backend Framework**  | **Bun.js + Astro API Routes** |
| **Frontend Framework** | **Astro.js 4 + Svelte 4**     |
| **Language**           | **Vanilla JavaScript**        |
| **Database Driver**    | **better-sqlite3 (sync)**     |
| **State Management**   | **Svelte Stores**             |
| **Build Tool**         | **Bun + Astro**               |

---

## สิ่งสำคัญที่ห้ามลืมในการทำงาน

- ทบทวนคำสั่งเสมอ เพื่อเช็คว่าลืมทำอะไรไป หรือไม่

## ฟีเจอร์หลัก (Key Features)

### 1. โครงสร้างพื้นฐาน (Infrastructure)

- ใช้ `package.json` จัดการ dependencies (Astro, Svelte, Tailwind CSS v4)
- ควบคุมคุณภาพโค้ดด้วย **Prettier และ Commitlint**
  - Prettier: บังคับ `semi: false` และ `singleQuote: true` (รวมถึงจัด format ให้ Svelte/Astro)
  - Husky + lint-staged: **รัน Prettier กับไฟล์ที่ stage ก่อน commit** (format-on-commit)
- ฐานข้อมูล SQLite (`payme.db`) พร้อมระบบ Migration
- รองรับการเปลี่ยน Theme (Dark/Light Mode)

### 2. ระบบยืนยันตัวตน (Authentication)

- หน้า Login และ Register
- ระบบ Session แบบ Cookie-based ที่ปลอดภัย
- Middleware ตรวจสอบสิทธิ์การเข้าถึง (Protected Routes)
- การจัดการ State ผู้ใช้ด้วย Svelte Store

### 3. ส่วนประกอบ UI (UI Components)

**หลักการสำคัญ: ใช้ Component ที่มีอยู่แล้วก่อนเสมอ**

ก่อนสร้าง UI component ใหม่ ต้อง**ตรวจสอบ `src/components/ui/` ก่อน** เพื่อใช้ component ที่มีอยู่แล้ว ช่วยให้:

- UI สอดคล้องกันทั้งระบบ (Consistency)
- ลดโค้ดซ้ำซ้อน (DRY Principle)
- ง่ายต่อการดูแลรักษา (Maintainability)
- มี Theme support (Dark/Light Mode) ในตัว

#### Basic UI Components (`src/components/ui/`)

- `Summary.svelte`: การ์ดแสดงสรุปยอดเงิน 4 ด้าน
- `MonthNav.svelte`: แถบนำทางเลือกเดือน
- `IncomeSection.svelte`: จัดการรายการรายรับ
- `FixedExpenses.svelte`: จัดการรายจ่ายคงที่
- `BudgetSection.svelte`: จัดการงบประมาณรายหมวดหมู่
- `ItemsSection.svelte`: ตารางบันทึกรายจ่าย พร้อมแก้ไขแบบ Inline
- `CategoryModal.svelte`: Modal จัดการ categories (CRUD)
- `Stats.svelte`: หน้าต่างแสดงกราฟสถิติและแนวโน้ม

#### UI Development Guidelines

**DO ✅:**

- ใช้ Basic UI Components จาก `src/components/ui/` เสมอ
- ตรวจสอบ props ที่มีก่อนใช้งาน
- ใช้ `bind:value` สำหรับ two-way binding
- ใช้ `on:event` สำหรับ event handling
- ส่ง `$$restProps` ต่อเมื่อต้องการ flexibility

**DON'T ❌:**

- สร้าง `<input>` หรือ `<button>` ใหม่เอง (ใช้ `Input.svelte` และ `Button.svelte` แทน)
- สร้าง modal/dialog ใหม่ (ใช้ `Modal.svelte`)
- เขียน inline styles ซ้ำๆ (ใช้ Tailwind classes หรือสร้าง component ใหม่)
- ลืมเช็ค theme support (ใช้ Tailwind color tokens: `text-foreground`, `bg-background`, etc.)

### 4. ระบบจัดการข้อมูล (Data Management)

- **API Endpoints**: REST API ครบทุกฟังก์ชัน (CRUD)
  - Income, Fixed Expenses, Budgets, Spending Items
  - Month Management (การสร้างเดือนใหม่, การปิดงบเดือน)
  - Dashboard Statistics
- **Data Stores**: ระบบ State Management ภายใน Frontend

### 5. ฟีเจอร์เพิ่มเติม (Additional Features)

- **Import/Export**: รองรับการนำเข้าและส่งออกข้อมูลรูปแบบ JSON
- **Analytics**: รายงานวิเคราะห์การใช้จ่ายและ Variance Analysis
- **Savings**: การจัดการเงินออมและเงินเกษียณ

---

## 💡 การตัดสินใจทางเทคนิค (Design Decisions)

1. **ใช้ Vanilla JavaScript**: ไม่ใช้ TypeScript และไม่ใช้ JSDoc เพื่อลดความซับซ้อนของ Build Process (อัปเดต: 17 ม.ค. 2026)
2. **ใช้ LayerCake**: เลือกใช้ Library นี้สำหรับกราฟและการแสดงผลข้อมูล เนื่องจากเป็น Svelte-native
3. **Hybrid Routing**: ใช้ Astro สำหรับ Routing หลัก และใช้ Svelte สำหรับ Interactive Components ภายในหน้า
4. **SSR Mode**: ใช้ Astro ในโหมด Server Action เพื่อจัดการ Authentication และ Security ได้ดียิ่งขึ้น
5. **No Semicolons**: ใช้ code style แบบไม่มี semicolons โดยให้ **Prettier เป็นแหล่งจริงเพียงหนึ่งเดียว (single source of truth)** (อัปเดต: 17 ม.ค. 2026)

---

## 📝 Code Style Guidelines (อัปเดต: 17 ม.ค. 2026)

### ภาษาและรูปแบบโค้ด

- **ภาษา**: Vanilla JavaScript (ไม่ใช้ TypeScript)
- **Documentation**: ไม่ใช้ JSDoc comments
- **Formatting**: ใช้ **Prettier เท่านั้น** (ห้ามจัด format แบบ manual แล้วปล่อยให้ไม่ผ่าน Prettier)
- **Semicolons**: ห้ามใช้ (`semi: false`)
- **Quotes**: Single quotes เท่านั้น (`singleQuote: true`)
- **Functions**: ใช้ **arrow function + const** เป็นหลัก
  - ปกติ: `const handleAdd = () => {}`
  - async: `const handleAdd = async () => {}`
  - หลีกเลี่ยง: `function handleAdd() {}` (ยกเว้นจำเป็นเรื่อง hoist)

### Scripts ที่ใช้งาน

```bash
bun run format:check  # ตรวจสอบว่า format ถูกต้อง
bun run format        # จัดรูปแบบด้วย Prettier (write)
```

Prettier Configuration (ตัวอย่าง)

```json
{
  "semi": false,
  "singleQuote": true
}
```

---

### การทำ Migration

1. **แก้ schema ก่อนเสมอ** - อย่าเขียน SQL migration เอง
2. **Generate ด้วย drizzle-kit** - ให้เครื่องมือสร้าง SQL ให้
3. **Review SQL ที่ได้** - ตรวจสอบไฟล์ที่ generate ออกมา
4. **Execute แบบ controlled** - ใช้ script พิเศษเพื่อความปลอดภัย
5. **Version control** - commit ทั้ง schema และ migration files

---

## 🏗️ API Development Guidelines (อัปเดต: 18 ม.ค. 2026)

### หลักการพื้นฐาน

**ห้าม Technical Debt** - ต้องป้องกันปัญหาเหล่านี้ตั้งแต่เริ่มเขียนโค้ด:

1. ❌ **ห้าม** เขียน try-catch ซ้ำๆ ในทุก endpoint
2. ❌ **ห้าม** เขียน `new Response(JSON.stringify(...))` ซ้ำๆ
3. ❌ **ห้าม** เขียน validation logic ซ้ำๆ
4. ❌ **ห้าม** เขียน ownership verification ซ้ำๆ
5. ❌ **ห้าม** ใช้ `function` declarations (ใช้ arrow functions แทน)

### โครงสร้าง API Endpoint มาตรฐาน

- ใช้ `export const METHOD = async () => {}` แทน `export async function METHOD()`
- Wrap logic ทั้งหมดด้วย `handleApiRequest()` เพื่อจัดการ error แบบรวม
- ใช้ `requireAuth()` สำหรับ protected endpoints
- ใช้ `validateRequired()` และ `parseIntParam()` สำหรับ validation
- Return ด้วย `jsonSuccess()` หรือ throw Error (ไม่ต้องสร้าง Response เอง)

### Utility Functions ที่ต้องใช้

**Response Utilities** (`src/lib/api-utils.js`):

- `jsonSuccess(data, status)` - สร้าง success response
- `jsonError(message, status)` - สร้าง error response
- `validateRequired(body, fields)` - validate required fields (auto throw)
- `parseIntParam(param, name)` - parse integer parameter (auto throw)
- `handleApiRequest(handler)` - centralized error handling
- `setSessionCookie(cookies, sessionId, expiresAt)` - ตั้งค่า session cookie

**Database Helpers** (`src/lib/db-helpers.js`):

- `getMonthByIdForUser(monthId, userId)` - ดึง month พร้อม check ownership
- `getCategoryByIdForUser(categoryId, userId)` - ดึง category พร้อม check ownership
- `verifyResourceOwnership(table, id, userId, name)` - ตรวจสอบ ownership ทั่วไป
- `getNextDisplayOrder(table, userId)` - คำนวณ display order ถัดไป

**Authentication Middleware** (`src/lib/middleware.js`):

- `requireAuth(cookies)` - ตรวจสอบ authentication (throw 'Unauthorized' ถ้าไม่ผ่าน)
- `withAuth(handler)` - optional wrapper สำหรับ authenticated handlers

### Error Handling Standards

**Error จะถูกแปลงเป็น HTTP Status อัตโนมัติ** โดย `handleApiRequest`:

| Error Message Pattern          | HTTP Status |
| ------------------------------ | ----------- |
| `'Unauthorized'`               | 401         |
| `'...not found'`               | 404         |
| `'...already exists'`          | 409         |
| `'Missing required fields...'` | 400         |
| อื่นๆ                          | 500         |

**วิธีการ throw error:**

- ใช้ `throw new Error('message')` สำหรับ error ทั่วไป
- ใช้ `validateRequired()` สำหรับ validation (จะ throw อัตโนมัติ)
- **ห้าม** return `new Response(JSON.stringify({error}), {status})` เอง

### Code Organization Principles

**1. แยก Helper Functions** - เมื่อมี verification logic ซับซ้อน ให้สร้าง helper function แยกออกมา

**2. DRY Principle** - ใช้ utilities แทนการเขียนโค้ดซ้ำๆ เช่น:

- แทนที่จะเขียน try-catch → ใช้ `handleApiRequest`
- แทนที่จะ validate ด้วย if-else → ใช้ `validateRequired`
- แทนที่จะ parse params เอง → ใช้ `parseIntParam`

**3. Consistent Naming** - ใช้ snake_case สำหรับ API request/response และ camelCase สำหรับ database operations (Drizzle ORM)

### Checklist สำหรับ API Endpoint ใหม่

เมื่อสร้าง endpoint ใหม่ ต้องตรวจสอบ:

- ใช้ `export const` แทน `export async function`
- ใช้ arrow function `= async () =>`
- ใช้ `handleApiRequest` wrap ทุก handler
- ใช้ `requireAuth` สำหรับ protected endpoints
- ใช้ `validateRequired` สำหรับ validation
- ใช้ `parseIntParam` สำหรับ integer parameters
- ใช้ `jsonSuccess` หรือ `jsonError` สำหรับ response
- ใช้ helper functions จาก `db-helpers.js` สำหรับ ownership verification
- **ห้าม** เขียน try-catch เอง
- **ห้าม** เขียน `new Response(JSON.stringify(...))` เอง
- ผ่าน `bun run format` และ `bun run lint`

### Quick Reference

**ไฟล์ที่ต้องรู้จัก:**

- `src/lib/api-utils.js` - Response และ validation utilities
- `src/lib/db-helpers.js` - Database helpers
- `src/lib/middleware.js` - Authentication middleware

**แพทเทิร์นที่ต้องจำ:**

1. **ทุก endpoint** ใช้ `handleApiRequest`
2. **Protected endpoints** ใช้ `requireAuth`
3. **Validation** ใช้ `validateRequired`
4. **Success response** ใช้ `jsonSuccess`
5. **Error response** ใช้ `throw new Error(...)` (ไม่ต้อง return)

---

## 🎯 Best Practices Summary

### DO ✅

- ใช้ utility functions จาก `api-utils.js` และ `db-helpers.js`
- ใช้ arrow functions กับ const
- ใช้ `handleApiRequest` เป็น error handler รวม
- Validate inputs ด้วย `validateRequired`
- Parse parameters ด้วย `parseIntParam`
- แยก helper functions ออกมาเมื่อ logic ซับซ้อน
- ตั้งชื่อตัวแปรแบบชัดเจน descriptive
- ใช้ Prettier format โค้ดเสมอ

### DON'T ❌

- เขียน try-catch ในทุก endpoint
- เขียน `new Response(JSON.stringify(...))` ซ้ำๆ
- เขียน validation logic ซ้ำๆ
- ใช้ `function` declarations (ยกเว้นจำเป็น)
- Return Response โดยตรงใน error cases (ใช้ throw Error แทน)
- เขียน ownership verification ซ้ำๆ
- ลืมรัน `bun run format` ก่อน commit

---
