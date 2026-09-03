# PRD + MASTER BUILD PROMPT

# HAIDAR PLASTIK — ADMIN MANAGEMENT PWA

**Version 2.0 — Revised**

---

# 1. ROLE & INSTRUCTION

You are an expert:

* Product Designer
* UX/UI Designer
* System Architect
* Database Designer
* Full-Stack PWA Developer
* Supabase/PostgreSQL Developer
* Security Engineer
* Responsive Web Developer

Build a production-ready **Haidar Plastik Management PWA**, starting with the **ADMIN MODULE**.

The system must be designed from the beginning so the future **User Module** can be integrated without requiring a major rewrite.

The application is an internal inventory and product-management system for a plastic shop called:

> **Haidar Plastik**

The application must work beautifully on:

* Mobile phones
* Tablets
* Desktop
* Web browsers
* Installed PWA

The design must be:

> **Mobile-first, PWA-native, operational, fast, clean, and reliable.**

Do not build a generic CRUD dashboard.

The application will eventually have two roles:

```text
ADMIN
USER
```

This document defines the complete Admin architecture.

---

# 2. CORE PRODUCT PHILOSOPHY

The system must preserve four major concepts:

```text
BARANG
= untuk melihat

DATA
= untuk mengelola

RIWAYAT
= untuk melacak

EXPORT
= untuk mengeluarkan data
```

Additionally:

```text
EDIT
= mengubah informasi barang

UPDATE
= perubahan harga resmi

CHECK
= pemeriksaan stok berdasarkan jadwal

STOCK CHECK
= laporan observasi User

SYSTEM STOCK
= stok resmi yang dikendalikan sistem/Admin
```

These concepts must never be mixed.

---

# 3. ADMIN OBJECTIVE

Admin is the authoritative operator of the system.

Admin must be able to:

* View dashboard
* View products
* Search products
* Filter products
* View product details
* View purchase/modal price
* View selling price
* Add products
* Edit products
* Update official prices
* Deactivate products
* Manage categories
* Manage units
* Set inspection schedules
* View inspection schedules
* View User stock checks
* Review stock-check edit requests
* View price history
* View Admin activity history
* Export data
* Maintain data integrity

---

# 4. ADMIN INFORMATION ARCHITECTURE

Primary Admin navigation:

```text
HAIDAR PLASTIK
│
├── Dashboard
├── Barang
├── Data
├── Riwayat
└── Export
```

Profile can exist as a secondary account area.

Desktop:

```text
┌──────────────────────┬──────────────────────────────┐
│ HAIDAR PLASTIK       │                              │
│                      │        MAIN CONTENT          │
│ Dashboard            │                              │
│ Barang               │                              │
│ Data                 │                              │
│ Riwayat              │                              │
│ Export               │                              │
│                      │                              │
│ Profile              │                              │
└──────────────────────┴──────────────────────────────┘
```

Mobile should use a compact PWA-friendly navigation system.

Do not overcrowd bottom navigation.

---

# 5. AUTHENTICATION

Admin must authenticate before accessing Admin pages.

Flow:

```text
LOGIN
 ↓
AUTHENTICATION
 ↓
LOAD USER PROFILE
 ↓
CHECK ROLE
 ↓
ROLE = ADMIN?
 ├── YES → ADMIN APPLICATION
 └── NO → DENY ADMIN ACCESS
```

Admin routes must be protected.

Do not rely only on frontend route protection.

Authorization must also exist at the database/backend layer.

---

# 6. ROLE MODEL

The system supports:

```text
ADMIN
USER
```

Admin:

```text
Dashboard
Barang
Data
Riwayat
Export
Profile
```

User:

```text
Dashboard
Barang
Check
Profile
```

The Admin module must not expose Admin-only data to User.

Especially:

```text
Harga Modal
Activity Log
Admin Activity
Full Price History
Administrative Data
```

---

# 7. PAGE 1 — DASHBOARD

Dashboard is the operational overview.

It should provide a quick understanding of:

* Total barang
* Total kategori
* Stok menipis
* Barang habis
* Perubahan harga
* Pemeriksaan stok
* Request edit pemeriksaan
* Recent Admin activity
* Important alerts

Do not turn Dashboard into an analytics-heavy BI system.

The purpose is:

> **Know what needs attention.**

---

# 8. DASHBOARD — OPERATIONAL INFORMATION

Potential structure:

```text
DASHBOARD

Total Barang
1.284

Kategori
18

Stok Menipis
23

Perubahan Harga
7
```

Then:

```text
PERUBAHAN HARGA TERBARU
```

and:

```text
PEMERIKSAAN STOK
```

and:

```text
AKTIVITAS TERBARU
```

and:

```text
REQUEST EDIT
```

The exact visual layout can evolve without changing the underlying business logic.

---

# 9. REAL-TIME DATE & TIME

The application must have a reliable concept of:

```text
Current Date
Current Time
Current Day
```

The system must not blindly depend on the device clock.

Use a consistent application timezone:

```text
Asia/Jakarta
```

unless the shop timezone is explicitly changed in future configuration.

The system must understand:

```text
Monday
Tuesday
Wednesday
Thursday
Friday
Saturday
Sunday
```

based on the application timezone.

---

# 10. REAL-TIME CLOCK

The PWA should be capable of displaying the current time where operational context requires it.

Example:

```text
Sabtu, 05 September 2026
13:42
```

The displayed time should update without requiring the page to be manually refreshed.

For example:

```text
13:41
↓
13:42
↓
13:43
```

The clock is primarily a UI representation.

Database timestamps must use reliable server/database timestamps.

---

# 11. CURRENT DAY LOGIC

The system must derive:

```text
CURRENT DATETIME
        ↓
CURRENT DATE
        ↓
CURRENT DAY OF WEEK
```

Example:

```text
2026-09-05 13:42
        ↓
05 September 2026
        ↓
Saturday
```

This current day is used to determine scheduled User inspections.

---

# 12. IMPORTANT DATE RULE

The inspection schedule is based on the **calendar day**, not a rolling 24-hour period.

For example:

```text
Friday
```

and:

```text
Saturday
```

are separate inspection days.

A Friday inspection must never automatically count as Saturday's inspection.

---

# 13. PAGE 2 — BARANG

The Barang page is **VIEW ONLY**.

This rule applies even to Admin.

Admin can:

* Search
* Filter
* View list
* Open detail
* Inspect information

Admin cannot perform CRUD from Barang.

Do NOT put:

```text
+ Tambah
Edit
Update
Delete
```

on the Barang page.

All management actions happen through:

> **Data**

---

# 14. BARANG — PRODUCT LIST

Product list should support:

```text
Search
Category Filter
Unit Filter
Status Filter
Stock Filter
```

Stock filters:

```text
Semua
Tersedia
Menipis
Habis
```

Search should feel immediate.

---

# 15. BARANG — ADMIN INFORMATION

Admin can see:

```text
Nama Barang
SKU
Kategori
Subkategori
Satuan
Stok
Harga Modal
Harga Jual
Price Version
Status
Foto
Catatan
Jadwal Pemeriksaan
```

Example:

```text
Plastik HD 15×30

Kategori
Plastik

Satuan
PCS

Stok
120 PCS

Harga Modal
Rp12.000

Harga Jual
Rp14.000

Price Version
v4

Jadwal
Senin · Rabu · Sabtu
```

---

# 16. PRODUCT DETAIL

Product detail remains view-only.

Example:

```text
Plastik HD 15×30
PLASTIK · PCS

────────────────────

STOK
120 PCS

HARGA MODAL
Rp12.000

HARGA JUAL
Rp14.000

PRICE VERSION
v4

JADWAL PEMERIKSAAN
Senin
Rabu
Sabtu

────────────────────

SKU
HP-PLS-0001

Minimum Stock
20 PCS

Catatan
...
```

No modification action should exist here.

---

# 17. PAGE 3 — DATA

Data is the Admin control center.

All CRUD and master-data operations happen here.

Primary actions:

```text
+ Tambah Barang
Edit
Update Harga
Deactivate
```

Additional management:

```text
Kategori
Satuan
Jadwal Pemeriksaan
```

---

