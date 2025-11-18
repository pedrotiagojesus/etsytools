# Implementation Plan

- [x] 1. Set up design system foundation





  - Create CSS variables file with color palette, typography scale, spacing, and shadows
  - Create animations.css with reusable animation definitions and transition variables
  - Update theme.css to import new CSS files and use design tokens
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 2. Implement theme system (light/dark mode)




  - [x] 2.1 Create ThemeContext with theme state management


    - Implement ThemeProvider component with theme state (light/dark/system)
    - Add system theme detection using window.matchMedia
    - Implement localStorage persistence for theme preference
    - Apply theme to document root using data-bs-theme attribute
    - _Requirements: 1.1, 1.4, 1.5_

  - [x] 2.2 Create useTheme custom hook


    - Implement hook to access ThemeContext
    - Add error handling for usage outside provider
    - _Requirements: 1.1_

  - [x] 2.3 Integrate ThemeProvider in App root


    - Wrap application with ThemeProvider in main.tsx
    - Ensure theme is applied before first render
    - _Requirements: 1.1, 1.5_



  - [x] 2.4 Add theme toggle button to Header





    - Add toggle button with sun/moon icons from Bootstrap Icons
    - Implement smooth rotation animation on toggle
    - Add accessible label for screen readers
    - Connect to useTheme hook
    - _Requirements: 1.2, 1.3_

  - [ ]* 2.5 Write unit tests for theme system
    - Test theme toggle functionality
    - Test localStorage persistence
    - Test system theme detection
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_


- [x] 3. Implement toast notification system




  - [x] 3.1 Create Toast component


    - Implement Toast component with message, type, and close button
    - Add Bootstrap Icons for different toast types (success, error, warning, info)
    - Implement slide-in and fade-out animations
    - Style with appropriate colors for each type
    - _Requirements: 3.1, 3.2, 3.4_

  - [x] 3.2 Create ToastContainer component


    - Implement container to manage multiple toasts
    - Position in top-right corner with fixed positioning
    - Stack toasts vertically with proper spacing
    - Limit maximum visible toasts to 3
    - _Requirements: 3.5_

  - [x] 3.3 Create ToastContext with queue management


    - Implement ToastProvider with toast queue state
    - Add addToast function with auto-dismiss timer
    - Add removeToast function
    - Generate unique IDs for each toast
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 3.4 Create useToast custom hook


    - Implement hook to access ToastContext
    - Provide convenient methods for showing toasts
    - _Requirements: 3.1_

  - [x] 3.5 Integrate ToastProvider and ToastContainer in App


    - Wrap application with ToastProvider
    - Add ToastContainer to App layout
    - _Requirements: 3.1, 3.5_

  - [ ]* 3.6 Write unit tests for toast system
    - Test toast queue management
    - Test auto-dismiss functionality
    - Test manual dismiss
    - _Requirements: 3.1, 3.2, 3.3, 3.4_


- [x] 4. Enhance Header component with icons





  - Add Bootstrap Icons to navigation links (calculator, box-seam, image)
  - Update Header styling for better visual hierarchy
  - Improve mobile menu with smooth transitions
  - Add active state highlighting for current route
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 5. Implement new Footer component





  - Create Footer component with copyright and version information
  - Add links section for documentation, support, and GitHub
  - Style footer with theme-aware colors
  - Ensure footer stays at bottom of page
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 6. Implement Tooltip component




  - [x] 6.1 Create Tooltip component with positioning logic


    - Implement tooltip with content and position props
    - Add positioning calculation using getBoundingClientRect
    - Implement viewport boundary detection
    - Add arrow pointer to tooltip
    - _Requirements: 4.1, 4.4_

  - [x] 6.2 Add hover and focus behavior


    - Implement show/hide with configurable delay (200ms default)
    - Add keyboard navigation support (show on focus)
    - Style tooltip with theme-aware colors
    - _Requirements: 4.3, 4.5_

  - [x] 6.3 Add tooltips to Calculator page fields


    - Wrap Calculator input labels with Tooltip component
    - Add explanatory text for all commission and tax fields
    - Add tooltip for price and discount fields
    - _Requirements: 4.1, 4.2_

  - [ ]* 6.4 Write unit tests for tooltip component
    - Test positioning logic
    - Test show/hide behavior
    - Test keyboard navigation
    - _Requirements: 4.1, 4.2, 4.3, 4.4_


- [x] 7. Implement input validation with visual feedback




  - [x] 7.1 Create validation utility functions


    - Implement validatePrice function (non-negative, max 2 decimals)
    - Implement validateDiscount function (0-100 range)
    - Return ValidationResult with isValid and message
    - _Requirements: 8.1, 8.2_

  - [x] 7.2 Create ValidationFeedback component


    - Implement component to display validation state
    - Add colored border (green/red) based on validation
    - Add icon indicator (checkmark/X)
    - Add error message display with fade-in animation
    - _Requirements: 8.3, 8.5_

  - [x] 7.3 Integrate validation in Calculator page


    - Add validation to price input fields
    - Add validation to discount input field
    - Display validation feedback immediately on change
    - Update input styling based on validation state
    - _Requirements: 8.1, 8.2, 8.4_

  - [ ]* 7.4 Write unit tests for validation
    - Test validatePrice with various inputs
    - Test validateDiscount with various inputs
    - Test ValidationFeedback rendering
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 8. Implement loading states and skeleton screens




  - [x] 8.1 Create LoadingSpinner component


    - Implement spinner with size variants (sm, md, lg)
    - Add overlay mode with semi-transparent backdrop
    - Add accessible loading announcement
    - Style with theme-aware colors
    - _Requirements: 10.2, 10.3, 10.5_

  - [x] 8.2 Create skeleton screen for Calculator page


    - Design skeleton that mimics table structure
    - Implement pulsing animation
    - Ensure no layout shift when content loads
    - _Requirements: 10.1, 10.4_

  - [ ]* 8.3 Write unit tests for loading components
    - Test LoadingSpinner rendering
    - Test skeleton screen animation
    - _Requirements: 10.1, 10.2_


