interface ErrorMessageProps {
  title: string;
  message: string;
}

export default function ErrorMessage({ title, message }: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <h2 className="text-red-800 text-xl font-semibold mb-2">{title}</h2>
      <p className="text-red-600">{message}</p>
    </div>
  );
}
