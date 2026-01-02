# Custom Navigation Documentation

This document describes how to configure custom navigation links for the header menu and footer section.

## Overview

The Ever Works template supports custom navigation items through two configuration arrays:

- **`custom_header`**: Custom links displayed in the main header navigation menu
- **`custom_footer`**: Custom links displayed in the footer section (added alongside default legal links)

Both arrays use the same structure and support the same features.

## Configuration Location

Custom navigation items are configured in `.content/config.yml`:

```yaml
custom_header:
  - label: "About"
    path: "/about"
  - label: "Documentation"
    path: "/pages/docs"

custom_footer:
  - label: "GitHub"
    path: "https://github.com/example"
  - label: "footer.PRIVACY_POLICY"
    path: "/pages/privacy-policy"
```

## Item Structure

Each navigation item is an object with two required properties:

### `label` (string, required)

The display text for the link. Supports two formats:

1. **Plain text**: Displayed as-is
   ```yaml
   label: "About"
   label: "Documentation"
   ```

2. **i18n translation key**: Resolved using next-intl translation system
   ```yaml
   label: "footer.PRIVACY_POLICY"
   label: "common.DOCS"
   label: "NAV_ABOUT"
   ```

   Translation keys can use:
   - Direct keys: `NAV_ABOUT`
   - Namespaced keys: `footer.PRIVACY_POLICY`, `common.DOCS`
   - The system will automatically try common namespaces (`common`, `footer`, `auth`, `listing`, `survey`, `help`) if the key format matches

### `path` (string, required)

The URL or route path for the link. Supports three types:

1. **Internal routes**: Paths starting with `/`
   ```yaml
   path: "/about"
   path: "/contact"
   path: "/categories"
   ```

2. **Markdown pages**: Dynamic pages served from `.content/pages/`
   ```yaml
   path: "/pages/docs"
   path: "/pages/privacy-policy"
   path: "/pages/terms-of-service"
   ```

3. **External URLs**: Full URLs starting with `http://` or `https://`
   ```yaml
   path: "https://blog.example.com"
   path: "https://github.com/example"
   path: "https://docs.example.com"
   ```

   External URLs automatically:
   - Open in a new tab (`target="_blank"`)
   - Include security attributes (`rel="noopener noreferrer"`)
   - Display an external link icon

## Validation Rules

Navigation items must meet the following requirements:

1. Both `label` and `path` must be non-empty strings
2. Empty strings (including whitespace-only) are not allowed
3. Invalid items are filtered out with a console warning

## Examples

### Header Navigation Example

```yaml
custom_header:
  - label: "About"
    path: "/about"
  - label: "Documentation"
    path: "/pages/docs"
  - label: "Blog"
    path: "https://blog.example.com"
  - label: "common.DOCS"
    path: "/docs"
  - label: "NAV_CONTACT"
    path: "/contact"
```

### Footer Navigation Example

```yaml
custom_footer:
  - label: "GitHub"
    path: "https://github.com/example"
  - label: "footer.PRIVACY_POLICY"
    path: "/pages/privacy-policy"
  - label: "Terms of Service"
    path: "/pages/terms-of-service"
  - label: "Documentation"
    path: "https://docs.example.com"
```

**Note**: Footer custom links are **added alongside** the default legal links (Terms, Privacy Policy, Cookies). They do not replace them.

## Behavior

### Header Links (`custom_header`)

- Displayed in the main navigation menu
- Appear after default navigation items
- Support the same features as footer links

### Footer Links (`custom_footer`)

- Added to the footer's resources section
- Displayed **after** default legal links (Terms, Privacy Policy, Cookies)
- Default legal links are always included and cannot be removed
- Custom footer items extend the default links, they do not replace them

## Managing Navigation via Admin UI

You can manage custom navigation items through the admin panel:

1. Navigate to Admin → Settings
2. Go to the "Custom Navigation" section
3. Use the interface to add, remove, reorder, and edit navigation items
4. Changes are saved to `.content/config.yml`

## API Endpoints

### GET `/api/admin/navigation`

Retrieves current custom navigation configuration.

**Response:**
```json
{
  "custom_header": [
    { "label": "About", "path": "/about" }
  ],
  "custom_footer": [
    { "label": "GitHub", "path": "https://github.com/example" }
  ]
}
```

### PATCH `/api/admin/navigation`

Updates custom navigation configuration.

**Request Body:**
```json
{
  "type": "header" | "footer",
  "items": [
    { "label": "About", "path": "/about" }
  ]
}
```

**Validation:**
- `type` must be either `"header"` or `"footer"`
- `items` must be an array
- Each item must have non-empty `label` and `path` strings

## Best Practices

1. **Use translation keys for internationalization**: Prefer `footer.PRIVACY_POLICY` over `"Privacy Policy"` for multi-language support
2. **Keep labels concise**: Navigation labels should be short and clear
3. **Organize logically**: Place most important links first
4. **Use appropriate link types**: 
   - Internal routes for site pages
   - External URLs only when necessary
   - Markdown pages for documentation/content pages
5. **Test translations**: Ensure translation keys exist in your message files

## Troubleshooting

### Links not appearing

- Check that items are valid (non-empty `label` and `path`)
- Verify the configuration format is correct YAML
- Check browser console for validation warnings
- Ensure changes are saved to `.content/config.yml`

### Translation keys not working

- Verify the key exists in your message files (e.g., `messages/en.json`)
- Check the namespace format (e.g., `footer.KEY` or `common.KEY`)
- Ensure the key follows the naming convention (uppercase with underscores)

### External links not opening in new tab

- Ensure the URL starts with `http://` or `https://`
- Check browser console for any JavaScript errors

