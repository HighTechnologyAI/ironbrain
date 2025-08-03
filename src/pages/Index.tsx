import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Users, MessageCircle, BarChart3, Settings, Bell } from "lucide-react";

const Index = () => {
  const [language, setLanguage] = useState('ru');

  const translations = {
    ru: {
      title: "🛡️ IRON CRM",
      welcome: "Добро пожаловать",
      subtitle: "Интеллектуальная система управления командой",
      myTasks: "Мои задачи",
      team: "Команда", 
      aiChat: "AI Чат",
      analytics: "Аналитика",
      settings: "Настройки",
      notifications: "Уведомления",
      activeTasks: "Активных задач",
      teamMembers: "Участников команды",
      aiRequests: "AI запросов сегодня"
    },
    en: {
      title: "🛡️ IRON CRM",
      welcome: "Welcome", 
      subtitle: "Intelligent team management system",
      myTasks: "My Tasks",
      team: "Team",
      aiChat: "AI Chat", 
      analytics: "Analytics",
      settings: "Settings",
      notifications: "Notifications",
      activeTasks: "Active tasks",
      teamMembers: "Team members",
      aiRequests: "AI requests today"
    }
  };

  const t = translations[language as keyof typeof translations];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t.title}</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
              >
                {language === 'ru' ? '🇷🇺' : '🇬🇧'}
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
          <CardHeader>
            <CardTitle className="text-2xl">{t.welcome}!</CardTitle>
            <p className="text-blue-100">{t.subtitle}</p>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">5</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{t.activeTasks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">12</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{t.teamMembers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">23</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{t.aiRequests}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Menu */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">{t.myTasks}</h3>
              <Badge variant="secondary">5 новых</Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">{t.team}</h3>
              <Badge variant="secondary">Онлайн: 8</Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">{t.aiChat}</h3>
              <Badge variant="secondary">🤖 AI</Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">{t.analytics}</h3>
              <Badge variant="secondary">Отчеты</Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Settings className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="font-semibold mb-2">{t.settings}</h3>
              <Badge variant="secondary">Профиль</Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Bell className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold mb-2">{t.notifications}</h3>
              <Badge variant="secondary">3 новых</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
