import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    fullName: "", 
    email: "", 
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    role: "User"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null); // Clear error when user types
    
    // Calculate password strength when password changes
    if (e.target.name === "password") {
      const strength = calculatePasswordStrength(e.target.value);
      setPasswordStrength(strength);
    }
  };

  const calculatePasswordStrength = (password) => {
    // Simple password strength calculation
    let score = 0;
    if (password.length > 6) score += 1;
    if (password.length > 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      setError("Phone number must be 10 digits");
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Split fullName into first and last name
      
      const dataToSend = {
        fullname: formData.fullName,
        email: formData.email,
        passwordHash: formData.password,
        phoneNumber: formData.phoneNumber,
        role: formData.role
      };
      
      await axios.post("https://localhost:7060/api/Auth/register", dataToSend, {
        headers: { "Content-Type": "application/json" }
      });
      
      // Redirect to login with success message
      navigate("/login", { 
        state: { 
          notification: {
            type: "success",
            message: "Registration successful! Please log in with your new account."
          } 
        }
      });
    } catch (err) {
      console.error("Error:", err);
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="w-full max-w-5xl">
        <div className="flex flex-col lg:flex-row bg-white rounded-2xl shadow-xl overflow-hidden transition-transform duration-300 hover:shadow-2xl transform hover:-translate-y-1">
          {/* Left Side - Brand/Logo */}
          <div className="lg:w-1/3 bg-gradient-to-br from-blue-600 to-blue-800 p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
              <p className="text-blue-100 mb-6">Join our platform and experience a new way of connecting.</p>
              
              <div className="bg-white bg-opacity-10 p-4 rounded-lg mb-6">
                <h3 className="text-white text-lg font-medium mb-2">Benefits</h3>
                <ul className="text-blue-100 space-y-2">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Secure account management
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Easy to use interface
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    24/7 customer support
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-auto">
              <p className="text-blue-100">Already have an account?</p>
              <button
                onClick={() => navigate("/login")}
                className="mt-2 inline-flex items-center text-white hover:text-blue-200 text-sm font-medium transition duration-150"
              >
                Sign in instead
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Right Side - Form */}
          <div className="lg:w-2/3 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h3>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4 animate-pulse">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleRegister}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name Input */}
                <div className="space-y-2">
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <input 
                      type="text" 
                      id="fullName"
                      name="fullName" 
                      value={formData.fullName}
                      placeholder="Ram Mohan" 
                      onChange={handleChange} 
                      className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 py-2 px-4 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 transition-all duration-200 shadow-sm"
                      required 
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                      </svg>
                    </div>
                    <input 
                      type="email" 
                      id="email"
                      name="email" 
                      value={formData.email}
                      placeholder="you@example.com" 
                      onChange={handleChange} 
                      className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 py-2 px-4 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 transition-all duration-200 shadow-sm"
                      required 
                    />
                  </div>
                </div>

                {/* Phone Number Input */}
                <div className="space-y-2">
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                    </div>
                    <input 
                      type="tel" 
                      id="phoneNumber"
                      name="phoneNumber" 
                      value={formData.phoneNumber}
                      placeholder="1234567890" 
                      onChange={handleChange} 
                      className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 py-2 px-4 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 transition-all duration-200 shadow-sm"
                      required 
                    />
                  </div>
                </div>

                {/* Role Selection */}
                <div className="space-y-2">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path>
                      </svg>
                    </div>
                    <select 
                      id="role"
                      name="role" 
                      value={formData.role}
                      onChange={handleChange} 
                      className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 py-2 px-4 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 transition-all duration-200 shadow-sm"
                      required 
                    >
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      id="password"
                      name="password" 
                      value={formData.password}
                      placeholder="••••••••" 
                      onChange={handleChange} 
                      className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 py-2 px-4 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 transition-all duration-200 shadow-sm"
                      required 
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  <div className="mt-1">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            passwordStrength === 0 ? 'bg-gray-300 w-0' : 
                            passwordStrength === 1 ? 'bg-red-500 w-1/5' : 
                            passwordStrength === 2 ? 'bg-orange-500 w-2/5' : 
                            passwordStrength === 3 ? 'bg-yellow-500 w-3/5' : 
                            passwordStrength === 4 ? 'bg-blue-500 w-4/5' : 
                            'bg-green-500 w-full'
                          }`}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs text-gray-600">
                        {passwordStrength === 0 ? '' : 
                         passwordStrength === 1 ? 'Weak' : 
                         passwordStrength === 2 ? 'Fair' : 
                         passwordStrength === 3 ? 'Good' : 
                         passwordStrength === 4 ? 'Strong' : 
                         'Very Strong'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      id="confirmPassword"
                      name="confirmPassword" 
                      value={formData.confirmPassword}
                      placeholder="••••••••" 
                      onChange={handleChange} 
                      className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 py-2 px-4 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 transition-all duration-200 shadow-sm"
                      required 
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full mt-6 py-2 px-4 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-blue-200 text-white transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <div className="flex justify-center items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;