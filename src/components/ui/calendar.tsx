'use client';

import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

import * as React from 'react';

import { buttonVariants } from '@/components/ui/button';

import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  // Créer des composants personnalisés pour les icônes
  const IconLeft = React.forwardRef<HTMLButtonElement>((props, ref) => (
    <button ref={ref} {...props}>
      <ChevronLeft className="h-4 w-4" />
    </button>
  ));
  IconLeft.displayName = 'IconLeft';

  const IconRight = React.forwardRef<HTMLButtonElement>((props, ref) => (
    <button ref={ref} {...props}>
      <ChevronRight className="h-4 w-4" />
    </button>
  ));
  IconRight.displayName = 'IconRight';

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('select-none p-3', className)}
      classNames={{
        months: 'flex flex-col space-y-4',
        month: 'space-y-4 w-[280px]',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium hidden',
        caption_dropdowns: 'flex justify-center gap-1',
        dropdown: 'relative z-10',
        dropdown_month: 'text-sm font-medium',
        dropdown_year: 'text-sm font-medium',
        dropdown_icon: 'hidden',
        vhidden: 'hidden',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell: 'w-9 font-normal text-[0.8rem] opacity-0 h-0 overflow-hidden',
        row: 'flex w-full mt-2',
        cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100',
        ),
        day_range_end: 'day-range-end',
        day_selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        day_today: 'bg-accent text-accent-foreground',
        day_outside:
          'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
        day_disabled: 'text-muted-foreground opacity-50',
        day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_hidden: 'invisible',
        ...classNames,
      }}
      locale={fr}
      fixedWeeks={true}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
