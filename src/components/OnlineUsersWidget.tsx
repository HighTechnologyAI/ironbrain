import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Activity,
  Eye,
  Clock,
  Wifi
} from "lucide-react";
import { useUserPresence } from "@/hooks/use-user-presence";

const OnlineUsersWidget = () => {
  const { onlineUsers, userCount } = useUserPresence();

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-primary" />
          Пользователи онлайн
          <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
            {userCount}
          </Badge>
        </CardTitle>
        <CardDescription>Активные пользователи в системе</CardDescription>
      </CardHeader>
      <CardContent>
        {userCount === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <Wifi className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Нет активных пользователей</p>
          </div>
        ) : (
          <div className="space-y-3">
            {onlineUsers.slice(0, 5).map((user) => (
              <div key={user.user_id} className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {user.full_name?.split(' ').map(n => n[0]).join('') || user.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background bg-primary"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.full_name || user.email}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(user.online_at).toLocaleTimeString('ru-RU', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  {user.status}
                </Badge>
              </div>
            ))}
            
            {userCount > 5 && (
              <div className="text-center pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  +{userCount - 5} больше пользователей онлайн
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OnlineUsersWidget;