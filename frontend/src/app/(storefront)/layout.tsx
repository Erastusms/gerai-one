import Header from "@/components/storefront/header";
import Footer from "@/components/storefront/footer";
import { ProfileGuard } from "@/components/storefront/profile-guard";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProfileGuard>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </ProfileGuard>
  );
}

