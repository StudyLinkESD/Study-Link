import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

interface BaseFieldProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
}

interface TextFieldProps extends BaseFieldProps {
  type: 'text' | 'textarea';
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

interface SelectFieldProps extends BaseFieldProps {
  type: 'select';
  value: string | undefined;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

interface RadioFieldProps extends BaseFieldProps {
  type: 'radio';
  value: string | undefined;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

type ProfileFormFieldProps = TextFieldProps | SelectFieldProps | RadioFieldProps;

export default function ProfileFormField(props: ProfileFormFieldProps) {
  const { label, name, error, required } = props;

  const renderField = () => {
    switch (props.type) {
      case 'text':
        return (
          <Input
            id={props.name}
            type="text"
            value={props.value || ''}
            onChange={(e) => props.onChange(e.target.value)}
            placeholder={props.placeholder}
            maxLength={props.maxLength}
            className={cn(props.error && 'border-red-500')}
          />
        );
      case 'textarea':
        return (
          <Textarea
            id={props.name}
            value={props.value || ''}
            onChange={(e) => props.onChange(e.target.value)}
            placeholder={props.placeholder}
            maxLength={props.maxLength}
            className={cn('min-h-[100px]', props.error && 'border-red-500')}
          />
        );
      case 'select':
        return (
          <Select value={props.value || ''} onValueChange={props.onChange}>
            <SelectTrigger>
              <SelectValue placeholder={props.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {props.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'radio':
        return (
          <RadioGroup value={props.value || ''} onValueChange={props.onChange}>
            {props.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${props.name}-${option.value}`} />
                <Label htmlFor={`${props.name}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderField()}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
