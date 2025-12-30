import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, AlertTriangle, CheckCircle2, XCircle, Building2, Calendar } from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts";

const COLORS = {
  ATIVA: "#10b981", // green
  VENCENDO: "#f59e0b", // orange
  VENCIDA: "#ef4444", // red
  NAO_INFORMADA: "#9ca3af", // gray
};

const TYPE_COLORS = ["#3b82f6", "#8b5cf6"]; // blue, purple

export default function LicenseDashboard() {
  const { data: metrics, isLoading } = trpc.license.getMetrics.useQuery();

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!metrics) {
    return (
      <AdminLayout>
        <div className="container py-8">
          <p className="text-muted-foreground">Nenhum dado disponível</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Dashboard de Licenças</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral e análise de métricas das licenças Bitrix24
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Total de Licenças
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.totalLicenses}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Compradores e Parceiros
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{metrics.activeLicenses}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.totalLicenses > 0 
                  ? Math.round((metrics.activeLicenses / metrics.totalLicenses) * 100)
                  : 0}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                Vencendo (30 dias)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{metrics.expiringLicenses}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Requerem atenção urgente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                Vencidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{metrics.expiredLicenses}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Contato imediato necessário
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos principais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Distribuição por Status */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Status</CardTitle>
              <CardDescription>Visão geral do status das licenças</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={metrics.statusDistribution}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.status}: ${entry.count}`}
                  >
                    {metrics.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.status as keyof typeof COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribuição por Tipo */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Tipo</CardTitle>
              <CardDescription>Compradores vs Parceiros</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={metrics.typeDistribution}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.type}: ${entry.count}`}
                  >
                    {metrics.typeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Vencimentos por Mês */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Vencimentos por Mês</CardTitle>
            <CardDescription>Próximos 12 meses - Compradores e Parceiros</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={metrics.expirationsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="buyers" name="Compradores" fill="#3b82f6" stackId="a" />
                <Bar dataKey="partners" name="Parceiros" fill="#8b5cf6" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Timeline de Vencimentos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Timeline de Vencimentos</CardTitle>
            <CardDescription>Próximas 13 semanas (~90 dias)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.expirationTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="Licenças vencendo"
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={{ fill: "#f59e0b" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Próximas Expirações */}
        <Card>
          <CardHeader>
            <CardTitle>Próximas Expirações</CardTitle>
            <CardDescription>Top 10 licenças vencendo primeiro</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.upcomingExpirations.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma licença vencendo nos próximos dias
                </p>
              ) : (
                metrics.upcomingExpirations.map((license) => (
                  <div
                    key={`${license.type}-${license.id}`}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{license.companyName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {license.type === "buyer" ? "Comprador" : "Parceiro"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Vence em {new Date(license.licenseExpiry).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        license.daysUntil <= 7 ? "text-red-600" :
                        license.daysUntil <= 30 ? "text-orange-600" :
                        "text-yellow-600"
                      }`}>
                        {license.daysUntil} dias
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
