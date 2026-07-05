"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "@/lib/api/profile.api";
import { addressApi } from "@/lib/api/address.api";
import { useUI } from "@/components/providers/ui-provider";
import { User, MapPin, CheckCircle, ArrowRight, ArrowLeft, Loader2, Info } from "lucide-react";
import Image from "next/image";

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const { showCartToast } = useUI();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);

  // Form states
  // Step 1: Personal Info
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");

  // Step 2: Address
  const [addressLabel, setAddressLabel] = useState("Home");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [subDistrict, setSubDistrict] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [addressNotes, setAddressNotes] = useState("");

  // Pre-populate fields from Clerk user when loaded
  useEffect(() => {
    if (isClerkLoaded && clerkUser) {
      const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();
      setFullName(name);
      setRecipientName(name);

      const phone = clerkUser.phoneNumbers?.[0]?.phoneNumber || "";
      setPhoneNumber(phone);
      setRecipientPhone(phone);

      if (clerkUser.imageUrl) {
        setProfilePhoto(clerkUser.imageUrl);
      }
    }
  }, [isClerkLoaded, clerkUser]);

  // Form Validation
  const validateStep1 = () => {
    if (!fullName.trim()) {
      showCartToast("Full Name is required", "error");
      return false;
    }
    if (!phoneNumber.trim()) {
      showCartToast("Phone Number is required", "error");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!recipientName.trim()) {
      showCartToast("Recipient Name is required", "error");
      return false;
    }
    if (!recipientPhone.trim()) {
      showCartToast("Recipient Phone is required", "error");
      return false;
    }
    if (!province.trim()) {
      showCartToast("Province is required", "error");
      return false;
    }
    if (!city.trim()) {
      showCartToast("City is required", "error");
      return false;
    }
    if (!district.trim()) {
      showCartToast("District is required", "error");
      return false;
    }
    if (!subDistrict.trim()) {
      showCartToast("Sub-district is required", "error");
      return false;
    }
    if (!postalCode.trim()) {
      showCartToast("Postal Code is required", "error");
      return false;
    }
    if (!fullAddress.trim()) {
      showCartToast("Full Address is required", "error");
      return false;
    }
    return true;
  };

  // Submit Mutation
  const setupProfileMutation = useMutation({
    mutationFn: async () => {
      // 1. Update Profile (Marks as completed)
      await profileApi.updateProfile({
        fullName,
        phoneNumber,
        gender: gender || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
        profilePhoto: profilePhoto || null,
        isProfileCompleted: true,
      });

      // 2. Create Shipping Address
      await addressApi.createAddress({
        label: addressLabel,
        recipientName,
        recipientPhone,
        province,
        city,
        district,
        subDistrict,
        postalCode,
        fullAddress,
        notes: addressNotes || null,
        isDefault: true,
      });
    },
    onSuccess: () => {
      showCartToast("Profile setup completed successfully!", "success");
      // Invalidate queries to refresh the ProfileGuard status
      queryClient.invalidateQueries({ queryKey: ["customer-profile"] });
      // Redirect to home
      router.push("/");
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || err.message || "Failed to complete setup";
      showCartToast(errMsg, "error");
    },
  });

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (validateStep2()) setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (setupProfileMutation.isPending) return;
    setupProfileMutation.mutate();
  };

  if (!isClerkLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-3 mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Complete Your Profile
        </h1>
        <p className="text-base text-gray-500 max-w-md mx-auto">
          Welcome to GeraiOne! Please take a moment to complete your setup before checking out.
        </p>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between mb-8 px-4">
        {[
          { num: 1, label: "Profile", icon: User },
          { num: 2, label: "Address", icon: MapPin },
          { num: 3, label: "Review", icon: CheckCircle },
        ].map((s, idx) => (
          <React.Fragment key={s.num}>
            <div className="flex flex-col items-center space-y-1">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-300 font-bold ${
                  step === s.num
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100"
                    : step > s.num
                    ? "bg-indigo-50 border-indigo-600 text-indigo-600"
                    : "border-gray-200 bg-white text-gray-400"
                }`}
              >
                <s.icon className="h-5 w-5" />
              </div>
              <span
                className={`text-xs font-semibold ${
                  step === s.num ? "text-indigo-600" : "text-gray-400"
                }`}
              >
                {s.label}
              </span>
            </div>
            {idx < 2 && (
              <div
                className={`h-0.5 flex-1 mx-4 transition-colors duration-300 ${
                  step > idx + 1 ? "bg-indigo-600" : "bg-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Form Container */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-sm transition-all duration-300">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-3">
                Personal Information
              </h2>

              <div className="flex flex-col items-center sm:flex-row gap-5 pb-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-indigo-100 bg-indigo-50 flex items-center justify-center">
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt="Profile Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-indigo-300" />
                  )}
                </div>
                <div className="flex-1 w-full space-y-1">
                  <label htmlFor="photoUrl" className="block text-xs font-bold text-gray-400 uppercase">
                    Profile Photo URL
                  </label>
                  <input
                    type="url"
                    id="photoUrl"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    placeholder="https://example.com/avatar.jpg"
                    value={profilePhoto}
                    onChange={(e) => setProfilePhoto(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="fullName" className="block text-xs font-bold text-gray-400 uppercase">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (recipientName === "") setRecipientName(e.target.value);
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="phoneNumber" className="block text-xs font-bold text-gray-400 uppercase">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    placeholder="e.g. +628123456789"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      if (recipientPhone === "") setRecipientPhone(e.target.value);
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="gender" className="block text-xs font-bold text-gray-400 uppercase">
                    Gender <span className="text-gray-400">(Optional)</span>
                  </label>
                  <select
                    id="gender"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="dob" className="block text-xs font-bold text-gray-400 uppercase">
                    Date of Birth <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    type="date"
                    id="dob"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Address */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-3">
                First Shipping Address
              </h2>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="label" className="block text-xs font-bold text-gray-400 uppercase">
                    Address Label
                  </label>
                  <select
                    id="label"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    value={addressLabel}
                    onChange={(e) => setAddressLabel(e.target.value)}
                  >
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="recipientName" className="block text-xs font-bold text-gray-400 uppercase">
                    Recipient Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="recipientName"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    placeholder="Recipient's Name"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="recipientPhone" className="block text-xs font-bold text-gray-400 uppercase">
                    Recipient Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="recipientPhone"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    placeholder="Recipient's Phone Number"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="province" className="block text-xs font-bold text-gray-400 uppercase">
                    Province <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="province"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    placeholder="Province"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="city" className="block text-xs font-bold text-gray-400 uppercase">
                    City / City Municipality <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="district" className="block text-xs font-bold text-gray-400 uppercase">
                    District <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="district"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    placeholder="District"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="subDistrict" className="block text-xs font-bold text-gray-400 uppercase">
                    Sub-district <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subDistrict"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    placeholder="Sub-district"
                    value={subDistrict}
                    onChange={(e) => setSubDistrict(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="postalCode" className="block text-xs font-bold text-gray-400 uppercase">
                    Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    placeholder="Postal Code"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="fullAddress" className="block text-xs font-bold text-gray-400 uppercase">
                  Full Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="fullAddress"
                  required
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-600 focus:bg-white transition-all resize-none"
                  placeholder="Street name, building details, house number, etc."
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="notes" className="block text-xs font-bold text-gray-400 uppercase">
                  Delivery Notes <span className="text-gray-400">(Optional)</span>
                </label>
                <textarea
                  id="notes"
                  rows={2}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-600 focus:bg-white transition-all resize-none"
                  placeholder="e.g., Green gate, drop at lobby receptionist"
                  value={addressNotes}
                  onChange={(e) => setAddressNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STEP 3: Review */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in text-gray-800">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-3">
                Review & Confirm
              </h2>

              <div className="rounded-2xl border border-dashed border-gray-200 bg-indigo-50/10 p-5 space-y-4">
                <div className="flex items-center gap-3 text-indigo-600">
                  <Info className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-semibold">
                    Please review your info before completing the setup.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-2">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-400 uppercase">Full Name</span>
                    <p className="font-bold text-gray-800">{fullName}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-400 uppercase">Phone Number</span>
                    <p className="font-bold text-gray-800">{phoneNumber}</p>
                  </div>
                  {gender && (
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-gray-400 uppercase">Gender</span>
                      <p className="font-bold text-gray-800">{gender}</p>
                    </div>
                  )}
                  {dateOfBirth && (
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-gray-400 uppercase">Date of Birth</span>
                      <p className="font-bold text-gray-800">{dateOfBirth}</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase block">Shipping Address ({addressLabel})</span>
                  <div className="text-sm space-y-1">
                    <p className="font-bold text-gray-800">{recipientName} ({recipientPhone})</p>
                    <p className="font-semibold text-gray-600">
                      {fullAddress}, {subDistrict}, {district}, {city}, {province}, {postalCode}
                    </p>
                    {addressNotes && (
                      <p className="text-xs italic text-gray-400 mt-1">Notes: {addressNotes}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-8">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              )}
            </div>

            <div>
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={setupProfileMutation.isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {setupProfileMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving Setup...
                    </>
                  ) : (
                    "Complete Setup"
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
