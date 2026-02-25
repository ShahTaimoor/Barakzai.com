import React from 'react';
import { Printer } from 'lucide-react';

/**
 * PrintTrigger - Button/trigger that invokes the print callback.
 */
const PrintTrigger = ({
  onPrint,
  disabled = false,
  loading = false,
  children,
  className = 'btn btn-outline btn-md flex items-center gap-2',
  title = 'Print',
  showIcon = true
}) => (
  <button
    type="button"
    onClick={onPrint}
    disabled={disabled || loading}
    title={title}
    className={className}
  >
    {showIcon && <Printer className="h-4 w-4" />}
    {children ?? (loading ? 'Printing...' : 'Print')}
  </button>
);

export default PrintTrigger;
