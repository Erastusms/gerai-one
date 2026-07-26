"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Lock, User, AlertCircle, PhoneCall, Sparkles, CheckCircle2, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react"
import { adminApi } from "@/lib/api/admin.api"

export default function AdminLoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  // Validation & Error states
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({})
  const [authError, setAuthError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [forgotPasswordMsg, setForgotPasswordMsg] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)

    // Form validation
    const errors: { identifier?: string; password?: string } = {}
    if (!identifier.trim()) {
      errors.identifier = "Email or Username is required."
    }
    if (!password) {
      errors.password = "Password is required."
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setIsLoading(true)

    try {
      const res = await adminApi.login({
        identifier: identifier.trim(),
        password,
        rememberMe,
      })

      if (res.success) {
        // Fetch current authenticated profile to verify session
        await adminApi.getMe()
        router.push("/")
        router.refresh()
      } else {
        setAuthError(res.message || "Invalid username/email or password.")
      }
    } catch (err: any) {
      if (err.code === "ERR_NETWORK" || !err.response) {
        setAuthError("Unable to connect to the backend server. Please make sure the backend service (http://localhost:3001) is running.")
      } else {
        const msg = err.response?.data?.message || "Invalid username/email or password."
        setAuthError(msg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-slate-950 text-slate-100 font-sans">
      {/* LEFT COLUMN - BRANDING & VISUAL ILLUSTRATION */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border-r border-slate-800 overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Branding Logo */}
        <div className="flex items-center gap-3 z-10">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <Shield className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-white">GeraiOne</span>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest leading-none mt-0.5">
              Admin Console
            </span>
          </div>
        </div>

        {/* Center Welcome Message */}
        <div className="space-y-6 z-10 my-auto max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-800/40 text-indigo-300 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Enterprise Administrative Portal</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Control your entire e-commerce ecosystem in one place.
          </h1>

          <p className="text-sm text-slate-400 leading-relaxed">
            Secure administrative interface for managing product catalogs, live inventory, marketing campaigns, customer accounts, and real-time business metrics.
          </p>

          {/* Key Features List */}
          <div className="space-y-3 pt-2">
            {[
              "Role-based access control & audit trail logging",
              "Real-time storefront banner & voucher controls",
              "Instant inventory management & catalog updates",
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs font-medium text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Left Footer info */}
        <div className="z-10 text-xs text-slate-500 font-medium">
          &copy; 2026 GeraiOne Inc. All rights reserved. Secure internal portal.
        </div>
      </div>

      {/* RIGHT COLUMN - LOGIN FORM CARD */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16 bg-slate-950">
        <div className="flex justify-end lg:hidden mb-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Shield className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg text-white">GeraiOne Console</span>
          </div>
        </div>

        {/* Login Card Container */}
        <div className="my-auto mx-auto w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-white">Administrator Login</h2>
            <p className="text-sm text-slate-400">
              Sign in with your administrative credentials to continue.
            </p>
          </div>

          {/* Authentication Alert / Error Message */}
          {authError && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs font-medium animate-in fade-in duration-200">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-red-200 block">Authentication Error</span>
                <p>{authError}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email / Username Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Email or Username</span>
                {fieldErrors.identifier && (
                  <span className="text-red-400 font-normal">{fieldErrors.identifier}</span>
                )}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value)
                    if (fieldErrors.identifier) setFieldErrors({ ...fieldErrors, identifier: undefined })
                  }}
                  placeholder="admin@example.com or superadmin"
                  className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-slate-900/80 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 transition-all ${
                    fieldErrors.identifier
                      ? "border-red-500/80 focus:ring-red-500/20"
                      : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20"
                  }`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => setForgotPasswordMsg(true)}
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined })
                  }}
                  placeholder="••••••••••••"
                  className={`w-full h-11 pl-10 pr-11 rounded-xl border bg-slate-900/80 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 transition-all ${
                    fieldErrors.password
                      ? "border-red-500/80 focus:ring-red-500/20"
                      : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20"
                  }`}
                />
                {/* Eye toggle password button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <span className="text-xs text-red-400 font-normal block pt-0.5">{fieldErrors.password}</span>
              )}
            </div>

            {/* Forgot Password Coming Soon Notification */}
            {forgotPasswordMsg && (
              <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-indigo-300 text-xs flex items-center justify-between animate-in fade-in">
                <span>Password reset via email is <strong>Coming Soon</strong>.</span>
                <button
                  type="button"
                  onClick={() => setForgotPasswordMsg(false)}
                  className="text-indigo-400 hover:text-white font-bold ml-2 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 text-xs text-slate-300 font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Console</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* ALWAYS VISIBLE LOGIN FOOTER */}
        <div className="mt-8 text-center pt-6 border-t border-slate-900">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-medium">
            <PhoneCall className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Need an administrator account? Please contact WhatsApp:</span>
            <a
              href="https://wa.me/6285155435801"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-emerald-400 hover:underline hover:text-emerald-300 transition-colors"
            >
              +62 851-5543-5801
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
