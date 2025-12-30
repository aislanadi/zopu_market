import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveTable } from "@/components/ResponsiveTable";
import { DollarSign, TrendingUp, TrendingDown, Activity, Download } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function FinancialDashboard() {
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  // Buscar dados de comissões
  const { data: summary, isLoading: loadingSummary } = trpc.commission.getSummary.useQuery(dateRange);
  const { data: byCategory, isLoading: loadingCategory } = trpc.commission.getByCategory.useQuery(dateRange);
  const { data: monthlyEvolution, isLoading: loadingEvolution } = trpc.commission.getMonthlyEvolution.useQuery({ months: 12 });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (loadingSummary) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard Financeiro</h1>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard Financeiro</h1>
        
        <div className="flex gap-4">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="px-3 py-2 border rounded-md"
            placeholder="Data Início"
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="px-3 py-2 border rounded-md"
            placeholder="Data Fim"
          />
          <Button
            variant="outline"
            onClick={() => setDateRange({ startDate: "", endDate: "" })}
          >
            Limpar Filtros
          </Button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Comissões Previstas</p>
              <p className="text-2xl font-bold">{formatCurrency(summary?.totalPrevisto || 0)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {summary?.totalReferrals || 0} indicações totais
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Comissões Realizadas</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(summary?.totalRealizado || 0)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {summary?.totalWon || 0} negócios ganhos
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
              <p className="text-2xl font-bold">{summary?.conversionRate.toFixed(1) || 0}%</p>
            </div>
            <Activity className="h-8 w-8 text-orange-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {summary?.totalWon || 0} ganhos / {summary?.totalReferrals || 0} total
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Em Andamento</p>
              <p className="text-2xl font-bold">{summary?.totalInProgress || 0}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-yellow-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {summary?.totalLost || 0} perdidos
          </p>
        </Card>
      </div>

      {/* Gráfico de Evolução Mensal */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Evolução Mensal de Comissões</h2>
        {loadingEvolution ? (
          <p>Carregando gráfico...</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyEvolution || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="totalPrevisto" stroke="#3b82f6" name="Previsto" />
              <Line type="monotone" dataKey="totalRealizado" stroke="#10b981" name="Realizado" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Gráfico de Comissões por Categoria */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Comissões por Categoria</h2>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
        
        {loadingCategory ? (
          <p>Carregando...</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byCategory || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoryName" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="totalPrevisto" fill="#3b82f6" name="Previsto" />
                <Bar dataKey="totalRealizado" fill="#10b981" name="Realizado" />
              </BarChart>
            </ResponsiveContainer>

            {/* Tabela Detalhada */}
            <div className="mt-6">
              <ResponsiveTable
                data={byCategory || []}
                columns={[
                  { header: "Categoria", accessor: "categoryName" },
                  { header: "Referrals", accessor: "totalReferrals", className: "text-right" },
                  { 
                    header: "Previsto", 
                    accessor: (row) => formatCurrency(Number(row.totalPrevisto) || 0),
                    className: "text-right"
                  },
                  { 
                    header: "Realizado", 
                    accessor: (row) => (
                      <span className="text-green-600 font-semibold">
                        {formatCurrency(Number(row.totalRealizado) || 0)}
                      </span>
                    ),
                    className: "text-right"
                  },
                  { header: "Ganhos", accessor: "totalWon", className: "text-right" },
                  { 
                    header: "Taxa", 
                    accessor: (row) => {
                      const taxa = row.totalReferrals > 0 
                        ? ((Number(row.totalWon) / Number(row.totalReferrals)) * 100).toFixed(1) 
                        : 0;
                      return `${taxa}%`;
                    },
                    className: "text-right"
                  },
                ]}
                keyExtractor={(row) => row.categoryId?.toString() || ""}
                emptyMessage="Nenhuma categoria com dados"
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
