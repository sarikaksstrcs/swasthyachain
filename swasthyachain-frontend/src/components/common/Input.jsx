
// =============================================
// src/components/common/Input.jsx
// =============================================
export const Input = ({ 
  label, 
  error, 
  type = 'text',
  icon: Icon,
  className = '',
  ...props 
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          type={type}
          className={`w-full pt-2 input-field ${Icon ? 'pl-10' : ''} ${
            error ? 'border-red-500 focus:ring-red-500' : ''
          }`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
