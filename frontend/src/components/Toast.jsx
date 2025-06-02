export default function Toast({ message, type = 'success', onClose }) {
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  
  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
          ×
        </button>
      )}
    </div>
  );
} 