import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Apple,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function EnhancedLogin() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [verificationStep, setVerificationStep] = useState<
    "none" | "sent" | "verified"
  >("none");

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { user, error } = await signIn(email, password);

      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message || "Failed to sign in. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (user) {
        // Simulate email verification check
        if (user.id.includes("demo")) {
          // Demo mode - simulate verification
          setVerificationStep("verified");
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
          setTimeout(() => navigate("/explore"), 1000);
        } else {
          // Real mode - check if email is verified
          // In production, this would check user.email_confirmed_at
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
          navigate("/explore");
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    try {
      // Simulate Apple Sign-In flow
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate email verification sent
      setVerificationStep("sent");
      toast({
        title: "Verification Email Sent",
        description:
          "Please check your email and click the verification link to complete sign-in with Apple.",
      });

      // Simulate email verification after a few seconds
      setTimeout(() => {
        setVerificationStep("verified");
        toast({
          title: "Email Verified!",
          description:
            "Your Apple account has been verified. Signing you in...",
        });
        setTimeout(() => navigate("/explore"), 1000);
      }, 3000);
    } catch (error) {
      toast({
        title: "Apple Sign-In Failed",
        description: "Failed to sign in with Apple. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailContinue = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate sending verification email
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setVerificationStep("sent");
      toast({
        title: "Verification Email Sent",
        description: `We've sent a verification link to ${email}. Please check your email and click the link to continue.`,
      });

      // Simulate email verification after a few seconds
      setTimeout(() => {
        setVerificationStep("verified");
        toast({
          title: "Email Verified!",
          description: "Your email has been verified. You can now continue.",
        });
      }, 4000);
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Failed to send verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to reset your password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate sending password reset email
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setResetEmailSent(true);
      toast({
        title: "Password Reset Email Sent",
        description: `We've sent password reset instructions to ${resetEmail}. Please check your email.`,
      });
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Failed to send password reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderVerificationStatus = () => {
    switch (verificationStep) {
      case "sent":
        return (
          <Alert className="mb-4">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Verification email sent! Please check your email and click the
              verification link.
            </AlertDescription>
          </Alert>
        );
      case "verified":
        return (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Email verified successfully! Redirecting...
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-white"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              <path d="M20 75C25 70, 30 65, 35 70C40 75, 45 70, 50 75C55 80, 60 75, 65 80C70 85, 75 80, 80 85" />
              <path d="M20 65C25 60, 30 55, 35 60C40 65, 45 60, 50 65C55 70, 60 65, 65 70C70 75, 75 70, 80 75" />
              <path d="M20 55C25 50, 30 45, 35 50C40 55, 45 50, 50 55C55 60, 60 55, 65 60C70 65, 75 60, 80 65" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Welcome Back to Wildpals
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue your adventure
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderVerificationStatus()}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10"
                  disabled={isLoading || verificationStep === "verified"}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  disabled={isLoading || verificationStep === "verified"}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <Button
                onClick={handleLogin}
                disabled={isLoading || verificationStep === "verified"}
                className="w-full"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>

              <Button
                onClick={handleEmailContinue}
                variant="outline"
                disabled={isLoading || verificationStep === "verified"}
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                {verificationStep === "sent"
                  ? "Verification Sent"
                  : "Continue with Email"}
              </Button>

              <Button
                onClick={handleAppleSignIn}
                variant="outline"
                disabled={isLoading || verificationStep === "verified"}
                className="w-full"
              >
                <Apple className="h-4 w-4 mr-2" />
                {isLoading ? "Connecting..." : "Continue with Apple"}
              </Button>
            </div>

            {/* Forgot Password */}
            <div className="text-center">
              <Dialog
                open={showForgotPassword}
                onOpenChange={setShowForgotPassword}
              >
                <DialogTrigger asChild>
                  <Button variant="link" className="text-sm">
                    Forgot your password?
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                    <DialogDescription>
                      Enter your email address and we'll send you a link to
                      reset your password.
                    </DialogDescription>
                  </DialogHeader>

                  {resetEmailSent ? (
                    <div className="py-4">
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          Password reset instructions have been sent to{" "}
                          {resetEmail}. Please check your email and follow the
                          instructions.
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : (
                    <div className="py-4">
                      <Label htmlFor="resetEmail">Email Address</Label>
                      <Input
                        id="resetEmail"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="mt-2"
                      />
                    </div>
                  )}

                  <DialogFooter>
                    {resetEmailSent ? (
                      <Button
                        onClick={() => {
                          setShowForgotPassword(false);
                          setResetEmailSent(false);
                          setResetEmail("");
                        }}
                      >
                        Close
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => setShowForgotPassword(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleForgotPassword}
                          disabled={isLoading}
                        >
                          {isLoading ? "Sending..." : "Send Reset Link"}
                        </Button>
                      </>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Demo Notice */}
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Demo Mode:</strong> Email verification and password
                reset are simulated. In production, real emails would be sent
                via Supabase Auth.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Button
              variant="link"
              asChild
              className="p-0 h-auto text-blue-600 hover:text-blue-500"
            >
              <a href="/signup">Sign up here</a>
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
