# PRD — HAIDAR PLASTIK MANAGEMENT PWA

## USER MODULE — v1.0

---

# 1. PRODUCT OVERVIEW

Haidar Plastik Management PWA memiliki dua jenis aktor:

* Admin
* User

Dokumen ini khusus membahas **User Module**.

User memiliki akses terbatas dan difokuskan untuk:

1. Melihat informasi barang.
2. Melihat harga jual.
3. Menerima informasi perubahan harga.
4. Melakukan pemeriksaan stok sesuai jadwal.
5. Mengirim hasil pemeriksaan stok.
6. Melihat status pemeriksaan barang.
7. Mengajukan permintaan edit terhadap pemeriksaan yang sudah disimpan.
8. Mengelola informasi profil pribadi.

User **tidak memiliki akses untuk mengelola Master Data**.

---

# 2. USER ROLE

User bersifat operasional/read-only.

Hak akses utama:

```text
USER
│
├── Dashboard
├── Barang
├── Check
│   └── Pemeriksaan Barang
└── Profile
```

User TIDAK dapat:

```text
Edit Barang
Tambah Barang
Delete Barang
Edit Kategori
Edit Satuan
Edit Harga
Update Harga
Melihat Harga Modal
Mengubah Stok Sistem
```

---

# 3. USER INFORMATION ARCHITECTURE

Struktur navigasi User:

```text
HAIDAR PLASTIK
│
├── 🏠 Dashboard
│
├── 📦 Barang
│   └── View Only
│
├── ✓ Check
│   └── Pemeriksaan Stok
│
└── 👤 Profile
```

Profile dapat menggunakan struktur yang sama dengan Admin sehingga sistem memiliki pola navigasi yang konsisten.

---

# 4. USER DASHBOARD

Dashboard adalah halaman pertama setelah User login.

Dashboard harus terasa personal.

Bagian atas menampilkan identitas User:

```text
Hi, Username 👋
```

Username harus berasal dari akun yang digunakan saat login.

Jangan menggunakan username hardcoded.

Contoh:

```text
Hi, Ahmad 👋
```

atau:

```text
Hi, Budi 👋
```

sesuai akun yang sedang login.

---

# 5. DASHBOARD HEADER

Bagian atas Dashboard:

```text
┌─────────────────────────────────┐
│ Hi, Ahmad 👋             [👤]  │
│ Selamat datang kembali          │
└─────────────────────────────────┘
```

Profile icon dapat membuka halaman Profile.

Username harus dinamis berdasarkan authenticated user.

---

# 6. DASHBOARD — PRICE ALERT

Dashboard memiliki container/card khusus untuk memberikan informasi perubahan harga.

Tujuan:

> Memberi tahu User barang mana yang mengalami perubahan harga.

Dashboard TIDAK menampilkan detail harga lama dan harga baru.

Dashboard hanya menampilkan:

> **Nama barang yang mengalami perubahan harga.**

---

# 7. PRICE ALERT — TIDAK ADA PERUBAHAN

Jika tidak ada perubahan harga pada hari tersebut:

```text
┌─────────────────────────────────┐
│ 🔔 Perubahan Harga              │
│                                 │
│ Hari ini tidak ada perubahan    │
│ harga.                          │
└─────────────────────────────────┘
```

Jangan menampilkan container kosong.

Harus ada empty state yang jelas.

---

# 8. PRICE ALERT — ADA PERUBAHAN

Jika terdapat perubahan harga:

```text
┌─────────────────────────────────┐
│ 🔔 Perubahan Harga              │
│                                 │
│ Plastik HD 15×30                │
│ Cup 16oz                        │
│ Kresek XL                       │
│                                 │
│ Lihat di Barang →               │
└─────────────────────────────────┘
```

Dashboard hanya menunjukkan **nama barang**.

Tidak menampilkan:

```text
Harga lama
Harga baru
Harga modal
Version
Alasan perubahan
```

Detail perubahan harga dilihat di halaman Barang.

---

# 9. PRICE ALERT COLOR

Nama barang pada daftar perubahan harga diberi warna berdasarkan jenis perubahan harga.

### Harga naik

