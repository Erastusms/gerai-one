"use client";

import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { customerProfile } from "@/data/profile";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();

  // Combine Clerk user data with mock profile data
  const displayName = isLoaded && user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || `${customerProfile.firstName} ${customerProfile.lastName}`
    : `${customerProfile.firstName} ${customerProfile.lastName}`;

  const emailAddress = isLoaded && user
    ? user.primaryEmailAddress?.emailAddress || customerProfile.email
    : customerProfile.email;

  const profileAvatar = isLoaded && user && user.imageUrl
    ? user.imageUrl
    : customerProfile.avatar;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* Title */}
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          My Account
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Manage your profile settings and shipping addresses.
        </p>
      </div>

      {/* PROFILE INFO CARD */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-5">
            <div className="relative h-20 w-20 overflow-hidden rounded-full bg-indigo-50 border-2 border-indigo-100 shadow-sm flex-shrink-0">
              <Image
                src={profileAvatar}
                alt={displayName}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
              <p className="text-sm text-gray-500">{emailAddress}</p>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            Edit Profile
          </button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Full Name
            </span>
            <p className="text-base font-semibold text-gray-900">{displayName}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Email Address
            </span>
            <p className="text-base font-semibold text-gray-900">{emailAddress}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Phone Number
            </span>
            <p className="text-base font-semibold text-gray-900">
              {customerProfile.phone}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Gender
            </span>
            <p className="text-base font-semibold text-gray-900">
              {customerProfile.gender}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Date of Birth
            </span>
            <p className="text-base font-semibold text-gray-900">
              {customerProfile.dateOfBirth}
            </p>
          </div>
        </div>
      </section>

      {/* SHIPPING ADDRESS CARD */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-gray-100">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900">Shipping Address</h3>
            <p className="text-sm text-gray-500">
              Your primary address for orders and deliveries.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            Change Address
          </button>
        </div>

        {/* Address Info */}
        <div className="pt-6 space-y-4">
          <div className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-600">
            {customerProfile.address.label}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Street Address
              </span>
              <p className="text-base font-semibold text-gray-900">
                {customerProfile.address.street}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                City & Province
              </span>
              <p className="text-base font-semibold text-gray-900">
                {customerProfile.address.city}, {customerProfile.address.province}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Postal Code
              </span>
              <p className="text-base font-semibold text-gray-900">
                {customerProfile.address.postalCode}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Country
              </span>
              <p className="text-base font-semibold text-gray-900">
                {customerProfile.address.country}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
