import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ContractDeclarationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offerId: number;
  partnerId: number;
  onSuccess: () => void;
}

export function ContractDeclarationModal({
  open,
  onOpenChange,
  offerId,
  partnerId,
  onSuccess,
}: ContractDeclarationModalProps) {
  const [formData, setFormData] = useState({
    contractDate: "",
    value: "",
    period: "",
    comments: "",
  });

  const createContract = trpc.contract.create.useMutation({
    onSuccess: () => {
      toast.success("Contratação registrada com sucesso! Agora você pode avaliar este serviço.");
      onSuccess();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao registrar contratação");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createContract.mutate({
      offerId,
      partnerId,
      contractDate: formData.contractDate,
      value: formData.value,
      period: formData.period,
      comments: formData.comments,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Eu Contratei este Serviço</DialogTitle>
          <DialogDescription>
            Informe os dados da contratação para habilitar a avaliação do parceiro. Suas informações serão verificadas pela equipe ZOPU.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contractDate">Data da contratação *</Label>
            <Input
              id="contractDate"
              type="date"
              required
              value={formData.contractDate}
              onChange={(e) => setFormData({ ...formData, contractDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Valor contratado</Label>
            <Input
              id="value"
              placeholder="Ex: R$ 50.000,00"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Opcional - ajuda na verificação</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="period">Período do contrato</Label>
            <Input
              id="period"
              placeholder="Ex: 6 meses, 1 ano"
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Opcional</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Comentários adicionais</Label>
            <Textarea
              id="comments"
              placeholder="Informações que ajudem na verificação..."
              rows={3}
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            <p className="font-medium">⚠️ Verificação necessária</p>
            <p className="mt-1">
              Sua declaração será verificada pela equipe ZOPU antes de habilitar a avaliação.
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createContract.isPending}>
              {createContract.isPending ? "Enviando..." : "Confirmar Contratação"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
