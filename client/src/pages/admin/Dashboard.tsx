import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Users, Package, FileText, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const { data: partners } = trpc.partner.list.useQuery();
  const { data: offers } = trpc.offer.list.useQuery();
  const { data: referrals } = trpc.referral.list.useQuery();

  const pendingPartners = partners?.filter(p => p.curationStatus === "PENDING").length || 0;
  const approvedPartners = partners?.filter(p => p.curationStatus === "APPROVED").length || 0;
  const totalOffers = offers?.length || 0;
  const publishedOffers = offers?.filter(o => o.status === "PUBLISHED").length || 0;
  const totalReferrals = referrals?.length || 0;
  const wonReferrals = referrals?.filter(r => r.status === "WON").length || 0;

  const stats = [
    {
      title: "Parceiros Pendentes",
      value: pendingPartners,
      description: `${approvedPartners} aprovados`,
      icon: Users,
      color: "text-yellow-600",
    },
    {
      title: "Ofertas Publicadas",
      value: publishedOffers,
      description: `${totalOffers} total`,
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Indicações Ativas",
      value: totalReferrals,
      description: `${wonReferrals} ganhas`,
      icon: FileText,
      color: "text-green-600",
    },
    {
      title: "Taxa de Conversão",
      value: totalReferrals > 0 ? `${Math.round((wonReferrals / totalReferrals) * 100)}%` : "0%",
      description: "Indicações convertidas",
      icon: TrendingUp,
      color: "text-purple-600",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do marketplace
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Parceiros Recentes</CardTitle>
              <CardDescription>
                Últimos parceiros cadastrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {partners && partners.length > 0 ? (
                <div className="space-y-4">
                  {partners.slice(0, 5).map((partner) => (
                    <div key={partner.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{partner.companyName}</p>
                        <p className="text-sm text-muted-foreground">
                          {partner.contactEmail}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          partner.curationStatus === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : partner.curationStatus === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {partner.curationStatus}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum parceiro cadastrado ainda
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Indicações Recentes</CardTitle>
              <CardDescription>
                Últimas indicações criadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {referrals && referrals.length > 0 ? (
                <div className="space-y-4">
                  {referrals.slice(0, 5).map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{referral.buyerCompany || "Cliente"}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(referral.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          referral.status === "WON"
                            ? "bg-green-100 text-green-700"
                            : referral.status === "LOST"
                            ? "bg-red-100 text-red-700"
                            : referral.status === "OVERDUE"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {referral.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhuma indicação criada ainda
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
