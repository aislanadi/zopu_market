import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function PendingOffers() {
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);
  const [successFeePercent, setSuccessFeePercent] = useState<number>(0);
  const [negotiationNotes, setNegotiationNotes] = useState("");

  const { data: pendingOffers, isLoading, refetch } = trpc.offer.getPending.useQuery();

  const approveMutation = trpc.offer.approve.useMutation({
    onSuccess: () => {
      toast.success("Oferta aprovada com sucesso!");
      setApproveDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao aprovar oferta");
    },
  });

  const rejectMutation = trpc.offer.reject.useMutation({
    onSuccess: () => {
      toast.success("Oferta rejeitada");
      setRejectDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao rejeitar oferta");
    },
  });

  const resetForm = () => {
    setSelectedOfferId(null);
    setSuccessFeePercent(0);
    setNegotiationNotes("");
  };

  const handleApproveClick = (offerId: number, currentFee: number) => {
    setSelectedOfferId(offerId);
    setSuccessFeePercent(currentFee || 0);
    setApproveDialogOpen(true);
  };

  const handleRejectClick = (offerId: number) => {
    setSelectedOfferId(offerId);
    setRejectDialogOpen(true);
  };

  const handleApprove = () => {
    if (!selectedOfferId) return;
    if (successFeePercent < 0 || successFeePercent > 100) {
      toast.error("Taxa de sucesso deve estar entre 0% e 100%");
      return;
    }

    approveMutation.mutate({
      id: selectedOfferId,
      successFeePercent,
      negotiationNotes,
    });
  };

  const handleReject = () => {
    if (!selectedOfferId) return;
    if (!negotiationNotes.trim()) {
      toast.error("Informe o motivo da rejeição");
      return;
    }

    rejectMutation.mutate({
      id: selectedOfferId,
      negotiationNotes,
    });
  };

  const getOfferTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      DIGITAL: "Digital",
      SERVICE_STANDARD: "Serviço Padrão",
      SERVICE_COMPLEX: "Serviço Complexo",
      LICENSE: "Licença",
    };
    return labels[type] || type;
  };

  return (
    <AdminLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Ofertas Pendentes de Aprovação</h1>
          <p className="text-muted-foreground">
            Revise as ofertas cadastradas pelos parceiros, negocie a taxa de sucesso e aprove para publicação
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando ofertas pendentes...</p>
          </div>
        ) : pendingOffers && pendingOffers.length > 0 ? (
          <div className="grid gap-6">
            {pendingOffers.map((offer: any) => (
              <div key={offer.id} className="border rounded-lg p-6 bg-card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{offer.title}</h3>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Aguardando Aprovação
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {offer.description || "Sem descrição"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tipo:</span>{" "}
                    <span className="font-medium">{getOfferTypeLabel(offer.offerType)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Preço:</span>{" "}
                    <span className="font-medium">
                      {offer.price ? `R$ ${(offer.price / 100).toFixed(2)}` : "Sob consulta"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Margem Líquida:</span>{" "}
                    <span className="font-medium">
                      {offer.profitMargin ? `${offer.profitMargin}%` : "Não informada"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Success Fee Proposta:</span>{" "}
                    <span className="font-medium">{offer.successFeePercent}%</span>
                  </div>
                </div>

                {offer.negotiationNotes && (
                  <div className="mb-4 p-3 bg-muted rounded-md">
                    <p className="text-sm">
                      <strong>Observações anteriores:</strong> {offer.negotiationNotes}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => handleApproveClick(offer.id, offer.successFeePercent)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprovar e Publicar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleRejectClick(offer.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeitar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhuma oferta pendente de aprovação</p>
          </div>
        )}

        {/* Approve Dialog */}
        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Aprovar Oferta</DialogTitle>
              <DialogDescription>
                Defina a taxa de sucesso negociada e adicione observações da entrevista
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="successFee">
                  Taxa de Sucesso (%) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="successFee"
                    type="number"
                    min="0"
                    max="100"
                    value={successFeePercent}
                    onChange={(e) => setSuccessFeePercent(Number(e.target.value))}
                    className="pl-9"
                    placeholder="Ex: 15"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Percentual da margem líquida que será pago à ZOPU
                </p>
              </div>

              <div>
                <Label htmlFor="notes">Observações da Negociação</Label>
                <Textarea
                  id="notes"
                  value={negotiationNotes}
                  onChange={(e) => setNegotiationNotes(e.target.value)}
                  placeholder="Registre detalhes da entrevista, justificativa da taxa, etc."
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleApprove}
                disabled={approveMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {approveMutation.isPending ? "Aprovando..." : "Aprovar e Publicar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Rejeitar Oferta</DialogTitle>
              <DialogDescription>
                Informe o motivo da rejeição. A oferta voltará para status DRAFT.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <Label htmlFor="rejectNotes">
                Motivo da Rejeição <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="rejectNotes"
                value={negotiationNotes}
                onChange={(e) => setNegotiationNotes(e.target.value)}
                placeholder="Ex: Margem líquida muito baixa, oferta não está alinhada com o marketplace, etc."
                rows={4}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleReject}
                disabled={rejectMutation.isPending}
                variant="destructive"
              >
                {rejectMutation.isPending ? "Rejeitando..." : "Rejeitar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
