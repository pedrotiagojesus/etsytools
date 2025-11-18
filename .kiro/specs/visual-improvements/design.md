# Design Document

## Overview

This design document outlines the comprehensive visual improvements for the EstyTOOLS application. The improvements focus on creating a modern, accessible, and user-friendly interface while maintaining the existing functionality. The design follows Bootstrap 5 conventions and leverages React hooks for state management.

The improvements are organized into several key areas:
- Theme system (light/dark mode)
- Enhanced footer and navigation
- Toast notification system
- Tooltip system for better UX
- Responsive design optimizations
- Animation and micro-interactions
- Input validation feedback
- Loading states and skeleton screens
- Improved typography and visual hierarchy

## Architecture

### Component Structure

```
src/
├── components/
│   ├── Header/
│   │   ├── Header.tsx (enhanced with icons and theme toggle)
│   │   └── Header.css
│   ├── Footer/
│   │   ├── Footer.tsx (new implementation)
│   │   └── Footer.css
│   ├── Toast/
│   │   ├── ToastContainer.tsx (new)
│   │   ├── Toast.tsx (new)
│   │   └── Toast.css
│   ├── Tooltip/
│   │   ├── Tooltip.tsx (new)
│   │   └── Tooltip.css
│   ├── Breadcrumb/
│   │   ├── Breadcrumb.tsx (new)
│   │   └── Breadcrumb.css
│   └── LoadingSpinner/
│       ├── LoadingSpinner.tsx (new)
│       └── LoadingSpinner.css
├── contexts/
│   ├── ThemeContext.tsx (new)
│   └── ToastContext.tsx (new)
├── hooks/
│   ├── useTheme.ts (new)
│   ├── useToast.ts (new)
│   └── useMediaQuery.ts (new)
├── assets/
│   └── css/
│       ├── theme.css (enhanced)
│       ├── variables.css (new)
│       └── animations.css (new)
└── utils/
    └── validation.ts (new)
```


### State Management

The application will use React Context API for global state management of:
- Theme preferences (light/dark mode)
- Toast notifications queue
- Loading states

Local component state will be managed using React hooks (useState, useEffect, useReducer where appropriate).

### Data Flow

1. **Theme System**: ThemeContext provides theme state and toggle function to all components
2. **Toast System**: ToastContext manages a queue of notifications with auto-dismiss timers
3. **Validation**: Input components validate on change and display immediate feedback
4. **Responsive Behavior**: useMediaQuery hook detects breakpoints and triggers layout changes

## Components and Interfaces

### 1. Theme System

#### ThemeContext

```typescript
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}
```

**Responsibilities:**
- Detect system theme preference on initial load
- Persist theme preference to localStorage
- Apply theme class to document root
- Provide theme state and toggle function to all components

**Implementation Details:**
- Uses `window.matchMedia('(prefers-color-scheme: dark)')` for system detection
- Stores preference in `localStorage` with key `'estytools-theme'`
- Applies `data-bs-theme="dark"` or `data-bs-theme="light"` to `<html>` element
- Listens for system theme changes and updates if user hasn't set preference


#### useTheme Hook

```typescript
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

### 2. Toast Notification System

#### ToastContext

```typescript
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: Toast['type'], duration?: number) => void;
  removeToast: (id: string) => void;
}
```

**Responsibilities:**
- Manage queue of active toast notifications
- Auto-dismiss toasts after specified duration (default 5000ms)
- Provide methods to add and remove toasts
- Limit maximum number of visible toasts (max 3)

**Implementation Details:**
- Uses `useReducer` for toast queue management
- Generates unique IDs using `crypto.randomUUID()` or timestamp fallback
- Positions toasts in top-right corner with fixed positioning
- Stacks toasts vertically with 8px gap
- Implements slide-in animation from right


#### Toast Component

```typescript
interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: (id: string) => void;
}
```

**Visual Design:**
- Width: 320px
- Padding: 16px
- Border-radius: 8px
- Box-shadow: 0 4px 12px rgba(0,0,0,0.15)
- Background colors:
  - Success: #d1e7dd (light) / #0f5132 (dark)
  - Error: #f8d7da (light) / #842029 (dark)
  - Warning: #fff3cd (light) / #664d03 (dark)
  - Info: #cff4fc (light) / #055160 (dark)
- Includes icon (Bootstrap Icons) and close button
- Slide-in animation from right (300ms ease-out)
- Fade-out animation on dismiss (200ms ease-in)

### 3. Tooltip System

#### Tooltip Component

```typescript
interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}
```

**Responsibilities:**
- Display contextual help text on hover
- Position tooltip relative to trigger element
- Handle viewport boundary detection
- Support keyboard navigation (show on focus)

**Implementation Details:**
- Uses CSS positioning with `position: absolute`
- Calculates position using `getBoundingClientRect()`
- Shows after 200ms delay (configurable)
- Hides after 200ms delay when mouse leaves
- Arrow pointer points to trigger element
- Max-width: 250px with text wrapping
- Z-index: 1070 (above most content, below modals)


### 4. Enhanced Header Component

**New Features:**
- Theme toggle button with sun/moon icon
- Bootstrap Icons for navigation items
- Improved mobile menu with smooth transitions
- Active state highlighting for current route

**Icon Mapping:**
- Calculadora: `bi-calculator`
- Gerador do Produto: `bi-box-seam`
- Mockup: `bi-image`

**Theme Toggle Button:**
- Position: Right side of navbar, before navigation items
- Icon: `bi-sun-fill` (light mode) / `bi-moon-fill` (dark mode)
- Smooth rotation animation on toggle (180deg, 300ms)
- Accessible label for screen readers

### 5. Enhanced Footer Component

**Content Structure:**
```
┌─────────────────────────────────────────────────┐
│  EstyTOOLS © 2024 | Version 1.0.0              │
│  Links: Documentation | Support | GitHub        │
└─────────────────────────────────────────────────┘
```

**Styling:**
- Background: Light gray (#f8f9fa) in light mode, dark gray (#212529) in dark mode
- Padding: 24px vertical, 16px horizontal
- Border-top: 1px solid border color
- Text alignment: Center
- Font size: 14px
- Links with hover effect (color transition 200ms)

### 6. Breadcrumb Component

```typescript
interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}
```

**Behavior:**
- Automatically generated from current route
- Hidden on home page
- Last item is not clickable (current page)
- Separator: `/` or `bi-chevron-right` icon
- Responsive: Collapses to "..." on mobile for long paths


### 7. Loading States

#### LoadingSpinner Component

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  overlay?: boolean;
}
```

