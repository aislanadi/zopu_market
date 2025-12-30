import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Activity, Clock } from "lucide-react";

export default function AdminAnalytics() {
  const { data: leadsByCategory, isLoading: loadingCategories } = trpc.adminDashboard.getLeadsByCategory.useQuery();
  const { data: agingReport, isLoading: loadingAging } = trpc.adminDashboard.getAgingReport.useQuery();

  const COLORS = ['#FF6B1A', '#FF8C42', '#FFA566', '#FFBE8A'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Analytics e Relatórios</h1>
          <p className="text-muted-foreground mt-2">
            Análise detalhada de leads por categoria e aging de indicações
          </p>
        </div>

        {/* Leads por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Leads por Categoria
            </CardTitle>
            <CardDescription>
              Distribuição e performance de leads por categoria de oferta
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingCategories ? (
              <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : leadsByCategory && leadsByCategory.length > 0 ? (
              <>
                {/* Gráfico de Barras */}
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={leadsByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="categoryName" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalLeads" fill="#FF6B1A" name="Total de Leads" />
                    <Bar dataKey="leadsWon" fill="#10b981" name="Ganhos" />
                    <Bar dataKey="leadsLost" fill="#ef4444" name="Perdidos" />
                    <Bar dataKey="leadsInProgress" fill="#f59e0b" name="Em Andamento" />
                  </BarChart>
                </ResponsiveContainer>

                {/* Tabela Detalhada */}
                <div className="mt-8 overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Categoria</th>
                        <th className="text-right p-3 font-semibold">Total</th>
                        <th className="text-right p-3 font-semibold">Ganhos</th>
                        <th className="text-right p-3 font-semibold">Perdidos</th>
                        <th className="text-right p-3 font-semibold">Em Andamento</th>
                        <th className="text-right p-3 font-semibold">Taxa Conversão</th>
                        <th className="text-right p-3 font-semibold">Valor Total</th>
                        <th className="text-right p-3 font-semibold">Valor Ganho</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leadsByCategory.map((cat) => {
                        const conversionRate = cat.totalLeads > 0 
                          ? ((cat.leadsWon / cat.totalLeads) * 100).toFixed(1)
                          : '0.0';
                        
                        return (
                          <tr key={cat.categoryId} className="border-b hover:bg-accent/50">
                            <td className="p-3 font-medium">{cat.categoryName || 'Sem Categoria'}</td>
                            <td className="text-right p-3">{cat.totalLeads}</td>
                            <td className="text-right p-3 text-green-600">{cat.leadsWon}</td>
                            <td className="text-right p-3 text-red-600">{cat.leadsLost}</td>
                            <td className="text-right p-3 text-amber-600">{cat.leadsInProgress}</td>
                            <td className="text-right p-3">
                              <span className={`inline-flex items-center gap-1 ${
                                parseFloat(conversionRate) >= 30 ? 'text-green-600' :
                                parseFloat(conversionRate) >= 15 ? 'text-amber-600' :
                                'text-red-600'
                              }`}>
                                {parseFloat(conversionRate) >= 15 ? (
                                  <TrendingUp className="h-4 w-4" />
                                ) : (
                                  <TrendingDown className="h-4 w-4" />
                                )}
                                {conversionRate}%
                              </span>
                            </td>
                            <td className="text-right p-3">
                              R$ {(cat.totalValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="text-right p-3 font-semibold text-green-600">
                              R$ {(cat.wonValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="h-96 flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        {/* Aging de Indicações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Aging de Indicações em Andamento
            </CardTitle>
            <CardDescription>
              Distribuição de indicações ativas por tempo de vida
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingAging ? (
              <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : agingReport && agingReport.buckets.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-8">
                {/* Gráfico de Pizza */}
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={agingReport.buckets}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ range, count }) => `${range}: ${count}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {agingReport.buckets.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                {/* Cards de Métricas */}
                <div className="space-y-4">
                  <div className="bg-card border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">Total em Andamento</div>
                    <div className="text-3xl font-bold">{agingReport.total}</div>
                  </div>

                  {agingReport.buckets.map((bucket, index) => (
                    <div key={bucket.range} className="bg-card border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">{bucket.range}</div>
                          <div className="text-2xl font-bold">{bucket.count}</div>
                        </div>
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: COLORS[index] + '20' }}
                        >
                          <div 
                            className="w-8 h-8 rounded-full"
                            style={{ backgroundColor: COLORS[index] }}
                          />
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        {((bucket.count / agingReport.total) * 100).toFixed(1)}% do total
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center text-muted-foreground">
                Nenhuma indicação em andamento
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
