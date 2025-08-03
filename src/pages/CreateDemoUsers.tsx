import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface DemoUser {
  email: string;
  password: string;
  fullName: string;
  profileId: string;
}

const CreateDemoUsers = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<DemoUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  const createDemoUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-demo-users');
      
      if (error) throw error;
      
      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.error || 'Произошла ошибка');
      }
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при создании пользователей');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Создание демо пользователей</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!users.length && (
            <Button 
              onClick={createDemoUsers} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Создание...' : 'Создать демо пользователей'}
            </Button>
          )}

          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-md">
              {error}
            </div>
          )}

          {users.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Созданные пользователи:</h3>
              <div className="grid gap-3">
                {users.map((user, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-2">
                      <div className="font-medium">{user.fullName}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Email:</span>
                        <code className="bg-muted px-2 py-1 rounded text-sm">{user.email}</code>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(user.email)}
                        >
                          Копировать
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Пароль:</span>
                        <code className="bg-muted px-2 py-1 rounded text-sm">{user.password}</code>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(user.password)}
                        >
                          Копировать
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-muted rounded-md">
                <h4 className="font-medium mb-2">Все данные для входа:</h4>
                <pre className="text-sm whitespace-pre-wrap">
                  {users.map(user => `${user.email} | ${user.password} | ${user.fullName}`).join('\n')}
                </pre>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => copyToClipboard(users.map(user => `${user.email} | ${user.password} | ${user.fullName}`).join('\n'))}
                >
                  Копировать все данные
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateDemoUsers;