import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { AlertCircle, ArrowLeft, Clock, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

export default function FollowUpAlerts() {
  const { data: alerts, isLoading } = trpc.gerente.getFollowUpAlerts.useQuery();

  const getStatusBadge = (status: string) => {
    const badges = {
      SENT: <Badge className="bg-blue-500">Enviado</Badge>,
      ACKED: <Badge className="bg-purple-500">Confirmado</Badge>,
      IN_NEGOTIATION: <Badge className="bg-amber-500">Em Negociação</Badge>,
    };
    return badges[status as keyof typeof badges] || <Badge variant="outline">{status}</Badge>;
  };

  const getUrgencyLevel = (days: number) => {
    if (days >= 30) return { color: "bg-red-100 border-red-300", label: "Urgente", icon: "🔴" };
    if (days >= 15) return { color: "bg-orange-100 border-orange-300", label: "Alta", icon: "🟠" };
    return { color: "bg-amber-100 border-amber-300", label: "Média", icon: "🟡" };
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container py-6">
          <div className="flex items-center gap-4">
            <Link href="/gerente/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-amber-500" />
                Alertas de Follow-up
              </h1>
              <p className="text-muted-foreground mt-2">
                Indicações que precisam de atenção urgente (sem atualização há mais de 7 dias)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-6">
        {/* Resumo */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{alerts?.length || 0}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Indicações pendentes de follow-up
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Urgência Alta/Urgente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {alerts?.filter((a) => a.daysSinceUpdate >= 15).length || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Mais de 15 dias sem atualização
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tempo Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {alerts && alerts.length > 0
                  ? Math.round(alerts.reduce((acc, a) => acc + a.daysSinceUpdate, 0) / alerts.length)
                  : 0}{" "}
                dias
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Desde a última atualização
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Alertas */}
        <Card>
          <CardHeader>
            <CardTitle>Indicações Pendentes</CardTitle>
            <CardDescription>
              Ordenadas por tempo desde a última atualização (mais antigas primeiro)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : alerts && alerts.length > 0 ? (
              <div className="space-y-4">
                {alerts.map((alert) => {
                  const urgency = getUrgencyLevel(alert.daysSinceUpdate);
                  
                  return (
                    <div
                      key={alert.id}
                      className={`border rounded-lg p-4 ${urgency.color}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{urgency.icon}</span>
                            <div>
                              <div className="font-bold text-lg">{alert.buyerCompany}</div>
                              <div className="text-sm text-muted-foreground">
                                ID #{alert.id} • Criado em {formatDate(alert.createdAt)}
                              </div>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Oferta</label>
                              <p className="text-sm font-medium">{alert.offerTitle}</p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Parceiro</label>
                              <p className="text-sm font-medium">{alert.partnerName}</p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Status Atual</label>
                              <div className="mt-1">{getStatusBadge(alert.status)}</div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Última Atualização</label>
                              <p className="text-sm font-medium">{formatDate(alert.lastStatusUpdate)}</p>
                            </div>
                          </div>

                          <div className="mt-4 p-3 bg-white rounded border">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-amber-600" />
                              <span className="font-semibold text-amber-900">
                                {alert.daysSinceUpdate} dias sem atualização
                              </span>
                              <Badge variant="outline" className="ml-auto">
                                Urgência: {urgency.label}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="ml-4">
                          <Link href={`/gerente/referral/${alert.id}`}>
                            <Button>
                              <TrendingUp className="h-4 w-4 mr-2" />
                              Fazer Follow-up
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-96 flex flex-col items-center justify-center text-muted-foreground">
                <AlertCircle className="h-16 w-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">Nenhum alerta no momento</p>
                <p className="text-sm mt-2">
                  Todas as suas indicações estão atualizadas! 🎉
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
