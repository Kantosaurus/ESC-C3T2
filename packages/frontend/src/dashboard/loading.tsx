import { PageLoader } from "@/components/ui/page-loader";

export const DashboardLoading = () => {
  return <PageLoader loading={true} pageType="dashboard" />;
};
