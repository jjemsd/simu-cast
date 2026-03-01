# Data Preparation Module Redesign

## Overview
The Upload Dataset section has been redesigned into a structured Data Preparation module that supports multiple datasets (Real and Synthetic).

## Current Implementation Status
✅ File upload with validation
✅ Dataset name input
✅ Synthetic data generation option
✅ Success message showing both datasets
✅ Interactive file drop zone

## Planned Enhancements

### 1. Dataset Cards Interface
Replace the success message with selectable dataset cards:

**Real Dataset Card:**
- Radio button (top-left)
- "Active" badge (top-right when selected)
- Dataset name and filename (e.g., "csa.csv")
- Stats: Records, Quality, Uploaded date
- Actions: "Replace Upload" and "Remove" buttons

**Synthetic Dataset Card:**
- Similar layout to Real dataset card
- Shows "Derived from: Real Dataset"
- Stats: Records, Method (Gaussian Copula), Generated date
- Actions: "Regenerate" and "Remove" buttons

**Placeholder Card (when no synthetic):**
- Dashed border
- "Generate Synthetic Dataset" text
- "Generate" button

### 2. Active Dataset Indicator
Below the cards, show:
```
Active Dataset: [Real Dataset | Synthetic Dataset]
```

### 3. Replace Dataset Modal
- Title: "Replace Dataset?"
- Warning about resetting preview/cleaning/model results
- Checkbox: "Also delete synthetic dataset"
- Buttons: "Cancel" (ghost) and "Replace & Upload" (primary)

### 4. Dataset Selection Logic
- User can click radio button or card to select active dataset
- Show confirmation modal when switching between datasets
- Update all downstream sections to use the active dataset

### 5. Action Handlers Needed
```typescript
const handleSelectDataset = (type: 'Real' | 'Synthetic') => {
  // Show confirmation modal if already have data in other steps
  setActiveDatasetType(type);
};

const handleRemoveDataset = (type: 'Real' | 'Synthetic') => {
  // Remove dataset from appState.datasets
  // If removing Real, optionally remove Synthetic too
};

const handleReplaceDataset = () => {
  // Show replace modal
  // Allow new upload
  // Optionally delete synthetic
};

const handleGenerateSynthetic = () => {
  // Show synthetic generation form
  // Create new synthetic dataset
};

const handleRegenerateSynthetic = () => {
  // Regenerate synthetic dataset with new parameters
};
```

### 6. Data Structure
```typescript
const realDataset = appState.datasets.find(d => d.type === 'Real');
const syntheticDataset = appState.datasets.find(d => d.type === 'Synthetic');
const activeDataset = activeDatasetType === 'Real' ? realDataset : syntheticDataset;
```

## UI Implementation Notes

### Dataset Card Component
```tsx
<div className={`bg-white rounded-lg border-2 p-4 cursor-pointer transition-all ${
  isActive ? 'border-amber-500 shadow-md' : 'border-slate-200 hover:border-slate-300'
}`}>
  <div className="flex items-start justify-between mb-3">
    <div className="flex items-center gap-2">
      <input 
        type="radio" 
        checked={isActive}
        className="w-4 h-4 text-amber-500"
      />
      <h4 className="font-medium">{title}</h4>
    </div>
    {isActive && <Badge className="bg-amber-500">Active</Badge>}
  </div>
  
  {/* Stats grid */}
  <div className="grid grid-cols-3 gap-2 mb-3">
    {/* Stats boxes */}
  </div>
  
  {/* Action buttons */}
  <div className="flex gap-2">
    <Button variant="outline" size="sm">
      {/* Action icon */} {actionLabel}
    </Button>
    <Button variant="ghost" size="sm" className="text-destructive">
      <Trash2 size={16} /> Remove
    </Button>
  </div>
</div>
```

### Status Badge for Outdated Steps
When user changes dataset after cleaning/modeling:
```tsx
<Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
  Outdated – dataset changed
</Badge>
```

## Migration Path
1. Keep current upload form for initial upload
2. After first upload, show dataset cards interface
3. Allow users to manage multiple datasets
4. Track which dataset is active for each workflow step
5. Show warnings when switching datasets mid-workflow

## Benefits
- Clear visual indication of which dataset is active
- Easy switching between Real and Synthetic datasets
- Ability to replace or regenerate datasets without losing workflow progress
- Better dataset management UX
- Consistent with dashboard-style analytics platform
