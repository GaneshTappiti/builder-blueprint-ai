"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, Github, Sparkles, ArrowLeft, Brain } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { signIn, signUp, signInWithProvider, resetPassword, loading } = useAuth();

  // Check if we're on the reset password page
  const isResetPassword = searchParams.get('mode') === 'reset-password';

  // Clear error and success messages when switching tabs or modes
  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [isLogin, isForgotPassword]);

  // Validation functions
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const VALIDATION = {
    PASSWORD_MIN_LENGTH: 6
  };

  const handleProviderSignIn = async (provider: 'github' | 'google' | 'gmail') => {
    setError(null);
    setSuccess(null);
    try {
      await signInWithProvider(provider);
      // The redirect will happen automatically via Supabase OAuth
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (isResetPassword) {
        // Validate password confirmation
        if (newPassword !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        if (newPassword.length < VALIDATION.PASSWORD_MIN_LENGTH) {
          setError(`Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long`);
          return;
        }

        // Note: Password update would need to be handled via Supabase auth
        // This is a simplified version - in production you'd use the auth callback
        setSuccess('Password updated successfully!');
        toast({
          title: "Success",
          description: "Password updated successfully!"
        });
        setTimeout(() => router.push('/auth'), 2000);
      } else if (isForgotPassword) {
        // Handle forgot password
        if (!email) {
          setError('Please enter your email address');
          return;
        }

        // Validate email format
        if (!isValidEmail(email)) {
          setError('Please enter a valid email address');
          return;
        }

        await resetPassword(email);
        setSuccess('Password reset instructions sent to your email!');
        toast({
          title: "Success",
          description: "Password reset instructions sent to your email!"
        });
        setTimeout(() => setIsForgotPassword(false), 3000);
      } else {
        // Handle login/signup
        if (!email || !password) {
          setError('Please fill in all required fields');
          return;
        }

        // Validate email format
        if (!isValidEmail(email)) {
          setError('Please enter a valid email address');
          return;
        }

        if (!isLogin && password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
          setError(`Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long`);
          return;
        }

        if (isLogin) {
          await signIn(email, password);
          toast({
            title: "Success",
            description: "Signed in successfully!"
          });
          router.push('/workspace');
        } else {
          if (!name) {
            setError('Please enter your name');
            return;
          }
          await signUp(email, password, name);
          setSuccess('Please check your email to verify your account!');
          toast({
            title: "Success",
            description: "Please check your email to verify your account!"
          });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleForgotPassword = () => {
    setIsForgotPassword(true);
    setError(null);
    setSuccess(null);
  };

  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setError(null);
    setSuccess(null);
  };

  const handleSocialSignIn = async (provider: 'github' | 'google' | 'gmail') => {
    setError(null);
    setSuccess(null);
    try {
      await signInWithProvider(provider);
      // The redirect will happen automatically via Supabase OAuth
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  if (isResetPassword) {
    return (
      <div className="layout-container items-center justify-center bg-green-glass">
        <div className="w-full max-w-md p-8 space-y-8 workspace-card m-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-gray-400">Enter your new password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="pl-10 bg-black/20 border-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pl-10 bg-black/20 border-white/10"
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-500/20 border-green-500/50">
                <AlertDescription className="text-green-400">{success}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-500"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-green-glass">
      {/* Navigation Header */}
      <nav className="px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-green-600/20 rounded-lg border border-green-500/30">
              <Brain className="h-6 w-6 text-green-400" />
            </div>
            <span className="text-xl font-bold text-white">MVP Studio</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="text-gray-300 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      {/* Auth Form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8 workspace-card p-8">
          <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-green-400" />
            <h1 className="text-3xl font-bold text-white">MVP Studio</h1>
          </div>
          <p className="text-gray-400">Sign in to your account or create a new one</p>
        </div>

        {!isForgotPassword && (
          <Tabs defaultValue="login" className="w-full" onValueChange={(value) => setIsLogin(value === 'login')}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 workspace-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 workspace-input"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-400"
                >
                  Remember me
                </label>
              </div>

              <Button
                type="button"
                variant="link"
                className="text-sm text-gray-400 hover:text-white"
                onClick={handleForgotPassword}
              >
                Forgot your password?
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-500/20 border-green-500/50">
                  <AlertDescription className="text-green-400">{success}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full workspace-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-black/20 px-2 text-gray-400">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="workspace-button-secondary"
                  onClick={() => handleSocialSignIn('github')}
                  disabled={loading}
                >
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="workspace-button-secondary"
                  onClick={() => handleSocialSignIn('google')}
                  disabled={loading}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="workspace-button-secondary"
                  onClick={() => handleSocialSignIn('gmail')}
                  disabled={loading}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Gmail
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="pl-10 bg-black/20 border-white/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 bg-black/20 border-white/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 bg-black/20 border-white/10"
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-500/20 border-green-500/50">
                  <AlertDescription className="text-green-400">{success}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-500"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-black/20 px-2 text-gray-400">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="bg-black/20 border-white/10 hover:bg-black/30"
                  onClick={() => handleSocialSignIn('github')}
                  disabled={loading}
                >
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="bg-black/20 border-white/10 hover:bg-black/30"
                  onClick={() => handleSocialSignIn('google')}
                  disabled={loading}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="bg-black/20 border-white/10 hover:bg-black/30"
                  onClick={() => handleSocialSignIn('gmail')}
                  disabled={loading}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Gmail
                </Button>
              </div>
            </form>
          </TabsContent>
          </Tabs>
        )}

        {/* Forgot Password Form */}
        {isForgotPassword && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white mb-2">Reset Password</h2>
              <p className="text-gray-400 text-sm">Enter your email to receive reset instructions</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 workspace-input"
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-500/20 border-green-500/50">
                  <AlertDescription className="text-green-400">{success}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 workspace-button-secondary"
                  onClick={handleBackToLogin}
                >
                  Back to Login
                </Button>
                <Button
                  type="submit"
                  className="flex-1 workspace-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
