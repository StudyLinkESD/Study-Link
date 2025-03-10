'use client';

import { fr } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import React, { forwardRef } from 'react';

import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

import './date-picker.css';

interface DatePickerProps {
  className?: string;
  placeholder?: string;
  selected?: Date | null;
  onChange?: (date: Date | null) => void;
  showMonthYearPicker?: boolean;
  dateFormat?: string;
}

const DatePicker = ({
  className,
  selected,
  onChange,
  placeholder = 'Sélectionner une date',
  showMonthYearPicker = true,
  dateFormat = 'MMMM yyyy',
  ...props
}: DatePickerProps) => {
  const CustomInput = forwardRef<HTMLButtonElement, { value?: string; onClick?: () => void }>(
    ({ value, onClick }, ref) => (
      <Button
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          if (onClick) onClick();
        }}
        type="button"
        ref={ref}
        className={cn(
          'w-full justify-start border-gray-300 text-left font-normal hover:bg-gray-50',
          !value && 'text-muted-foreground',
          className,
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
        {value || placeholder}
      </Button>
    ),
  );
  CustomInput.displayName = 'CustomInput';

  return (
    <ReactDatePicker
      selected={selected}
      onChange={onChange}
      customInput={<CustomInput />}
      showMonthYearPicker={showMonthYearPicker}
      dateFormat={dateFormat}
      locale={fr}
      popperClassName="date-picker-popper"
      calendarClassName="date-picker-calendar"
      {...props}
    />
  );
};

export { DatePicker };