**Variants:**
- Small (16px): Inline loading indicators
- Medium (32px): Default size for content areas
- Large (48px): Full-page loading

**Overlay Mode:**
- Semi-transparent backdrop (rgba(255,255,255,0.8) light / rgba(0,0,0,0.8) dark)
- Centered spinner
- Prevents interaction with underlying content
- Accessible loading announcement for screen readers

#### Skeleton Screens

Used for Calculator page initial load:
- Mimics table structure with gray rectangles
- Pulsing animation (1.5s ease-in-out infinite)
- Maintains layout to prevent content shift

### 8. Responsive Design

#### Breakpoints (Bootstrap 5 standard)
- xs: < 576px
- sm: ≥ 576px
- md: ≥ 768px
- lg: ≥ 992px
- xl: ≥ 1200px
- xxl: ≥ 1400px

#### Calculator Page Responsive Behavior

**Desktop (≥ 768px):**
- Two-column layout (8-4 grid)
- Tables display normally

**Mobile (< 768px):**
- Single column layout
- Tables transform to card-based layout
- Each row becomes a card with label-value pairs
- Improved touch targets (minimum 44x44px)

**Card Layout Structure:**
```
┌─────────────────────────┐
│ Label                   │
│ [Input Field]           │
└─────────────────────────┘
```


### 9. Input Validation

#### Validation Rules

**Price Fields:**
- Must be non-negative
- Maximum 2 decimal places
- Maximum value: 999999.99

**Discount Field:**
- Must be between 0 and 100
- Integer values only

