import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Plus, Building, User, DollarSign, FileText } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreateReferral() {
  const [, setLocation] = useLocation();
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
  const [buyerCompany, setBuyerCompany] = useState("");
  const [buyerContact, setBuyerContact] = useState("");
  const [expectedValue, setExpectedValue] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  const { data: offers } = trpc.offer.list.useQuery({ status: "APPROVED" });
  const { data: partners } = trpc.partner.list.useQuery();
  const { data: categories } = trpc.category.list.useQuery();

  const createMutation = trpc.gerente.createManualReferral.useMutation({
    onSuccess: (data) => {
      toast.success("Indicação manual criada com sucesso!");
      setLocation(`/gerente/referral/${data.id}`);
    },
    onError: (error) => {
      toast.error(`Erro ao criar indicação: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOfferId || !selectedPartnerId || !buyerCompany || !buyerContact) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createMutation.mutate({
      offerId: selectedOfferId,
      partnerId: selectedPartnerId,
      buyerCompany,
      buyerContact,
      expectedValue: expectedValue ? parseFloat(expectedValue.replace(/[^\d,]/g, "").replace(",", ".")) : undefined,
      internalNotes: internalNotes || undefined,
    });
  };

  const getCategoryName = (categoryId: number) => {
    return categories?.find((c) => c.id === categoryId)?.name || "N/A";
  };

  const selectedOffer = offers?.find((o: any) => o.id === selectedOfferId);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container py-6">
          <div className="flex items-center gap-4">
            <Link href="/gerente/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Plus className="h-8 w-8 text-primary" />
                Nova Indicação Manual
              </h1>
              <p className="text-muted-foreground mt-2">
                Crie uma indicação assistida para um cliente específico
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <form onSubmit={handleSubmit}>
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Seleção de Oferta */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Oferta
                </CardTitle>
                <CardDescription>
                  Selecione a oferta que será indicada ao cliente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Oferta <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={selectedOfferId?.toString() || ""}
                    onValueChange={(v) => setSelectedOfferId(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma oferta..." />
                    </SelectTrigger>
                    <SelectContent>
                      {offers?.map((offer: any) => (
                        <SelectItem key={offer.id} value={offer.id.toString()}>
                          {offer.title} - {getCategoryName(offer.categoryId)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedOffer && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Categoria:</span>
                        <span className="ml-2 font-medium">
                          {getCategoryName((selectedOffer as any).categoryId)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Success Fee:</span>
                        <span className="ml-2 font-medium">
                          {(selectedOffer as any).successFeePercent}%
                        </span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-muted-foreground">Descrição:</span>
                        <p className="mt-1 text-sm">{(selectedOffer as any).description}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Seleção de Parceiro */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Parceiro
                </CardTitle>
                <CardDescription>
                  Selecione o parceiro que receberá a indicação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Parceiro <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={selectedPartnerId?.toString() || ""}
                    onValueChange={(v) => setSelectedPartnerId(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um parceiro..." />
                    </SelectTrigger>
                    <SelectContent>
                      {partners?.map((partner: any) => (
                        <SelectItem key={partner.id} value={partner.id.toString()}>
                          {partner.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Dados do Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Dados do Cliente
                </CardTitle>
                <CardDescription>
                  Informações do comprador que será indicado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Empresa <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Nome da empresa do cliente"
                    value={buyerCompany}
                    onChange={(e) => setBuyerCompany(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Contato <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Nome e email/telefone do contato"
                    value={buyerContact}
                    onChange={(e) => setBuyerContact(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Ex: João Silva - joao@empresa.com.br - (11) 98765-4321
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Valor Esperado e Observações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Detalhes Adicionais
                </CardTitle>
                <CardDescription>
                  Informações complementares sobre a indicação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Valor Esperado (opcional)
                  </label>
                  <Input
                    type="text"
                    placeholder="R$ 0,00"
                    value={expectedValue}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      const formatted = (parseInt(value || "0") / 100).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      });
                      setExpectedValue(formatted);
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Estimativa do valor da negociação
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Observações Internas (opcional)
                  </label>
                  <Textarea
                    placeholder="Notas internas sobre o cliente, contexto da indicação, histórico de conversas, etc."
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Essas observações são visíveis apenas para a equipe ZOPU
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="flex gap-3 justify-end">
              <Link href="/gerente/dashboard">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Indicação
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
