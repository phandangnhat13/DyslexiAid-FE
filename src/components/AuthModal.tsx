import { useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, LogIn, Lock, User, UserPlus, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export const AuthModal = ({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  
  // Register state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  
  const { login, register } = useAuth();
  const { toast } = useToast();

  const resetForms = () => {
    // Reset login form
    setLoginEmail("");
    setLoginPassword("");
    setLoginError("");
    setIsLoginLoading(false);
    setShowLoginPassword(false);
    
    // Reset register form
    setRegisterName("");
    setRegisterEmail("");
    setRegisterUsername("");
    setRegisterPassword("");
    setRegisterConfirmPassword("");
    setRegisterError("");
    setIsRegisterLoading(false);
    setShowRegisterPassword(false);
    setShowRegisterConfirmPassword(false);
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoginLoading(true);

    if (!loginEmail || !loginPassword) {
      setLoginError("Vui lòng nhập đầy đủ thông tin");
      setIsLoginLoading(false);
      return;
    }

    try {
      const success = await login(loginEmail, loginPassword);
      if (success) {
        toast({
          title: "Đăng nhập thành công!",
          description: "Chào mừng bạn quay trở lại.",
        });
        handleClose();
      } else {
        setLoginError("Email hoặc mật khẩu không đúng");
      }
    } catch (err) {
      setLoginError("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    setIsRegisterLoading(true);

    if (!registerName || !registerEmail || !registerUsername || !registerPassword || !registerConfirmPassword) {
      setRegisterError("Vui lòng nhập đầy đủ thông tin");
      setIsRegisterLoading(false);
      return;
    }

    if (registerPassword.length < 6) {
      setRegisterError("Mật khẩu phải có ít nhất 6 ký tự");
      setIsRegisterLoading(false);
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setRegisterError("Mật khẩu nhập lại không khớp");
      setIsRegisterLoading(false);
      return;
    }

    try {
      const result = await register(registerUsername, registerEmail, registerName, registerPassword);
      if (result.success) {
        toast({
          title: "Đăng ký thành công!",
          description: "Tài khoản của bạn đã được tạo. Hãy đăng nhập để tiếp tục.",
        });
        setActiveTab('login');
        setLoginEmail(registerEmail);
      } else {
        setRegisterError(result.message || "Đăng ký thất bại");
      }
    } catch (err) {
      setRegisterError("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
      setIsRegisterLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Chào mừng đến với DyslexiAid
            </span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="gap-2">
              <LogIn className="h-4 w-4" />
              Đăng nhập
            </TabsTrigger>
            <TabsTrigger value="register" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Đăng ký
            </TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login" className="space-y-4 mt-6">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <Alert variant="destructive">
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="example@email.com"
                    className="pl-10"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={isLoginLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    disabled={isLoginLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    disabled={isLoginLoading}
                  >
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoginLoading}>
                {isLoginLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Đăng nhập
                  </>
                )}
              </Button>

              <div className="text-center">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-muted-foreground hover:text-primary hover:underline"
                  onClick={handleClose}
                >
                  Quên mật khẩu?
                </Link>
              </div>
            </form>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register" className="space-y-4 mt-6">
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {registerError && (
                <Alert variant="destructive">
                  <AlertDescription>{registerError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="register-name">Họ và tên</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className="pl-10"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    disabled={isRegisterLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="example@email.com"
                    className="pl-10"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    disabled={isRegisterLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-username">Tên đăng nhập</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-username"
                    type="text"
                    placeholder="username"
                    className="pl-10"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    disabled={isRegisterLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-password"
                    type={showRegisterPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    disabled={isRegisterLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    disabled={isRegisterLoading}
                  >
                    {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirm-password">Nhập lại mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-confirm-password"
                    type={showRegisterConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    disabled={isRegisterLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                    disabled={isRegisterLoading}
                  >
                    {showRegisterConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isRegisterLoading}>
                {isRegisterLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang đăng ký...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Đăng ký
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {/* Demo accounts info */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg mt-4">
          <p className="font-medium mb-2">🎯 Tài khoản demo:</p>
          <div className="space-y-1">
            <p><strong>Admin:</strong> admin@demo.com / demo1234</p>
            <p><strong>Teacher:</strong> teacher@demo.com / demo1234</p>
            <p><strong>Student:</strong> student@demo.com / demo1234</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