```text
Plastik HD 15×30
```

ditampilkan **merah**.

### Harga turun

```text
Cup 16oz
```

ditampilkan **hijau**.

Contoh:

```text
🔔 Perubahan Harga

🔴 Plastik HD 15×30
🟢 Cup 16oz
🔴 Kresek XL
```

Warna tersebut berasal dari hasil perbandingan:

```text
new_price > old_price
→ merah

new_price < old_price
→ hijau
```

Database tidak menyimpan warna.

---

# 10. DASHBOARD — CHECK REMINDER

Selain perubahan harga, Dashboard juga memiliki peringatan pemeriksaan barang.

Tujuannya:

> Memberi tahu User apakah masih ada barang yang harus diperiksa hari ini.

Contoh:

```text
┌─────────────────────────────────┐
│ ✓ Pemeriksaan Barang            │
│                                 │
│ Masih ada 3 barang yang         │
│ belum diperiksa hari ini.       │
│                                 │
│ [ Periksa Sekarang ]            │
└─────────────────────────────────┘
```

---

# 11. CHECK REMINDER — SEMUA SUDAH SELESAI

Jika semua barang yang dijadwalkan hari itu sudah diperiksa:

```text
┌─────────────────────────────────┐
│ ✓ Pemeriksaan Barang            │
│                                 │
│ Semua barang hari ini sudah     │
│ diperiksa.                      │
└─────────────────────────────────┘
```

---

# 12. CHECK REMINDER — BELUM ADA PEMERIKSAAN

Jika ada barang yang belum diperiksa:

```text
┌─────────────────────────────────┐
│ Pemeriksaan Barang              │
│                                 │
│ 3 barang belum diperiksa.       │
│                                 │
│ Plastik HD 15×30                │
│ Cup 16oz                        │
│ Kresek XL                       │
│                                 │
│ [ Periksa Sekarang ]            │
└─────────────────────────────────┘
```

Dashboard boleh menampilkan nama barang yang belum diperiksa untuk membantu User.

---

# 13. DAILY CHECK SYSTEM

Sistem pemeriksaan menggunakan konsep **jadwal pemeriksaan berdasarkan hari**.

Admin menentukan hari pemeriksaan untuk setiap barang.

Contoh:

```text
Plastik HD 15×30
Hari pemeriksaan:
☑ Senin
☐ Selasa
☑ Rabu
☐ Kamis
☑ Sabtu
```

Artinya barang tersebut harus diperiksa pada:

```text
Senin
Rabu
Sabtu
```

---

# 14. CHECK SCHEDULE DI MASTER DATA

Fitur pengaturan jadwal pemeriksaan menjadi bagian dari **Master Data / Data Barang Admin**.

Ketika Admin menambah atau mengedit barang:

```text
Data Barang
│
├── Nama Barang
├── Kategori
├── Satuan
├── Harga Modal
├── Harga Jual
├── Stok
├── Minimum Stock
├── Foto
├── Catatan
└── Jadwal Pemeriksaan
```

Jadwal pemeriksaan dapat berupa pilihan hari:

```text
☐ Senin
☐ Selasa
☐ Rabu
☐ Kamis
☐ Jumat
☐ Sabtu
☐ Minggu
```

Admin dapat memilih satu atau beberapa hari.

---

# 15. DAILY RESET

Pemeriksaan bersifat **harian**.

Setiap hari sistem menentukan kembali barang mana yang harus diperiksa berdasarkan:

```text
Hari sekarang
+
Jadwal pemeriksaan barang
```

Contoh:

Hari ini:

```text
Sabtu
```

Sistem mencari seluruh barang yang memiliki:

```text
inspection_day = Saturday
```

Hasil:

```text
Barang A
Barang F
Barang G
```

User melihat:

```text
PEMERIKSAAN HARI INI

Sabtu, 05 September 2026

3 Barang
```

---

# 16. CHECK PAGE

Menu:

```text
✓ Check
```

digunakan untuk melakukan pemeriksaan barang.

Halaman ini harus langsung menunjukkan **barang yang memang perlu diperiksa hari tersebut**.

Tidak perlu User mencari semua barang secara manual.

