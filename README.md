# 🎁 Psychopomp - Personal Love App

A beautiful, interactive web application built with Next.js 14 and Supabase, featuring personalized experiences for loved ones.

## ✅ Build Status

**Last Build:** Success ✓  
**Vercel Ready:** Yes ✓  
**ESLint Errors:** 0  
**Build Warnings:** 60+ (non-critical)

---

## ✨ Features

### 🏠 Landing & Authentication
- Animated landing page with purple gradient theme
- Custom login system (username + birthday)
- Session management with localStorage
- Protected routes

### 📅 Diary - Personal Journal & Planning
Full-featured diary with multiple views:
- **Calendar of Us**: Interactive calendar with events (Memory, Photo, Message, Birthday, Special)
- **Daily Journal**: Daily todo lists, mood tracking, reflections, photo of the day
- **Monthly Planner**: Focus themes, goals, priorities, habit tracker, gratitude list
- **Timeline**: Chronological event view with filters
- **Book View**: Aesthetic scrapbook-style layout
- **Highlights**: Featured special moments
- Photo & audio attachments
- Search and filter functionality
- Beautiful animations with Framer Motion

### 🎵 Music Library
- Upload and manage music collection
- Search by title or artist
- Sort options: Date, Title, Artist, Duration, Size, Manual
- Drag-and-drop manual ordering
- Edit song metadata
- Audio playback with progress bar
- Custom notification modals
- Portal-based UI for proper z-index layering

### 📸 Photobooth
- 4 template options (Buzz Lightyear theme):
  - Single Photo (1 photo)
  - Stamp Template (2 photos)
  - Polaroid 1 (1 photo)
  - Polaroid 4 (4 photos vertical)
- Real-time camera feed
- Photo preview with thumbnails
- 12px rounded corners on all photos
- Download as JPEG with high quality
- Auto-save to Memories gallery

### 🖼️ Memories Gallery
- Grid layout with masonry effect
- Filter by date range
- View full-size images
- Download individual photos
- Animated loading states

### 🎁 Surprise Page
- Interactive flower animation (tap to grow)
- Love letter in envelope with open animation
- Personalized message reveal
- Beautiful particle effects
- Romantic music background

### 🧩 Puzzle Game
- Image-based jigsaw puzzle
- Drag-and-drop pieces
- Victory animation
- Random piece positioning

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Authentication:** Custom (Supabase RLS)
- **Animation:** Framer Motion
- **Icons:** Emoji-based

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Setup

1. **Clone repository:**
```bash
git clone <your-repo-url>
cd project
```

2. **Install dependencies:**
```bash
npm install
```

3. **Environment variables:**

Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

4. **Database setup:**

Run SQL migrations in `database/` folder (in order):
```bash
# 1. Core tables
database/planner_tables.sql          # Daily journals, monthly planners, habits
database/setup_calendar_events.sql   # Calendar events
database/setup_music_table.sql       # Music library
database/add_manual_order_to_music.sql

# 2. Policies & fixes
database/fix_rls_policies.sql        # Row level security
database/fix_month_format.sql        # Fix date formats

# 3. Storage buckets
database/setup_storage.sql           # Setup storage buckets
```

Or run all at once in Supabase SQL Editor.

See `STORAGE_SETUP.md` for storage bucket configuration.

5. **Run development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
project/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Landing page
│   ├── login/               # Login page
│   ├── home/                # Home page
│   ├── diary/               # Diary/Calendar feature
│   │   ├── CalendarOfUs.tsx
│   │   ├── tabs/            # Timeline, Book, Highlights
│   │   └── components/      # Event modals, pickers
│   ├── music/               # Music library
│   ├── camera/              # Camera features
│   │   ├── photobooth/      # Photobooth templates
│   │   └── puzzle/          # Puzzle game
│   ├── memories/            # Photo gallery
│   └── surprise/            # Surprise page
├── lib/
│   ├── auth/                # Authentication logic
│   └── supabase/            # Supabase client
├── database/                # SQL migrations
├── public/                  # Static assets
│   ├── buzz/                # Buzz Lightyear images
│   ├── body_box/            # Body box decorations
│   └── *.png                # Templates & assets
└── .env.local               # Environment variables (not in git)
```

---

## 🗄️ Database Schema

### Tables:
- **profiles** - User profiles (username, birthday, display_name)
- **calendar_events** - Calendar events with photos, audio, music
- **daily_journals** - Daily todo, mood tracking, reflections, photos
- **monthly_planners** - Monthly goals, priorities, focus themes, gratitude
- **habit_tracker** - Habit tracking by month
- **music** - Music library with metadata

### Storage Buckets:
- **diary-images** - Event photos, daily journal photos, and memories
- **diary-music** - Audio recordings and music files

See `STORAGE_SETUP.md` for detailed configuration.

---

## 🎨 Design Features

### Color Scheme:
- Purple gradients (primary)
- Blue accents
- White/transparent overlays
- Glass morphism effects

### Animations:
- Framer Motion for smooth transitions
- Hover effects on interactive elements
- Loading states with spinners
- Success/error notifications with Portal rendering

### Responsive:
- Mobile-first design
- Adaptive layouts
- Touch-friendly controls
- Works on all screen sizes

---

## 🔒 Security

- ✅ Environment variables for credentials
- ✅ Row Level Security (RLS) enabled
- ✅ `.env.local` in `.gitignore`
- ✅ No hardcoded secrets in code
- ✅ Public read with RLS policies
- ✅ Secure authentication flow

---

## 🚀 Deployment

### Vercel (Recommended):
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy automatically

### Environment Variables in Vercel:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## 📝 Recent Updates

### Latest (2026-08-16): 🐛 Diary Bug Fixes
- ✅ Fixed Daily Journal photo upload (now uses `diary-images` bucket)
- ✅ Fixed Monthly Planner 406 errors (proper date format)
- ✅ Auto-save after photo upload completion
- ✅ Added error handling and loading states
- ✅ Storage setup documentation
- ✅ SQL script to fix existing data format
- 📖 See `DIARY_BUG_FIXES.md` for detailed information

### Previous (2026-08-12):
- ✅ Enhanced music page notifications (custom modals)
- ✅ Added 12px border-radius to photobooth photos
- ✅ Portal rendering for z-index fixes
- ✅ Removed backup files from repository
- ✅ Security audit passed (no hardcoded secrets)

### Previous:
- Music library with drag-drop ordering
- Calendar search and filter
- Photobooth with 4 templates
- Surprise page with animations
- Memory gallery with date filter

---

## 🐛 Known Issues

None currently! 🎉

**Fixed Issues:**
- ✅ Daily Journal photo upload (Fixed: 2026-08-16)
- ✅ Monthly Planner 406 errors (Fixed: 2026-08-16)
- ✅ Data not saving properly (Fixed: 2026-08-16)

See `DIARY_BUG_FIXES.md` for troubleshooting guide.

---

## 📄 License

Private project - Not for public use

---

## 👤 Author

Personal project for loved ones ❤️

---

## 🙏 Acknowledgments

- Next.js team for amazing framework
- Supabase for backend infrastructure
- Framer Motion for smooth animations
- Tailwind CSS for styling
#   j o e l  
 