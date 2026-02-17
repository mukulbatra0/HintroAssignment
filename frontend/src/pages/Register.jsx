import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, clearError } from '../store/authSlice';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    if (!formData.name) {
      errors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (!/\d/.test(formData.password)) {
      errors.password = 'Password must contain at least one number';
    }
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
    const result = await dispatch(register(formData));
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Get Started!</h1>
            <p className="text-gray-600 mb-8">Create your account to begin</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error.message || 'Registration failed. Please try again.'}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Input */}
              <div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border ${
                      formErrors.name ? 'border-red-300' : 'border-gray-200'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all`}
                  />
                </div>
                {formErrors.name && (
                  <p className="mt-1.5 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>

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
                    autoComplete="new-password"
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

              {/* Confirm Password Input */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                    className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 border ${
                      formErrors.confirmPassword ? 'border-red-300' : 'border-gray-200'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="mt-1.5 text-sm text-red-600">{formErrors.confirmPassword}</p>
                )}
              </div>

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/30 mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>

              {/* Sign In Link */}
              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                >
                  Sign In
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
                <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: 'white', stopOpacity: 0.8 }} />
                  <stop offset="100%" style={{ stopColor: 'white', stopOpacity: 0.2 }} />
                </linearGradient>
              </defs>
              <path fill="url(#grad2)" d="M43.2,-58.7C56.6,-47.3,68.7,-34.2,74.5,-18.3C80.3,-2.3,79.8,16.5,72.5,32.4C65.2,48.3,51.1,61.3,34.9,69.1C18.7,76.9,0.4,79.5,-16.7,75.3C-33.8,71.1,-49.7,60.1,-61.7,46.4C-73.7,32.7,-81.8,16.4,-82.2,-0.3C-82.6,-17,-75.3,-34,-64.2,-47.4C-53.1,-60.8,-38.2,-70.6,-22.4,-74C-6.6,-77.4,10.1,-74.4,24.5,-68.2C38.9,-62,51,-52.6,43.2,-58.7Z" transform="translate(200 200)" />
            </svg>
          </div>

          {/* Content */}
          <div className="relative z-10 text-center">
            <h2 className="text-5xl font-bold text-white mb-6">Join Us Today!</h2>
            <p className="text-purple-100 text-lg leading-relaxed max-w-md mx-auto">
              Create your account and start collaborating with your team in real-time. Boost productivity together.
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

export default Register;
