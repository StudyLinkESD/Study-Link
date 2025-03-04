import { Input } from "@/components/ui/input";

interface ICommonInputProps {
  placeholder: string;
  name: string;
  type: string;
}

const CommonInput = ({ placeholder, name, type }: ICommonInputProps) => {
  return (
    <Input
      className="h-[50px] mb-0"
      placeholder={placeholder}
      name={name}
      type={type}
    />
  );
};

export default CommonInput;
