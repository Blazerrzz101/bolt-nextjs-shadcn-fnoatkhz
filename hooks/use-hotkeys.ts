<<<<<<< HEAD
"use client";

import { useEffect } from 'react';

interface Hotkey {
  key: string;
  callback: () => void;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
=======
```typescript
"use client"

import { useEffect } from 'react'

interface Hotkey {
  key: string
  callback: () => void
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
>>>>>>> 64d0ba3 (fix: update materialized view configuration and client handling for product rankings)
}

export function useHotkeys(hotkeys: Hotkey[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      hotkeys.forEach(({ key, callback, ctrlKey, altKey, shiftKey }) => {
        if (
          event.key.toLowerCase() === key.toLowerCase() &&
          (!ctrlKey || event.ctrlKey) &&
          (!altKey || event.altKey) &&
          (!shiftKey || event.shiftKey)
        ) {
<<<<<<< HEAD
          event.preventDefault();
          callback();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hotkeys]);
} 
=======
          event.preventDefault()
          callback()
        }
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hotkeys])
}
```
>>>>>>> 64d0ba3 (fix: update materialized view configuration and client handling for product rankings)
