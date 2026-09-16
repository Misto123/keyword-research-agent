# Design Patterns - Always Follow

## 1. Error/Success Messages

### ✅ ALWAYS use sticky footer for messages

**Why:**
- Always visible (no scrolling)
- Better UX for long forms
- Consistent across all pages

**Implementation:**
```css
.message-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}
```

```javascript
function showMessage(message, type) {
  // type: 'success', 'error', 'info'
  const footer = document.getElementById('message-footer');
  footer.className = `message-footer show ${type}`;
  footer.textContent = message;
}
```

### ❌ DON'T use inline messages that might be off-screen

---

## 2. Form Validation

### ✅ ALWAYS check if elements exist before accessing

**Why:**
- Prevents "cannot access property of null" errors
- Handles optional/collapsed sections
- More robust code

**Implementation:**
```javascript
const setIfExists = (id, value) => {
  try {
    const el = document.getElementById(id);
    if (el && value) el.value = value;
  } catch (err) {
    console.warn(`Could not set ${id}:`, err);
  }
};
```

### ❌ DON'T directly access without checking
```javascript
// BAD:
document.getElementById('field').value = val;

// GOOD:
const el = document.getElementById('field');
if (el) el.value = val;
```

---

## 3. Password Fields

### ✅ ALWAYS add visibility toggle (👁️)

**Why:**
- Users can verify their input
- Reduces typos
- Better UX

**Implementation:**
```html
<div class="password-wrapper">
  <input type="password" id="field">
  <button onclick="togglePassword('field')">👁️</button>
</div>
```

---

## 4. API Error Handling

### ✅ ALWAYS show user-friendly errors in sticky footer

**Implementation:**
```javascript
try {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed');
  showMessage('✅ Success!', 'success');
} catch (error) {
  showMessage(`❌ Error: ${error.message}`, 'error');
}
```

---

**Last Updated:** December 2024
**Project:** Keyword Research Agent
