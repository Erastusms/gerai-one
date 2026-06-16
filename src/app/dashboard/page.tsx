import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-8 rounded-lg bg-indigo-600 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349m-18 0a2.993 2.993 0 00.506-1.599l.694-4.85A1.5 1.5 0 015.686 1.5h12.628a1.5 1.5 0 011.486 1.3l.694 4.85A2.993 2.993 0 0021 9.349"
                  />
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900 tracking-tight">
                GeraiOne
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-indigo-700">
                    {user.firstName?.[0] || user.emailAddresses[0]?.emailAddress[0]?.toUpperCase() || "U"}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {user.firstName || user.emailAddresses[0]?.emailAddress || "User"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user.firstName || "there"}! 👋
          </h1>
          <p className="mt-1 text-gray-500">
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Total Revenue", value: "$0.00", icon: "💰", change: "+0%" },
            { label: "Orders", value: "0", icon: "📦", change: "+0%" },
            { label: "Customers", value: "0", icon: "👥", change: "+0%" },
            { label: "Products", value: "0", icon: "🏷️", change: "+0%" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">{stat.icon}</span>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Empty state */}
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="mx-auto size-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-8 text-indigo-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Ready to get started?
          </h2>
          <p className="text-gray-500 max-w-sm mx-auto">
            You&apos;re all set up! Start by adding your first product to begin
            selling on GeraiOne.
          </p>
        </div>
      </main>
    </div>
  );
}
