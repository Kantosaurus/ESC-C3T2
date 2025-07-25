export const DashboardLoading = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Loading dashboard...
        </p>
      </div>
    </div>
  );
};