# 18. DATA PAGE STRUCTURE

Recommended:

```text
DATA

[ + Tambah Barang ]

[ Search Barang ]

────────────────────────

Products

Barang A
Barang B
Barang C
```

Each management item can provide:

```text
Edit
Update Harga
Deactivate
```

Unlike Barang, these actions are allowed here.

---

# 19. ADD PRODUCT

Admin can create a new product.

Required:

```text
Nama Barang
Kategori
Satuan
Harga Modal
Harga Jual
Stok Awal
```

Optional:

```text
SKU
Subkategori
Minimum Stock
Foto
Catatan
```

New requirement:

```text
Jadwal Pemeriksaan
```

Admin must be able to select one or more days.

---

# 20. ADD PRODUCT — INSPECTION SCHEDULE

When creating a product, show:

```text
Jadwal Pemeriksaan

☐ Senin
☐ Selasa
☐ Rabu
☐ Kamis
☐ Jumat
☐ Sabtu
☐ Minggu
```

Admin can select:

* One day
* Multiple days
* All days

Example:

```text
☑ Senin
☐ Selasa
☑ Rabu
☐ Kamis
☐ Jumat
☑ Sabtu
☐ Minggu
```

Result:

```text
Senin
Rabu
Sabtu
```

---

# 21. ADD PRODUCT FLOW

```text
Tambah Barang
 ↓
Input Product Data
 ↓
Select Inspection Days
 ↓
Validate
 ↓
Create Product
 ↓
Create Initial Price Version
 ↓
Create Inspection Schedule
 ↓
Create Activity Log
 ↓
Success
```

Initial price:

```text
v1
```

---

# 22. INITIAL PRICE VERSION

Every newly created product starts with:

```text
current_price_version = 1
```

The initial prices become the official starting price state.

The system should record the creation event in Activity Log.

---

# 23. EDIT PRODUCT

Edit is for normal product/master-data modifications.

Examples:

```text
Nama
Kategori
Subkategori
Satuan
SKU
Minimum Stock
Foto
Catatan
Jadwal Pemeriksaan
```

Edit does NOT mean price update.

---

# 24. EDIT — PRICE VERSION RULE

If Admin changes:

```text
Kategori
```

or:

```text
Satuan
```

or:

```text
Jadwal Pemeriksaan
```

price version remains unchanged.

Example:

```text
Before:
v4

Edit:
PCS → PACK

After:
v4
```

---

# 25. EDIT INSPECTION SCHEDULE

Admin must be able to change the inspection schedule through Edit.

Example:

Before:

```text
Senin
Rabu
Sabtu
```

Admin changes to:

```text
Senin
Selasa
Kamis
Sabtu
```

The new schedule becomes authoritative for future daily checks.

Historical Stock Check records must not be rewritten.

---

# 26. SCHEDULE CHANGE RULE

Changing the schedule does not modify historical inspections.

Example:

```text
Product A

Old schedule:
Monday + Wednesday

Historical:
Monday check
Wednesday check
```

If Admin changes schedule to:

```text
Tuesday + Saturday
```

old records remain:

```text
Monday check
Wednesday check
```

Only future scheduling uses the new configuration.

---

# 27. UPDATE PRICE

Update Price is completely separate from Edit.

It represents:

> **Official price change.**

Admin can update:

```text
Harga Modal
Harga Jual
```

The system must show:

```text
Harga Lama
Harga Baru
Version Lama
Version Baru
Alasan
```

before confirmation.

---

# 28. PRICE UPDATE FLOW

```text
UPDATE HARGA
 ↓
Read Current Price
 ↓
Enter New Price
 ↓
Enter Reason
 ↓
Compare Old vs New
 ↓
Show Confirmation
 ↓
Admin Confirms
 ↓
Update Product Price
 ↓
Version +1
 ↓
Create Price History
 ↓
Create Activity Log
 ↓
Generate Price Change Event
```

---

# 29. PRICE VERSION

Price version belongs to the product's official price state.

Use:

```text
current_price_version
```

or:

```text
price_version
```

Example:

```text
v1
↓
v2
↓
v3
↓
v4
```

Rules:

```text
Normal Edit:
v4 → v4

Official Price Update:
v4 → v5
```

---

# 30. PRICE UPDATE CONFIRMATION

Before confirmation:

```text
UPDATE HARGA

Plastik HD 15×30

Harga Modal
Rp12.000 → Rp13.000

Harga Jual
Rp13.000 → Rp14.000

Version
v3 → v4

Alasan
Harga supplier naik

[ Batal ] [ Update Harga ]
```

The consequential nature of the operation must be clear.

---

# 31. PRICE CHANGE LOGIC

For each price:

```text
new > old
→ PRICE INCREASE

new < old
→ PRICE DECREASE

new = old
→ NO CHANGE
```

Do not store colors in the database.

Frontend derives the visual state.

---

# 32. PRICE VISUAL SYSTEM

Price increase:

```text
Old
Rp13.000
```

neutral gray.

New:

```text
Rp14.000
```

red.

Price decrease:

```text
Old
Rp14.000
```

neutral gray.

New:

```text
Rp13.000
```

green.

Red and green must be reserved for meaningful price-change states.

---

# 33. PRICE HISTORY

Every official price update creates a permanent historical record.

Structure:

```text
price_history
────────────────────────
id
product_id
version

old_purchase_price
new_purchase_price

old_selling_price
new_selling_price

reason
updated_by
created_at
```

Historical records must never be overwritten.

---

# 34. PRICE CHANGE EVENT

Every official price update should produce enough information for the future User module.

Example:

```text
Product:
Plastik HD 15×30

Version:
v4

Old Selling Price:
Rp13.000

New Selling Price:
Rp14.000

Change:
INCREASE

Date:
03 September 2026

Time:
14:10
```

The future User Dashboard can consume this event.

---

# 35. FUTURE USER PRICE ALERT

The future User Dashboard should be able to display:

```text
Perubahan Harga

🔴 Plastik HD 15×30
🟢 Cup 16oz
```

Dashboard only shows product names.

Detailed price information is shown in Product Detail.

Admin architecture must preserve all required data.

---

# 36. USER PRICE SEEN STATE

Architecture should support:

```text
user_price_views
────────────────────────
user_id
product_id
last_seen_version
updated_at
```

Example:

```text
Current:
v4

User last seen:
v3
```

Therefore:

```text
v4 > v3
```

User has an unseen price version.

This is optional for the initial Admin UI but must not be prevented by the architecture.

---

# 37. DELETE / DEACTIVATE PRODUCT

Prefer soft delete.

Use:

```text
is_active = false
```

instead of permanent deletion.

Reason:

Historical references may exist.

Preserve:

* Price history
* Stock checks
* Activity logs
* Future transactions
* Inspection history

---

# 38. DEACTIVATION FLOW

```text
Deactivate
 ↓
Confirmation
 ↓
Check Historical References
 ↓
Set is_active = false
 ↓
Create Activity Log
 ↓
Success
```

The confirmation must clearly explain that the product will no longer be active.

---

# 39. CATEGORY MANAGEMENT

Admin can:

```text
Create
Edit
Deactivate
```

Example:

```text
Plastik
Cup
Botol
Kresek
Sedotan
```

Categories are master data.

Do not permanently destroy categories that have historical references.

---

# 40. UNIT MANAGEMENT

Admin can:

```text
Create
Edit
Deactivate
```

Examples:

```text
PCS
PACK
DUS
KG
LUSIN
ROLL
```

Structure:

```text
units
────────────
id
name
symbol
is_active
created_at
updated_at
```

---

# 41. INSPECTION SCHEDULE MANAGEMENT

Inspection schedule is a core Admin feature.

Admin controls:

> **Barang apa yang harus diperiksa pada hari apa.**

Every product may have:

```text
0 or more inspection days
```

Example:

```text
Barang A
Senin
Rabu
Sabtu
```

---

# 42. SCHEDULE DATA MODEL

Do NOT store schedule as:

```text
"Senin,Rabu,Sabtu"
```

Prefer a relational table:

```text
product_inspection_schedules
──────────────────────────────
id
product_id
day_of_week
created_at
updated_at
```

Example:

