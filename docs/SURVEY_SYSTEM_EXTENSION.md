# Survey System Extension - Documentation

## Overview

This extension adds advanced features to manage dynamic CTAs and conditional display of information blocks on item pages.

## New fields in item.yml

### 1. `action` (optional)
Defines the type of CTA (Call To Action) to display for the item.

**Possible values:**
- `visit-website` (default): Displays the "Visit Website" button
- `start-survey`: Displays the "Start Survey" button that directly launches the first survey attached to the item
- `buy`: Placeholder for a future purchase system (currently disabled)

**Example:**
```yaml
action: "start-survey"
```

### 2. `showSurveys` (optional)
Controls the display of the Surveys section on the item page.

**Possible values:**
- `true` (default): Displays the Surveys section if surveys are available
- `false`: Completely hides the Surveys section even if surveys are defined

**Example:**
```yaml
showSurveys: false
```

### 3. `publisher` (optional)
Name of the item's publisher. If defined, will be displayed in the right column.

**Example:**
```yaml
publisher: "Ever Works"
```

## Complete example of an item.yml for a test

```yaml
name: IQ Test
description: Discover your intelligence quotient with our comprehensive IQ test. This scientifically validated assessment measures various cognitive abilities including logical reasoning, pattern recognition, and problem-solving skills.
source_url: https://example.com
category: tests
tags:
  - iq
  - intelligence
  - assessment
action: "start-survey"
showSurveys: true
publisher: "Ever Works"
updated_at: 2025-01-15 10:00
```

## Conditional display of blocks

The following blocks are now automatically hidden if they are empty or undefined:

### Right column

1. **Publisher**: Displayed only if `publisher` is defined in the YAML
2. **Website**: Displayed only if `source_url` exists and is valid
3. **Categories**: Displayed only if a category is defined
4. **Tags**: Displayed only if there is at least one tag
5. **Similar products**: Displayed only if similar items exist

## "Start Survey" CTA behavior

When `action: "start-survey"` is defined:

1. The `ItemCTAButton` component automatically loads the first published survey attached to the item
2. On clicking the "Start Survey" button, the survey opens in a modal (SurveyDialog)
3. The survey uses SurveyJS for rendering
4. After submission, a success message is displayed

### Prerequisites for "Start Survey"

- The item must have at least one created and published survey
- The survey must be of type `item` and associated with the item via `itemId`

## Recommended YAML structure for a test directory

```yaml
# IQ Test
name: IQ Test
description: Comprehensive intelligence quotient assessment
action: "start-survey"
showSurveys: true
publisher: "Ever Works"
category: tests
tags: [iq, intelligence, assessment]

# Mind Test
name: Mind Test
description: Evaluate your cognitive abilities
action: "start-survey"
showSurveys: true
publisher: "Ever Works"
category: tests
tags: [mind, cognitive, assessment]

# Personality Test
name: Personality Test
description: Discover your personality traits
action: "start-survey"
showSurveys: true
publisher: "Ever Works"
category: tests
tags: [personality, psychology, assessment]

# Health Test
name: Health Test
description: Assess your health and wellness
action: "start-survey"
showSurveys: true
publisher: "Ever Works"
category: tests
tags: [health, wellness, assessment]
```

## Future preparation

The code is structured to facilitate future addition of:

1. **Payment system**: The `action: "buy"` field is already prepared (currently disabled)
2. **Affiliation system**: The structure allows easy addition of affiliation links
3. **Paid test results**: The architecture allows adding payment logic to access results

## Modified files

- `lib/content.ts`: Added `action`, `showSurveys`, `publisher` fields to `ItemData`
- `lib/types/item.ts`: Updated `ItemData` interface
- `components/item-detail/item-cta-button.tsx`: New component for dynamic CTA
- `components/item-detail/item-detail.tsx`: Integration of dynamic CTA and conditional display
- `components/surveys/user-survey-section.tsx`: Respects `showSurveys` flag (via parent)

## Important notes

- If `action` is not defined, the default behavior is `visit-website`
- If `showSurveys` is not defined, the default value is `true`
- The "Start Survey" button is disabled if no survey is available
- All fields are optional to maintain backward compatibility
