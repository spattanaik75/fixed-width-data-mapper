# ICE Data Mapper UI - User Guide

## 🚀 New Features Added

### 1. Add/Edit/Delete Field Mappings
- Click **"Add Field"** button in the mapper editor to create new field mappings
- Click the **Edit** icon (pencil) on any field row to modify it
- Click the **Delete** icon (trash) on any field row to remove it
- Modal dialog with validation ensures data integrity

### 2. Toast Notifications
- Success notifications for completed actions (green)
- Error notifications for failed operations (red)
- Info notifications for general messages (blue)
- Auto-dismiss after 3 seconds

### 3. Local Storage & Session Persistence
- Auto-saves your work every 2 seconds after changes
- Session restored on page refresh (if < 24 hours old)
- Prompt to resume previous session on startup
- All mappings, records, and state preserved

### 4. Help Panel
- Collapsible help section in the sidebar
- Quick start guide
- Field type descriptions
- Keyboard shortcuts
- Validation rules explained

## 📁 Sample Data Files

Two sample files are included for testing:

1. **SRV.mapper.csv** - 188 field mappings for fixed-width format
2. **sample_data.txt** - 3 sample records (Vodafone, BP, HSBC)

## 🎯 How to Use

### Getting Started
1. Open [http://localhost:5173](http://localhost:5173)
2. If you have a previous session, you'll be prompted to restore it
3. Upload your mapper CSV file (or use sample: `public/sample-data/SRV.mapper.csv`)
4. Upload your data file (or use sample: `public/sample-data/sample_data.txt`)

### Working with Fields
1. **View Mappings**: All fields displayed in sortable table
2. **Search**: Use the search bar to filter by field name, value, or description
3. **Add Field**: Click "Add Field" button, fill in the form, save
4. **Edit Field**: Click edit icon on any row, modify values, save
5. **Delete Field**: Click delete icon, confirm deletion

### Validation
- Automatic validation runs after any change
- Errors/warnings shown in the validation panel
- Click error messages to highlight the problematic field
- Export validation report as CSV

### Export Options
- **Mapper CSV**: Export field mappings
- **Mapper Excel**: Export mappings to .xlsx
- **Data CSV**: Export parsed records
- **Validation Report**: Export errors/warnings
- **Export All**: Download all files as .zip

### Keyboard Shortcuts
- `Enter` - Search (when in search box)
- `Escape` - Clear search
- `Ctrl/⌘ + S` - Auto-save trigger

## 🛠️ Development

### Run Dev Server
```bash
cd ice-data-mapper-ui
npm install
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📊 Field Types

- **CHR**: Character/String field
- **FCV**: Numeric value (prices, amounts)
- **FCD**: Date field (YYYYMMDD format)
- **FCR**: Record identifier
- **NUM**: General numeric field
- **SED**: SEDOL code

## ✅ Features Completed

- [x] File upload (mapper & data)
- [x] Fixed-width parsing with auto-detection
- [x] Field mapping editor with CRUD operations
- [x] Data viewer with pagination
- [x] Search functionality
- [x] Validation (overlaps, gaps, empty fields)
- [x] Export to CSV, Excel
- [x] Toast notifications
- [x] Local storage persistence
- [x] Help panel with instructions
- [x] Sample data files

## 🐛 Known Issues

None at this time. Please report any issues found during testing.

## 📝 TODO

- [ ] Undo/redo functionality
- [ ] Dark mode toggle
- [ ] Compare two mapper versions
- [ ] Bulk edit fields
- [ ] Import mapper from Excel
- [ ] Share mapper via URL

## 📞 Support

For issues or questions, please check the Help panel in the application or review the source code in:
- `src/components/` - UI components
- `src/composables/` - State management
- `src/utils/` - Parser utilities