```text
product_id = A
day_of_week = MONDAY

product_id = A
day_of_week = WEDNESDAY

product_id = A
day_of_week = SATURDAY
```

This allows reliable daily queries.

---

# 43. DAY OF WEEK ENUM

Use a controlled representation.

For example:

```text
MONDAY
TUESDAY
WEDNESDAY
THURSDAY
FRIDAY
SATURDAY
SUNDAY
```

Do not store arbitrary free text.

The frontend can display:

```text
Senin
Selasa
Rabu
Kamis
Jumat
Sabtu
Minggu
```

---

# 44. TODAY'S INSPECTION ALGORITHM

Every time the User opens Check, the system conceptually performs:

```text
CURRENT DATETIME
 ↓
CURRENT DAY
 ↓
QUERY PRODUCT SCHEDULE
 ↓
FIND PRODUCTS WHERE
day_of_week = CURRENT_DAY
 ↓
FILTER ACTIVE PRODUCTS
 ↓
CHECK TODAY'S STOCK CHECK
 ↓
RETURN STATUS
```

Example:

```text
Current day:
SATURDAY
```

System finds:

```text
Product A → SATURDAY
Product F → SATURDAY
Product G → SATURDAY
```

User sees:

```text
A
F
G
```

---

# 45. DAILY CHECK OCCURRENCE

The system determines completion based on:

```text
product_id
+
user_id
+
check_date
```

A check is considered today's check only when:

```text
check_date = today's calendar date
```

in the application timezone.

---

# 46. EXAMPLE DAILY RESET

Friday:

```text
Product A
✓ Checked
```

Saturday:

```text
Product A
○ Not Checked
```

if Saturday is also scheduled.

Friday completion does not satisfy Saturday.

---

# 47. REAL-TIME USER CHECK EXPERIENCE

The User PWA should automatically recognize the current day.

Example:

```text
Saturday, 05 September 2026
```

When Saturday begins, the User Check page automatically uses:

```text
SATURDAY
```

and displays products scheduled for Saturday.

No Admin intervention is needed every day.

---

# 48. DAY CHANGE BEHAVIOR

At midnight according to the configured application timezone:

```text
Friday
23:59
 ↓
Saturday
00:00
```

the logical inspection context changes.

The system should then evaluate:

```text
Saturday schedule
```

rather than:

```text
Friday schedule
```

The previous day's records remain historical.

---

# 49. DATE DISPLAY

Operational screens should clearly show date.

Example:

```text
Pemeriksaan Barang

Sabtu, 05 September 2026
```

Where appropriate, time can also be shown:

```text
Terakhir diperiksa:
05 September 2026 · 13:42
```

---

# 50. SERVER TIMESTAMP

Important database events should use reliable server/database timestamps.

Examples:

```text
created_at
updated_at
reviewed_at
```

Do not trust arbitrary client timestamps for audit history.

The displayed local time should be derived from the configured application timezone.

---

# 51. STOCK CHECK — ADMIN VIEW

Admin can view all User Stock Checks.

Example:

```text
Plastik HD 15×30

User:
Ahmad

Tanggal:
05 September 2026

Waktu:
13:42

Stok Sebelumnya:
120 pak

Stok Sekarang:
180 pcs

Catatan:
masih ada banyak
```

---

# 52. STOCK CHECK IS NOT SYSTEM STOCK

This is a critical rule.

User Stock Check:

```text
OBSERVATION
```

System Stock:

```text
OFFICIAL SYSTEM DATA
```

Never automatically execute:

```text
products.stock = current_stock
```

because:

```text
current_stock
```

is textual observation.

---

# 53. STOCK CHECK DATA TYPE

Use:

```text
previous_stock TEXT
current_stock TEXT
note TEXT
```

Examples:

```text
"120 pak"
"180 pcs"
"masih ada banyak"
"50 dus"
"3 dus + 20 pcs"
"tinggal sedikit"
```

Preserve exact text.

Do not normalize.

Do not calculate.

Do not force numeric conversion.

---

# 54. STOCK CHECK STATUS

Use:

```text
SUBMITTED
EDIT_REQUESTED
EDIT_APPROVED
EDIT_REJECTED
```

Meaning:

### SUBMITTED

Inspection has been submitted and is locked.

### EDIT_REQUESTED

User requested permission to modify the inspection.

### EDIT_APPROVED

Admin approved the edit.

### EDIT_REJECTED

Admin rejected the request.

---

# 55. STOCK CHECK LOCK

After User submits:

```text
SUBMITTED
```

the inspection becomes locked.

User cannot directly modify the fields.

If User needs correction:

```text
Minta Edit
```

---

# 56. EDIT REQUEST

Admin must be able to see requests generated by Users.

Example:

```text
REQUEST EDIT

Plastik HD 15×30

User:
Ahmad

Tanggal Pemeriksaan:
05 Sep 2026

Status:
Menunggu Persetujuan

Alasan:
Salah menulis stok sekarang.
```

Admin can:

```text
[ Setujui ]
[ Tolak ]
```

---

# 57. EDIT REQUEST APPROVAL FLOW

```text
USER
 ↓
STOCK CHECK
 ↓
SUBMITTED
 ↓
MINTA EDIT
 ↓
EDIT_REQUESTED
 ↓
ADMIN REVIEW
 ↓
┌───────────────┐
│               │
▼               ▼
APPROVE        REJECT
│               │
▼               ▼
EDIT_APPROVED   EDIT_REJECTED
│
▼
USER EDIT
│
▼
SUBMIT AGAIN
│
▼
LOCK
```

---

# 58. APPROVED EDIT

When Admin approves:

```text
EDIT_APPROVED
```

User may modify the inspection.

After resubmission:

```text
SUBMITTED
```

again.

The final data should remain auditable.

---

# 59. REJECTED EDIT

When Admin rejects:

```text
EDIT_REJECTED
```

the inspection remains locked.

User cannot modify it unless a new valid request is allowed by the business rules.

---

# 60. EDIT REQUEST TABLE

Recommended:

```text
stock_check_edit_requests
────────────────────────────
id
stock_check_id
requested_by
status
reason
reviewed_by
reviewed_at
created_at
```

This gives a permanent approval trail.

---

# 61. STOCK CHECK HISTORY

Admin's Riwayat must preserve all User inspections.

Recommended fields:

```text
id
product_id
user_id
check_date
previous_stock TEXT
current_stock TEXT
note TEXT
status
created_at
updated_at
```

The date and time of submission must be preserved.

---

# 62. USER + PRODUCT + DATE UNIQUENESS

For daily inspection logic, the system should prevent accidental duplicate active submissions for:

```text
user_id
+
product_id
+
check_date
```

unless the approved-edit workflow explicitly allows a resubmission.

The database should enforce appropriate uniqueness or transactional logic.

---

# 63. ACTIVITY LOG

Activity Log records important Admin actions.

Examples:

```text
Admin created product
Admin edited product
Admin updated price
Admin changed category
Admin changed unit
Admin changed inspection schedule
Admin deactivated product
Admin approved stock-check edit
Admin rejected stock-check edit
```

---

# 64. ACTIVITY LOG STRUCTURE

Recommended:

```text
activity_logs
────────────────────────
id
user_id
action
entity_type
entity_id
old_data
new_data
created_at
```

Use JSON/JSONB for:

```text
old_data
new_data
```

where appropriate.

---

# 65. SCHEDULE ACTIVITY LOG

Changes to inspection schedule must be auditable.

Example:

```text
05 Sep 2026 · 14:20

Admin mengubah jadwal pemeriksaan

Plastik HD 15×30

Sebelum:
Senin · Rabu

Sesudah:
Senin · Rabu · Sabtu
```

This is important because the schedule directly determines User workload.

---

# 66. PRICE HISTORY + ACTIVITY LOG

Price update creates at least:

```text
Price History
+
Activity Log
+
Price Change Event
```

These records represent different purposes.

```text
Price History
= historical price state

Activity Log
= who performed the action

Price Change Event
= information consumed by future User experience
```

---

# 67. PAGE 4 — RIWAYAT

Riwayat is the Admin audit/history center.

Recommended tabs:

