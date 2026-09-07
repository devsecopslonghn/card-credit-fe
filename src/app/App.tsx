import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { NavigationBar } from "@/components/layout/NavigationBar";
import { AuthProvider, ProtectedRoute } from "@/app/auth";
import AccountsPage from "@/pages/accounts/page";
import AdminCatalogPage from "@/pages/admin/card-catalog/page";
import AdminUsersPage from "@/pages/admin/users/page";
import AnalyticsPage from "@/pages/analytics/page";
import BudgetsPage from "@/pages/budgets/page";
import CardDetailPage from "@/pages/cards/[id]/page";
import CardsPage from "@/pages/cards/page";
import CashbackPage from "@/pages/cashback/page";
import DashboardPage from "@/pages/dashboard/page";
import FeesPage from "@/pages/fees/page";
import ForgotPasswordPage from "@/pages/forgot-password/page";
import LoginPage from "@/pages/login/page";
import BanksPage from "@/pages/masterdata/banks/page";
import CardTypesPage from "@/pages/masterdata/cardtypes/page";
import NotificationsPage from "@/pages/notifications/page";
import PaymentsPage from "@/pages/payments/page";
import ProfilePage from "@/pages/profile/page";
import RecurringPage from "@/pages/recurring/page";
import RegisterPage from "@/pages/register/page";
import ReportsPage from "@/pages/reports/page";
import TransactionsPage from "@/pages/transactions/page";

const privateRoutes = [
  ["/dashboard", DashboardPage], ["/transactions", TransactionsPage], ["/accounts", AccountsPage],
  ["/budgets", BudgetsPage], ["/reports", ReportsPage], ["/payments", PaymentsPage],
  ["/notifications", NotificationsPage], ["/fees", FeesPage], ["/cashback", CashbackPage],
  ["/analytics", AnalyticsPage], ["/recurring", RecurringPage], ["/cards", CardsPage],
  ["/cards/:id", CardDetailPage], ["/masterdata/banks", BanksPage], ["/masterdata/cardtypes", CardTypesPage],
  ["/profile", ProfilePage], ["/admin/users", AdminUsersPage], ["/admin/card-catalog", AdminCatalogPage],
] as const;

export function App() {
  return <BrowserRouter><AuthProvider><NavigationBar /><Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/login" element={<LoginPage />} /><Route path="/register" element={<RegisterPage />} /><Route path="/forgot-password" element={<ForgotPasswordPage />} />
    {privateRoutes.map(([path, Component]) => <Route key={path} path={path} element={<ProtectedRoute><Component /></ProtectedRoute>} />)}
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes></AuthProvider></BrowserRouter>;
}
