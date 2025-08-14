import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusChip } from "@/components/ui/status-chip";
import { Progress } from "@/components/ui/progress";
import { 
  Cpu,
  Database,
  Clock,
  Activity,
  Plane,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  CheckSquare,
  AlertTriangle,
  Settings,
  Zap,
  Radio,
  Thermometer,
  Battery,
  Wifi
} from "lucide-react";
import AppNavigation from "@/components/AppNavigation";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { usePerformanceData } from "@/hooks/use-performance-data";
import { useUserPresence } from "@/hooks/use-user-presence";

const UAVDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const { data: performanceData } = usePerformanceData();
  const { userCount: onlineUserCount } = useUserPresence();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // OKR Block Data
  const currentQuarter = `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`;
  const objectiveProgress = 73; // Example progress

  // KPI Cards Data
  const kpiCards = [
    {
      title: "Active Missions",
      value: "12",
      change: "+3",
      icon: Plane,
      status: "armed" as const,
      description: "Drones in flight",
      onClick: () => navigate('/missions')
    },
    {
      title: "Production Line", 
      value: "47",
      change: "+8",
      icon: Target,
      status: "ready" as const,
      description: "Units in production",
      onClick: () => navigate('/production')
    },
    {
      title: "Technical Status",
      value: "98.2%",
      change: "+0.5%",
      icon: ShieldCheck,
      status: "ready" as const,
      description: "System health"
    },
    {
      title: "Team Members",
      value: onlineUserCount.toString(),
      change: "+5",
      icon: Users,
      status: "info" as const,
      description: "Operators online",
      onClick: () => navigate('/team')
    }
  ];

  // System Status Panel Data
  const systemMetrics = [
    { label: "БД", value: "99.9%", icon: Database, status: "ready" },
    { label: "CPU", value: "24%", icon: Cpu, status: "ready" },
    { label: "RTT", value: "42ms", icon: Activity, status: "ready" },
    { label: "ESC Темп.", value: "42°C", icon: Thermometer, status: "warning" },
    { label: "Батарея", value: "87%", icon: Battery, status: "ready" },
    { label: "Связь", value: "RSSI -45", icon: Radio, status: "ready" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation 
        title={t.operationalCenter} 
        subtitle={t.uavSystem}
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Welcome Section with Mission Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Zap className="text-primary h-8 w-8" />
              <div className="absolute inset-0 shadow-mission-primary rounded-full blur-sm"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold font-ui tracking-tight">
                {t.welcomeUser}, {user?.email?.split('@')[0]}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-success" />
                  <span>{t.systems}:</span>
                  <StatusChip variant="ready">{t.ready}</StatusChip>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{currentTime.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
          <Button variant="mission" size="lg" className="hover-scale transition-all duration-300 hover:shadow-lg hover:shadow-primary/25" onClick={() => navigate('/missions')}>
            <Plane className="h-4 w-4 mr-2" />
            {t.launchMission}
          </Button>
        </div>

        {/* OKR Block - Large Strategic Focus */}
        <Card 
          className="bg-surface-1 border-border cursor-pointer hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.01] transition-all duration-300"
          onClick={() => navigate('/tasks')}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-ui">Strategic Goal Q3 2025</CardTitle>
                <CardDescription className="font-mono text-sm">
                  Increase production capacity to 100 units/month
                </CardDescription>
              </div>
              <StatusChip variant="ready">НА ПУТИ</StatusChip>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">{objectiveProgress}% выполнения</span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-success" />
                <span>+12% за месяц</span>
              </div>
            </div>
            <Progress value={objectiveProgress} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Производство:</span>
                <div className="font-mono font-semibold">78 ед/мес</div>
              </div>
              <div>
                <span className="text-muted-foreground">Качество:</span>
                <div className="font-mono font-semibold">99.2%</div>
              </div>
              <div>
                <span className="text-muted-foreground">Дедлайн:</span>
                <div className="font-mono font-semibold">31 дек</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((kpi, index) => (
            <Card 
              key={index} 
              className={`bg-surface-1 border-border transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:scale-105 ${
                kpi.onClick ? 'cursor-pointer' : ''
              }`}
              onClick={kpi.onClick}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-ui text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <kpi.icon className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-foreground">{kpi.value}</div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 text-xs">
                    <TrendingUp className="h-3 w-3 text-success" />
                    <span className="text-success font-semibold">{kpi.change}</span>
                  </div>
                  <StatusChip variant={kpi.status} className="text-xs">
                    {kpi.status === "armed" ? "ВООРУЖЕН" : 
                     kpi.status === "ready" ? "ГОТОВ" : 
                     kpi.status === "info" ? "ИНФО" : "ПРЕДУПРЕЖДЕНИЕ"}
                  </StatusChip>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-2 relative hover:scale-105 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
            onClick={() => navigate('/tasks')}
          >
            <CheckSquare className="h-5 w-5" />
            <span className="text-sm">{t.tasks}</span>
            {performanceData.pendingTasks > 0 && (
              <Badge variant="default" className="absolute -top-1 -right-1 min-w-6 h-6 flex items-center justify-center px-2 text-xs font-semibold animate-pulse">
                {performanceData.pendingTasks}
              </Badge>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-2 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
            onClick={() => navigate('/analytics')}
          >
            <Activity className="h-5 w-5" />
            <span className="text-sm">{t.analytics}</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-2 relative hover:scale-105 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
            onClick={() => navigate('/issues')}
          >
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm">{t.issues}</span>
            {performanceData.overdueTasks > 0 && (
              <Badge variant="critical" className="absolute -top-1 -right-1 min-w-6 h-6 flex items-center justify-center px-2 text-xs font-semibold animate-pulse">
                {performanceData.overdueTasks}
              </Badge>
            )}
          </Button>
        </div>

        {/* System Status Panel */}
        <Card className="bg-surface-1 border-border">
          <CardHeader>
            <CardTitle className="text-lg font-ui flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              {t.systemStatusLabel || "Системный статус"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {systemMetrics.map((metric, index) => (
                <div key={index} className="text-center p-3 rounded-lg bg-surface-2 border border-border">
                  <metric.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-xs text-muted-foreground mb-1">{metric.label}</div>
                  <div className="font-mono font-semibold text-sm">{metric.value}</div>
                  <StatusChip 
                    variant={metric.status as any} 
                    className="mt-2 text-xs scale-75"
                  >
                    {metric.status === "ready" ? "ОК" : "ВНИМАНИЕ"}
                  </StatusChip>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-muted-foreground text-center font-mono">
              Последнее обновление: {currentTime.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UAVDashboard;