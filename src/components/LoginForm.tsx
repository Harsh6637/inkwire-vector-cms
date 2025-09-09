import React, { useState, useContext, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import inkwireLogo from '../assets/inkwire_squiggle_dark.png';
import Header from "./Header";

interface LoginFormState {
  email: string;
  password: string;
  error: string;
}

export default function LoginForm() {
  const [formState, setFormState] = useState<LoginFormState>({
    email: '',
    password: '',
    error: ''
  });

  const { login, checkExistingLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (checkExistingLogin()) navigate('/dashboard');
  }, [checkExistingLogin, navigate]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setFormState(prev => ({ ...prev, error: '' }));

    const result = login({
      email: formState.email,
      password: formState.password
    });

    if (result.success) {
      navigate('/dashboard');
    } else {
      setFormState(prev => ({ ...prev, error: result.message }));
    }
  };

  const updateFormState = (field: keyof Pick<LoginFormState, 'email' | 'password'>) =>
    (value: string) => {
      setFormState(prev => ({ ...prev, [field]: value }));
    };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900">

      {/* Header */}
      <Header />

      {/* Login Content */}
      <div className="flex-grow flex items-center justify-center p-4 relative">

        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>

        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl z-10">
          <CardHeader className="space-y-4 pb-6 flex flex-col items-center justify-center">
            {/* Inkwire - Login Text */}
            <h1 className="text-3xl font-bold text-gray-900 text-center leading-none">
              Inkwire - Login
            </h1>

            {/* Accent line */}
            <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full"></div>
          </CardHeader>

          <CardContent className="space-y-6">
            {formState.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {formState.error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formState.email}
                  onChange={(e) => updateFormState('email')(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formState.password}
                  onChange={(e) => updateFormState('password')(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  placeholder="Enter your password"
                />
              </div>

              <Button
                type="submit"
                disabled={!formState.email || !formState.password} // disabled if either field is empty
                className={`w-full h-12 font-medium transition-all duration-200 shadow-lg hover:shadow-xl
                  ${!formState.email || !formState.password
                    ? 'bg-gray-400 cursor-not-allowed text-white' // disabled styling
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white' // enabled styling
                  }`}
              >
                Sign In
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-800 mb-2 font-medium">Demo Credentials</p>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>Email:</strong> admin@inkwire.co</p>
                <p><strong>Password:</strong> P@$word123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
