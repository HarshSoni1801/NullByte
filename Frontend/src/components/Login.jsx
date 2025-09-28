import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, loginGuestUser } from '../authSlice'; // Assume you add guest login action here
import Logo from '../assets/Logo';

// The login schema for validation
const loginSchema = z.object({
  emailId: z.string().email("Invalid email format"),
  password: z.string().min(6, 'Password should contain at least 6 characters'),
});

// The Login component
const Login = () => {
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting },
    setError 
  } = useForm({ 
    resolver: zodResolver(loginSchema) 
  });

  const dispatch = useDispatch();
  const navigate = useNavigate(); // fix: call useNavigate()
  const { isAuthenticated, loading, error } = useSelector((state)=> state.auth);
  const [showPassword, setShowPassword] = useState(false);
  // Navigate after successful login
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    try {
      await dispatch(loginUser(data)).unwrap();
      sessionStorage.setItem('showSplash', 'true');
      await dispatch(loginUser(data)).unwrap();
    } catch (err) {
      setError('root.serverError', {
        type: 'manual',
        message: error || 'Login failed'
      });
    }
  };

  // Handler for Login as Guest
  const handleGuestLogin = async () => {
    try {
      await dispatch(loginGuestUser()).unwrap();
      sessionStorage.setItem('showSplash', 'true');

    } catch (err) {
      setError('root.serverError', {
        type: 'manual',
        message: error || 'Guest login failed',
      });
    }
  };
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-300 font-sans flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Logo className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Welcome to NullByte</h1>
          <p className="text-zinc-400 mt-2">Login to access your account.</p>
        </div>

        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-8 shadow-2xl shadow-zinc-950/50">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-400 mb-2">
                Email Address
              </label>
              <input
                {...register('emailId')}
                type="email"
                placeholder='you@example.com'
                className={`w-full bg-zinc-700/50 border ${errors.emailId ? 'border-red-500' : 'border-zinc-600'} text-zinc-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition`}
                required
              />
              {errors.emailId && (
                <p className="mt-1 text-xs text-red-500">{errors.emailId.message}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-baseline">
                <label htmlFor="password" className="block text-sm font-medium text-zinc-400 mb-2">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full bg-zinc-700/50 border ${errors.password ? 'border-red-500' : 'border-zinc-600'} text-zinc-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-300"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.879 12.121l-1.414 1.414L10 11.414l-2.465 2.465-1.414-1.414L8.586 10 6.121 7.535l1.414-1.414L10 8.586l2.465-2.465 1.414 1.414L11.414 10l2.465 2.121z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Form-level Errors */}
            {errors.root?.serverError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-md text-sm">
                {errors.root.serverError.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-3 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-red-500 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Guest login button */}
          <button
            onClick={handleGuestLogin}
            className="w-full mt-4 px-4 py-3 text-sm font-semibold text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-gray-500"
          >
            Login as Guest
          </button>

          {/* <div className="flex gap-4 mt-6">
            <button className="btn btn-neutral w-full bg-zinc-700/50 border border-zinc-600 text-zinc-300 hover:bg-zinc-600/50">
              Log in with Google
            </button>
          </div> */}

          <p className="text-center text-sm text-zinc-400 mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-red-400 hover:text-red-300 transition">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