---

# 17. CHECK PAGE — HEADER

Contoh:

```text
Pemeriksaan Barang

Sabtu, 05 September 2026

3 barang perlu diperiksa
```

Kemudian daftar:

```text
┌─────────────────────────────────┐
│ Plastik HD 15×30                │
│ Stok sistem: 120 PCS            │
│                                 │
│ [ Periksa ]                     │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Cup 16oz                        │
│ Stok sistem: 45 PCS             │
│                                 │
│ [ Periksa ]                     │
└─────────────────────────────────┘
```

---

# 18. CHECK STATUS

Setiap barang memiliki status pemeriksaan untuk hari tersebut.

Status:

```text
Belum diperiksa
Sudah diperiksa
Menunggu persetujuan edit
```

Contoh:

```text
Plastik HD 15×30
✓ Sudah diperiksa
```

---

# 19. CHECK ITEM

Ketika User memilih barang:

```text
Plastik HD 15×30
```

User masuk ke halaman/detail pemeriksaan.

---

# 20. PEMERIKSAAN STOK

Form pemeriksaan terdiri dari:

```text
Stok Sebelumnya
Stok Sekarang
Catatan
```

Ketiga field pemeriksaan disimpan sebagai **STRING/TEXT**.

Contoh:

```text
┌─────────────────────────────────┐
│ Pemeriksaan Stok                │
│                                 │
│ Plastik HD 15×30                │
│                                 │
│ Stok Sebelumnya                 │
│ [ 120 pak                    ]  │
│                                 │
│ Stok Sekarang                   │
│ [ 180 pcs                   ]   │
│                                 │
│ Catatan                         │
│ [ masih ada banyak           ]  │
│                                 │
│ [ Simpan Pemeriksaan ]          │
└─────────────────────────────────┘
```

---

# 21. STOCK CHECK IS TEXTUAL

The system must preserve exactly what the User enters.

Examples:

```text
"120 pak"
"180 pcs"
"masih ada banyak"
```

Other valid examples:

```text
"50 dus"
"3 dus + 20 pcs"
"tinggal sedikit"
"1 box"
```

Do NOT force these values into numeric fields.

Do NOT automatically calculate the difference.

Do NOT normalize the text.

---

# 22. STOCK CHECK DOES NOT MODIFY SYSTEM STOCK

This is a critical business rule.

When User enters:

```text
Stok Sebelumnya:
120 pak

Stok Sekarang:
180 pcs
```

the system must NOT automatically execute:

```text
products.stock = 180
```

Instead:

```text
User
 ↓
Stock Check
 ↓
Save
 ↓
stock_checks
```

The official system stock remains unchanged.

---

# 23. SAVE CHECK

Before saving, the User should be able to review the entered information.

Example:

```text
Stok Sebelumnya
120 pak

Stok Sekarang
180 pcs

Catatan
masih ada banyak

[ Simpan Pemeriksaan ]
```

After saving, the system must confirm:

```text
Pemeriksaan berhasil disimpan.
```

---

# 24. LOCK AFTER SAVE

After User saves a stock inspection:

> The inspection becomes locked.

User cannot directly edit the submitted inspection.

Example:

```text
✓ Pemeriksaan telah disimpan

Stok Sebelumnya
120 pak

Stok Sekarang
180 pcs

Catatan
masih ada banyak
```

No direct edit field should remain active.

---

# 25. EDIT REQUEST

If User discovers a mistake after submitting the inspection, User cannot directly edit it.

Instead:

```text
[ Minta Edit ]
```

The request must be sent to Admin.

---

# 26. EDIT REQUEST FLOW

```text
User
 ↓
Pemeriksaan sudah disimpan
 ↓
Menyadari kesalahan
 ↓
Minta Edit
 ↓
Request dikirim ke Admin
 ↓
Menunggu persetujuan
```

Status:

```text
Menunggu persetujuan Admin
```

---

# 27. EDIT REQUEST UI

After submission:

