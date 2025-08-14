import React, { memo, useCallback, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Building,
  Clock,
  Settings,
  MoreHorizontal,
  UserCheck,
  UserX
} from 'lucide-react';
import { format } from 'date-fns';

interface Profile {
  id: string;
  full_name: string;
  position: string;
  department: string;
  role: 'admin' | 'manager' | 'employee';
  avatar_url?: string;
  phone?: string;
  hire_date: string;
  is_active: boolean;
  salary?: number;
  telegram_username?: string;
}

interface ProfileCardProps {
  profile: Profile;
  currentUserId?: string;
  onEdit?: (profile: Profile) => void;
  onToggleStatus?: (profileId: string, isActive: boolean) => void;
  compact?: boolean;
  showActions?: boolean;
}

const roleColors = {
  admin: 'border-red-200 bg-red-50 text-red-800',
  manager: 'border-blue-200 bg-blue-50 text-blue-800',
  employee: 'border-green-200 bg-green-50 text-green-800',
} as const;

const ProfileCardComponent: React.FC<ProfileCardProps> = ({
  profile,
  currentUserId,
  onEdit,
  onToggleStatus,
  compact = false,
  showActions = true
}) => {
  const initials = useMemo(() => {
    return profile.full_name
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [profile.full_name]);

  const formattedHireDate = useMemo(() => {
    return format(new Date(profile.hire_date), 'dd/MM/yyyy');
  }, [profile.hire_date]);

  const isCurrentUser = useMemo(() => {
    return profile.id === currentUserId;
  }, [profile.id, currentUserId]);

  const handleEdit = useCallback(() => {
    onEdit?.(profile);
  }, [onEdit, profile]);

  const handleToggleStatus = useCallback(() => {
    onToggleStatus?.(profile.id, !profile.is_active);
  }, [onToggleStatus, profile.id, profile.is_active]);

  if (compact) {
    return (
      <Card className={`${!profile.is_active ? 'opacity-60' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              <AvatarFallback className="text-sm">{initials}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm truncate">{profile.full_name}</h4>
                {isCurrentUser && (
                  <Badge variant="outline" className="text-xs">You</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{profile.position}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={`text-xs ${roleColors[profile.role]}`}>
                {profile.role}
              </Badge>
              {!profile.is_active && (
                <UserX className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${!profile.is_active ? 'opacity-60 border-dashed' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{profile.full_name}</CardTitle>
                {isCurrentUser && (
                  <Badge variant="outline">You</Badge>
                )}
                {!profile.is_active && (
                  <Badge variant="destructive">Inactive</Badge>
                )}
              </div>
              <p className="text-muted-foreground">{profile.position}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={roleColors[profile.role]}>
              {profile.role}
            </Badge>
            {profile.is_active ? (
              <UserCheck className="h-4 w-4 text-green-600" />
            ) : (
              <UserX className="h-4 w-4 text-red-600" />
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span>{profile.department}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Hired: {formattedHireDate}</span>
          </div>

          {profile.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{profile.phone}</span>
            </div>
          )}

          {profile.telegram_username && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>@{profile.telegram_username}</span>
            </div>
          )}
        </div>

        {profile.salary && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Salary</span>
              <span className="font-medium">${profile.salary.toLocaleString()}</span>
            </div>
          </div>
        )}

        {showActions && (
          <>
            <Separator />
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Last updated: {formattedHireDate}</span>
              </div>
              
              <div className="flex gap-2">
                {onToggleStatus && !isCurrentUser && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleToggleStatus}
                  >
                    {profile.is_active ? (
                      <>
                        <UserX className="h-4 w-4 mr-1" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4 mr-1" />
                        Activate
                      </>
                    )}
                  </Button>
                )}
                
                {onEdit && (
                  <Button variant="ghost" size="sm" onClick={handleEdit}>
                    <Settings className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export const ProfileCard = memo(ProfileCardComponent);