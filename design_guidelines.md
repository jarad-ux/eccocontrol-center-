# Go Ecco Climate Control - Design Guidelines

## Design Approach
**System-Based Approach** - Drawing from modern B2B SaaS applications like Linear, Notion, and Stripe's dashboard design. This is a utility-focused enterprise tool prioritizing clarity, efficiency, and data hierarchy over visual flair.

## Core Design Principles
1. **Clarity First**: Forms and data must be instantly scannable
2. **Efficient Data Entry**: Minimize friction for field sales reps entering data on-the-go
3. **Role-Based Hierarchy**: Clear visual distinction between admin and rep capabilities
4. **Professional Trust**: Enterprise-grade polish that instills confidence

---

## Typography

**Font Family**: DM Sans (already in use) - modern, legible, professional
- Primary headings: 600-700 weight
- Body text: 400-500 weight
- Labels/metadata: 500 weight
- Small text: 400 weight

**Scale**:
- Page titles: 24-28px, weight 700
- Section headers: 18-20px, weight 600
- Card titles: 16px, weight 600
- Body/Form labels: 14px, weight 500
- Input text: 14px, weight 400
- Metadata/timestamps: 12px, weight 400
- Helper text: 11px, weight 400

---

## Layout System

**Spacing Units**: Use Tailwind spacing - consistently apply 4, 8, 16, 24, 32, 48 for margins and padding
- Component internal spacing: 8-16px
- Between sections: 24-32px
- Page margins: 32px
- Form field gaps: 16px
- Card padding: 24-32px

**Container Widths**:
- Main content: max-width 1200px, centered
- Forms: max-width 800px
- Narrow content: max-width 600px

**Grid System**:
- Dashboard stats: 4-column grid on desktop, 2-column tablet, 1-column mobile
- Form fields: 2-column layout where appropriate (side-by-side inputs)
- Data tables: Full-width with horizontal scroll on mobile

---

## Component Library

### Navigation & Header
- Fixed header with company logo/branding on left
- Horizontal tab navigation (Dashboard, New Sale, Settings)
- User profile with role indicator and sign-out on right
- Height: 64-72px
- Subtle bottom border for separation

### Dashboard Components
**Stat Cards**:
- 4-column grid displaying key metrics
- Large prominent number (24-32px, weight 700)
- Descriptive label below (12px, muted)
- Subtle background treatment (slightly lighter than page background)
- Rounded corners (8-12px)
- Padding: 24px

**Recent Sales Table**:
- Clean data table with column headers
- Alternating row background for readability
- Status indicators (colored badges/pills)
- Timestamp formatting
- Actions column (view/edit icons)
- Horizontal scroll on mobile

**Action Buttons**:
- Primary CTA: Green gradient background (#10b981 to #059669)
- Secondary: Transparent with border
- Tertiary: Text only with subtle hover
- Consistent height: 40-44px
- Border radius: 8px
- Font: 14px, weight 600

### Forms (Sales Entry)
**Form Structure**:
- Organized into logical sections with clear headings
- Section dividers or subtle background blocks
- Two-column layout for related fields (e.g., First/Last Name)
- Full-width for address, notes, longer inputs
- Consistent vertical rhythm between fields

**Input Fields**:
- Height: 44px (comfortable for mobile/touch)
- Border radius: 8px
- Border: 1px solid (subtle)
- Background: Slightly lighter than page for contrast
- Focus state: Border color change + subtle glow
- Label above input (not floating)
- Helper text below when needed (11px, muted)
- Error state: Red border + error text below

**Dropdowns/Selects**:
- Match input field styling
- Clear dropdown indicator
- Options list with hover states
- Search capability for long lists

**Form Actions**:
- Fixed or sticky footer with Submit/Cancel
- Submit button prominent (green gradient)
- Cancel button secondary (transparent/border)
- Clear spacing between actions

### Settings Panel
**Configuration Cards**:
- Each integration/service in its own card
- Card header with service name and status indicator
- Input fields for API keys, URLs
- "Test Connection" buttons where applicable
- Save button per section or global save at bottom

### Data Display
**Tables**:
- Header row with sorting indicators
- Cell padding: 12px vertical, 16px horizontal
- Borders: Subtle row separators
- Hover state on rows
- Empty state messaging when no data

**Badges/Status Indicators**:
- Small rounded pills for status (8px border radius)
- Color-coded (green for synced, yellow for pending, etc.)
- Padding: 4px 8px
- Font: 11px, weight 500

---

## Visual Treatment

**Color Strategy** (maintain existing):
- Page background: Very dark (#0f172a)
- Card/panel background: Dark slate (#1e293b)
- Borders: Lighter slate (#334155)
- Primary text: Near white (#f1f5f9)
- Secondary text: Medium gray (#94a3b8)
- Muted text: Gray (#64748b)
- Accent/Primary actions: Green gradient (#10b981, #059669)
- Success states: Green
- Error states: Red (#dc2626)
- Warning states: Amber

**Elevation/Depth**:
- Subtle borders instead of heavy shadows
- Layered backgrounds (page → card → input creates depth through color)
- No drop shadows (maintains flat, modern aesthetic)

**Border Radius**:
- Small elements (inputs, badges): 8px
- Medium (cards, buttons): 8-12px
- Large (modals, major containers): 16px
- Logo/avatar: 10-16px

---

## Interactions & States

**Minimal Animations** - This is a productivity tool:
- Button hover: Slight opacity change (0.9)
- Input focus: Smooth border color transition (150ms)
- Page transitions: None or instant
- Loading states: Simple spinner, no elaborate animations
- Toast notifications: Slide in from top-right, auto-dismiss

**Feedback**:
- Success: Green toast notification
- Error: Red toast notification
- Loading: Disabled state on buttons with "Loading..." text
- Form validation: Inline error messages below fields

---

## Responsive Behavior

**Breakpoints**:
- Mobile: < 640px (single column, stacked layouts)
- Tablet: 640-1024px (2-column grids where appropriate)
- Desktop: > 1024px (full multi-column layouts)

**Mobile Optimizations**:
- Larger touch targets (min 44px)
- Simplified navigation (hamburger menu if needed)
- Stacked form layouts
- Horizontal scroll tables with sticky first column
- Bottom navigation for primary actions

---

## Accessibility

- High contrast ratios (light text on dark background meets WCAG AA)
- Focus indicators visible on all interactive elements
- Semantic HTML structure
- Proper label associations for all form inputs
- Keyboard navigation support
- Screen reader friendly status messages