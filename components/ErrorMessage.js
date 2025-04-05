const ErrorMessage = ({ 
    message = "An error occurred!", 
    retryFn,
    className = "" 
  }) => {
    return (
      <div className={`flex items-start gap-3 p-4 mb-4 bg-red-50 border-l-4 border-red-500 ${className}`}>
        <span className="text-red-500 text-xl">⚠️</span>
        <div className="flex-1">
          <p className="text-red-800">{message}</p>
          {retryFn && (
            <button
              onClick={retryFn}
              className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  };
  
  export default ErrorMessage;