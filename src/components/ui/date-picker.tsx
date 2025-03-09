'use client';

import { fr, Locale } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import React, { forwardRef } from 'react';

import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

// Styles personnalisés pour le DatePicker
import './date-picker.css';

export interface DatePickerProps {
  className?: string;
  placeholder?: string;
  selected?: Date | null;
  onChange?: (date: Date | null) => void;
  showMonthYearPicker?: boolean;
  dateFormat?: string;
  locale?: Locale;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Pour les autres props de ReactDatePicker
}

const DatePicker = ({
  className,
  selected,
  onChange,
  placeholder = 'Sélectionner une date',
  showMonthYearPicker = true,
  dateFormat = 'MMMM yyyy',
  locale = fr,
  ...props
}: DatePickerProps) => {
  // Composant personnalisé pour le bouton du datepicker
  const CustomInput = forwardRef<HTMLButtonElement, { value?: string; onClick?: () => void }>(
    ({ value, onClick }, ref) => (
      <Button
        variant="outline"
        onClick={(e) => {
          e.preventDefault(); // Empêcher la soumission du formulaire
          if (onClick) onClick();
        }}
        type="button" // Explicitement définir le type comme "button" pour éviter la soumission du formulaire
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
      locale={locale}
      popperClassName="date-picker-popper"
      calendarClassName="date-picker-calendar"
      {...props}
    />
  );
};

export { DatePicker };