**Validation States:**
- Valid: Green border (#198754)
- Invalid: Red border (#dc3545)
- Neutral: Default border

#### Validation Component

```typescript
interface ValidationFeedbackProps {
  isValid: boolean;
  message?: string;
}
```

**Visual Feedback:**
- Border color change (200ms transition)
- Icon indicator (checkmark or X)
- Error message below input (fade-in 150ms)
- Error message color matches border
- Font size: 12px

### 10. Animations and Transitions

#### CSS Variables for Animations

```css
:root {
  --transition-fast: 150ms;
  --transition-base: 200ms;
  --transition-slow: 300ms;
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0.0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
}
```

#### Animation Specifications

**Page Transitions:**
- Fade effect: opacity 0 → 1
- Duration: 300ms
- Easing: ease-out

**Hover Effects:**
- Color transitions: 200ms ease-in-out
- Scale on buttons: scale(1.02)
- Box-shadow on cards: 200ms ease-out

**Value Changes (Calculator):**
- Highlight flash: background color pulse
- Duration: 500ms
- Color: rgba(primary, 0.2) → transparent

**Respect User Preferences:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```


## Data Models

### Theme Preference

```typescript
type Theme = 'light' | 'dark' | 'system';

interface ThemePreference {
  theme: Theme;
  lastUpdated: number;
}
```

Stored in localStorage as JSON string with key `'estytools-theme'`.

### Toast Notification

```typescript
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
  timestamp: number;
}
```

### Validation Result

```typescript
interface ValidationResult {
  isValid: boolean;
  message?: string;
}

type ValidatorFunction = (value: any) => ValidationResult;
```

## Error Handling

### Toast Notifications for Errors

All user-facing errors should be displayed using the toast system:
- API errors: "Erro ao processar pedido. Tente novamente."
- Validation errors: Specific field-level messages
- Network errors: "Sem conexão à internet. Verifique sua rede."

### Graceful Degradation

- If localStorage is unavailable, theme defaults to system preference
- If animations cause performance issues, respect prefers-reduced-motion
- If toast system fails, fall back to console.error

### Error Boundaries

Implement React Error Boundary for component-level error handling:
- Catch rendering errors
- Display user-friendly error message
- Log error details to console
- Provide "Reload" button


## Testing Strategy

### Unit Tests

**Components to Test:**
- ThemeContext: theme toggle, persistence, system detection
- ToastContext: add/remove toasts, auto-dismiss, queue management
- Tooltip: positioning, show/hide behavior, keyboard navigation
- Validation utilities: all validation rules

**Testing Tools:**
- React Testing Library for component tests
- Jest for unit tests
- Mock localStorage and matchMedia APIs

### Integration Tests

**Scenarios:**
- Theme toggle updates all components
- Toast notifications appear and dismiss correctly
- Form validation prevents invalid submissions
- Responsive layout changes at breakpoints

### Visual Regression Tests

- Screenshot comparison for theme switching
- Layout verification at different breakpoints
- Animation state verification

### Accessibility Tests

**Requirements:**
- All interactive elements keyboard accessible
- ARIA labels for icon-only buttons
- Color contrast meets WCAG AA standards
- Screen reader announcements for dynamic content
- Focus indicators visible and clear

**Tools:**
- axe-core for automated accessibility testing
- Manual keyboard navigation testing
- Screen reader testing (NVDA/JAWS)

### Performance Tests

**Metrics:**
- Theme toggle response time < 100ms
- Toast animation smooth (60fps)
- Page transition < 300ms
- No layout shift during loading


## Design System

### Color Palette

#### Light Theme
```css
--primary: #0d6efd;
--secondary: #6c757d;
--success: #198754;
--danger: #dc3545;
--warning: #ffc107;
--info: #0dcaf0;
--light: #f8f9fa;
--dark: #212529;
--background: #ffffff;
--surface: #f8f9fa;
--text-primary: #212529;
--text-secondary: #6c757d;
--border: #dee2e6;
```

#### Dark Theme
```css
--primary: #0d6efd;
--secondary: #6c757d;
--success: #198754;
--danger: #dc3545;
--warning: #ffc107;
--info: #0dcaf0;
--light: #343a40;
--dark: #f8f9fa;
--background: #212529;
--surface: #343a40;
--text-primary: #f8f9fa;
--text-secondary: #adb5bd;
--border: #495057;
```

### Typography Scale

```css
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.25rem;    /* 20px */
--font-size-xl: 1.5rem;     /* 24px */
--font-size-2xl: 2rem;      /* 32px */

--font-weight-normal: 400;
--font-weight-medium: 600;
--font-weight-bold: 700;

--line-height-tight: 1.25;
--line-height-base: 1.5;
--line-height-relaxed: 1.75;
```

### Spacing Scale

```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
```

### Border Radius

```css
--radius-sm: 0.25rem;    /* 4px */
--radius-md: 0.5rem;     /* 8px */
--radius-lg: 1rem;       /* 16px */
--radius-full: 9999px;   /* Fully rounded */
```

### Shadows

```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
--shadow-xl: 0 20px 25px rgba(0,0,0,0.15);
```


## Implementation Notes

### Browser Compatibility

- Target: Modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
- CSS features: CSS Grid, Flexbox, CSS Variables, color-mix()
- JavaScript features: ES6+, async/await, optional chaining
- Fallbacks for older browsers not required

### Performance Considerations

1. **CSS Optimization:**
   - Use CSS variables for theme switching (no class recalculation)
   - Minimize repaints with transform/opacity animations
   - Use will-change sparingly for animations

2. **JavaScript Optimization:**
   - Debounce validation checks (300ms)
   - Memoize expensive calculations
   - Use React.memo for pure components
   - Lazy load non-critical components

3. **Asset Optimization:**
   - Use Bootstrap Icons (already included)
   - No additional icon libraries needed
   - Minimize custom CSS by leveraging Bootstrap utilities

### Accessibility Guidelines

1. **Keyboard Navigation:**
   - All interactive elements must be keyboard accessible
   - Logical tab order
   - Visible focus indicators
   - Escape key closes modals/tooltips

2. **Screen Readers:**
   - Semantic HTML elements
   - ARIA labels for icon-only buttons
   - Live regions for dynamic content (toasts, validation)
   - Skip navigation links

3. **Visual:**
   - Minimum contrast ratio 4.5:1 for text
   - Minimum touch target 44x44px
   - No information conveyed by color alone
   - Respect prefers-reduced-motion

### Migration Strategy

1. **Phase 1: Foundation**
   - Implement theme system and context
   - Add CSS variables and design tokens
   - Update root layout with providers

2. **Phase 2: Core Components**
   - Implement toast system
   - Enhance header with theme toggle and icons
   - Implement new footer

3. **Phase 3: Enhanced UX**
   - Add tooltips to Calculator page
   - Implement validation feedback
   - Add loading states

4. **Phase 4: Responsive & Polish**
   - Implement responsive layouts
   - Add animations and transitions
   - Add breadcrumb navigation
   - Final polish and testing

Each phase should be tested before moving to the next.
