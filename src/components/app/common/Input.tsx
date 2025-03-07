import { Input } from '@/components/ui/input';

interface ICommonInputProps {
  placeholder: string;
  name: string;
  type: string;
}

const CommonInput = ({ placeholder, name, type }: ICommonInputProps) => {
  return <Input className="mb-0 h-[50px]" placeholder={placeholder} name={name} type={type} />;
};

export default CommonInput;
