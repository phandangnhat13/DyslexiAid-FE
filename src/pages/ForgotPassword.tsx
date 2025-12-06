import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Mail, Send, CheckCircle2, KeyRound, Lock, Eye, EyeOff } from "lucide-react";
import { AuthService } from "@/services/authService";

type Step = "email" | "verify" | "success";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get full OTP code from array
  const getOtpCode = () => otpValues.join("");

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    // Only allow alphanumeric characters
    const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    
    if (sanitizedValue.length <= 1) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = sanitizedValue;
      setOtpValues(newOtpValues);

      // Auto-focus next input
      if (sanitizedValue && index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    } else if (sanitizedValue.length === 6) {
      // Handle paste of full code
      const newOtpValues = sanitizedValue.split("");
      setOtpValues(newOtpValues);
      otpInputRefs.current[5]?.focus();
    }
  };

  // Handle OTP keydown for backspace navigation
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste event for OTP
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6);
    if (pastedData.length > 0) {
      const newOtpValues = [...otpValues];
      for (let i = 0; i < pastedData.length && i < 6; i++) {
        newOtpValues[i] = pastedData[i];
      }
      setOtpValues(newOtpValues);
      const focusIndex = Math.min(pastedData.length, 5);
      otpInputRefs.current[focusIndex]?.focus();
    }
  };

  // Handle email submission (Step 1)
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email) {
      setError("Vui lòng nhập email");
      setIsLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email không hợp lệ");
      setIsLoading(false);
      return;
    }

    const result = await AuthService.forgotPassword(email);

    if (result.success) {
      setStep("verify");
    } else {
      setError(result.message || "Có lỗi xảy ra, vui lòng thử lại");
    }

    setIsLoading(false);
  };

  // Handle code and new password submission (Step 2)
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const code = getOtpCode();

    if (!code || code.length !== 6) {
      setError("Vui lòng nhập đầy đủ mã xác thực 6 ký tự");
      setIsLoading(false);
      return;
    }

    if (!newPassword) {
      setError("Vui lòng nhập mật khẩu mới");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("Mật khẩu mới phải có ít nhất 8 ký tự");
      setIsLoading(false);
      return;
    }

    if (!confirmPassword) {
      setError("Vui lòng nhập xác nhận mật khẩu");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      setIsLoading(false);
      return;
    }

    const result = await AuthService.resetPassword({
      email,
      code,
      newPassword,
      confirmNewPassword: confirmPassword,
    });

    if (result.success) {
      setStep("success");
    } else {
      setError(result.message || "Có lỗi xảy ra, vui lòng thử lại");
    }

    setIsLoading(false);
  };

  // Resend verification code
  const handleResendCode = async () => {
    setError("");
    setIsLoading(true);
    
    const result = await AuthService.forgotPassword(email);
    
    if (!result.success) {
      setError(result.message || "Có lỗi xảy ra khi gửi lại mã");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              {step === "email" && <Mail className="w-8 h-8 text-primary" />}
              {step === "verify" && <KeyRound className="w-8 h-8 text-primary" />}
              {step === "success" && <CheckCircle2 className="w-8 h-8 text-primary" />}
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">
            {step === "email" && "Quên mật khẩu"}
            {step === "verify" && "Xác thực & Đặt lại"}
            {step === "success" && "Thành công!"}
          </CardTitle>
          <CardDescription>
            {step === "email" && "Nhập email của bạn để nhận mã xác thực"}
            {step === "verify" && `Nhập mã xác thực đã gửi đến ${email}`}
            {step === "success" && "Mật khẩu của bạn đã được đặt lại thành công"}
          </CardDescription>
        </CardHeader>

        {step === "success" ? (
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center text-center space-y-4 py-6">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Đặt lại mật khẩu thành công!</h3>
                <p className="text-sm text-muted-foreground">
                  Bạn có thể đăng nhập bằng mật khẩu mới của mình
                </p>
              </div>
              <Button onClick={() => navigate("/login")} className="w-full">
                Đăng nhập ngay
              </Button>
            </div>
          </CardContent>
        ) : step === "verify" ? (
          <form onSubmit={handleResetSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>Mã xác thực (6 ký tự)</Label>
                <div className="flex justify-center gap-2">
                  {otpValues.map((value, index) => (
                    <Input
                      key={index}
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      type="text"
                      value={value}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      className="w-12 h-12 text-center text-xl font-bold font-mono uppercase"
                      maxLength={1}
                      disabled={isLoading}
                      autoComplete="off"
                    />
                  ))}
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Nhập mã 6 ký tự đã gửi đến email của bạn
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Đặt lại mật khẩu
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full"
                onClick={handleResendCode}
                disabled={isLoading}
              >
                Gửi lại mã xác thực
              </Button>
              <Button
                type="button"
                variant="link"
                onClick={() => setStep("email")}
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Button>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleEmailSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Gửi mã xác thực
                  </>
                )}
              </Button>
              <Link to="/login" className="w-full">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại đăng nhập
                </Button>
              </Link>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;

