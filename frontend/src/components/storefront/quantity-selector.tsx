import React, { useState, useEffect, useRef } from "react";
import { Minus, Plus, Loader2 } from "lucide-react";

interface QuantitySelectorProps {
  initialQuantity: number;
  onChange: (quantity: number) => Promise<any> | void;
  min?: number;
  max?: number;
  debounceMs?: number;
  className?: string;
  disabled?: boolean;
}

export default function QuantitySelector({
  initialQuantity,
  onChange,
  min = 1,
  max = 9999,
  debounceMs = 1200,
  className = "",
  disabled = false,
}: QuantitySelectorProps) {
  const [inputValue, setInputValue] = useState<string>(initialQuantity.toString());
  const [isEditing, setIsEditing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentQuantityRef = useRef(initialQuantity);
  const prevValidQuantityRef = useRef(initialQuantity);

  // Sync with prop changes (e.g. when backend response returns new state)
  useEffect(() => {
    if (!isEditing && !isSyncing) {
      setInputValue(initialQuantity.toString());
      currentQuantityRef.current = initialQuantity;
      prevValidQuantityRef.current = initialQuantity;
    }
  }, [initialQuantity, isEditing, isSyncing]);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const triggerChange = (targetQty: number) => {
    clearTimer();
    
    // Optimistically update the current quantity ref & UI
    currentQuantityRef.current = targetQty;
    setInputValue(targetQty.toString());

    timerRef.current = setTimeout(async () => {
      setIsSyncing(true);
      try {
        await onChange(targetQty);
        prevValidQuantityRef.current = targetQty;
      } catch (error) {
        // Rollback to previous valid quantity on error
        const rollbackVal = prevValidQuantityRef.current;
        currentQuantityRef.current = rollbackVal;
        setInputValue(rollbackVal.toString());
      } finally {
        setIsSyncing(false);
      }
    }, debounceMs);
  };

  const handleIncrement = () => {
    const nextQty = currentQuantityRef.current + 1;
    if (nextQty <= max) {
      triggerChange(nextQty);
    }
  };

  const handleDecrement = () => {
    const nextQty = currentQuantityRef.current - 1;
    if (nextQty >= min) {
      triggerChange(nextQty);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Only allow digits
    if (/^\d*$/.test(val)) {
      setInputValue(val);
      
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed) && parsed >= min && parsed <= max) {
        // Trigger debounced change while typing
        triggerChange(parsed);
      }
    }
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    const parsed = parseInt(inputValue, 10);
    if (isNaN(parsed) || parsed < min) {
      // Rollback to last valid quantity
      const rollbackVal = prevValidQuantityRef.current;
      currentQuantityRef.current = rollbackVal;
      setInputValue(rollbackVal.toString());
    } else {
      const finalQty = Math.min(parsed, max);
      setInputValue(finalQty.toString());
      if (finalQty !== prevValidQuantityRef.current) {
        // Trigger immediate sync on blur/enter if changed
        clearTimer();
        setIsSyncing(true);
        Promise.resolve(onChange(finalQty))
          .then(() => {
            prevValidQuantityRef.current = finalQty;
          })
          .catch(() => {
            const rollbackVal = prevValidQuantityRef.current;
            currentQuantityRef.current = rollbackVal;
            setInputValue(rollbackVal.toString());
          })
          .finally(() => {
            setIsSyncing(false);
          });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    } else if (e.key === "Escape") {
      // Revert without saving
      const rollbackVal = prevValidQuantityRef.current;
      currentQuantityRef.current = rollbackVal;
      setInputValue(rollbackVal.toString());
      setIsEditing(false);
    }
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`flex items-center rounded-xl border border-gray-200 bg-white p-1 shadow-xs hover:border-gray-300 transition-colors ${
        disabled ? "opacity-50 bg-gray-50 pointer-events-none cursor-not-allowed" : ""
      }`}>
        {/* Decrement Button */}
        <button
          type="button"
          onClick={handleDecrement}
          disabled={currentQuantityRef.current <= min || isSyncing}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 active:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </button>

        {/* Quantity display / editable input */}
        <div className="relative flex items-center justify-center w-14">
          {isEditing ? (
            <input
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full text-center text-sm font-bold text-gray-900 focus:outline-hidden p-0 bg-transparent border-0 focus:ring-0 focus:ring-offset-0"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="w-full text-center text-sm font-bold text-gray-900 hover:bg-gray-50/80 py-1 rounded-md transition-colors cursor-pointer select-none"
            >
              {inputValue}
            </button>
          )}
        </div>

        {/* Increment Button */}
        <button
          type="button"
          onClick={handleIncrement}
          disabled={currentQuantityRef.current >= max || isSyncing}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 active:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Syncing indicator */}
      {isSyncing && (
        <span className="text-gray-400 animate-pulse flex items-center gap-1.5 text-xs font-medium">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>saving...</span>
        </span>
      )}
    </div>
  );
}
