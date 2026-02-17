import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, clearError } from '../store/authSlice';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (error) {
      dispatch(clearError());
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    const result = await dispatch(login(formData));
    if (!result.error) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex animate-fade-in">
        {/* Left Section - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="max-w-md mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Hello!</h1>
            <p className="text-gray-600 mb-8">Sign in to your account</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error.message || 'Login failed. Please try again.'}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border ${
                      formErrors.email ? 'border-red-300' : 'border-gray-200'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all`}
                  />
                </div>
                {formErrors.email && (
                  <p className="mt-1.5 text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 border ${
                      formErrors.password ? 'border-red-300' : 'border-gray-200'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="mt-1.5 text-sm text-red-600">{formErrors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/30"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Sign Up Link */}
              <p className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                >
                  Create
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Right Section - Welcome Message */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-purple-600 via-violet-600 to-purple-700 p-12 items-center justify-center relative overflow-hidden">
          {/* Abstract Shape */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: 'white', stopOpacity: 0.8 }} />
                  <stop offset="100%" style={{ stopColor: 'white', stopOpacity: 0.2 }} />
                </linearGradient>
              </defs>
              <path fill="url(#grad1)" d="M57.4,-64.8C73.8,-54.3,86.5,-35.6,90.7,-15.1C94.9,5.3,90.6,27.5,79.3,45.8C68,64.2,49.7,78.7,29.4,85.1C9.1,91.5,-13.2,89.8,-33.7,82.1C-54.2,74.4,-72.9,60.7,-82.9,42.8C-92.9,24.9,-94.2,2.8,-89.1,-17.1C-84,-37,-72.5,-54.7,-57.6,-65.5C-42.7,-76.3,-24.4,-80.2,-5.7,-73.5C13,-66.8,41,-75.3,57.4,-64.8Z" transform="translate(200 200)" />
            </svg>
          </div>

          {/* Content */}
          <div className="relative z-10 text-center">
            <h2 className="text-5xl font-bold text-white mb-6">Welcome Back!</h2>
            <p className="text-purple-100 text-lg leading-relaxed max-w-md mx-auto">
              Sign in to access your workspace and continue collaborating with your team in real-time.
            </p>
            <div className="mt-8 flex justify-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
