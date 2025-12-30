import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveTable } from "@/components/ResponsiveTable";
import { Download, Filter } from "lucide-react";

export default function PartnerCommissions() {
  const [filters, setFilters] = useState({
    partnerId: undefined as number | undefined,
    startDate: "",
    endDate: "",
  });

  // Buscar lista de parceiros para o filtro
  const { data: partners } = trpc.partner.list.useQuery();
  
  // Buscar dados de comissões por parceiro
  const { data: commissions, isLoading } = trpc.commission.getByPartner.useQuery(filters);
  
  // Mutation para exportar CSV
  const exportCSV = trpc.commission.exportCSV.useQuery(
    { type: "by_partner", ...filters },
    { enabled: false }
  );

  const formatCurrency = (value: number | null) => {
    if (!value) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const handleExportCSV = async () => {
    const result = await exportCSV.refetch();
    if (result.data) {
      const blob = new Blob([result.data.csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = result.data.filename;
      link.click();
    }
  };

  // Calcular totalizadores
  const totals = commissions?.reduce(
    (acc, item) => ({
      previsto: acc.previsto + (item.successFeeExpected || 0),
      realizado: acc.realizado + (item.successFeeRealized || 0),
      expectedValue: acc.expectedValue + (item.expectedValue || 0),
      wonValue: acc.wonValue + (item.wonValue || 0),
    }),
    { previsto: 0, realizado: 0, expectedValue: 0, wonValue: 0 }
  );

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      SENT: { label: "Enviado", className: "bg-blue-100 text-blue-800" },
      ACKED: { label: "Aceito", className: "bg-purple-100 text-purple-800" },
      IN_NEGOTIATION: { label: "Em Negociação", className: "bg-yellow-100 text-yellow-800" },
      WON: { label: "Ganho", className: "bg-green-100 text-green-800" },
      LOST: { label: "Perdido", className: "bg-red-100 text-red-800" },
      OVERDUE: { label: "Atrasado", className: "bg-gray-100 text-gray-800" },
    };

    const badge = badges[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Comissões por Parceiro</h1>
        
        <Button onClick={handleExportCSV} disabled={!commissions || commissions.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="h-5 w-5 text-muted-foreground" />
          
          <Select
            value={filters.partnerId?.toString() || "all"}
            onValueChange={(value) =>
              setFilters({ ...filters, partnerId: value === "all" ? undefined : parseInt(value) })
            }
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Todos os Parceiros" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Parceiros</SelectItem>
              {partners?.map((partner) => (
                <SelectItem key={partner.id} value={partner.id.toString()}>
                  {partner.legalName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="px-3 py-2 border rounded-md"
            placeholder="Data Início"
          />
          
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="px-3 py-2 border rounded-md"
            placeholder="Data Fim"
          />

          <Button
            variant="outline"
            onClick={() => setFilters({ partnerId: undefined, startDate: "", endDate: "" })}
          >
            Limpar
          </Button>
        </div>
      </Card>

      {/* Cards de Totalizadores */}
      {totals && commissions && commissions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Valor Esperado Total</p>
            <p className="text-xl font-bold">{formatCurrency(totals.expectedValue)}</p>
          </Card>
          
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Valor Ganho Total</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(totals.wonValue)}</p>
          </Card>
          
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Comissão Prevista</p>
            <p className="text-xl font-bold">{formatCurrency(totals.previsto)}</p>
          </Card>
          
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Comissão Realizada</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(totals.realizado)}</p>
          </Card>
        </div>
      )}

      {/* Tabela de Comissões */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Histórico Detalhado</h2>
        
        {isLoading ? (
          <p>Carregando...</p>
        ) : !commissions || commissions.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma comissão encontrada com os filtros selecionados.</p>
        ) : (
          <ResponsiveTable
            data={commissions}
            columns={[
              { 
                header: "ID", 
                accessor: (row) => `#${row.referralId}`,
                mobileLabel: "ID"
              },
              { header: "Parceiro", accessor: (row) => row.partnerName || "N/A" },
              { header: "Status", accessor: (row) => getStatusBadge(row.status) },
              { 
                header: "Valor Esperado", 
                accessor: (row) => formatCurrency(row.expectedValue),
                className: "text-right"
              },
              { 
                header: "Valor Ganho", 
                accessor: (row) => (
                  <span className="font-semibold">
                    {row.wonValue ? formatCurrency(row.wonValue) : "-"}
                  </span>
                ),
                className: "text-right"
              },
              { 
                header: "Comissão Prevista", 
                accessor: (row) => formatCurrency(row.successFeeExpected),
                className: "text-right"
              },
              { 
                header: "Comissão Realizada", 
                accessor: (row) => (
                  <span className="text-green-600 font-semibold">
                    {row.successFeeRealized ? formatCurrency(row.successFeeRealized) : "-"}
                  </span>
                ),
                className: "text-right"
              },
              { 
                header: "Data Criação", 
                accessor: (row) => (
                  <span className="text-sm text-muted-foreground">
                    {formatDate(row.createdAt)}
                  </span>
                ),
                className: "text-right"
              },
              { 
                header: "Última Atualização", 
                accessor: (row) => (
                  <span className="text-sm text-muted-foreground">
                    {formatDate(row.lastStatusUpdate)}
                  </span>
                ),
                className: "text-right"
              },
            ]}
            keyExtractor={(row) => row.referralId.toString()}
            emptyMessage="Nenhuma comissão encontrada"
          />
        )}
      </Card>
    </div>
  );
}