```text
Semua
Harga
Pemeriksaan Stok
Aktivitas
```

Potential additional filter:

```text
Request Edit
```

if needed.

---

# 68. RIWAYAT HARGA

Show:

```text
Tanggal
Waktu
Barang
Version
Harga Lama
Harga Baru
Perubahan
Alasan
Admin
```

Filters:

```text
Barang
Tanggal
Admin
Harga Naik
Harga Turun
```

---

# 69. RIWAYAT PEMERIKSAAN STOK

Show:

```text
Tanggal
Waktu
Barang
User
Stok Sebelumnya
Stok Sekarang
Catatan
Status
```

Example:

```text
05 Sep 2026 · 13:42

Plastik HD 15×30
Ahmad

120 pak
→
180 pcs

masih ada banyak

SUBMITTED
```

---

# 70. RIWAYAT REQUEST EDIT

Admin should be able to identify:

```text
Who requested
Which inspection
When requested
Reason
Who reviewed
When reviewed
Decision
```

Example:

```text
05 Sep 2026 · 14:00

Ahmad
request edit

Alasan:
Salah memasukkan stok.

14:05
Admin approved
```

---

# 71. ACTIVITY HISTORY

Show:

```text
Tanggal
Waktu
Admin/User
Action
Entity
Details
```

Example:

```text
05 Sep 2026 · 14:20

Admin

Mengubah jadwal pemeriksaan

Plastik HD 15×30

Senin · Rabu
→
Senin · Rabu · Sabtu
```

---

# 72. FILTERING

Product filters:

```text
Category
Unit
Status
Stock Status
Inspection Day
```

Price history:

```text
Product
Date
Admin
Increase
Decrease
```

Stock checks:

```text
Product
User
Date
Status
```

Activity:

```text
User
Action
Entity
Date
```

---

# 73. PAGE 5 — EXPORT

Export must be a dedicated page.

Do not hide Export inside Riwayat.

Flow:

```text
Export
 ↓
Choose Dataset
 ↓
Choose Columns
 ↓
Choose Filters
 ↓
Choose Format
 ↓
Preview
 ↓
Confirm
 ↓
Generate File
```

---

# 74. EXPORT DATASETS

At minimum:

```text
Data Barang
Data Harga
Data Stok
Jadwal Pemeriksaan
Riwayat Harga
Riwayat Pemeriksaan Stok
Request Edit
Activity Log
```

---

# 75. EXPORT FORMATS

Support:

```text
Excel
PDF
```

---

# 76. EXPORT — PRODUCT DATA

Preset:

```text
Barang Lengkap
```

Columns:

```text
Nama
Kategori
Satuan
Harga Modal
Harga Jual
Stok
```

Optional:

```text
SKU
Subkategori
Minimum Stock
Status
Jadwal Pemeriksaan
Catatan
```

---

# 77. EXPORT — PRICE

Preset:

```text
Harga Modal + Jual
```

Columns:

```text
Nama
Harga Modal
Harga Jual
```

Preset:

```text
Harga Jual
```

Columns:

```text
Nama
Harga Jual
```

---

# 78. EXPORT — STOCK

Preset:

```text
Stok
```

Columns:

```text
Nama
Satuan
Stok
```

---

# 79. EXPORT — INSPECTION SCHEDULE

Preset:

```text
Jadwal Pemeriksaan
```

Columns:

```text
Nama Barang
Hari Pemeriksaan
Status Barang
```

Example:

```text
Plastik HD 15×30
Senin
Rabu
Sabtu
Aktif
```

---

# 80. EXPORT — PRICE HISTORY

Columns:

```text
Tanggal
Waktu
Nama
Version
Harga Lama
Harga Baru
Perubahan
Admin
Alasan
```

---

# 81. EXPORT — STOCK CHECK

Columns:

```text
Tanggal
Waktu
Nama Barang
User
Stok Sebelumnya
Stok Sekarang
Catatan
Status
```

Preserve stock strings exactly.

---

# 82. EXPORT — ACTIVITY LOG

Columns:

```text
Tanggal
Waktu
User
Action
Entity
Old Data
New Data
```

---

# 83. DATABASE ARCHITECTURE

Use:

```text
PostgreSQL
```

through:

```text
Supabase
```

Use:

* Supabase Auth
* PostgreSQL
* Supabase Storage
* Row Level Security
* Supabase APIs
* Edge Functions where appropriate

---

# 84. CORE TABLES

Minimum architecture:

```text
users
categories
units
products
product_inspection_schedules
price_history
stock_checks
stock_check_edit_requests
activity_logs
```

Optional/future:

```text
user_price_views
stock_movements
sales
sale_items
purchases
purchase_items
```

---

# 85. USERS

Recommended:

```text
users
────────────────
id
name
username
email
role
created_at
updated_at
```

Role:

```text
ADMIN
USER
```

---

# 86. CATEGORIES

```text
categories
────────────────
id
name
description
is_active
created_at
updated_at
```

---

# 87. UNITS

```text
units
────────────────
id
name
symbol
is_active
created_at
updated_at
```

---

# 88. PRODUCTS

Recommended:

```text
products
────────────────────────
id
sku
name
category_id
subcategory_id
unit_id

purchase_price
selling_price

current_price_version

stock
minimum_stock

image_url
notes

is_active

created_at
updated_at
```

---

# 89. PRODUCT INSPECTION SCHEDULES

```text
product_inspection_schedules
──────────────────────────────
id
product_id
day_of_week
created_at
updated_at
```

Foreign key:

```text
product_id → products.id
```

---

# 90. PRICE HISTORY TABLE

```text
price_history
────────────────────────
id
product_id
version

old_purchase_price
new_purchase_price

old_selling_price
new_selling_price

reason
updated_by

created_at
```

---

# 91. STOCK CHECKS TABLE

```text
stock_checks
────────────────────────
id
product_id
user_id

check_date

previous_stock TEXT
current_stock TEXT
note TEXT

status

created_at
updated_at
```

---

# 92. STOCK CHECK EDIT REQUESTS

```text
stock_check_edit_requests
────────────────────────────
id
stock_check_id
requested_by

status
reason

reviewed_by
reviewed_at

created_at
```

---

# 93. ACTIVITY LOGS

```text
activity_logs
────────────────────────
id
user_id
action
entity_type
entity_id

old_data JSONB
new_data JSONB

created_at
```

---

# 94. FUTURE PRICE VIEW TABLE

Optional:

```text
user_price_views
────────────────────────
user_id
product_id
last_seen_version
updated_at
```

This allows future User notifications to know whether a price version has been seen.

---

# 95. SYSTEM STOCK

Official system stock:

```text
products.stock
```

This is numeric.

Example:

```text
120
```

The unit comes from the product's configured unit.

The User Stock Check is different.

---

# 96. USER STOCK CHECK

User inspection:

```text
stock_checks.previous_stock
stock_checks.current_stock
```

Both are:

```text
TEXT
```

Example:

```text
120 pak
180 pcs
```

Never automatically convert them to:

```text
120
180
```

---

# 97. STOCK ARCHITECTURE

The conceptual model:

```text
             PRODUCT
                │
       ┌────────┴────────┐
       │                 │
       ▼                 ▼
 SYSTEM STOCK       STOCK CHECK
 numeric             text
       │                 │
       │                 ▼
       │               USER
       │
       ▼
   ADMIN CONTROL
```

---

# 98. FUTURE STOCK MOVEMENT

Architecture should allow:

```text
IN
OUT
ADJUSTMENT
```

Future:

```text
SALE
PURCHASE
```

Do not implement full sales/purchase UI in Admin v1 unless explicitly requested.

---

# 99. REAL-TIME DATA PRINCIPLES

The application should use near-real-time synchronization where operationally useful.

Especially:

```text
Price changes
Stock checks
Edit requests
Approval status
Inspection schedule
```

Supabase Realtime can be used where appropriate.

Do not blindly subscribe to every table.

Subscriptions should be scoped to the current user/role and required screen.

---

# 100. REAL-TIME INSPECTION SCHEDULE

If Admin changes a product's schedule:

```text
Admin
 ↓
Update Schedule
 ↓
Database
 ↓
Realtime / Query Invalidation
 ↓
User Check Context
```

