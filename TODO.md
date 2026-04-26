# AgriBot Dashboard - Fix & Local Host Plan

## Information Gathered
- React-based AgriBot dashboard with 15+ components
- Uses Tailwind CSS, shadcn/ui patterns, recharts, next-themes, lucide-react
- All files are in a single `frontend/` folder with inconsistent naming
- Imports use `@/` aliases pointing to `src/` structure that doesn't exist
- Many UI component imports are missing entirely
- datahistory.jsx is empty
- No package.json, index.html, or build tooling

## Plan

### Step 1: Create Project Structure ✅
- Initialize Vite React project with proper folder structure
- Create package.json with all required dependencies
- Create index.html entry point
- Set up vite.config.js with path aliases
- Create necessary config files (jsconfig.json, postcss.config.js)

### Step 2: Fix File Names & Locations ✅
- Rename/move files to match import paths:
  - `Themeprovider.jsx` → `src/components/agribot/ThemeProvider.jsx`
  - `agribotnavbar.jsx` → `src/components/agribot/Navbar.jsx`
  - `cropselectore.jsx` → `src/components/agribot/CropSelector.jsx`
  - `monitoring cards.jsx` → `src/components/agribot/MonitoringCards.jsx`
  - `iriigationstatus.jsx` → `src/components/agribot/IrrigationStatus.jsx`
  - `notifications.jsx` → `src/components/agribot/Notifications.jsx`
  - `manual control.jsx` → `src/components/agribot/ManualControl.jsx`
  - `datahistory.jsx` → `src/components/agribot/DataHistory.jsx`
  - `Systemhealth.jsx` → `src/components/agribot/SystemHealth.jsx`
  - `weather wdiget.jsx` → `src/components/agribot/WeatherWidget.jsx`
  - `agribotcontent.jsx` → `src/contexts/AgriBotContext.jsx`
  - `mockdata.js` → `src/lib/agribot/mockData.js`
  - `dashboard.jsx` → `src/pages/Dashboard.jsx`
  - `app.js` → `src/App.jsx`
  - `app.css` → `src/App.css`
  - `index.css` → `src/index.css`
  - `tailwind.config.js` → `tailwind.config.js` (root)

### Step 3: Create Missing UI Components ✅
Create shadcn/ui-style components in `src/components/ui/`:
- button.jsx, dialog.jsx, dropdown-menu.jsx, avatar.jsx, tooltip.jsx
- input.jsx, label.jsx, select.jsx, scroll-area.jsx, progress.jsx, switch.jsx, sonner.jsx

### Step 4: Fix datahistory.jsx ✅
Create the DataHistory component with irrigation timeline display

### Step 5: Fix Import Paths in All Files ✅
Update all `@/` imports to work with the new structure

### Step 6: Install Dependencies & Test ✅
- Run npm install
- Run npm run dev to verify the app works
- App is running locally at http://localhost:5173/

