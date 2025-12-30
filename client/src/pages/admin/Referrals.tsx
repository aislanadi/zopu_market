import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Referrals() {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: referrals, isLoading } = trpc.referral.list.useQuery();

  const { data: offers } = trpc.offer.list.useQuery({});
  const { data: partners } = trpc.partner.list.useQuery();

  const getStatusBadge = (status: string) => {
    const styles = {
      SENT: "bg-blue-100 text-blue-800",
      ACKED: "bg-purple-100 text-purple-800",
      IN_NEGOTIATION: "bg-yellow-100 text-yellow-800",
      WON: "bg-green-100 text-green-800",
      LOST: "bg-red-100 text-red-800",
      OVERDUE: "bg-orange-100 text-orange-800",
    };
    return styles[status as keyof typeof styles] || styles.SENT;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      SENT: "Enviado",
      ACKED: "Aceito",
      IN_NEGOTIATION: "Em Negociação",
      WON: "Ganho",
      LOST: "Perdido",
      OVERDUE: "Atrasado",
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Indicações</h1>
            <p className="text-muted-foreground">
              Acompanhe todas as indicações e referrals do marketplace
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="SENT">Enviado</SelectItem>
              <SelectItem value="ACKED">Aceito</SelectItem>
              <SelectItem value="IN_NEGOTIATION">Em Negociação</SelectItem>
              <SelectItem value="WON">Ganho</SelectItem>
              <SelectItem value="LOST">Perdido</SelectItem>
              <SelectItem value="OVERDUE">Atrasado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando indicações...</p>
          </div>
        ) : referrals && referrals.length > 0 ? (
          <div className="space-y-4">
            {referrals
              .filter((r: any) => statusFilter === "all" || r.status === statusFilter)
              .map((referral: any) => {
              const offer = offers?.find((o: any) => o.id === referral.offerId);
              const partner = partners?.find((p: any) => p.id === referral.partnerId);

              return (
                <div
                  key={referral.id}
                  className="border border-border rounded-lg p-6 bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {referral.buyerCompany || referral.buyerContact}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(
                            referral.status
                          )}`}
                        >
                          {getStatusLabel(referral.status)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Oferta:</span>{" "}
                          <span className="font-medium">{offer?.title || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Parceiro:</span>{" "}
                          <span className="font-medium">
                            {partner?.companyName || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Origem:</span>{" "}
                          <span className="font-medium">{referral.origin}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Success Fee:</span>{" "}
                          <span className="font-medium">
                            {referral.successFeePercent}%
                          </span>
                        </div>
                        {referral.dealValue && (
                          <div>
                            <span className="text-muted-foreground">Valor:</span>{" "}
                            <span className="font-medium">
                              R$ {(referral.dealValue / 100).toFixed(2)}
                            </span>
                          </div>
                        )}
                        {referral.ackDeadline && (
                          <div>
                            <span className="text-muted-foreground">
                              Prazo de Aceite:
                            </span>{" "}
                            <span className="font-medium">
                              {format(
                                new Date(referral.ackDeadline),
                                "dd/MM/yyyy HH:mm",
                                { locale: ptBR }
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {referral.notes && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Observações:</span>{" "}
                        {referral.notes}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground">
              Nenhuma indicação registrada ainda
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
