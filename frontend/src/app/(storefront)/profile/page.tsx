"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "@/lib/api/profile.api";
import { addressApi } from "@/lib/api/address.api";
import { useUI } from "@/components/providers/ui-provider";
import {
  User,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  Calendar,
  Phone,
  Mail,
  Home,
  Briefcase,
  Building2,
  Compass,
} from "lucide-react";
import { Address } from "@/types";

export default function ProfilePage() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const { showCartToast } = useUI();
  const queryClient = useQueryClient();

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Edit Profile Form States
  const [profileFullName, setProfileFullName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileGender, setProfileGender] = useState("");
  const [profileDob, setProfileDob] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");

  // Address Form States
  const [addressLabel, setAddressLabel] = useState("Home");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [subDistrict, setSubDistrict] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  // Queries
  const { data: profileRes, isLoading: isProfileLoading } = useQuery({
    queryKey: ["customer-profile"],
    queryFn: () => profileApi.getProfile(),
    enabled: isClerkLoaded && !!clerkUser,
  });

  const { data: addressesRes, isLoading: isAddressesLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressApi.getAddresses(),
    enabled: isClerkLoaded && !!clerkUser,
  });

  const profile = profileRes?.data;
  const addresses = addressesRes?.data || [];

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => profileApi.updateProfile(data),
    onSuccess: () => {
      showCartToast("Profile updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["customer-profile"] });
      setIsEditProfileOpen(false);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to update profile";
      showCartToast(msg, "error");
    },
  });

  const createAddressMutation = useMutation({
    mutationFn: (data: any) => addressApi.createAddress(data),
    onSuccess: () => {
      showCartToast("Address added successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setIsAddressModalOpen(false);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to add address";
      showCartToast(msg, "error");
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => addressApi.updateAddress(id, data),
    onSuccess: () => {
      showCartToast("Address updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setIsAddressModalOpen(false);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to update address";
      showCartToast(msg, "error");
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id: string) => addressApi.deleteAddress(id),
    onSuccess: () => {
      showCartToast("Address deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to delete address";
      showCartToast(msg, "error");
    },
  });

  const setDefaultAddressMutation = useMutation({
    mutationFn: (id: string) => addressApi.setDefaultAddress(id),
    onSuccess: () => {
      showCartToast("Default address updated", "success");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to set default address";
      showCartToast(msg, "error");
    },
  });

  // Open Handlers
  const handleOpenEditProfile = () => {
    if (!profile) return;
    setProfileFullName(profile.fullName || "");
    setProfilePhone(profile.phoneNumber || "");
    setProfileGender(profile.gender || "");
    setProfileDob(profile.dateOfBirth || "");
    setProfilePhoto(profile.profilePhoto || "");
    setIsEditProfileOpen(true);
  };

  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressLabel("Home");
    setRecipientName(profile?.fullName || "");
    setRecipientPhone(profile?.phoneNumber || "");
    setProvince("");
    setCity("");
    setDistrict("");
    setSubDistrict("");
    setPostalCode("");
    setFullAddress("");
    setNotes("");
    setIsDefault(addresses.length === 0); // Default if first address
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddressLabel(addr.label);
    setRecipientName(addr.recipientName);
    setRecipientPhone(addr.recipientPhone);
    setProvince(addr.province);
    setCity(addr.city);
    setDistrict(addr.district);
    setSubDistrict(addr.subDistrict);
    setPostalCode(addr.postalCode);
    setFullAddress(addr.fullAddress);
    setNotes(addr.notes || "");
    setIsDefault(addr.isDefault);
    setIsAddressModalOpen(true);
  };

  // Submit Handlers
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileFullName.trim() || !profilePhone.trim()) {
      showCartToast("Full name and phone number are required", "error");
      return;
    }
    updateProfileMutation.mutate({
      fullName: profileFullName,
      phoneNumber: profilePhone,
      gender: profileGender || null,
      dateOfBirth: profileDob ? new Date(profileDob).toISOString() : null,
      profilePhoto: profilePhoto || null,
    });
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !recipientName.trim() ||
      !recipientPhone.trim() ||
      !province.trim() ||
      !city.trim() ||
      !district.trim() ||
      !subDistrict.trim() ||
      !postalCode.trim() ||
      !fullAddress.trim()
    ) {
      showCartToast("All required address fields must be filled", "error");
      return;
    }

    const payload = {
      label: addressLabel,
      recipientName,
      recipientPhone,
      province,
      city,
      district,
      subDistrict,
      postalCode,
      fullAddress,
      notes: notes || null,
      isDefault,
    };

    if (editingAddress) {
      updateAddressMutation.mutate({ id: editingAddress.id, data: payload });
    } else {
      createAddressMutation.mutate(payload);
    }
  };

  // Helpers
  const getLabelIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case "home":
        return <Home className="h-4 w-4" />;
      case "office":
        return <Briefcase className="h-4 w-4" />;
      case "apartment":
        return <Building2 className="h-4 w-4" />;
      default:
        return <Compass className="h-4 w-4" />;
    }
  };

  if (isProfileLoading || isAddressesLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const avatarSrc = profile?.profilePhoto || clerkUser?.imageUrl || "https://i.pravatar.cc/150?u=geraione";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-10 animate-fade-in">
      {/* Title */}
      <div className="border-b border-gray-100 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            My Account
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage your personal profile and delivery addresses.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex flex-col items-center text-center pb-6 border-b border-gray-100 space-y-4">
              <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-indigo-50 shadow-inner flex items-center justify-center">
                <img
                  src={avatarSrc}
                  alt={profile?.fullName || "Avatar"}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {profile?.fullName || "Complete Profile"}
                </h2>
                {profile?.username && (
                  <p className="text-sm font-semibold text-indigo-600">@{profile.username}</p>
                )}
                <p className="text-xs text-gray-400 font-semibold">{profile?.email}</p>
              </div>

              <button
                onClick={handleOpenEditProfile}
                type="button"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </button>
            </div>

            <div className="pt-6 space-y-4 text-sm font-semibold text-gray-700">
              <div className="flex items-center gap-3">
                <Mail className="h-4.5 w-4.5 text-gray-400" />
                <div className="overflow-hidden truncate">
                  <span className="text-xs font-bold text-gray-400 block uppercase">Email</span>
                  <span className="text-gray-800">{profile?.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-4.5 w-4.5 text-gray-400" />
                <div>
                  <span className="text-xs font-bold text-gray-400 block uppercase">Phone</span>
                  <span className="text-gray-800">{profile?.phoneNumber || "Not set"}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="h-4.5 w-4.5 text-gray-400" />
                <div>
                  <span className="text-xs font-bold text-gray-400 block uppercase">Gender</span>
                  <span className="text-gray-800">{profile?.gender || "Not set"}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4.5 w-4.5 text-gray-400" />
                <div>
                  <span className="text-xs font-bold text-gray-400 block uppercase">Birth Date</span>
                  <span className="text-gray-800">
                    {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "Not set"}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Address Cards */}
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">Saved Addresses</h3>
                <p className="text-sm text-gray-500">
                  Manage shipping destinations for checkout and courier delivery.
                </p>
              </div>

              <button
                onClick={handleOpenAddAddress}
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add Address
              </button>
            </div>

            {/* List */}
            {addresses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-bold text-gray-800">No addresses saved yet</p>
                  <p className="text-sm text-gray-400 max-w-xs">
                    Please add a delivery address to complete your profile structure.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 hover:shadow-sm transition-all ${
                      addr.isDefault
                        ? "border-indigo-600 bg-indigo-50/5 ring-1 ring-indigo-500/20"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Label + Default Badge */}
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-600">
                          {getLabelIcon(addr.label)}
                          {addr.label}
                        </div>
                        {addr.isDefault && (
                          <span className="inline-flex items-center rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm">
                            Default
                          </span>
                        )}
                      </div>

                      {/* Recipient Details */}
                      <div className="text-sm">
                        <p className="font-extrabold text-gray-900">{addr.recipientName}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase mt-0.5">
                          {addr.recipientPhone}
                        </p>
                      </div>

                      {/* Full Address */}
                      <p className="text-sm font-semibold text-gray-600 leading-relaxed">
                        {addr.fullAddress}, {addr.subDistrict}, {addr.district}, {addr.city}, {addr.province}, {addr.postalCode}
                      </p>

                      {addr.notes && (
                        <p className="text-xs font-medium text-gray-400 italic">
                          Notes: {addr.notes}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2 text-xs font-bold">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleOpenEditAddress(addr)}
                          className="text-gray-500 hover:text-indigo-600 transition-colors"
                          title="Edit Address"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this address?")) {
                              deleteAddressMutation.mutate(addr.id);
                            }
                          }}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Address"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {!addr.isDefault && (
                        <button
                          onClick={() => setDefaultAddressMutation.mutate(addr.id)}
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Set Default
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* MODAL 1: Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-100 flex flex-col space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Personal Information</h2>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-400 uppercase">
                  Profile Photo URL
                </label>
                <input
                  type="url"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                  placeholder="https://example.com/avatar.jpg"
                  value={profilePhoto}
                  onChange={(e) => setProfilePhoto(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    placeholder="John Doe"
                    value={profileFullName}
                    onChange={(e) => setProfileFullName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    placeholder="e.g. +62812345678"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase">
                    Gender
                  </label>
                  <select
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    value={profileGender}
                    onChange={(e) => setProfileGender(e.target.value)}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    value={profileDob}
                    onChange={(e) => setProfileDob(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex w-full gap-3 pt-4 border-t mt-4">
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {updateProfileMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-[0.98] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add/Edit Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-100 flex flex-col space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-xl font-bold text-gray-900">
                {editingAddress ? "Edit Shipping Address" : "Add New Shipping Address"}
              </h2>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase">
                    Address Label
                  </label>
                  <select
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
                  <label className="block text-xs font-bold text-gray-400 uppercase">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    placeholder="Recipient's Name"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase">
                    Recipient Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    placeholder="e.g. +62812345678"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase">
                    Province *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    placeholder="Province"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase">
                    District *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    placeholder="District"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase">
                    Sub-district *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    placeholder="Sub-district"
                    value={subDistrict}
                    onChange={(e) => setSubDistrict(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    placeholder="Postal Code"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-400 uppercase">
                  Full Address *
                </label>
                <textarea
                  required
                  rows={2}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-600 focus:bg-white transition-all resize-none"
                  placeholder="Street name, building details, house number, etc."
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-400 uppercase">
                  Delivery Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-600 focus:bg-white transition-all resize-none"
                  placeholder="e.g., Drop at security gate"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="defaultAddress"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  disabled={editingAddress?.isDefault} // Can't unset default if it is already default
                />
                <label htmlFor="defaultAddress" className="text-sm font-semibold text-gray-700 select-none">
                  Set as default shipping address
                </label>
              </div>

              <div className="flex w-full gap-3 pt-4 border-t mt-4">
                <button
                  type="submit"
                  disabled={createAddressMutation.isPending || updateAddressMutation.isPending}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {(createAddressMutation.isPending || updateAddressMutation.isPending) && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {editingAddress ? "Update Address" : "Add Address"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-[0.98] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
