# Design System

## Overview

A clean, calm, professional design system for the Flukee coaching platform MVP. Focused on clarity, trustworthiness, and ease of use for professional coaches.

## Design Principles

1. **Minimalist and Quiet** - No unnecessary elements or decoration
2. **One Primary Action** - Each screen has one clear primary action
3. **Lots of White Space** - Generous spacing for clarity and breathing room
4. **Clear Visual Hierarchy** - Text-first design with clear typography scales
5. **Professional Tone** - Trustworthy and focused, never playful or flashy

## Color Palette

### Primary Color
- **Primary Blue**: `#4A90E2`
- **Primary Hover**: `#357ABD`

### Neutral Grays
- **Gray 900** (Text Primary): `#1A1A1A`
- **Gray 700** (Text Secondary): `#4A4A4A`
- **Gray 500** (Text Tertiary): `#8A8A8A`
- **Gray 300** (Borders): `#E5E5E5`
- **Gray 100** (Backgrounds): `#F5F5F5`

### Backgrounds
- **White**: `#FFFFFF` (Primary background)
- **Gray 100**: `#F5F5F5` (Subtle backgrounds when needed)

## Typography

### Font Family
System font stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`

### Type Scale

**Web:**
- **H1**: 2rem (32px) / Weight: 600 / Line Height: 1.2
- **H2**: 1.5rem (24px) / Weight: 600 / Line Height: 1.3
- **H3**: 1.25rem (20px) / Weight: 500 / Line Height: 1.4
- **Body**: 1rem (16px) / Weight: 400 / Line Height: 1.5
- **Small**: 0.875rem (14px) / Weight: 400 / Line Height: 1.4

**Mobile:**
- **Title**: 32px / Weight: 600 / Line Height: 40px
- **Heading**: 24px / Weight: 600 / Line Height: 28px
- **Subheading**: 20px / Weight: 500 / Line Height: 28px
- **Body**: 18px / Weight: 400 / Line Height: 26px
- **Small**: 16px / Weight: 400 / Line Height: 22px

### Text Colors
- **Primary Text**: Gray 900 (`#1A1A1A`)
- **Secondary Text**: Gray 700 (`#4A4A4A`)
- **Tertiary Text**: Gray 500 (`#8A8A8A`)

## Spacing

Consistent spacing scale:
- **XS**: 0.5rem (8px)
- **SM**: 1rem (16px)
- **MD**: 1.5rem (24px)
- **LG**: 2rem (32px)
- **XL**: 3rem (48px)
- **2XL**: 4rem (64px)

## Components

### Buttons

**Primary Button:**
- Background: Primary Blue (`#4A90E2`)
- Text: White
- Padding: 0.875rem 1.5rem
- Font Size: 1rem
- Font Weight: 500
- Border Radius: 4px
- Hover: Primary Hover (`#357ABD`)

**Secondary Button:**
- Background: Transparent
- Text: Gray 700
- Border: 1px solid Gray 300
- Padding: 0.875rem 1.5rem
- Font Size: 1rem
- Font Weight: 500
- Border Radius: 4px

### Inputs

- Border: 1px solid Gray 300 (`#E5E5E5`)
- Border Radius: 4px
- Padding: 0.875rem
- Font Size: 1rem
- Focus: Border color changes to Primary Blue
- No shadows or heavy styling

### Cards

**Minimal Use Only:**
- No heavy shadows
- Simple borders when needed (1px solid Gray 300)
- Generous padding (2rem)
- White background

### Links

- Color: Primary Blue
- Hover: Primary Hover
- No underlines (except on hover if needed)
- Clear visual distinction

## Layout Principles

1. **Maximum Content Width**: 1200px (web), full width (mobile)
2. **Page Padding**: 2rem (32px) on sides
3. **Section Spacing**: 3-4rem between major sections
4. **Element Spacing**: 1.5-2rem between related elements

## Screen-Specific Guidelines

### Coach Dashboard (Trainee List)
- Simple list layout
- Each trainee: Name + status text (e.g., "2 tasks pending")
- Minimal visual elements
- Clear hierarchy: Name → Status → Arrow indicator
- No cards, just clean list items with borders

### Trainee Task Screen (Mobile)
- Large task title (32px)
- Short explanation text
- One clear primary button
- Focused, single-task view
- Generous spacing around content

### Messages Screen
- Simple chat layout
- Calm, non-distracting
- Clear message bubbles
- Minimal styling
- Focus on readability

## What We Avoid

- ❌ Gradients
- ❌ Heavy shadows
- ❌ Excessive rounded corners (only 4px where needed)
- ❌ Small text (minimum 16px)
- ❌ Playful colors or decorations
- ❌ Complex animations
- ❌ Over-styled components
- ❌ Multiple competing actions
- ❌ Charts or complex visualizations (for MVP)

## Empty States

Thoughtful, helpful empty state text:
- "No trainees yet. Add trainees to get started."
- "No tasks assigned yet. Your coach will add tasks here."
- "No messages yet. Start the conversation."

Clear, professional, and helpful without being verbose.
