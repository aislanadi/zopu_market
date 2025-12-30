import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Trophy, TrendingUp, TrendingDown, Award, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminConversionRanking() {
  const { data: ranking, isLoading } = trpc.adminDashboard.getConversionRanking.useQuery({ limit: 20 });

  const getRankBadge = (position: number) => {
    if (position === 1) return <Badge className="bg-yellow-500 hover:bg-yellow-600">🥇 1º Lugar</Badge>;
    if (position === 2) return <Badge className="bg-gray-400 hover:bg-gray-500">🥈 2º Lugar</Badge>;
    if (position === 3) return <Badge className="bg-amber-600 hover:bg-amber-700">🥉 3º Lugar</Badge>;
    return <span className="text-muted-foreground text-sm">#{position}</span>;
  };

  const getConversionColor = (rate: number) => {
    if (rate >= 50) return "text-green-600";
    if (rate >= 30) return "text-green-500";
    if (rate >= 15) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Ranking de Conversão de Parceiros
          </h1>
          <p className="text-muted-foreground mt-2">
            Parceiros ordenados por taxa de conversão (leads ganhos / total de leads)
          </p>
        </div>

        {/* Cards de Resumo */}
        {!isLoading && ranking && ranking.length > 0 && (
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  🥇 Melhor Conversão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ranking[0].partnerName}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {ranking[0].conversionRate}% de conversão
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Parceiros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ranking.length}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Com pelo menos 1 lead
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Conversão Média
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(ranking.reduce((acc, p) => acc + (p.conversionRate || 0), 0) / ranking.length).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Média geral do marketplace
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabela de Ranking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Ranking Completo
            </CardTitle>
            <CardDescription>
              Top 20 parceiros com melhor performance de conversão
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : ranking && ranking.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold w-20">Posição</th>
                      <th className="text-left p-4 font-semibold">Parceiro</th>
                      <th className="text-right p-4 font-semibold">Total Leads</th>
                      <th className="text-right p-4 font-semibold">Ganhos</th>
                      <th className="text-right p-4 font-semibold">Perdidos</th>
                      <th className="text-right p-4 font-semibold">Taxa Conversão</th>
                      <th className="text-right p-4 font-semibold">Comissão Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.map((partner, index) => {
                      const position = index + 1;
                      const conversionRate = partner.conversionRate || 0;
                      
                      return (
                        <tr 
                          key={partner.partnerId} 
                          className={`border-b hover:bg-accent/50 ${
                            position <= 3 ? 'bg-accent/20' : ''
                          }`}
                        >
                          <td className="p-4">
                            {getRankBadge(position)}
                          </td>
                          <td className="p-4 font-medium">
                            {partner.partnerName}
                          </td>
                          <td className="text-right p-4">
                            {partner.totalLeads}
                          </td>
                          <td className="text-right p-4 text-green-600 font-semibold">
                            {partner.leadsWon}
                          </td>
                          <td className="text-right p-4 text-red-600">
                            {partner.leadsLost}
                          </td>
                          <td className="text-right p-4">
                            <span className={`inline-flex items-center gap-1 font-bold ${getConversionColor(conversionRate)}`}>
                              {conversionRate >= 30 ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              {conversionRate.toFixed(1)}%
                            </span>
                          </td>
                          <td className="text-right p-4">
                            <span className="inline-flex items-center gap-1 font-semibold text-green-600">
                              <DollarSign className="h-4 w-4" />
                              {(partner.totalCommission || 0).toLocaleString('pt-BR', { 
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2 
                              })}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível. Aguardando leads de parceiros.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Insights */}
        {!isLoading && ranking && ranking.length > 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">💡 Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">
                • <strong>{ranking.filter(p => (p.conversionRate || 0) >= 30).length}</strong> parceiros com conversão acima de 30% (excelente)
              </p>
              <p className="text-sm">
                • <strong>{ranking.filter(p => (p.conversionRate || 0) >= 15 && (p.conversionRate || 0) < 30).length}</strong> parceiros com conversão entre 15-30% (bom)
              </p>
              <p className="text-sm">
                • <strong>{ranking.filter(p => (p.conversionRate || 0) < 15).length}</strong> parceiros com conversão abaixo de 15% (necessita atenção)
              </p>
              <p className="text-sm mt-4 text-muted-foreground">
                💼 Considere oferecer treinamento e suporte aos parceiros com baixa conversão para melhorar a performance geral do marketplace.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
