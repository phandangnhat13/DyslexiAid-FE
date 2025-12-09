import { DashboardChart } from "@/components/DashboardChart";
import { DashboardLoginRequired } from "@/components/LoginRequired";
import { AuthGuard } from "@/components/AuthGuard";

const Dashboard = () => {
  return (
    <AuthGuard fallback={<DashboardLoginRequired />}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8 animate-fade-in">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Tiến trình của bạn
            </h1>
            <p className="text-muted-foreground">
              Theo dõi sự tiến bộ và thành tích của bạn
            </p>
          </div>

          <DashboardChart />
        </div>
      </div>
    </AuthGuard>
  );
};

export default Dashboard;