```text
┌─────────────────────────────────┐
│ ✓ Pemeriksaan Tersimpan         │
│                                 │
│ Stok Sebelumnya                 │
│ 120 pak                         │
│                                 │
│ Stok Sekarang                   │
│ 180 pcs                         │
│                                 │
│ Catatan                         │
│ masih ada banyak                │
│                                 │
│ ─────────────────────────────── │
│                                 │
│ Ada kesalahan pada data?        │
│                                 │
│ [ Minta Edit ]                  │
└─────────────────────────────────┘
```

After request:

```text
┌─────────────────────────────────┐
│ Menunggu Persetujuan Admin      │
│                                 │
│ Permintaan edit telah dikirim.  │
│ Tunggu persetujuan Admin.       │
└─────────────────────────────────┘
```

---

# 28. ADMIN APPROVAL

The User module must support the following states:

```text
SUBMITTED
EDIT_REQUESTED
EDIT_APPROVED
EDIT_REJECTED
```

Admin will later process the request.

If approved:

```text
Admin approve
 ↓
User can edit
 ↓
User submit again
 ↓
Inspection locked
```

If rejected:

```text
Admin reject
 ↓
Inspection remains locked
```

The Admin module should record this activity.

---

# 29. CHECK HISTORY

User should be able to see their examination history where appropriate.

Each record can display:

```text
Tanggal
Nama Barang
Stok Sebelumnya
Stok Sekarang
Catatan
Status
```

Example:

```text
03 Sep 2026

Plastik HD 15×30

120 pak → 180 pcs

masih ada banyak

✓ Sudah diperiksa
```

---

# 30. PAGE 2 — BARANG

The Barang page is VIEW ONLY.

User cannot:

* Add
* Edit
* Update
* Delete

The Barang page functions as a product catalog.

---

# 31. USER PRODUCT INFORMATION

User can see:

```text
Nama Barang
SKU if appropriate
Kategori
Satuan
Stok
Harga Jual
```

User MUST NOT see:

```text
Harga Modal
Purchase Price
Admin-only data
```

---

# 32. PRODUCT DETAIL — USER

Example:

```text
Plastik HD 15×30

Plastik · PCS

────────────────

Stok
120 PCS

Harga Jual
Rp14.000

────────────────

SKU
HP-PLS-0001

Catatan
...
```

Do not display:

```text
Harga Modal
```

---

# 33. PRICE CHANGE ON PRODUCT PAGE

Unlike the Dashboard, the Barang page can provide more detailed price information.

If a product has recently changed price, the User can see:

```text
Harga Jual

Rp13.000 → Rp14.000

HARGA NAIK
```

Visual:

```text
Rp13.000
neutral gray

→

Rp14.000
red
```

If the price decreased:

```text
Rp14.000
neutral gray

→

Rp13.000
green
```

---

# 34. DASHBOARD VS BARANG PRICE INFORMATION

Important distinction:

### Dashboard

Only:

```text
Nama Barang
```

Example:

```text
🔴 Plastik HD 15×30
🟢 Cup 16oz
```

### Barang Detail

Can show:

```text
Harga lama
Harga baru
Jenis perubahan
Tanggal perubahan
```

This keeps Dashboard simple while allowing detailed information when the User needs it.

---

# 35. PAGE 4 — PROFILE

Profile is a standard personal account page.

Example:

```text
Profile

        [ Avatar ]

Ahmad
username@email.com

────────────────

Nama
Ahmad

Username
ahmad

Email
username@email.com

────────────────

Account
Password
Logout
```

Only personal account information should be shown.

---

# 36. PROFILE SECURITY

User must not be able to change:

* Role
* Permissions
* Admin-only information
* System data

User can change personal information only if the authentication architecture supports it.

---

# 37. LOGOUT

Profile should contain:

```text
[ Logout ]
```

Logout must securely terminate the authenticated session.

---

# 38. USER AUTHENTICATION

Username shown on Dashboard must come from authenticated account data.

Example:

```text
Login
 ↓
Authentication
 ↓
User Profile
 ↓
username
 ↓
Dashboard
 ↓
Hi, username 👋
```

Do not hardcode:

```text
Hi, User
```

unless fallback data is required.

---

# 39. DAILY CHECK LOGIC

The system must determine today's inspection list using:

```text
Current Date
        ↓
Current Day
        ↓
Product Inspection Schedule
        ↓
Find products scheduled today
        ↓
Check whether today's inspection exists
        ↓
Display:
    - Belum diperiksa
    - Sudah diperiksa
```

Example:

Today:

```text
Sabtu
```

Product schedules:

```text
Barang A → Sabtu
Barang B → Senin
Barang C → Sabtu
Barang D → Selasa
Barang E → Sabtu
```

User sees:

```text
Pemeriksaan Hari Ini

Barang A
Barang C
Barang E
```

---

# 40. DAILY CHECK REFRESH

The inspection context resets according to the calendar day.

Example:

```text
Friday
 ↓
Friday checklist

Saturday
 ↓
Saturday checklist
```

A completed Friday check does not automatically count as a Saturday check.

Each scheduled day represents a separate inspection occurrence.

Historical records must remain stored.

---

# 41. CHECK COMPLETION LOGIC

For each:

```text
product + date
```

the system determines whether an inspection has been submitted.

Conceptually:

```text
scheduled?
   │
   ├── NO → Do not show in today's check list
   │
   └── YES
        │
        ├── NOT SUBMITTED → Belum diperiksa
        │
        └── SUBMITTED → Sudah diperiksa
```

---

# 42. USER DASHBOARD CHECK STATUS

Dashboard can summarize:

```text
Pemeriksaan Hari Ini

3 dari 5 selesai

2 belum diperiksa
```

or:

```text
Semua pemeriksaan hari ini selesai ✓
```

The Dashboard should not become a complex analytics page.

Keep it focused on today's operational needs.

---

# 43. PRICE ALERT DATE LOGIC

Price changes displayed on Dashboard should be based on the relevant recent/current price-change event.

If there is no applicable price change for the current day:

```text
Hari ini tidak ada perubahan harga.
```

If there are changes:

```text
Perubahan Harga Hari Ini

🔴 Plastik HD 15×30
🟢 Cup 16oz
```

The detailed history remains available through product information/history functionality.

---

# 44. USER BUSINESS RULES

### BR-U01

User can only view products.

### BR-U02

User cannot access Master Data.

### BR-U03

User cannot modify product master data.

### BR-U04

User cannot see purchase/modal price.

### BR-U05

User can see selling price.

### BR-U06

Dashboard displays User's actual registered username.

### BR-U07

Dashboard displays price-change alerts.

### BR-U08

Dashboard price alert only displays product names.

### BR-U09

Price increase is represented by red product-name text.

### BR-U10

Price decrease is represented by green product-name text.

### BR-U11

No price change displays an appropriate empty state.

### BR-U12

Dashboard displays today's stock-check reminder.

### BR-U13

Today's check list is generated from Admin-defined inspection schedules.

### BR-U14

Stock Check values are stored as text.

### BR-U15

Stock Check does not automatically change official system stock.

### BR-U16

After submission, Stock Check is locked.

### BR-U17

User must request Admin approval to edit a submitted Stock Check.

### BR-U18

Each scheduled day creates a separate inspection occurrence.

### BR-U19

Historical inspections must remain accessible to Admin.

### BR-U20

User can access Profile.

---

# 45. DATABASE REQUIREMENTS FOR USER MODULE

The User module requires the following conceptual data.

---

## USERS

```text
users
────────────
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

# 46. PRODUCT INSPECTION SCHEDULE

Add inspection schedule information to the product architecture.

Possible design:

```text
product_inspection_schedules
──────────────────────────────
id
product_id
day_of_week
created_at
```

Example:

```text
product_id: A
day_of_week: MONDAY

product_id: A
day_of_week: WEDNESDAY

product_id: A
day_of_week: SATURDAY
```

This is preferable to storing all days as one uncontrolled string because it allows reliable querying.

---

# 47. STOCK CHECK TABLE

```text
stock_checks
────────────────────
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

Possible status:

```text
SUBMITTED
EDIT_REQUESTED
EDIT_APPROVED
EDIT_REJECTED
```

---

# 48. CHECK EDIT REQUEST

If the architecture separates requests from checks, use:

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

This allows the system to clearly track:

