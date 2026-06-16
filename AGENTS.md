# RESPONSIVE LAYOUT RULE FOR SKINSTRIC PAGES

For pages based on Figma desktop comps, do not immediately scale or redesign components to make them responsive.

Use this order:

1. Match the desktop Figma composition first.
2. Keep component sizes faithful to the approved desktop design.
3. Make the page responsive by repositioning components, not by shrinking them.
4. Only scale or reduce component size as a last resort on very small screens.

---

# DESKTOP-FIRST COMPOSITION RULE

When a Figma panel provides a desktop target composition, treat that panel as the source of truth.

For example, panel `#005` uses a desktop frame of:

* `1920 x 960`

Build the desktop page to match that composition first.

Do not use a loose responsive layout first if the page is meant to match a precise Figma comp.

---

# MOVE COMPONENTS, DO NOT SCALE COMPONENTS

For responsive behavior:

* keep icons at their intended design size
* keep labels at their intended design size
* keep rectangle/diamond assets at their intended design size
* keep buttons at their intended design size

Adapt responsiveness by:

* moving groups inward
* reducing outer margins
* tightening gaps
* changing layout mode at breakpoints
* stacking sections vertically when needed

Do NOT default to shrinking the entire UI.

---

# WHEN TO USE A FIXED DESIGN STAGE

If a page is highly dependent on exact Figma placement, use a centered desktop composition strategy first.

That means:

* start from the desktop frame
* place major groups according to Figma
* preserve exact visual relationships
* then add responsive rules around that composition

This is especially useful for:

* upload / camera choice pages
* hero pages
* geometry-heavy layouts
* pages with symmetric left/right compositions

---

# RESPONSIVE BREAKPOINT STRATEGY

Use this general approach:

## Large desktop

* preserve the original Figma composition closely

## Medium desktop / laptop

* keep component sizes
* move groups inward
* tighten empty margins
* reduce gap before resizing anything

## Tablet

* preserve component sizes where possible
* stack major sections before overlap happens

## Mobile

* stack vertically
* center content
* only reduce sizes if absolutely necessary to avoid clipping

---

# DO NOT KEEP TWEAKING A PAGE THAT IS ALREADY CORRECT

If a page now matches the Figma/live reference well:

* stop redesigning it
* do not continue “improving” spacing without a specific issue
* only make functional fixes, bug fixes, or tiny polish changes

Once layout is approved, treat it as stable.

---

# APPLY THIS TO FUTURE PAGES

Use this same approach for future Skinstric pages such as:

* `/result`
* `/camera`
* `/camera/capture`
* `/select`
* `/summary`

Match the desktop comp first, then make responsiveness happen by repositioning rather than shrinking.