The User application should receive the latest schedule when online.

Offline devices must reconcile when connectivity returns.

---

# 101. REAL-TIME PRICE EVENT

When Admin updates:

```text
Rp13.000
→
Rp14.000
```

the system creates:

```text
Price History
Activity Log
Price Change Event
```

The future User Dashboard can update without requiring a full manual refresh where realtime is enabled.

---

# 102. OFFLINE-FIRST PWA

Use:

```text
React
+
Service Worker
+
IndexedDB
+
Supabase
```

Conceptually:

```text
USER
 │
 ▼
REACT PWA
 │
 ├── ONLINE ──────► SUPABASE
 │
 └── OFFLINE ─────► INDEXEDDB
                         │
                         ▼
                     SYNC QUEUE
                         │
                  CONNECTION RETURNS
                         │
                         ▼
                      SUPABASE
```

---

# 103. OFFLINE ADMIN RULE

Not every Admin operation should be treated equally offline.

Read operations may use cached data.

Sensitive mutations such as:

```text
Price Update
Deactivate Product
Schedule Change
Approval
```

must preserve transactional integrity.

Do not silently pretend a consequential mutation succeeded if it has not reached the authoritative backend.

---

# 104. OFFLINE STATUS

Use subtle indicators:

```text
● Online
```

or:

```text
Offline — perubahan akan disinkronkan saat terhubung
```

For critical pending mutations:

```text
Menunggu sinkronisasi
```

Do not show fake success states.

---

# 105. SECURITY

Implement:

```text
Supabase Auth
Role-Based Access
Row Level Security
Protected Routes
Server-Side Validation
Client-Side Validation
```

---

# 106. USER DATA PROTECTION

The User must never receive Admin-only purchase price through normal User queries.

Do not rely only on:

```text
display: none
```

or:

```text
if role === USER
```

The backend/database must restrict access.

---

# 107. RLS CONCEPT

Conceptually:

```text
ADMIN
→ Full authorized access

USER
→ Public operational product fields
→ Own stock checks
→ Own profile
→ No purchase price
→ No Admin activity
→ No unrestricted master-data mutation
```

RLS policies must be designed before production deployment.

---

# 108. PRICE UPDATE SECURITY

Price updates are consequential operations.

The system should validate:

```text
Authenticated Admin
+
Valid Product
+
Valid Price
+
Valid Reason
```

The update should be transactional.

The following should not partially succeed:

```text
Product update
Price history
Activity log
Version increment
```

Prefer database transaction / server-side function for the complete operation.

---

# 109. SCHEDULE UPDATE SECURITY

Schedule changes must be atomic.

If Admin changes:

```text
Monday
Wednesday
```

to:

```text
Monday
Wednesday
Saturday
```

the database should not leave a partially updated schedule.

Use a transaction or equivalent safe mutation strategy.

---

# 110. STOCK CHECK SECURITY

User can create only their own stock-check submissions.

User must not be able to:

```text
Change another User's check
Change product system stock
Change schedule
Change price
Change product master data
```

Admin can review authorized stock-check records.

---

# 111. DATE/TIME SECURITY

Audit timestamps should be generated server-side whenever possible.

Do not trust:

```text
client-created_at
```

for important audit events.

The application timezone should be consistently applied when determining:

```text
check_date
current_day
daily schedule
```

---

# 112. VALIDATION

Use:

```text
Zod
+
React Hook Form
```

Validate:

Product:

```text
Name required
Category required
Unit required
Price >= 0
Stock >= 0
```

Inspection schedule:

```text
Valid day enum
```

Stock Check:

```text
TEXT
```

Do not numeric-validate User Stock Check values.

---

# 113. SEARCH

Search products by:

```text
Name
SKU
Category
Unit
```

Use debounced search where needed.

Search must remain responsive on mobile.

---

# 114. FILTERS

Product filters:

```text
Category
Unit
Status
Stock Status
Inspection Day
```

Price history:

```text
Product
Date
Admin
Increase
Decrease
```

Stock checks:

```text
Product
User
Date
Status
```

Activity:

```text
User
Action
Entity
Date
```

---

# 115. EMPTY STATES

Every page needs an intentional empty state.

Examples:

No price history:

```text
Belum ada riwayat harga.
Perubahan harga akan muncul di sini.
```

No stock checks:

```text
Belum ada pemeriksaan stok.
```

No schedule:

```text
Belum ada jadwal pemeriksaan.
```

No edit requests:

```text
Tidak ada permintaan edit.
```

No products:

```text
Belum ada barang.
Tambahkan barang untuk mulai mengelola inventori.
```

---

# 116. LOADING STATES

Use skeleton loading for:

* Product lists
* Dashboard data
* History
* Tables

Avoid unnecessary full-screen spinners.

---

# 117. ERROR HANDLING

User-facing errors should be understandable.

Instead of:

```text
500 Internal Server Error
```

show:

```text
Data belum berhasil disimpan.
Coba lagi beberapa saat.
```

Technical details should be logged separately.

---

# 118. RESPONSIVE DESIGN

Mobile:

```text
Bottom Navigation
Cards
Bottom Sheets
Sticky Actions
Large Touch Targets
Compact Lists
```

Desktop:

```text
Sidebar
Tables
Filters
Dense Data Views
Keyboard-Friendly Search
```

Do not simply stretch mobile UI onto desktop.

---

# 119. UI / UX DIRECTION

Visual direction:

```text
Modern
Clean
Professional
Fast
Operational
Slightly Industrial
Information Dense
PWA Native
```

Avoid:

```text
Generic SaaS dashboard
Excessive gradients
Huge hero sections
Too many cards
Excessive rounded containers
Decorative animations
Unnecessary glassmorphism
```

The application is a working shop tool.

Function comes before decoration.

---

# 120. DATA DENSITY

Admin pages may contain significant amounts of information.

Use:

```text
Compact rows
Clear typography
Strong hierarchy
Smart whitespace
Sticky filters
Search
Sorting where useful
```

Do not sacrifice readability for density.

---

# 121. EDIT VS UPDATE VISUAL LANGUAGE

Edit and Update must look different.

### EDIT

Represents:

```text
Master Data Change
```

### UPDATE

Represents:

```text
Official Price Change
```

Update should have stronger confirmation.

---

# 122. DESTRUCTIVE ACTIONS

Deactivate must use explicit confirmation.

Example:

```text
Nonaktifkan Barang?

Plastik HD 15×30

Barang akan dinonaktifkan dan tidak
lagi muncul sebagai barang aktif.

Riwayat data tetap dipertahankan.

[ Batal ] [ Nonaktifkan ]
```

---

# 123. PRODUCT PHOTO

Product photo can use:

```text
Supabase Storage
```

Store:

```text
image_url
```

Optimize images for PWA performance.

Use appropriate thumbnails.

Do not load unnecessarily large originals in product lists.

---

# 124. PERFORMANCE

Prioritize:

```text
Fast initial load
Small bundles
Lazy loading
Image optimization
Query pagination
Debounced search
Caching
Skeleton states
```

Use:

```text
TanStack Query
```

for server state and caching.

---

# 125. STATE MANAGEMENT

Use:

```text
Zustand
```

for client state where appropriate.

Use:

```text
TanStack Query
```

for server state.

Do not put all server data into Zustand.

---

# 126. FRONTEND STACK

Use:

```text
TypeScript
React
Vite
Tailwind CSS
```

PWA:

```text
vite-plugin-pwa
```

Forms:

```text
React Hook Form
```

Validation:

```text
Zod
```

Backend:

```text
Supabase
```

Database:

```text
PostgreSQL
```

Storage:

```text
Supabase Storage
```

Offline:

```text
IndexedDB
```

---

# 127. PROJECT STRUCTURE

Use feature-based architecture:

```text
haidar-plastik/
│
├── public/
│
├── src/
│   ├── app/
│   ├── components/
│   │
│   ├── features/
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── data/
│   │   ├── categories/
│   │   ├── units/
│   │   ├── inspection-schedules/
│   │   ├── price-history/
│   │   ├── stock-checks/
│   │   ├── stock-check-edit-requests/
│   │   ├── activity-log/
│   │   └── export/
│   │
│   ├── pages/
│   ├── hooks/
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── db.ts
│   │   ├── sync.ts
│   │   └── datetime.ts
│   │
│   ├── stores/
│   ├── schemas/
│   ├── types/
│   └── utils/
│
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── seed.sql
│
├── package.json
└── vite.config.ts
```

---

# 128. DATE/TIME UTILITY

Create a centralized date/time utility.

For example:

```text
datetime.ts
```

It should be responsible for:

```text
getCurrentDate()
getCurrentTime()
getCurrentDay()
getCurrentDateTime()
formatDate()
formatTime()
formatDateTime()
```

The entire application must use the same date/time logic.

Do not scatter date logic throughout components.

---

# 129. INSPECTION SCHEDULE SERVICE

Create a dedicated schedule service responsible for:

```text
getTodayDayOfWeek()
getScheduledProductsForToday()
isProductScheduledToday()
getInspectionStatusForToday()
```

This logic should be shared with the future User module.

---

# 130. TODAY'S CHECK QUERY

Conceptually:

```text
SELECT products
FROM products
JOIN product_inspection_schedules
ON products.id = schedule.product_id
WHERE schedule.day_of_week = CURRENT_DAY
AND products.is_active = true
```

Then evaluate:

```text
stock_checks
```

for:

```text
current date
+
current user
```

---

# 131. ADMIN SCHEDULE MANAGEMENT FLOW

```text
ADMIN
 ↓
DATA
 ↓
SELECT PRODUCT
 ↓
EDIT
 ↓
JADWAL PEMERIKSAAN
 ↓
SELECT DAYS
 ↓
SAVE
 ↓
VALIDATE
 ↓
UPDATE SCHEDULE
 ↓
ACTIVITY LOG
 ↓
SUCCESS
```

---

# 132. COMPLETE ADMIN PRODUCT FLOW

```text
START
 ↓
LOGIN
 ↓
ROLE VALIDATION
 ↓
DASHBOARD
 ↓
DATA
 ↓
SELECT PRODUCT
 ↓
┌───────────┬───────────┬───────────┐
│           │           │           │
▼           ▼           ▼
EDIT     UPDATE PRICE  DEACTIVATE
│           │           │
▼           ▼           ▼
SAVE      CONFIRM     CONFIRM
│           │           │
▼           ▼           ▼
LOG       VERSION+1   IS_ACTIVE=FALSE
            │
       ┌────┼────┐
       │    │    │
       ▼    ▼    ▼
    HISTORY LOG EVENT
```

---

# 133. COMPLETE INSPECTION FLOW

```text
ADMIN
 ↓
ADD / EDIT PRODUCT
 ↓
SET INSPECTION DAYS
 ↓
SAVE SCHEDULE
 ↓
DATABASE
 ↓
CURRENT DATE
 ↓
CURRENT DAY
 ↓
USER CHECK PAGE
 ↓
FIND PRODUCTS SCHEDULED TODAY
 ↓
USER CHECKS PRODUCT
 ↓
STOCK CHECK
 ↓
SUBMIT
 ↓
LOCK
 ↓
ADMIN RIWAYAT
```

---

# 134. COMPLETE EDIT REQUEST FLOW

```text
USER
 ↓
SUBMIT STOCK CHECK
 ↓
LOCK
 ↓
REQUEST EDIT
 ↓
EDIT_REQUESTED
 ↓
ADMIN RIWAYAT / REQUEST
 ↓
REVIEW
 ↓
┌──────────────┐
│              │
▼              ▼
APPROVE       REJECT
│              │
▼              ▼
EDIT_APPROVED  EDIT_REJECTED
│              │
▼              ▼
USER EDIT      LOCKED
│
▼
RESUBMIT
│
▼
SUBMITTED
```

---

# 135. COMPLETE PRICE FLOW

```text
ADMIN
 ↓
DATA
 ↓
UPDATE PRICE
 ↓
OLD PRICE
 ↓
NEW PRICE
 ↓
COMPARE
 ↓
CONFIRM
 ↓
VERSION +1
 ↓
PRODUCT UPDATE
 ↓
PRICE HISTORY
 ↓
ACTIVITY LOG
 ↓
PRICE CHANGE EVENT
 ↓
FUTURE USER DASHBOARD
```

---

# 136. COMPLETE DAILY TIME FLOW

```text
APPLICATION
 ↓
CURRENT SERVER / APP DATETIME
 ↓
CONVERT TO ASIA/JAKARTA
 ↓
CURRENT DATE
 ↓
CURRENT DAY
 ↓
READ INSPECTION SCHEDULE
 ↓
FIND TODAY'S PRODUCTS
 ↓
CHECK TODAY'S SUBMISSIONS
 ↓
RETURN:
 ├── BELUM DIPERIKSA
 └── SUDAH DIPERIKSA
```

This logic must be deterministic.

---

# 137. COMPLETE ADMIN ACTIVITY DIAGRAM

```text
                         START
                           │
                           ▼
                         LOGIN
                           │
                           ▼
                    VALIDATE ADMIN
                           │
                           ▼
                       DASHBOARD
                           │
                           ▼
                    SELECT MENU
                           │
       ┌───────────────┬───┼───────────────┬───────────────┐
       │               │   │               │               │
       ▼               ▼   ▼               ▼               ▼
    BARANG           DATA RIWAYAT        EXPORT         PROFILE
       │               │     │               │
       ▼               │     ├── Harga       │
   VIEW ONLY           │     ├── Stock Check │
                       │     ├── Request     │
                       │     └── Activity    │
                       │                     │
              ┌────────┼─────────┐           │
              │        │         │           │
              ▼        ▼         ▼           │
           TAMBAH     EDIT    UPDATE         │
              │        │         │            │
              ▼        ▼         ▼            │
           PRODUCT   MASTER    PRICE          │
              │        │         │            │
              │        │      VERSION+1       │
              │        │         │            │
              │        │    PRICE HISTORY     │
              │        │         │            │
              └────────┴────ACTIVITY LOG──────┘
```

---

# 138. DATA RELATIONSHIP

Conceptually:

```text
CATEGORY
   │
   ▼
PRODUCT
   │
   ├──────────────► UNIT
   │
   ├──────────────► PRICE HISTORY
   │
   ├──────────────► INSPECTION SCHEDULE
   │
   └──────────────► STOCK CHECK
                         │
                         ▼
                        USER
```

Activity:

```text
ADMIN / USER
     │
     ▼
ACTIVITY LOG
```

---

# 139. ADMIN ↔ USER ARCHITECTURE

The final relationship:

```text
                         ADMIN
                           │
                           ▼
                     MASTER DATA
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
          PRODUCT         PRICE       SCHEDULE
             │             │             │
             │             ▼             │
             │        PRICE EVENT        │
             │             │             │
             └─────────────┼─────────────┘
                           ▼
                          USER
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
         DASHBOARD       BARANG        CHECK
             │             │             │
             │             │             ▼
             │             │        STOCK CHECK
             │             │             │
             │             │             ▼
             │             │          DATABASE
             │             │
             └─────────────┴─────────────┐
                                         ▼
                                      ADMIN
                                    RIWAYAT
```

---

# 140. BUSINESS RULES

## BR-A01

Barang is view-only.

## BR-A02

CRUD happens only inside Data.

## BR-A03

Edit does not increment price version.

## BR-A04

Official Update Price increments price version.

## BR-A05

Every official price update creates Price History.

## BR-A06

Price colors are frontend-derived.

## BR-A07

Old price is neutral gray.

## BR-A08

New increased price is red.

## BR-A09

New decreased price is green.

## BR-A10

Stock Check does not modify system stock.

## BR-A11

Stock Check values are TEXT.

## BR-A12

Admin can see purchase/modal price.

## BR-A13

Future User cannot see purchase/modal price.

## BR-A14

Important Admin actions create Activity Log.

## BR-A15

Products should use soft delete.

## BR-A16

Price version represents price state, not product version.

## BR-A17

Each product can have multiple inspection days.

## BR-A18

Inspection days are stored relationally.

## BR-A19