```text
User requested edit
↓
Admin reviewed
↓
Approved / Rejected
```

---

# 49. PRICE HISTORY

User does not modify price history.

User only consumes price-change data generated by Admin.

Existing structure:

```text
price_history
────────────────────
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

User-facing queries must only expose selling-price information.

---

# 50. USER DATA ACCESS

The User API/data query must be intentionally limited.

User product response should resemble:

```text
{
  id,
  name,
  sku,
  category,
  unit,
  stock,
  selling_price
}
```

Do NOT send:

```text
purchase_price
```

to the User frontend unless there is a deliberate security reason and strict server-side protection.

Prefer not exposing sensitive Admin-only fields at all.

---

# 51. ROLE-BASED ACCESS

Conceptually:

```text
                 APPLICATION
                      │
              ┌───────┴───────┐
              │               │
            ADMIN            USER
              │               │
       Full management      Limited
              │               │
              │        ┌──────┼──────┐
              │        │      │      │
              │      View    Check  Profile
              │      Item
```

Admin:

```text
CRUD
Price Update
Master Data
History
Export
```

User:

```text
View
Search
Check
Profile
```

---

# 52. USER FLOW

Main User flow:

```text
START
 ↓
LOGIN
 ↓
AUTHENTICATION
 ↓
DASHBOARD
 ↓
Choose Activity
```

Then:

```text
Dashboard
│
├── Price Alert
│     └── Open Barang
│
├── Check Reminder
│     └── Open Check
│
├── Barang
│     ├── Search
│     ├── View
│     └── Detail
│
├── Check
│     └── Pemeriksaan Stok
│
└── Profile
```

---

# 53. USER CHECK FLOW

```text
USER
 ↓
CHECK
 ↓
Current Day
 ↓
Scheduled Products
 ↓
Select Product
 ↓
Pemeriksaan Stok
 ↓
Input:
   Stok Sebelumnya
   Stok Sekarang
   Catatan
 ↓
Review
 ↓
Simpan
 ↓
LOCK
 ↓
Submitted
```

If an error occurs:

```text
Submitted
 ↓
Minta Edit
 ↓
Admin Approval
 ↓
Approved?
 ├── YES → Edit
 └── NO → Remains Locked
```

---

# 54. USER PRICE ALERT FLOW

```text
ADMIN
 ↓
UPDATE PRICE
 ↓
Version +1
 ↓
Price History
 ↓
Price Change Event
 ↓
USER DASHBOARD
 ↓
Show Product Name
 ↓
User opens Barang
 ↓
View detailed price change
```

Dashboard:

```text
🔴 Plastik HD 15×30
```

Product detail:

```text
Rp13.000 → Rp14.000
HARGA NAIK
```

---

# 55. USER EXPERIENCE PRINCIPLE

The User module should follow:

> **See what matters. Check what is scheduled. Submit once.**

User should not be overwhelmed by management features.

The application should make the User's daily workflow extremely simple:

```text
Login
 ↓
See today's alerts
 ↓
See today's checks
 ↓
Check products
 ↓
Submit
 ↓
Done
```

---

# 56. MOBILE-FIRST PWA DESIGN

The User module must prioritize mobile usage.

Use:

* Bottom navigation
* Large touch targets
* Sticky actions
* Bottom sheets where appropriate
* Compact cards
* Clear status badges
* Fast search
* Minimal navigation depth
* Offline-aware UI

Recommended bottom navigation:

```text
┌─────────────────────────────────┐
│                                 │
│          CONTENT                │
│                                 │
├─────────────────────────────────┤
│  🏠       📦       ✓       👤   │
│ Home    Barang   Check   Profile│
└─────────────────────────────────┘
```

---

# 57. USER DASHBOARD VISUAL HIERARCHY

Recommended order:

```text
1. Greeting
2. Price Change Alert
3. Today's Check Reminder
```

Example:

```text
Hi, Ahmad 👋

────────────────────────

🔔 PERUBAHAN HARGA

🔴 Plastik HD 15×30
🟢 Cup 16oz

────────────────────────

✓ PEMERIKSAAN BARANG

