import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Zap, Shield, Lock, Mail, User, Eye, EyeOff, Building, Briefcase, Phone, MessageCircle } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import CyberBackground from "@/components/AnimatedStarfield";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    position: "",
    department: "",
    phone: "",
    telegramUsername: ""
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    // Проверяем, авторизован ли уже пользователь
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/');
      }
    });

    // Слушаем изменения авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        toast({
          title: t.successLogin,
          description: t.welcomeToTiger,
        });
        navigate('/');
      }
    } catch (error: any) {
      let errorMessage = t.loginErrorGeneric;
      
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = t.invalidCredentials;
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = t.emailNotConfirmed;
      }

      toast({
        title: t.loginError,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: formData.fullName,
            position: formData.position,
            department: formData.department,
            phone: formData.phone,
            telegram_username: formData.telegramUsername
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        toast({
          title: t.registrationSuccess,
          description: t.checkEmail,
        });
      }
    } catch (error: any) {
      let errorMessage = t.registrationErrorGeneric;
      
      if (error.message.includes("User already registered")) {
        errorMessage = t.userExists;
      } else if (error.message.includes("Password should be")) {
        errorMessage = t.weakPassword;
      }

      toast({
        title: t.registrationError,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6">
      <CyberBackground />
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        {/* Language Switcher */}
        <div className="absolute top-6 right-6 z-20">
          <LanguageSwitcher />
        </div>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Zap className="text-primary h-12 w-12 cyber-glow animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-full blur-xl"></div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-yellow-400 bg-clip-text text-transparent">{t.title}</h1>
          </div>
          <p className="text-foreground/80 font-mono text-sm tracking-wider">
            {t.systemDesc}
          </p>
        </div>

        <Card className="bg-black/80 backdrop-blur-md border-primary/30 cyber-glow hover:border-primary/50 transition-all duration-500 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2 text-foreground">
              <Shield className="h-5 w-5 text-primary" />
              {t.auth}
            </CardTitle>
            <CardDescription className="text-center text-foreground/70">
              {t.enterSystem}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-black/60 border border-primary/20">
                <TabsTrigger 
                  value="signin"
                  className="text-foreground/70 data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:font-semibold transition-all"
                >
                  {t.signIn}
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="text-foreground/70 data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:font-semibold transition-all"
                >
                  {t.signUp}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4 mt-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {t.email}
                    </Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="example@company.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      {t.password}
                    </Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? t.signingIn : t.signIn}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-fullname" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {t.fullName}
                    </Label>
                    <Input
                      id="signup-fullname"
                      name="fullName"
                      type="text"
                      placeholder="Иван Иванов"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-position" className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      {t.position}
                    </Label>
                    <Input
                      id="signup-position"
                      name="position"
                      type="text"
                      placeholder="Менеджер проектов"
                      value={formData.position}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-department" className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {t.department}
                    </Label>
                    <Select onValueChange={(value) => handleSelectChange('department', value)} disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectDepartment} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Управление">Управление</SelectItem>
                        <SelectItem value="Маркетинг">Маркетинг</SelectItem>
                        <SelectItem value="Экспертиза">Экспертиза</SelectItem>
                        <SelectItem value="Производство">Производство</SelectItem>
                        <SelectItem value="Руководство">Руководство</SelectItem>
                        <SelectItem value="IT">IT</SelectItem>
                        <SelectItem value="Консультации">Консультации</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {t.phone}
                    </Label>
                    <Input
                      id="signup-phone"
                      name="phone"
                      type="tel"
                      placeholder="+7 (999) 123-45-67"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-telegram" className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      {t.telegram}
                    </Label>
                    <Input
                      id="signup-telegram"
                      name="telegramUsername"
                      type="text"
                      placeholder="@username"
                      value={formData.telegramUsername}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {t.email}
                    </Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="ivan@company.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      {t.password}
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t.minPassword}
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? t.registering : t.signUp}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Auth;