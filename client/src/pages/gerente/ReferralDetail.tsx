import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Save, FileText, Building, User, DollarSign, Clock, AlertCircle } from "lucide-react";
import { Link, useRoute } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function ReferralDetail() {
  const [, params] = useRoute("/gerente/referral/:id");
  const referralId = params?.id ? parseInt(params.id) : null;

  const [internalNotes, setInternalNotes] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const { data: referrals } = trpc.gerente.getMyReferrals.useQuery({ limit: 1000 });
  const referral = referrals?.find((r) => r.id === referralId);

  const updateNotesMutation = trpc.gerente.updateInternalNotes.useMutation({
    onSuccess: () => {
      toast.success("Observações atualizadas com sucesso!");
      setHasChanges(false);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar observações: ${error.message}`);
    },
  });

  useEffect(() => {
    if (referral?.internalNotes) {
      setInternalNotes(referral.internalNotes);
    }
  }, [referral]);

  const handleSaveNotes = () => {
    if (!referralId) return;
    updateNotesMutation.mutate({
      referralId,
      notes: internalNotes,
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      SENT: <Badge className="bg-blue-500">Enviado</Badge>,
      ACKED: <Badge className="bg-purple-500">Confirmado</Badge>,
      IN_NEGOTIATION: <Badge className="bg-amber-500">Em Negociação</Badge>,
      WON: <Badge className="bg-green-500">Ganho</Badge>,
      LOST: <Badge className="bg-red-500">Perdido</Badge>,
      OVERDUE: <Badge className="bg-orange-600">Atrasado</Badge>,
    };
    return badges[status as keyof typeof badges] || <Badge variant="outline">{status}</Badge>;
  };

  const getOriginBadge = (origin: string) => {
    const badges = {
      ZOPU_MARKET: <Badge variant="outline">Marketplace</Badge>,
      ASSISTED_REFERRAL: <Badge className="bg-indigo-500">Indicação Manual</Badge>,
      CAMPAIGN: <Badge className="bg-pink-500">Campanha</Badge>,
    };
    return badges[origin as keyof typeof badges] || <Badge variant="outline">{origin}</Badge>;
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return "R$ 0,00";
    return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const daysSinceUpdate = referral?.lastStatusUpdate
    ? Math.floor((Date.now() - new Date(referral.lastStatusUpdate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  if (!referralId || !referral) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Indicação não encontrada</CardTitle>
            <CardDescription>
              A indicação solicitada não existe ou você não tem permissão para visualizá-la.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/gerente/dashboard">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <div className="flex-1">
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                Indicação #{referral.id}
              </h1>
              <p className="text-muted-foreground mt-2">
                {referral.buyerCompany} • {referral.offerTitle}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(referral.status)}
              {getOriginBadge(referral.origin)}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-6">
        {/* Alerta de Follow-up */}
        {daysSinceUpdate > 7 && ["SENT", "ACKED", "IN_NEGOTIATION"].includes(referral.status) && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-900">
                    Atenção: {daysSinceUpdate} dias sem atualização
                  </p>
                  <p className="text-sm text-amber-700">
                    Esta indicação está há mais de 7 dias sem movimentação. Considere fazer um follow-up com o parceiro.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações do Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Empresa</label>
                  <p className="text-lg font-semibold">{referral.buyerCompany}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contato</label>
                  <p className="text-lg">{referral.buyerContact}</p>
                </div>
              </CardContent>
            </Card>

            {/* Informações da Oferta */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Oferta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Título</label>
                  <p className="text-lg font-semibold">{referral.offerTitle}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Parceiro</label>
                  <p className="text-lg">{referral.partnerName}</p>
                </div>
              </CardContent>
            </Card>

            {/* Valores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Valores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Valor Esperado</label>
                    <p className="text-xl font-bold">{formatCurrency(referral.expectedValue)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Valor Realizado</label>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(referral.wonValue)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Success Fee Esperado</label>
                    <p className="text-lg font-semibold">{formatCurrency(referral.successFeeExpected)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Success Fee Realizado</label>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(referral.successFeeRealized)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Observações Internas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Observações Internas
                </CardTitle>
                <CardDescription>
                  Notas visíveis apenas para a equipe ZOPU
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Adicione observações sobre o cliente, contexto da indicação, histórico de conversas, etc."
                  value={internalNotes}
                  onChange={(e) => {
                    setInternalNotes(e.target.value);
                    setHasChanges(true);
                  }}
                  rows={8}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveNotes}
                    disabled={!hasChanges || updateNotesMutation.isPending}
                  >
                    {updateNotesMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Observações
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Criado em</label>
                  <p className="text-sm font-semibold">{formatDate(referral.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Última Atualização</label>
                  <p className="text-sm font-semibold">{formatDate(referral.lastStatusUpdate)}</p>
                  {daysSinceUpdate > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Há {daysSinceUpdate} dia{daysSinceUpdate > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Status Atual */}
            <Card>
              <CardHeader>
                <CardTitle>Status Atual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  {getStatusBadge(referral.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Origem:</span>
                  {getOriginBadge(referral.origin)}
                </div>
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/admin/referrals`}>
                    <FileText className="h-4 w-4 mr-2" />
                    Ver no Admin
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/gerente/dashboard">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar ao Dashboard
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