Today's inspection list is derived automatically from the current calendar day.

## BR-A20

The current calendar day uses the application's configured timezone.

## BR-A21

A completed inspection from a previous day does not satisfy today's inspection.

## BR-A22

Inspection status is determined using product + user + calendar date.

## BR-A23

Historical inspections are never rewritten because the schedule changes.

## BR-A24

User-submitted inspections are locked after submission.

## BR-A25

User must request Admin approval to edit a submitted inspection.

## BR-A26

Admin approval/rejection is auditable.

## BR-A27

Inspection schedule changes are auditable.

## BR-A28

Important timestamps use server/database timestamps.

---

# 141. ADMIN ACCEPTANCE CRITERIA

The Admin module is considered functionally complete when:

### Authentication

* Admin can log in.
* User cannot access Admin routes.
* Admin authorization is enforced server-side.

### Dashboard

* Dashboard loads operational information.
* Recent activity can be viewed.
* Recent price changes can be viewed.
* Stock-check information can be summarized.
* Pending edit requests can be surfaced.

### Barang

* Admin can view products.
* Admin can search.
* Admin can filter.
* Admin can view product detail.
* Admin can see purchase price.
* Admin can see selling price.
* Admin can see price version.
* Admin cannot CRUD from Barang.

### Data

* Admin can add product.
* Admin can edit product.
* Admin can update price.
* Admin can deactivate product.
* Admin can manage categories.
* Admin can manage units.
* Admin can configure inspection days.
* Admin can change inspection days.

### Inspection Schedule

* Admin can select one day.
* Admin can select multiple days.
* Schedule is stored relationally.
* Current day is detected automatically.
* User can receive today's scheduled products.
* Schedule changes do not modify historical inspections.

### Price

* Price update shows old/new prices.
* Price update requires confirmation.
* Price version increments.
* Price history is created.
* Activity Log is created.
* Price change direction is determined correctly.

### Stock Check

* Admin can view User stock checks.
* Admin can see exact textual stock values.
* Admin can see date and time.
* Admin can see status.
* Admin can review edit requests.
* Admin can approve.
* Admin can reject.

### Riwayat

* Price history available.
* Stock-check history available.
* Edit-request history available.
* Activity Log available.
* User/Admin identity available.
* Date/time available.

### Export

* Dataset selectable.
* Columns selectable.
* Filters available.
* Preview available.
* Excel export available.
* PDF export available.
* Inspection schedule export available.

### PWA

* Installable.
* Responsive.
* Mobile-first.
* Desktop-ready.
* Offline-aware.
* Fast.
* Data integrity preserved.

---

# 142. IMPLEMENTATION PRIORITY

Build in this order:

```text
PHASE 1
Project Foundation
        ↓
PHASE 2
Database Schema
        ↓
PHASE 3
Supabase Auth + RLS
        ↓
PHASE 4
Date/Time Architecture
        ↓
PHASE 5
PWA Foundation
        ↓
PHASE 6
Product + Master Data
        ↓
PHASE 7
Inspection Schedule
        ↓
PHASE 8
Barang — View Only
        ↓
PHASE 9
Data — CRUD
        ↓
PHASE 10
Edit Product
        ↓
PHASE 11
Update Price
        ↓
PHASE 12
Price Version + History
        ↓
PHASE 13
Stock Check History
        ↓
PHASE 14
Stock Check Edit Request
        ↓
PHASE 15
Activity Log
        ↓
PHASE 16
Dashboard
        ↓
PHASE 17
Export
        ↓
PHASE 18
Realtime
        ↓
PHASE 19
Offline / Sync
        ↓
PHASE 20
Responsive Polish
        ↓
PHASE 21
Testing
```

Do not build advanced UI before stabilizing the data model.

---

# 143. TESTING REQUIREMENTS

Test at minimum:

### Product

```text
Create
Edit
Deactivate
Search
Filter
Detail
```

### Price

```text
Increase
Decrease
No Change
Version increment
History creation
Activity creation
```

### Schedule

```text
One day
Multiple days
All days
No days
Schedule update
Schedule removal
```

### Date

```text
Monday
Tuesday
Wednesday
Thursday
Friday
Saturday
Sunday
```

### Daily reset

```text
Friday check
Saturday check
```

must remain separate.

### Stock Check

```text
Text values
Submission
Lock
Edit request
Approval
Rejection
Resubmission
```

### Security

Test that User cannot:

```text
View purchase price
Change product
Change price
Change schedule
Change system stock
Access Admin history
Access another user's protected data
```

---

# 144. CRITICAL EDGE CASES

The implementation must explicitly handle:

### Product has no inspection schedule

Then:

```text
Product does not appear in User Check.
```

### Product has multiple schedules

Example:

```text
Monday
Wednesday
Saturday
```

It appears on all three days.

### Product is deactivated

It should not appear as an active scheduled inspection item.

Historical records remain accessible.

### Schedule is changed

Historical checks remain unchanged.

### User already checked today

The item becomes:

```text
Sudah diperiksa
```

### User checks tomorrow

A new inspection occurrence is created.

### Price changes twice in one day

Both official changes remain in Price History.

### Price does not actually change

Do not increment price version.

Do not create a false price-change event.

---

# 145. MULTIPLE PRICE CHANGES IN ONE DAY

Example:

```text
09:00
Rp13.000 → Rp14.000

15:00
Rp14.000 → Rp15.000
```

The system must preserve both:

```text
v4
v5
```

with separate historical records.

The User-facing dashboard logic may aggregate/display the latest relevant event according to future UX rules, but Admin history must never lose either change.

---

# 146. PRODUCT SCHEDULE AND DEACTIVATION

If:

```text
Product A
Monday + Wednesday
```

and Admin deactivates it:

```text
is_active = false
```

it must no longer appear in active User daily checks.

However:

```text
Schedule records
Stock checks
Price history
Activity logs
```

remain historically queryable.

---

# 147. DATA INTEGRITY PRINCIPLE

The database is the source of truth.

Do not make important business rules exist only inside UI components.

Critical rules must be enforced through:

```text
Database
RLS
Server-side functions
Transactions
Constraints
```

Frontend provides UX.

Backend/database provides authority.

---

# 148. NO FAKE REAL-TIME

Do not create fake realtime behavior such as:

```text
setTimeout
mock data
hardcoded dates
hardcoded schedules
```

Real-time date/day behavior must derive from actual current time.

Realtime database updates must come from actual persisted backend data.

---

# 149. NO HARDCODED DAILY SCHEDULE

Do not write:

```text
if Saturday:
  show Product A
```

The system must query:

```text
product_inspection_schedules
```

based on:

```text
current_day
```

Example:

```text
Current Day
SATURDAY

Database:
Product A → SATURDAY
Product F → SATURDAY
Product G → SATURDAY

Result:
A
F
G
```

---

# 150. FUTURE USER COMPATIBILITY

The Admin architecture must be directly compatible with the User PRD.

The future User module will depend on:

```text
products
categories
units
price_history
product_inspection_schedules
stock_checks
stock_check_edit_requests
users
```

Therefore, do not redesign these entities later without a strong reason.

---

# 151. FUTURE USER DATA EXPOSURE

Future User product query should expose only:

```text
id
name
sku
category
unit
stock
selling_price
```

Do NOT expose:

```text
purchase_price
```

The Admin database can contain the purchase price, but User access must be restricted.

---

# 152. FINAL ADMIN STRUCTURE

The final Admin application:

```text
HAIDAR PLASTIK
│
├── DASHBOARD
│   ├── Overview
│   ├── Price Changes
│   ├── Stock Checks
│   ├── Pending Requests
│   └── Recent Activity
│
├── BARANG
│   ├── Search
│   ├── Filter
│   ├── Product List
│   └── Product Detail
│       ├── Stock
│       ├── Purchase Price
│       ├── Selling Price
│       ├── Price Version
│       └── Inspection Schedule
│
├── DATA
│   ├── Products
│   │   ├── Add
│   │   ├── Edit
│   │   ├── Update Price
│   │   └── Deactivate
│   │
│   ├── Categories
│   ├── Units
│   └── Inspection Schedule
│
├── RIWAYAT
│   ├── Harga
│   ├── Pemeriksaan Stok
│   ├── Request Edit
│   └── Activity Log
│
└── EXPORT
    ├── Data Barang
    ├── Harga
    ├── Stok
    ├── Jadwal Pemeriksaan
    ├── Riwayat Harga
    ├── Pemeriksaan Stok
    ├── Request Edit
    └── Activity Log
```

