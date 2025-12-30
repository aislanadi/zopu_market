import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveTable } from "@/components/ResponsiveTable";
import { trpc } from "@/lib/trpc";
import { 
  Briefcase, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Clock,
  DollarSign,
  Plus,
  FileText,
  Filter
} from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export default function GerenteDashboard() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const { data: stats, isLoading: loadingStats } = trpc.gerente.getDashboardStats.useQuery();
  const { data: referrals, isLoading: loadingReferrals } = trpc.gerente.getMyReferrals.useQuery({
    status: statusFilter as any,
    limit: 50,
  });
  const { data: alerts, isLoading: loadingAlerts } = trpc.gerente.getFollowUpAlerts.useQuery();

  const getStatusBadge = (status: string) => {
    const badges = {
      SENT: <Badge className="bg-blue-500">Enviado</Badge>,
      ACKED: <Badge className="bg-purple-500">Confirmado</Badge>,
      IN_NEGOTIATION: <Badge className="bg-amber-500">Em Negociação</Badge>,
      WON: <Badge className="bg-green-500">Ganho</Badge>,
      LOST: <Badge className="bg-red-500">Perdido</Badge>,
      OVERDUE: <Badge className="bg-orange-600">Atrasado</Badge>,
    };
    return badges[status as keyof typeof badges] || <Badge variant="outline">{status}</Badge>;
  };

  const getOriginBadge = (origin: string) => {
    const badges = {
      ZOPU_MARKET: <Badge variant="outline">Marketplace</Badge>,
      ASSISTED_REFERRAL: <Badge className="bg-indigo-500">Indicação Manual</Badge>,
      CAMPAIGN: <Badge className="bg-pink-500">Campanha</Badge>,
    };
    return badges[origin as keyof typeof badges] || <Badge variant="outline">{origin}</Badge>;
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return "R$ 0,00";
    return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Briefcase className="h-8 w-8 text-primary" />
                Dashboard do Gerente de Contas
              </h1>
              <p className="text-muted-foreground mt-2">
                Gerencie sua carteira de indicações e acompanhe o desempenho
              </p>
            </div>
            <Link href="/gerente/create-referral">
              <Button size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Nova Indicação Manual
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-6">
        {/* Cards de Estatísticas */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Indicações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
              ) : (
                <>
                  <div className="text-3xl font-bold">{stats?.totalReferrals || 0}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-muted-foreground">
                      {stats?.inProgress || 0} em andamento
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Conversão
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
              ) : (
                <>
                  <div className="text-3xl font-bold">{stats?.conversionRate || 0}%</div>
                  <div className="flex items-center gap-2 mt-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">
                      {stats?.won || 0} ganhos
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Valor Total Ganho
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="h-8 w-24 bg-muted animate-pulse rounded"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {formatCurrency(stats?.totalWonValue || 0)}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Esperado: {formatCurrency(stats?.totalExpectedValue || 0)}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Comissão Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="h-8 w-24 bg-muted animate-pulse rounded"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats?.totalCommission || 0)}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">
                      ZOPU success fee
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Alertas de Follow-up */}
        {alerts && alerts.length > 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <AlertCircle className="h-5 w-5" />
                Alertas de Follow-up ({alerts.length})
              </CardTitle>
              <CardDescription className="text-amber-700">
                Indicações que precisam de atenção (sem atualização há mais de 7 dias)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                    <div className="flex-1">
                      <div className="font-medium">{alert.buyerCompany}</div>
                      <div className="text-sm text-muted-foreground">
                        {alert.offerTitle} • {alert.partnerName}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(alert.status)}
                      <Badge variant="outline" className="bg-amber-100">
                        {alert.daysSinceUpdate} dias sem atualização
                      </Badge>
                      <Link href={`/gerente/referral/${alert.id}`}>
                        <Button size="sm" variant="outline">
                          Ver Detalhes
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
                {alerts.length > 5 && (
                  <div className="text-center pt-2">
                    <Link href="/gerente/follow-up-alerts">
                      <Button variant="link">
                        Ver todos os {alerts.length} alertas →
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabela de Indicações */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Minhas Indicações</CardTitle>
                <CardDescription>
                  Carteira completa de indicações gerenciadas por você
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? undefined : v)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="SENT">Enviado</SelectItem>
                    <SelectItem value="ACKED">Confirmado</SelectItem>
                    <SelectItem value="IN_NEGOTIATION">Em Negociação</SelectItem>
                    <SelectItem value="WON">Ganho</SelectItem>
                    <SelectItem value="LOST">Perdido</SelectItem>
                    <SelectItem value="OVERDUE">Atrasado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingReferrals ? (
              <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : referrals && referrals.length > 0 ? (
              <ResponsiveTable
                data={referrals}
                columns={[
                  { 
                    header: "Cliente", 
                    accessor: (ref) => (
                      <div>
                        <div className="font-medium">{ref.buyerCompany}</div>
                        <div className="text-xs text-muted-foreground">{ref.buyerContact}</div>
                      </div>
                    )
                  },
                  { header: "Oferta", accessor: "offerTitle" },
                  { header: "Parceiro", accessor: "partnerName" },
                  { header: "Origem", accessor: (ref) => getOriginBadge(ref.origin) },
                  { header: "Status", accessor: (ref) => getStatusBadge(ref.status) },
                  { 
                    header: "Valor", 
                    accessor: (ref) => (
                      <div>
                        <div className="font-medium">
                          {formatCurrency(ref.wonValue || ref.expectedValue)}
                        </div>
                        {ref.successFeeRealized && (
                          <div className="text-xs text-green-600">
                            Fee: {formatCurrency(ref.successFeeRealized)}
                          </div>
                        )}
                      </div>
                    ),
                    className: "text-right"
                  },
                  { 
                    header: "Data", 
                    accessor: (ref) => formatDate(ref.createdAt)
                  },
                  { 
                    header: "Ações", 
                    accessor: (ref) => (
                      <Link href={`/gerente/referral/${ref.id}`}>
                        <Button size="sm" variant="outline" className="w-full md:w-auto">
                          <FileText className="h-4 w-4 mr-1" />
                          Detalhes
                        </Button>
                      </Link>
                    ),
                    className: "text-right"
                  },
                ]}
                keyExtractor={(ref) => ref.id.toString()}
                emptyMessage="Nenhuma indicação encontrada"
              />
            ) : (
              <div className="h-96 flex flex-col items-center justify-center text-muted-foreground">
                <Briefcase className="h-16 w-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">Nenhuma indicação encontrada</p>
                <p className="text-sm mt-2">Comece criando uma indicação manual</p>
                <Link href="/gerente/create-referral">
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Indicação
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