- [x] 9. Implement responsive design for Calculator page




  - [x] 9.1 Create useMediaQuery custom hook


    - Implement hook to detect viewport breakpoints
    - Return boolean for current breakpoint match
    - Add event listener for window resize
    - _Requirements: 5.4_

  - [x] 9.2 Create responsive card layout component


    - Implement card-based layout for mobile view
    - Transform table rows to cards with label-value pairs
    - Ensure all functionality works in card format
    - _Requirements: 5.1, 5.2_

  - [x] 9.3 Update Calculator page with responsive behavior


    - Use useMediaQuery to detect mobile viewport
    - Switch between table and card layout based on breakpoint
    - Ensure smooth transition between layouts
    - Increase touch target sizes for mobile (minimum 44x44px)
    - _Requirements: 5.1, 5.3, 5.4, 5.5_

  - [ ]* 9.4 Write tests for responsive behavior
    - Test useMediaQuery hook
    - Test layout switching at breakpoints
    - _Requirements: 5.1, 5.4_

- [-] 10. Implement Breadcrumb navigation


  - [x] 10.1 Create Breadcrumb component


    - Implement component with items array prop
    - Render breadcrumb trail with separators
    - Make all items except last clickable
    - Add responsive behavior (collapse on mobile)
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 10.2 Integrate breadcrumbs in App layout


    - Add Breadcrumb component below Header
    - Generate breadcrumb items from current route
    - Hide breadcrumbs on home page
    - _Requirements: 9.1, 9.4, 9.5_

  - [ ]* 10.3 Write unit tests for breadcrumb
    - Test breadcrumb rendering
    - Test navigation on click
    - _Requirements: 9.1, 9.2, 9.3_


- [x] 11. Implement animations and micro-interactions





  - [x] 11.1 Add page transition animations


    - Implement fade transition for route changes
    - Use 300ms duration with ease-out timing
    - Ensure smooth transition between pages
    - _Requirements: 6.1_


  - [x] 11.2 Add hover effects to interactive elements

    - Add color transitions to buttons and links (200ms)
    - Add subtle scale effect to buttons on hover
    - Add box-shadow transitions to cards
    - _Requirements: 6.2_

  - [x] 11.3 Add value change animations in Calculator


    - Implement highlight flash when calculated values update
    - Use subtle background color pulse effect
    - Duration 500ms with fade out
    - _Requirements: 6.3_

  - [x] 11.4 Add prefers-reduced-motion support


    - Detect user's motion preference
    - Disable animations when prefers-reduced-motion is set
    - Ensure functionality works without animations
    - _Requirements: 6.5_

  - [x] 11.5 Ensure smooth animation performance


    - Use CSS transitions for all animations
    - Optimize with transform and opacity properties
    - Test animation performance (60fps target)
    - _Requirements: 6.4_

- [x] 12. Enhance profit calculation visual feedback





  - [x] 12.1 Add visual indicators to profit result


    - Display green background and success icon for positive profit
    - Display red background and warning icon for negative profit
    - Display yellow background and info icon for zero profit
    - _Requirements: 12.1, 12.2, 12.3_

  - [x] 12.2 Add animation to profit value changes


    - Implement smooth animation when profit value updates
    - Increase font size and weight for emphasis
    - _Requirements: 12.4, 12.5_


- [x] 13. Improve typography and visual hierarchy





  - Apply consistent font sizes using type scale throughout application
  - Use appropriate font weights for hierarchy (400 body, 600 emphasis, 700 headings)
  - Set line-height to 1.5 for body text
  - Add adequate spacing between sections (minimum 24px)
  - Verify text contrast ratios meet WCAG AA standards
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 14. Update existing pages with new components



  - [x] 14.1 Update GenerateProduct page


    - Replace existing feedback with toast notifications
    - Add loading spinner during product generation
    - Add tooltips to form fields
    - Apply validation to input fields
    - _Requirements: 3.1, 4.1, 8.1, 10.2_

  - [x] 14.2 Update Mockup page


    - Add loading spinner for template loading
    - Replace loading overlay with LoadingSpinner component
    - Add toast notifications for errors
    - _Requirements: 3.1, 10.2_

- [x] 15. Final polish and accessibility review





  - [x] 15.1 Keyboard navigation audit


    - Verify all interactive elements are keyboard accessible
    - Ensure logical tab order throughout application
    - Add visible focus indicators to all focusable elements
    - Test escape key functionality for dismissible components
    - _Requirements: 6.2, 4.3_



  - [x] 15.2 Screen reader compatibility





    - Add ARIA labels to icon-only buttons
    - Implement live regions for toast notifications
    - Add skip navigation links
    - Test with screen reader software


    - _Requirements: 3.5, 7.1, 10.5_

  - [x] 15.3 Color contrast verification




    - Verify all text meets 4.5:1 contrast ratio
    - Check contrast in both light and dark themes
    - Ensure information is not conveyed by color alone
    - _Requirements: 11.5, 1.3_

  - [ ]* 15.4 Cross-browser testing
    - Test in Chrome, Firefox, Safari, and Edge
    - Verify animations work smoothly
    - Check responsive behavior on different devices
    - _Requirements: 6.1, 6.2, 5.1_

  - [ ]* 15.5 Performance optimization
    - Measure and optimize animation performance
    - Ensure theme toggle responds in under 100ms
    - Verify no layout shifts during loading
    - _Requirements: 6.5, 1.3, 10.4_
