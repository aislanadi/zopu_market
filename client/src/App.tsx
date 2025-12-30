import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CookieConsent } from "@/components/CookieConsent";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Catalog from "./pages/Catalog";
import OfferDetail from "./pages/OfferDetail";
import PartnerProfile from "./pages/PartnerProfile";
import Favorites from "./pages/Favorites";
import Compare from "./pages/Compare";
import BecomeClient from "./pages/BecomeClient";
import PartnerDashboard from "./pages/partner/Dashboard";
import EditPartnerProfile from "./pages/partner/EditProfile";
import BuyerCompleteProfile from "./pages/buyer/CompleteProfile";
import BuyerDashboard from "./pages/buyer/Dashboard";
import BuyerEditProfile from "./pages/buyer/EditProfile";
import { ProfileGuard } from "./components/ProfileGuard";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminPartners from "./pages/admin/Partners";
import PartnersManagement from "./pages/admin/PartnersManagement";
import AdminCategories from "./pages/admin/Categories";
import AdminOffers from "./pages/admin/Offers";
import AdminContracts from "./pages/admin/Contracts";
import AdminCases from "./pages/admin/Cases";
import AdminReferrals from "./pages/admin/Referrals";
import AdminPendingOffers from "./pages/admin/PendingOffers";
import Licenses from "@/pages/admin/Licenses";
import LicenseDashboard from "@/pages/admin/LicenseDashboard";
import AdminFinancialDashboard from "./pages/admin/FinancialDashboard";
import AdminPartnerCommissions from "./pages/admin/PartnerCommissions";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminConversionRanking from "./pages/AdminConversionRanking";
import AdminFeesConfig from "./pages/AdminFeesConfig";
import AdminAuditLogs from "./pages/AdminAuditLogs";
import AdminCoupons from "./pages/admin/Coupons";
import AdminUsers from "./pages/admin/Users";
import GerenteDashboard from "./pages/gerente/Dashboard";
import GerenteFollowUpAlerts from "./pages/gerente/FollowUpAlerts";
import GerenteCreateReferral from "./pages/gerente/CreateReferral";
import GerenteReferralDetail from "./pages/gerente/ReferralDetail";
import PartnerApply from "./pages/PartnerApply";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import PrivacySettings from "./pages/PrivacySettings";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password/:token" component={ResetPassword} />
      <Route path="/catalog" component={Catalog} />
      <Route path="/offer/:id" component={OfferDetail} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/compare" component={Compare} />
      <Route path="/become-client" component={BecomeClient} />
      
      {/* Institutional Pages */}
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/privacy-settings" component={PrivacySettings} />
      
      {/* Partner Routes - Rotas específicas ANTES das dinâmicas */}
      <Route path="/partner/apply" component={PartnerApply} />
      <Route path="/partner/dashboard" component={PartnerDashboard} />
      <Route path="/partner/edit-profile" component={EditPartnerProfile} />
      <Route path="/partner/:id" component={PartnerProfile} />
      
      {/* Buyer Routes */}
      <Route path="/buyer/dashboard">
        <ProfileGuard>
          <BuyerDashboard />
        </ProfileGuard>
      </Route>
      <Route path="/buyer/complete-profile" component={BuyerCompleteProfile} />
      <Route path="/buyer/edit-profile" component={BuyerEditProfile} />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/categories" component={AdminCategories} />
      <Route path="/admin/partners" component={AdminPartners} />
      <Route path="/admin/partners-management" component={PartnersManagement} />
      <Route path="/admin/contracts" component={AdminContracts} />
      <Route path="/admin/cases" component={AdminCases} />
      <Route path="/admin/offers" component={AdminOffers} />
      <Route path="/admin/pending-offers" component={AdminPendingOffers} />
      <Route path="/admin/licenses" component={Licenses} />
      <Route path="/admin/license-dashboard" component={LicenseDashboard} />
      <Route path="/admin/referrals" component={AdminReferrals} />
      <Route path="/admin/financial" component={AdminFinancialDashboard} />
      <Route path="/admin/partner-commissions" component={AdminPartnerCommissions} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/admin/conversion-ranking" component={AdminConversionRanking} />
      <Route path="/admin/fees-config" component={AdminFeesConfig} />
          <Route path="/admin/audit-logs" component={AdminAuditLogs} />
          <Route path="/admin/coupons" component={AdminCoupons} />
          <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin" component={AdminDashboard} />
      
      {/* Gerente Routes */}
      <Route path="/gerente/dashboard" component={GerenteDashboard} />
      <Route path="/gerente/follow-up-alerts" component={GerenteFollowUpAlerts} />
      <Route path="/gerente/create-referral" component={GerenteCreateReferral} />
      <Route path="/gerente/referral/:id" component={GerenteReferralDetail} />
      
      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <CookieConsent />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
