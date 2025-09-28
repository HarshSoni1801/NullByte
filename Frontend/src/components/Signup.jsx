import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, loginGuestUser } from '../authSlice';
import Logo from '../assets/Logo';

const signupSchema = z.object({
  name: z.string().min(2, 'Name should contain at least 2 characters'),
  emailId: z.string().email("Invalid email format"),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .superRefine((val, ctx) => {
      if (!/[a-z]/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Password must contain at least one lowercase letter",
        });
      }
      if (!/[A-Z]/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Password must contain at least one uppercase letter",
        });
      }
      if (!/[0-9]/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Password must contain at least one number",
        });
      }
      if (!/[^a-zA-Z0-9]/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Password must contain at least one special character",
        });
      }
    }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

const Signup = () => {
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting },
    setError 
  } = useForm({ 
    resolver: zodResolver(signupSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange'
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Function to split name into firstName and lastName
  const splitName = (fullName) => {
    if (!fullName) return { firstName: '', lastName: '' };
    
    const nameParts = fullName.trim().split(/\s+/);
    
    if (nameParts.length === 1) {
      // Only one name provided - use it as firstName, lastName remains empty
      return {
        firstName: nameParts[0],
        lastName: ''
      };
    } else {
      // Two or more names - first name is first part, last name is combined remaining parts
      return {
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' ')
      };
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    console.log("Errors updated:", errors);
  }, [errors]);

  const onSubmit = async (data, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    console.log("Form submitted with data:", data);
    
    try {
      const { confirmPassword, name, ...userData } = data;
      
      // Split the name into firstName and lastName
      const { firstName, lastName } = splitName(name);
      
      // Prepare the final user data with firstName and lastName
      const finalUserData = {
        ...userData,
        firstName,
        lastName: lastName || '', // Ensure lastName is always defined, even if empty
      };
      
      console.log("Final userData with split names:", finalUserData);
      await dispatch(registerUser(finalUserData)).unwrap();
      sessionStorage.setItem('showSplash', 'true');
    } catch (err) {
      console.log("Caught error in client side:", err);
      
      // Handle field-specific errors first
      if (err?.errors && typeof err.errors === 'object') {
        Object.keys(err.errors).forEach(fieldName => {
          console.log(`Setting error for field ${fieldName}:`, err.errors[fieldName]);
          setError(fieldName, {
            type: 'server',
            message: err.errors[fieldName]
          });
        });
      }
      
      // Handle general error message
      if (err?.message && !err.errors) {
        setError('root.serverError', {
          type: 'manual',
          message: err.message
        });
      }
    }
  };
  
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
    <div className="min-h-screen bg-zinc-900 text-zinc-300 font-sans flex justify-center items-center p-4">
      <div className="w-full max-w-4xl flex rounded-lg overflow-hidden bg-zinc-800/50 border border-zinc-700/50 shadow-2xl shadow-zinc-950/50">
        
        {/* Left Column */}
        <div className="hidden md:flex w-1/2 flex-col justify-center items-center bg-zinc-900 p-10">
          <Logo className="h-32 w-32 text-red-500 mb-6" />
          <h1 className="text-4xl font-bold text-zinc-100 tracking-tight mb-2">NullByte</h1>
          <p className="text-zinc-400 text-lg max-w-xs text-center">Join our community and get started.</p>
        </div>

        <div className="w-full md:w-1/2 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Full Name
              </label>
              <input
                {...register('name')}
                placeholder='Enter your full name'
                className={`w-full bg-zinc-700/50 border ${errors.name ? 'border-red-500' : 'border-zinc-600'} text-zinc-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
              )}
              <p className="mt-1 text-xs text-zinc-500">
                You can enter just your first name, or include middle and last names
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Email
              </label>
              <input
                {...register('emailId')}
                placeholder='you@example.com'
                className={`w-full bg-zinc-700/50 border ${errors.emailId ? 'border-red-500' : 'border-zinc-600'} text-zinc-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition`}
              />
              {errors.emailId && (
                <p className="mt-1 text-xs text-red-500">{errors.emailId.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full bg-zinc-700/50 border ${errors.password ? 'border-red-500' : 'border-zinc-600'} text-zinc-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition`}
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full bg-zinc-700/50 border ${errors.confirmPassword ? 'border-red-500' : 'border-zinc-600'} text-zinc-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-300"
                >
                  {showConfirmPassword ? (
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
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Error Messages */}
            {errors.root?.serverError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-md text-sm">
                {errors.root.serverError.message}
              </div>
            )}

            {/* Signup Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-3 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-red-500 disabled:opacity-50"
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>

          {/* Guest Login Button */}
          <button onClick={handleGuestLogin} className="w-full mt-4 px-4 py-3 text-sm font-semibold text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-gray-500">
            Login as Guest
          </button>

          {/* Login Link */}
          <p className="text-center text-sm text-zinc-400 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-red-400 hover:text-red-300 transition">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;