3 barang belum diperiksa

[ Periksa Sekarang ]
```

Do not add unnecessary analytics.

---

# 58. BARANG PAGE VISUAL HIERARCHY

```text
Barang

[ 🔍 Cari barang ]

────────────────

Plastik HD 15×30
Plastik · PCS

Rp14.000
120 PCS
```

User only sees selling price.

---

# 59. CHECK PAGE VISUAL HIERARCHY

```text
Pemeriksaan Barang

Sabtu, 05 September 2026

3 barang

────────────────

✓ / ○ Status

Plastik HD 15×30
Stok: 120 PCS

[ Periksa ]
```

After completion:

```text
✓ Sudah diperiksa
```

---

# 60. CHECK FORM UX

The form should be extremely simple.

```text
Pemeriksaan Stok

Plastik HD 15×30

Stok Sebelumnya
[................]

Stok Sekarang
[................]

Catatan
[................]

────────────────

[ Simpan Pemeriksaan ]
```

The primary CTA should be obvious.

---

# 61. AFTER SUBMISSION UX

Immediately show:

```text
✓ Pemeriksaan berhasil disimpan
```

Then:

```text
Pemeriksaan Terkunci

Data sudah dikirim dan tidak dapat
diubah secara langsung.

Ada kesalahan?

[ Minta Edit ]
```

This makes the rule clear.

---

# 62. EDIT REQUEST UX

The User should never wonder what happened to the request.

Statuses:

```text
Menunggu persetujuan Admin
```

```text
Permintaan edit disetujui
```

```text
Permintaan edit ditolak
```

Use clear status indicators.

---

# 63. EMPTY STATES

Price:

```text
Hari ini tidak ada perubahan harga.
```

Check:

```text
Tidak ada barang yang perlu diperiksa hari ini.
```

Completed:

```text
Semua pemeriksaan hari ini sudah selesai. ✓
```

History:

```text
Belum ada riwayat pemeriksaan.
```

---

# 64. ERROR HANDLING

Use friendly messages.

Example:

```text
Pemeriksaan belum berhasil disimpan.
Periksa koneksi dan coba lagi.
```

Do not expose raw technical errors.

---

# 65. OFFLINE PWA BEHAVIOR

The User module should be PWA-ready.

The application should support:

* Installable PWA
* App shell caching
* Offline awareness
* Cached product viewing where appropriate
* Clear sync state

However, stock-check submission must preserve data integrity.

If an inspection is created offline, the application must clearly indicate:

```text
Menunggu sinkronisasi
```

and only mark it as successfully submitted once synchronization is confirmed, unless the offline architecture explicitly guarantees durable local submission.

---

# 66. RESPONSIVE DESIGN

Mobile:

```text
Bottom Navigation
Cards
Bottom Sheets
Large Inputs
```

Desktop:

```text
Sidebar
Content Area
Table/List
```

Do not simply stretch the mobile interface onto desktop.

Create a proper responsive experience.

---

# 67. USER SECURITY

User must never be able to bypass the UI and directly modify protected data.

Security must be enforced at the backend/database layer.

Do not rely only on:

```text
if role === "USER"
```

in frontend code.

Use server/database authorization such as:

* Supabase Auth
* Row Level Security
* Protected routes
* Server-side validation

---

# 68. IMPORTANT SECURITY RULE

Purchase/modal price is Admin-only.

The User should not receive purchase price through normal User queries.

This is both a UI and backend data-access requirement.

---

# 69. DATA RELATIONSHIP

Conceptually:

```text
                    USER
                     │
                     │
                     ▼
                STOCK CHECK
                     │
                     │
                     ▼
                  PRODUCT
                     │
          ┌──────────┼──────────┐
          │          │          │
          ▼          ▼          ▼
       CATEGORY     UNIT     PRICE HISTORY
                                  │
                                  ▼
                              VERSION
```

Inspection schedule:

```text
PRODUCT
   │
   ▼
INSPECTION SCHEDULE
   │
   ├── Monday
   ├── Wednesday
   └── Saturday
