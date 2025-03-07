interface ErrorMessageProps {
  title: string;
  message: string;
}

export default function ErrorMessage({ title, message }: ErrorMessageProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <h2 className="mb-2 text-xl font-semibold text-red-800">{title}</h2>
      <p className="text-red-600">{message}</p>
    </div>
  );
}
