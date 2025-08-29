# Performance Optimization Report for react-merge-link

## Executive Summary

This report identifies several performance optimization opportunities in the react-merge-link codebase. The primary issues involve unnecessary re-renders caused by object dependencies in React hooks, missing memoization, and inefficient DOM operations.

## Critical Issues (High Impact)

### 1. Config Object Recreation Causing Unnecessary Re-renders

**Location:** `src/useMergeLink.tsx` lines 57 and 63
**Impact:** High - Causes unnecessary re-renders and re-initializations
**Issue:** The entire `config` object is used directly in dependency arrays for `useEffect` and `useCallback`, causing these hooks to re-run whenever any property in the config changes, even if the change doesn't affect the hook's behavior.

**Current Code:**
```typescript
useEffect(() => {
  // ... initialization logic
}, [isReadyForInitialization, config]); // ❌ config object dependency

const open = useCallback(() => {
  if (window.MergeLink) {
    window.MergeLink.openLink(config);
  }
}, [config]); // ❌ config object dependency
```

**Performance Impact:**
- Every config property change triggers re-initialization
- Unnecessary MergeLink.initialize() calls
- Callback recreation on every render when config changes
- Potential memory leaks from frequent re-initializations

### 2. Missing Memoization for Computed Values

**Location:** `src/useMergeLink.tsx` lines 27-30 and 38-43
**Impact:** Medium - Unnecessary recalculations on every render
**Issue:** `scriptSrc` and `isReadyForInitialization` are recalculated on every render without memoization.

**Current Code:**
```typescript
const scriptSrc = config?.tenantConfig?.apiBaseURL != null
  ? BASE_URL_TO_CDN_MAP[config.tenantConfig.apiBaseURL] || DEFAULT_CDN_URL
  : DEFAULT_CDN_URL; // ❌ Recalculated every render

const isReadyForInitialization = !isServer &&
  !!window.MergeLink &&
  !loading &&
  !error &&
  isLinkTokenDefined(config); // ❌ Recalculated every render
```

## Medium Priority Issues

### 3. Inefficient DOM Operations in useScript

**Location:** `src/hooks/useScript.tsx` lines 87-95
**Impact:** Medium - Inefficient attribute setting
**Issue:** `Object.keys(attributes).forEach()` runs on every effect execution, even when attributes haven't changed.

**Current Code:**
```typescript
Object.keys(attributes).forEach((key) => {
  // @ts-ignore
  if (scriptEl[key] === undefined) {
    scriptEl.setAttribute(key, attributes[key]);
  } else {
    // @ts-ignore
    scriptEl[key] = attributes[key];
  }
});
```

### 4. Global Scripts Object Memory Management

**Location:** `src/hooks/useScript.tsx` line 25
**Impact:** Low-Medium - Potential memory leaks
**Issue:** The global `scripts` object uses string keys and never cleans up entries for scripts that are no longer needed, potentially causing memory leaks in long-running applications.

## Low Priority Issues

### 5. Missing Error Boundary Considerations

**Impact:** Low - Error handling efficiency
**Issue:** No error boundaries or error recovery mechanisms for script loading failures.

### 6. Type Safety Issues

**Location:** `src/hooks/useScript.tsx` lines 88 and 92
**Impact:** Low - Development experience
**Issue:** `@ts-ignore` comments indicate type safety issues that could be resolved with better typing.

## Recommended Fixes (Implemented in this PR)

### Fix 1: Optimize Config Dependencies
- Extract primitive values from config object for dependency arrays
- Use `useMemo` to memoize the config object passed to MergeLink.initialize
- Use `useCallback` with stable, primitive dependencies

### Fix 2: Add Memoization for Computed Values
- Memoize `scriptSrc` calculation with `useMemo`
- Memoize `isReadyForInitialization` with `useMemo`

## Performance Benefits

After implementing these optimizations:
- **Reduced re-renders:** Config changes only trigger re-renders when relevant properties change
- **Fewer API calls:** MergeLink.initialize() only called when necessary
- **Better memory usage:** Reduced callback and object recreation
- **Improved responsiveness:** Fewer unnecessary computations per render

## Future Optimization Opportunities

1. Implement WeakMap for script caching in useScript
2. Add error boundaries for better error handling
3. Consider lazy loading for the MergeLink script
4. Implement proper TypeScript types to remove @ts-ignore comments
5. Add performance monitoring hooks for development

## Testing Recommendations

- Verify no functional regressions
- Test with rapidly changing config props
- Monitor re-render frequency in development
- Test script loading performance with network throttling
