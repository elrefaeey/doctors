# MedBook - Firebase-Powered Doctor Booking Platform

A fully dynamic, bilingual (English/Arabic) doctor booking platform powered 100% by Firebase with zero hardcoded data.

## 🌟 Features

- ✅ **100% Firebase-Powered** - All data from Firestore, no hardcoded content
- ✅ **Dynamic Content** - Doctors, appointments, translations all from database
- ✅ **Bilingual** - Full English and Arabic support with RTL
- ✅ **Role-Based Access** - Admin, Doctor, and Patient dashboards
- ✅ **Real-Time Updates** - Live data synchronization
- ✅ **Secure Authentication** - Firebase Authentication
- ✅ **Responsive Design** - Works on all devices
- ✅ **Empty Database Ready** - Shows empty states when database is empty

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed the Database
```bash
npm run seed
```

This populates Firestore with:
- Medical specializations
- Subscription plans
- UI translations (English & Arabic)

### 3. Update Security Rules
1. Go to [Firebase Console](https://console.firebase.google.com/project/doctor-20c9d)
2. Navigate to Firestore Database → Rules
3. Copy rules from `FIRESTORE_STRUCTURE.md`
4. Publish changes

### 4. Create Admin User
1. Go to Firebase Console → Authentication
2. Add user with email/password
3. Go to Firestore → `users` collection
4. Set `role: "admin"` for that user

### 5. Run the Application
```bash
npm run dev
```

Visit: `http://localhost:5173`

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - 5-minute setup guide
- **[FIRESTORE_STRUCTURE.md](FIRESTORE_STRUCTURE.md)** - Complete database schema
- **[FIREBASE_MIGRATION_GUIDE.md](FIREBASE_MIGRATION_GUIDE.md)** - Detailed setup instructions
- **[MIGRATION_COMPLETE.md](MIGRATION_COMPLETE.md)** - Migration summary

## 🗄️ Database Structure

### Firestore Collections

- `users` - All user accounts (patients, doctors, admins)
- `doctors` - Doctor profiles and details
- `appointments` - Appointment bookings
- `specializations` - Medical specializations
- `subscriptionPlans` - Pricing tiers (Silver, Gold, Verified)
- `translations` - UI translations (en, ar)
- `pendingRequests` - Doctor profile update requests
- `notifications` - User notifications
- `reviews` - Doctor reviews

## 🔐 Firebase Configuration

```javascript
Project ID: doctor-20c9d
Auth Domain: doctor-20c9d.firebaseapp.com
API Key: AIzaSyBYIxl2jeMTQzsPEg7-Zn5KcvJ_mvuOrds
```

## 👥 User Roles

### Admin
- Manage doctors (add, edit, delete)
- Approve/reject doctor profile updates
- Manage subscription plans
- View all appointments
- Access: `/admin/login`

### Doctor
- View and manage appointments
- Update profile (requires admin approval)
- View statistics
- Manage schedule
- Access: `/doctor/login`

### Patient
- Search and browse doctors
- Book appointments
- View appointment history
- Manage profile
- Access: `/login/patient`

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Firebase (Firestore + Authentication)
- **Routing**: React Router v6
- **Animations**: Framer Motion
- **Build Tool**: Vite
- **Language**: TypeScript

## 📦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run tests
npm run seed         # Seed Firestore database
```

## 🌐 Internationalization

Translations are stored in Firestore (`translations` collection) with documents:
- `en` - English translations
- `ar` - Arabic translations

The app automatically detects and applies RTL layout for Arabic.

## 🔒 Security

- Firestore security rules enforce role-based access
- Authentication required for protected routes
- Admin actions restricted to admin role
- Patient data protected by user ownership rules

## 📱 Responsive Design

- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interfaces
- Adaptive layouts

## 🎨 UI Components

Built with shadcn/ui components:
- Forms, dialogs, dropdowns
- Cards, badges, buttons
- Navigation, tabs, accordions
- Toast notifications
- And more...

## 🚨 Important Notes

### No Hardcoded Data
- All data comes from Firebase Firestore
- No mock data exists in the codebase
- Empty database shows empty states (expected behavior)
- Admin must populate initial data

### First-Time Setup
1. Run seeding script
2. Update security rules
3. Create admin user manually
4. Use admin dashboard to add doctors

### Translations
- Stored in Firestore, not code
- Can be updated without redeployment
- Cached on client for performance

## 🐛 Troubleshooting

### "No doctors found"
→ Use admin dashboard to add doctors

### "Permission denied"
→ Update Firestore security rules from documentation

### "Translations not loading"
→ Run `npm run seed` again

### "Can't add doctors as admin"
→ Verify user has `role: "admin"` in Firestore

## 📈 Performance

- Optimized Firestore queries
- Data denormalization for speed
- Loading states for async operations
- Translation caching
- Code splitting

## 🔄 Development Workflow

1. Make changes locally
2. Test with `npm run dev`
3. Build with `npm run build`
4. Deploy to Firebase Hosting (optional)

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. Contact the project owner for contribution guidelines.

## 📞 Support

For issues or questions:
1. Check documentation files
2. Review Firebase Console
3. Check browser console for errors
4. Verify Firestore security rules

## ✅ Verification Checklist

- [ ] Dependencies installed
- [ ] Database seeded
- [ ] Security rules updated
- [ ] Admin user created
- [ ] Can login as admin
- [ ] Can add doctors
- [ ] Doctors appear in search
- [ ] Can create patient account
- [ ] Can book appointments

## 🎯 Project Status

✅ Migration to Firebase complete
✅ All hardcoded data removed
✅ Dynamic content management
✅ Bilingual support
✅ Role-based access control
✅ Production ready

---

**Built with ❤️ using React, TypeScript, and Firebase**
