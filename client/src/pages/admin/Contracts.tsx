import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import { toast } from "sonner";

export default function AdminContracts() {

  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [isApproving, setIsApproving] = useState(false);

  const { data: contracts, isLoading, refetch } = trpc.contract.listPending.useQuery();
  const approveMutation = trpc.contract.approve.useMutation({
    onSuccess: () => {
      toast.success("Contrato aprovado com sucesso!");
      setSelectedContract(null);
      setReviewComment("");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro ao aprovar contrato: ${error.message}`);
    },
  });

  const rejectMutation = trpc.contract.reject.useMutation({
    onSuccess: () => {
      toast.success("Contrato rejeitado");
      setSelectedContract(null);
      setReviewComment("");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro ao rejeitar contrato: ${error.message}`);
    },
  });

  const handleApprove = () => {
    if (!selectedContract) return;
    approveMutation.mutate({
      contractId: selectedContract.id,
      comment: reviewComment,
    });
  };

  const handleReject = () => {
    if (!selectedContract) return;
    if (!reviewComment.trim()) {
      toast.error("Por favor, informe o motivo da rejeição");
      return;
    }
    rejectMutation.mutate({
      contractId: selectedContract.id,
      comment: reviewComment,
    });
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Aprovação de Contratos</h1>
        <p className="text-muted-foreground">
          Revise e aprove declarações de contratação de serviços
        </p>
      </div>

      {!contracts || contracts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum contrato pendente de aprovação</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {contracts.map((contract: any) => (
            <Card key={contract.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-2">
                      {contract.offer?.title || "Oferta não encontrada"}
                    </CardTitle>
                    <CardDescription>
                      Parceiro: {contract.offer?.partner?.companyName || "N/A"}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    <Clock className="h-3 w-3 mr-1" />
                    Pendente
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold mb-3">Informações do Cliente</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Nome:</span>{" "}
                        <span className="font-medium">{contract.user?.name || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span>{" "}
                        <span className="font-medium">{contract.user?.email || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Detalhes do Contrato</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Data da Contratação:</span>{" "}
                        <span className="font-medium">
                          {new Date(contract.contractDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Valor:</span>{" "}
                        <span className="font-medium">{contract.contractValue}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Período:</span>{" "}
                        <span className="font-medium">{contract.contractPeriod}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {contract.comments && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Comentários do Cliente</h3>
                    <div className="bg-muted p-4 rounded-lg text-sm">
                      {contract.comments}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setSelectedContract(contract);
                      setIsApproving(true);
                    }}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprovar Contrato
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setSelectedContract(contract);
                      setIsApproving(false);
                    }}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeitar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de Aprovação/Rejeição */}
      <Dialog open={!!selectedContract} onOpenChange={() => setSelectedContract(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isApproving ? "Aprovar Contrato" : "Rejeitar Contrato"}
            </DialogTitle>
            <DialogDescription>
              {isApproving
                ? "Adicione um comentário opcional e confirme a aprovação. O cliente poderá avaliar o parceiro após a aprovação."
                : "Informe o motivo da rejeição. O cliente será notificado."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Comentário {!isApproving && <span className="text-red-500">*</span>}
              </label>
              <Textarea
                placeholder={isApproving ? "Comentário opcional..." : "Motivo da rejeição..."}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedContract(null)}>
              Cancelar
            </Button>
            {isApproving ? (
              <Button onClick={handleApprove} disabled={approveMutation.isPending}>
                {approveMutation.isPending ? "Aprovando..." : "Confirmar Aprovação"}
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={rejectMutation.isPending}
              >
                {rejectMutation.isPending ? "Rejeitando..." : "Confirmar Rejeição"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
