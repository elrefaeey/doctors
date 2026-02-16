# Quick Start - Doctor Profile Management

## 🚀 Deploy in 3 Steps

### Step 1: Deploy Rules
```bash
deploy-rules.bat
```
Wait for: "✔ Deploy complete!"

### Step 2: Build & Deploy Website
```bash
npm run build
firebase deploy --only hosting
```
Wait for: "✔ Deploy complete!"

### Step 3: Test
1. Go to your website
2. Login as doctor
3. Click "تعديل الملف الشخصي"
4. Upload photo and edit info
5. Click "حفظ التعديلات"

## ✅ Done!

Doctors can now:
- ✅ Upload profile photos
- ✅ Edit their information
- ✅ Manage working hours
- ✅ Request subscription upgrades

---

## 📱 Access Points

### For Doctors:
- Dashboard → "تحديث الملف" button (top banner)
- Dashboard → "الملف الشخصي" → "تعديل الملف الشخصي"
- Direct URL: `/doctor/settings`

### For Admins:
- Subscription requests appear in "طلبات الاشتراكات"
- Approve/reject upgrade requests

---

## 🔧 Troubleshooting

### "Missing permissions" error?
→ Run `deploy-rules.bat` again

### Photo not uploading?
→ Check file size (max 2MB)
→ Check format (JPG, PNG, GIF only)

### Changes not saving?
→ Check browser console (F12)
→ Verify internet connection

---

## 📚 Full Documentation

- `DOCTOR_PROFILE_MANAGEMENT.md` - Complete feature docs
- `دليل_نشر_ملف_الطبيب.md` - Arabic deployment guide
- `IMPLEMENTATION_DOCTOR_PROFILE.md` - Technical details
