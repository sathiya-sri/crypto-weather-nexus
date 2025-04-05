const LoadingSpinner = ({ size = "md" }) => {
    const sizeClasses = {
      sm: "w-6 h-6 border-2",
      md: "w-8 h-8 border-3",
      lg: "w-12 h-12 border-4"
    };
  
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-5">
        <div
          className={`rounded-full border-solid border-gray-200 border-t-blue-500 animate-spin ${
            sizeClasses[size]
          }`}
        />
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  };
  
  export default LoadingSpinner;