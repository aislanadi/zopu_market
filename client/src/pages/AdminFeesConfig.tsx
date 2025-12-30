import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { DollarSign, Save, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminFeesConfig() {
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);
  const [successFee, setSuccessFee] = useState("");
  const [zopuTakeRate, setZopuTakeRate] = useState("");
  const [partnerShare, setPartnerShare] = useState("");

  const { data: offers, isLoading } = trpc.offer.list.useQuery({});
  const { data: categories } = trpc.category.list.useQuery();
  const updateOfferMutation = trpc.offer.update.useMutation({
    onSuccess: () => {
      toast.success("Configuração de fees atualizada com sucesso!");
      utils.offer.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar fees: ${error.message}`);
    },
  });

  const utils = trpc.useUtils();

  const selectedOffer = offers?.find((o: any) => o.id === selectedOfferId);

  const handleSelectOffer = (offerId: string) => {
    const id = parseInt(offerId);
    setSelectedOfferId(id);
    const offer = offers?.find((o: any) => o.id === id);
    if (offer) {
      setSuccessFee(offer.successFeePercent?.toString() || "");
      setZopuTakeRate(offer.zopuTakeRatePercent?.toString() || "");
      setPartnerShare(offer.partnerSharePercent?.toString() || "");
    }
  };

  const handleSave = () => {
    if (!selectedOfferId) {
      toast.error("Selecione uma oferta primeiro");
      return;
    }

    const successFeeNum = parseInt(successFee);
    const zopuTakeRateNum = parseInt(zopuTakeRate);
    const partnerShareNum = parseInt(partnerShare);

    // Validações
    if (isNaN(successFeeNum) || successFeeNum < 0 || successFeeNum > 100) {
      toast.error("Success Fee deve ser entre 0 e 100%");
      return;
    }

    if (zopuTakeRate && (isNaN(zopuTakeRateNum) || zopuTakeRateNum < 0 || zopuTakeRateNum > 100)) {
      toast.error("ZOPU Take Rate deve ser entre 0 e 100%");
      return;
    }

    if (partnerShare && (isNaN(partnerShareNum) || partnerShareNum < 0 || partnerShareNum > 100)) {
      toast.error("Partner Share deve ser entre 0 e 100%");
      return;
    }

    // Verificar se soma de split é 100%
    if (zopuTakeRate && partnerShare) {
      if (zopuTakeRateNum + partnerShareNum !== 100) {
        toast.error("A soma de ZOPU Take Rate + Partner Share deve ser 100%");
        return;
      }
    }

    updateOfferMutation.mutate({
      id: selectedOfferId,
      successFeePercent: successFeeNum,
      zopuTakeRatePercent: zopuTakeRateNum || undefined,
      partnerSharePercent: partnerShareNum || undefined,
    });
  };

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return "Sem categoria";
    return categories?.find((c) => c.id === categoryId)?.name || "Categoria desconhecida";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-primary" />
            Configuração de Fees por Produto
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure as taxas de comissionamento e split para cada oferta
          </p>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Sobre as Taxas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Success Fee:</strong> Percentual de comissão que a ZOPU recebe sobre o valor ganho em indicações (LEAD_FORM).
              Aplicado quando o status da indicação é marcado como WON.
            </p>
            <p>
              <strong>ZOPU Take Rate:</strong> Percentual da ZOPU em vendas diretas (CHECKOUT). Usado para calcular split de pagamento.
            </p>
            <p>
              <strong>Partner Share:</strong> Percentual do parceiro em vendas diretas (CHECKOUT). Deve somar 100% com ZOPU Take Rate.
            </p>
          </CardContent>
        </Card>

        {/* Seletor de Oferta */}
        <Card>
          <CardHeader>
            <CardTitle>Selecionar Oferta</CardTitle>
            <CardDescription>Escolha a oferta para configurar as taxas</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Select value={selectedOfferId?.toString()} onValueChange={handleSelectOffer}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma oferta..." />
                </SelectTrigger>
                <SelectContent>
                  {offers?.map((offer: any) => (
                    <SelectItem key={offer.id} value={offer.id.toString()}>
                      {offer.title} - {getCategoryName(offer.categoryId)} - {offer.saleMode === "CHECKOUT" ? "Checkout" : "Lead Form"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        {/* Formulário de Configuração */}
        {selectedOffer && (
          <Card>
            <CardHeader>
              <CardTitle>Configurar Taxas</CardTitle>
              <CardDescription>
                Oferta: <strong>{selectedOffer.title}</strong> | Modo: <strong>{selectedOffer.saleMode === "CHECKOUT" ? "Checkout Direto" : "Formulário de Proposta"}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Success Fee */}
              <div className="space-y-2">
                <Label htmlFor="successFee">
                  Success Fee (%) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="successFee"
                  type="number"
                  min="0"
                  max="100"
                  value={successFee}
                  onChange={(e) => setSuccessFee(e.target.value)}
                  placeholder="Ex: 15"
                />
                <p className="text-sm text-muted-foreground">
                  Comissão da ZOPU sobre indicações ganhas (aplicável a todos os modos de venda)
                </p>
              </div>

              {/* ZOPU Take Rate - apenas para CHECKOUT */}
              {selectedOffer.saleMode === "CHECKOUT" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="zopuTakeRate">ZOPU Take Rate (%)</Label>
                    <Input
                      id="zopuTakeRate"
                      type="number"
                      min="0"
                      max="100"
                      value={zopuTakeRate}
                      onChange={(e) => setZopuTakeRate(e.target.value)}
                      placeholder="Ex: 20"
                    />
                    <p className="text-sm text-muted-foreground">
                      Percentual da ZOPU em vendas diretas via checkout
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="partnerShare">Partner Share (%)</Label>
                    <Input
                      id="partnerShare"
                      type="number"
                      min="0"
                      max="100"
                      value={partnerShare}
                      onChange={(e) => setPartnerShare(e.target.value)}
                      placeholder="Ex: 80"
                    />
                    <p className="text-sm text-muted-foreground">
                      Percentual do parceiro em vendas diretas via checkout (deve somar 100% com ZOPU Take Rate)
                    </p>
                  </div>

                  {zopuTakeRate && partnerShare && (
                    <div className={`p-4 rounded-lg ${
                      parseInt(zopuTakeRate) + parseInt(partnerShare) === 100
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    }`}>
                      <p className="text-sm font-medium">
                        Soma: {parseInt(zopuTakeRate || "0") + parseInt(partnerShare || "0")}%
                        {parseInt(zopuTakeRate) + parseInt(partnerShare) === 100 ? " ✓" : " ✗ (deve ser 100%)"}
                      </p>
                    </div>
                  )}
                </>
              )}

              <Button
                onClick={handleSave}
                disabled={updateOfferMutation.isPending}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateOfferMutation.isPending ? "Salvando..." : "Salvar Configuração"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tabela de Resumo */}
        {offers && offers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resumo de Todas as Ofertas</CardTitle>
              <CardDescription>Visão geral das taxas configuradas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Oferta</th>
                      <th className="text-left p-3 font-semibold">Categoria</th>
                      <th className="text-left p-3 font-semibold">Modo</th>
                      <th className="text-right p-3 font-semibold">Success Fee</th>
                      <th className="text-right p-3 font-semibold">ZOPU Rate</th>
                      <th className="text-right p-3 font-semibold">Partner Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offers.map((offer: any) => (
                      <tr key={offer.id} className="border-b hover:bg-accent/50">
                        <td className="p-3 font-medium">{offer.title}</td>
                        <td className="p-3">{getCategoryName(offer.categoryId)}</td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-1 rounded text-xs ${
                            offer.saleMode === "CHECKOUT"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}>
                            {offer.saleMode === "CHECKOUT" ? "Checkout" : "Lead Form"}
                          </span>
                        </td>
                        <td className="text-right p-3 font-semibold text-primary">
                          {offer.successFeePercent || 0}%
                        </td>
                        <td className="text-right p-3">
                          {offer.zopuTakeRatePercent || "-"}
                          {offer.zopuTakeRatePercent ? "%" : ""}
                        </td>
                        <td className="text-right p-3">
                          {offer.partnerSharePercent || "-"}
                          {offer.partnerSharePercent ? "%" : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