---

# 153. FINAL CORE MODEL

The entire system must preserve:

```text
BARANG
= VIEW

DATA
= MANAGE

EDIT
= MASTER DATA CHANGE

UPDATE
= OFFICIAL PRICE CHANGE

PRICE HISTORY
= PRICE AUDIT

SCHEDULE
= WHEN A PRODUCT MUST BE CHECKED

CURRENT DAY
= AUTOMATIC DAILY CONTEXT

STOCK CHECK
= USER OBSERVATION

SYSTEM STOCK
= OFFICIAL SYSTEM QUANTITY

RIWAYAT
= AUDIT / HISTORY

EXPORT
= DATA OUTPUT
```

---

# 154. FINAL DAILY SCHEDULE MODEL

The most important new behavior is:

```text
ADMIN
   │
   ▼
INPUT PRODUCT
   │
   ▼
SET INSPECTION DAYS
   │
   ├── Monday
   ├── Wednesday
   └── Saturday
   │
   ▼
DATABASE
   │
   ▼
CURRENT DATE/TIME
   │
   ▼
CURRENT DAY
   │
   ▼
USER CHECK PAGE
   │
   ▼
MATCH SCHEDULE
   │
   ▼
SHOW TODAY'S PRODUCTS
```

Example:

```text
Admin sets:

Barang A
→ Monday + Wednesday

Barang B
→ Tuesday

Barang C
→ Saturday
```

When current date is:

```text
Saturday
```

User automatically receives:

```text
Pemeriksaan Hari Ini

Barang C
```

When current date becomes:

```text
Monday
```

User automatically receives:

```text
Pemeriksaan Hari Ini

Barang A
```

No manual daily setup is required.

---

# 155. FINAL REAL-TIME MODEL

The PWA must behave conceptually like:

```text
              CURRENT TIME
                   │
                   ▼
             CURRENT DATE
                   │
                   ▼
              CURRENT DAY
                   │
                   ▼
         INSPECTION SCHEDULE
                   │
                   ▼
          TODAY'S PRODUCTS
                   │
                   ▼
          EXISTING STOCK CHECK
                   │
          ┌────────┴────────┐
          ▼                 ▼
     NOT CHECKED         CHECKED
          │                 │
          ▼                 ▼
       CHECK              DONE
```

At the same time:

```text
ADMIN
 │
 ├── changes price
 │       ↓
 │   Price History
 │       ↓
 │   Price Event
 │       ↓
 │   User Dashboard
 │
 ├── changes schedule
 │       ↓
 │   Schedule Database
 │       ↓
 │   User Check
 │
 └── reviews stock check
         ↓
      Approval
         ↓
       User
```

---

# 156. DESIGN PRINCIPLE

The Admin experience must follow:

> **Fast to see. Fast to manage. Hard to make a destructive mistake.**

The daily operational loop should be:

```text
LOGIN
 ↓
SEE OVERVIEW
 ↓
CHECK WHAT NEEDS ATTENTION
 ↓
MANAGE DATA
 ↓
REVIEW USER CHECKS
 ↓
REVIEW HISTORY
 ↓
EXPORT WHEN NEEDED
```

---

# 157. DO NOT DO THESE THINGS

Do NOT:

1. Put CRUD actions on Barang.
2. Put Update Price inside normal Edit.
3. Increment price version during normal Edit.
4. Store price colors in database.
5. Convert Stock Check text to numbers.
6. Automatically change system stock from Stock Check.
7. Expose purchase price to User.
8. Permanently delete historical product records.
9. Store inspection schedules as uncontrolled strings.
10. Hardcode Saturday/Monday product lists.
11. Hardcode current date.
12. Depend exclusively on device time for critical date logic.
13. Rewrite historical checks when schedules change.
14. Treat Friday and Saturday as the same inspection occurrence.
15. Allow User to directly modify submitted checks.
16. Allow User to modify Admin-controlled schedule.
17. Build fake realtime behavior.
18. Build full sales/purchase transactions prematurely.
19. Build a generic SaaS dashboard.
20. Overload the interface with decorative UI.
21. Hide important business rules only in frontend code.
22. Pretend an offline critical mutation succeeded before it is safely persisted.

---

# 158. FINAL BUILD INSTRUCTION

Before writing implementation code:

1. Inspect the existing repository.
2. Do not overwrite useful existing work without inspection.
3. Establish database architecture first.
4. Establish relationships and foreign keys.
5. Establish Supabase Auth.
6. Establish RLS.
7. Establish role authorization.
8. Establish centralized date/time handling.
9. Establish inspection schedule architecture.
10. Establish daily schedule query logic.
11. Establish product model.
12. Establish price version logic.
13. Establish price history.
14. Establish stock-check model.
15. Establish edit-request model.
16. Establish Activity Log.
17. Establish PWA foundation.
18. Establish realtime architecture where useful.
19. Then build UI.
20. Keep Barang and Data completely separate.
21. Keep Edit and Update Price completely separate.
22. Keep Stock Check separate from System Stock.
23. Keep historical data immutable where appropriate.
24. Make inspection scheduling fully dynamic.
25. Make today's inspection list automatically derive from current date/day.
26. Use reliable server/database timestamps for audit events.
27. Protect Admin-only data at backend/database level.
28. Preserve compatibility with the future User Module.
29. Do not simplify or remove requirements without explaining why.
30. If technical implementation is ambiguous, business rules in this PRD are the source of truth.

---

# 159. FINAL PRODUCT MODEL

```text
                         HAIDAR PLASTIK
                                │
          ┌─────────────────────┼─────────────────────┐
          │                     │                     │
      DASHBOARD               BARANG                 DATA
          │                  VIEW ONLY              MANAGE
          │                                          │
          │                              ┌───────────┼───────────┐
          │                              │           │           │
          │                           CREATE       EDIT       UPDATE
          │                              │           │           │
          │                              │           │       VERSION +1
          │                              │           │           │
          │                              │           │    PRICE HISTORY
          │                              │           │           │
          │                              │           │      PRICE EVENT
          │                              │           │
          │                              │       SCHEDULE
          │                              │           │
          │                              │      ACTIVITY LOG
          │                              │
          └──────────────────────────────┴──────────────┐
                                                         │
                                                       USER
                                                         │
                                            ┌────────────┼────────────┐
                                            │            │            │
                                       DASHBOARD       BARANG       CHECK
                                            │            │            │
                                      PRICE ALERT       VIEW      DAILY SCHEDULE
                                                                      │
                                                                      ▼
                                                                STOCK CHECK
                                                                      │
                                                                      ▼
                                                                  DATABASE
                                                                      │
                                                                      ▼
                                                                   RIWAYAT
                                                                      │
                                                                      ▼
                                                                    ADMIN
```

---

# 160. FINAL SOURCE OF TRUTH

The Admin system must always preserve these distinctions:

```text
BARANG
→ melihat

DATA
→ mengelola

EDIT
→ perubahan master data

UPDATE
→ perubahan harga resmi

PRICE HISTORY
→ riwayat harga

SCHEDULE
→ menentukan hari pemeriksaan

CURRENT DAY
→ menentukan barang yang harus diperiksa hari ini

STOCK CHECK
→ observasi User

SYSTEM STOCK
→ stok resmi

EDIT REQUEST
→ mekanisme koreksi pemeriksaan

RIWAYAT
→ audit trail

EXPORT
→ output data
```

The most important operational relationship is:

> **Admin menentukan jadwal → sistem membaca hari sekarang secara otomatis → User mendapatkan daftar barang yang harus diperiksa hari itu → User melakukan pemeriksaan → hasil tersimpan sebagai riwayat → Admin dapat memantau dan menindaklanjuti.**

---

# 161. OUTPUT FILE

Save this document as:

```text
admin_prd.md
```

The file must contain the complete Admin specification.
