import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label="GeraiOne Home"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4 text-white"
                aria-hidden="true"
              >
                <path d="M5.223 2.25h13.554a2.25 2.25 0 0 1 2.225 1.91l.61 4.272a2.25 2.25 0 0 1-2.225 2.59H4.613a2.25 2.25 0 0 1-2.225-2.59l.61-4.272a2.25 2.25 0 0 1 2.225-1.91Zm0 0V.75" />
                <path
                  fillRule="evenodd"
                  d="M6 12.75a.75.75 0 0 1 .75.75v6.75h10.5V13.5a.75.75 0 0 1 1.5 0v7.5a.75.75 0 0 1-.75.75H6a.75.75 0 0 1-.75-.75V13.5a.75.75 0 0 1 .75-.75Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-base font-semibold tracking-tight text-gray-900">
              GeraiOne
            </span>
          </Link>

          {/* Copyright */}
          <p className="text-sm text-gray-500">
            &copy; 2026 GeraiOne. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
