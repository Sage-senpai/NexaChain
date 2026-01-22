# Nexachain Images

## Certificate Image

Place your company certificate image in this folder:

### Required File
- `certificate.jpg` - Your company registration certificate

### Supported Formats
- JPG/JPEG (recommended)
- PNG
- WebP

### Image Requirements
- **Format**: JPG preferred for photographs/scanned documents
- **Resolution**: At least 1200px wide for clarity
- **Quality**: High quality scan or photo
- **Content**: Official company registration certificate

### How to Add Your Certificate

1. Scan or photograph your company certificate
2. Save it as `certificate.jpg`
3. Place it in this folder (`public/images/`)
4. Push to GitHub

```bash
git add public/images/certificate.jpg
git commit -m "Add company certificate"
git push
```

### Tips for a Good Certificate Image

1. **Scan if possible** - Scanners produce cleaner images than photos
2. **Good lighting** - If photographing, ensure even lighting with no shadows
3. **Straight alignment** - Keep the certificate straight in the frame
4. **High resolution** - At least 1200x1600 pixels recommended
5. **Clear text** - All text should be readable when zoomed in

### What Users Will See

When users click the "Company Certificate" card on the landing page:
- A modal will open showing the full certificate
- They can zoom in/out to read details
- They can download the certificate image
- Works on all devices (mobile, tablet, desktop)

### Privacy Note

Only include certificates you're comfortable displaying publicly. The certificate will be:
- Visible to all website visitors
- Downloadable by users
- Indexed by search engines (if not blocked)