```

---

# 70. DAILY CHECK RELATIONSHIP

The system should conceptually evaluate:

```text
Product
+
Inspection Schedule
+
Current Date
+
Existing Stock Check
```

to determine:

```text
Should this product appear today?
```

and:

```text
Has this product already been checked today?
```

---

# 71. ADMIN ↔ USER RELATIONSHIP

The final system relationship is:

```text
                    ADMIN
                      │
                      ▼
                 MASTER DATA
                      │
             ┌────────┼─────────┐
             │        │         │
             ▼        ▼         ▼
          PRODUCT    PRICE    SCHEDULE
             │        │         │
             │        │         │
             │        ▼         │
             │    PRICE ALERT   │
             │        │         │
             ▼        ▼         ▼
                   USER
                     │
          ┌──────────┼───────────┐
          │          │           │
          ▼          ▼           ▼
       DASHBOARD   BARANG      CHECK
          │          │           │
          │          │           ▼
          │          │      STOCK CHECK
          │          │           │
          │          │           ▼
          │          │        DATABASE
          │          │
          └──────────┴───────┐
                              │
                              ▼
                            ADMIN
                         (History)
```

---

# 72. FINAL USER MODULE STRUCTURE

The final User application should be:

```text
HAIDAR PLASTIK
│
├── 🏠 DASHBOARD
│   │
│   ├── Hi, Username
│   │
│   ├── Price Change Alert
│   │   ├── No change
│   │   └── Changed products
│   │
│   └── Check Reminder
│       ├── Not checked
│       └── All checked
│
├── 📦 BARANG
│   │
│   ├── Search
│   ├── Product List
│   └── Product Detail
│       └── Selling Price
│
├── ✓ CHECK
│   │
│   ├── Today's Date
│   ├── Scheduled Products
│   ├── Check Status
│   └── Stock Inspection
│       ├── Previous Stock
│       ├── Current Stock
│       └── Note
│
└── 👤 PROFILE
    │
    ├── User Information
    ├── Account
    └── Logout
```

---

# 73. FINAL USER BUSINESS MODEL

The User workflow must be summarized as:

```text
                    USER
                     │
                     ▼
                  LOGIN
                     │
                     ▼
                DASHBOARD
                     │
            ┌────────┴────────┐
            │                 │
            ▼                 ▼
       PRICE ALERT       CHECK REMINDER
            │                 │
            ▼                 ▼
         BARANG             CHECK
            │                 │
            ▼                 ▼
       VIEW PRICE       TODAY'S LIST
                              │
                              ▼
                         SELECT ITEM
                              │
                              ▼
                       STOCK INSPECTION
                              │
                              ▼
                            SAVE
                              │
                              ▼
                           LOCKED
                              │
                         ┌────┴────┐
                         │         │
                         ▼         ▼
                      DONE      REQUEST EDIT
                                   │
                                   ▼
                              ADMIN REVIEW
```

---

# 74. FINAL PRINCIPLES

The User module must follow these core principles:

```text
BARANG
= VIEW ONLY

HARGA
= SELLING PRICE ONLY

DASHBOARD
= SIMPLE ALERTS

PRICE ALERT
= PRODUCT NAME ONLY

PRICE INCREASE
= RED

PRICE DECREASE
= GREEN

CHECK
= DAILY SCHEDULED TASK

STOCK CHECK
= TEXTUAL OBSERVATION

SAVE CHECK
= LOCK

EDIT AFTER SAVE
= ADMIN APPROVAL REQUIRED

SYSTEM STOCK
= NOT AUTOMATICALLY CHANGED BY USER

PROFILE
= PERSONAL ACCOUNT
```

The User module must remain simple and operational.

The User should not feel like they are using an inventory-management backend.

Their primary daily experience should be:

> **Login → lihat apa yang berubah → lihat apa yang harus dicek → lakukan pemeriksaan → simpan → selesai.**

The Admin module remains the authoritative source for product data, price data, inspection schedules, and official system information.

---

# 75. OUTPUT FILE

Dokumen PRD User ini harus disimpan sebagai file:

```text
prd_user.md
```

Struktur file:

```text
prd_user.md
```

File tersebut berisi seluruh spesifikasi User Module Haidar Plastik Management PWA.
