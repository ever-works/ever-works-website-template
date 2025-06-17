# Guide de Test de Responsivité

## 📱 Appareils à Tester

### Mobile (320px - 768px)
- iPhone SE (375x667)
- iPhone 12/13 (390x844)
- Samsung Galaxy S20 (360x800)
- iPad Mini Portrait (768x1024)

### Tablette (768px - 1024px)
- iPad Air (820x1180)
- iPad Pro 11" (834x1194)
- Surface Pro 7 (912x1368)

### Desktop (1024px+)
- Laptop (1366x768)
- Desktop HD (1920x1080)
- 4K Monitor (3840x2160)

## ✅ Points de Vérification

1. **Navigation**
   - [ ] Menu hamburger visible sur mobile
   - [ ] Navigation horizontale sur desktop
   - [ ] Tous les liens accessibles

2. **Contenu**
   - [ ] Texte lisible sans zoom
   - [ ] Images adaptées à la taille d'écran
   - [ ] Pas de débordement horizontal

3. **Interactions**
   - [ ] Boutons assez grands pour le toucher (min 44x44px)
   - [ ] Espacement suffisant entre éléments cliquables
   - [ ] Hover states uniquement sur desktop

4. **Performance**
   - [ ] Temps de chargement < 3s sur 3G
   - [ ] Images optimisées pour chaque taille
   - [ ] Animations fluides (60 FPS)

## 🛠️ Outils Recommandés

1. **Chrome DevTools** - Responsive Design Mode
2. **Firefox Developer Tools** - Responsive Design Mode
3. **BrowserStack** - Tests sur vrais appareils
4. **Lighthouse** - Audit de performance mobile

## 📊 Métriques Cibles

- **Mobile Score Lighthouse**: > 90
- **First Contentful Paint**: < 1.8s
- **Cumulative Layout Shift**: < 0.1
- **Touch Target Size**: >= 48x48px 