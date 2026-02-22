# Car Rental Nigeria - Styling Guidelines

## 🎨 **Styling Conflict Prevention**

### **1. CSS Specificity Hierarchy**
```css
/* ALWAYS follow this order (lowest to highest specificity) */
1. Element selectors (button, div)
2. Class selectors (.bg-black, .text-white)
3. Pseudo-classes (:hover, :focus, :disabled)
4. ID selectors (#button)
5. Inline styles (style="...")
6. !important declarations
```

### **2. Tailwind Class Order**
```tsx
// ✅ CORRECT ORDER
className="
  /* Layout & Spacing */
  flex items-center space-x-2
  
  /* Sizing */
  h-12 px-8 min-w-[180px]
  
  /* Colors & Background */
  bg-black text-white
  
  /* Border & Shape */
  rounded-[30px]
  
  /* Interactive States */
  hover:bg-yellow-500 hover:text-black
  disabled:opacity-100
  
  /* Transitions */
  transition-colors duration-200
"
```

### **3. Button Styling Template**
```tsx
// ✅ Use this template for all buttons
<Button 
  className="
    /* Base styling */
    bg-black text-white
    h-12 px-8 rounded-[30px]
    
    /* Hover effects */
    hover:bg-yellow-500 hover:text-black
    
    /* Disabled state */
    disabled:opacity-100
    
    /* Smooth transitions */
    transition-colors duration-200
  "
  onClick={handleClick}
>
  <span>Button Text</span>
  <Icon className="h-4 w-4 text-yellow-400 hover:text-white transition-colors duration-200" />
</Button>
```

### **4. Icon Styling Rules**
```tsx
// ✅ Icons should match button state
<Icon className="
  /* Base size */
  h-4 w-4
  
  /* Default color */
  text-yellow-400
  
  /* Hover color (matches button text) */
  hover:text-white
  
  /* Smooth transition */
  transition-colors duration-200
" />
```

### **5. Never Mix These**
```tsx
// ❌ NEVER DO THIS
<Button 
  style={{ backgroundColor: '#000000' }}  // Inline style
  className="hover:bg-yellow-500"        // Hover won't work!
/>

// ✅ ALWAYS DO THIS
<Button className="bg-black hover:bg-yellow-500 transition-colors" />
```

### **6. Debugging Checklist**
- [ ] Check if element has `opacity-50` or `disabled:opacity-50`
- [ ] Ensure no inline styles override hover effects
- [ ] Verify z-index and positioning
- [ ] Test hover effects immediately after adding
- [ ] Use browser dev tools to inspect CSS conflicts

### **7. Common Issues & Solutions**
```tsx
// Issue: Button appears gray
// Solution: Add disabled:opacity-100

// Issue: Hover effect not working
// Solution: Remove inline styles, use Tailwind classes

// Issue: Icon color not changing on hover
// Solution: Add hover:text-white to icon

// Issue: Transition not smooth
// Solution: Add transition-colors duration-200
```

### **8. Color Scheme**
```tsx
// Primary colors
bg-black          // Default button background
bg-yellow-500     // Hover background
text-white        // Default text color
text-black        // Hover text color
text-yellow-400   // Icon default color
text-white        // Icon hover color
```

## 🚀 **Current Button Implementation**
```tsx
<Button 
  className="bg-black text-white hover:bg-yellow-500 hover:text-black h-12 px-8 rounded-[30px] flex items-center space-x-2 whitespace-nowrap min-w-[180px] disabled:opacity-100 transition-colors duration-200"
  onClick={handleClick}
>
  <span>Find a Vehicle</span>
  <ArrowRight className="h-4 w-4 text-yellow-400 hover:text-white transition-colors duration-200" />
</Button>
```

## ✅ **Benefits of This Approach**
- **No CSS conflicts** - Clear specificity hierarchy
- **Consistent styling** - Template-based approach
- **Easy debugging** - Systematic troubleshooting
- **Maintainable code** - Predictable patterns
- **Smooth interactions** - Proper transitions
