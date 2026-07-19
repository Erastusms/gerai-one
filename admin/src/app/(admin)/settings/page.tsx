"use client"

import React, { useState } from "react"
import { Input, Button, Badge } from "@gerai-one/shared-ui"
import { Settings, Save, CheckCircle, Loader2 } from "lucide-react"

export default function SettingsPage() {
  const [appName, setAppName] = useState("GeraiOne")
  const [timezone, setTimezone] = useState("Asia/Jakarta (UTC+07:00)")
  const [currency, setCurrency] = useState("IDR (Rp)")
  const [language, setLanguage] = useState("English (US)")
  
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    // Simulate API delay
    setTimeout(() => {
      setIsSaving(false)
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)
    }, 1000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">System Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Configure global system attributes and regional variables.
        </p>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">General Configurations</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Core parameters for the application.</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* App Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Application Name
            </label>
            <Input
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="bg-slate-50/50 dark:bg-slate-950/30"
              required
            />
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Timezone
            </label>
            <div className="relative">
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 cursor-pointer appearance-none"
              >
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="Asia/Jakarta (UTC+07:00)">Asia/Jakarta (UTC+07:00)</option>
                <option value="Asia/Singapore (UTC+08:00)">Asia/Singapore (UTC+08:00)</option>
                <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                <option value="America/New_York (EST)">America/New_York (EST)</option>
              </select>
              <div className="absolute right-3.5 top-3.5 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-500 w-0 h-0" />
            </div>
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Currency
            </label>
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 cursor-pointer appearance-none"
              >
                <option value="USD ($)">USD ($) - US Dollar</option>
                <option value="IDR (Rp)">IDR (Rp) - Indonesian Rupiah</option>
                <option value="EUR (€)">EUR (€) - Euro</option>
                <option value="SGD ($)">SGD ($) - Singapore Dollar</option>
              </select>
              <div className="absolute right-3.5 top-3.5 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-500 w-0 h-0" />
            </div>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Language
            </label>
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 cursor-pointer appearance-none"
              >
                <option value="English (US)">English (US)</option>
                <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>
              <div className="absolute right-3.5 top-3.5 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-500 w-0 h-0" />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-emerald-100 bg-white dark:bg-slate-900 dark:border-emerald-950 px-4 py-3 shadow-xl transition-all duration-300 animate-in slide-in-from-bottom-5">
          <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-50">Settings Saved</span>
            <span className="text-[10px] text-slate-400 font-medium">Configurations successfully updated!</span>
          </div>
        </div>
      )}
    </div>
  )
}
