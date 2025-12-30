import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Calendar, Building2, AlertTriangle, CheckCircle2, XCircle, RefreshCw, ExternalLink, AlertCircle, Mail, Phone } from "lucide-react";
import { Link } from "wouter";
import AdminLayout from "@/components/AdminLayout";

export default function Licenses() {
  const [daysFilter, setDaysFilter] = useState(90);
  
  const { data: licenses, isLoading, refetch } = trpc.license.getExpiring.useQuery({ days: daysFilter });
  const checkExpirationsMutation = trpc.license.checkExpirations.useMutation();

  const handleCheckExpirations = async () => {
    try {
      const result = await checkExpirationsMutation.mutateAsync();
      toast.success(`Verificação concluída! ${result.notified} notificações enviadas de ${result.checked} licenças verificadas.`);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao verificar vencimentos");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ATIVA":
        return <Badge variant="default" className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Ativa</Badge>;
      case "VENCENDO":
        return <Badge variant="default" className="bg-yellow-500"><AlertTriangle className="h-3 w-3 mr-1" />Vencendo</Badge>;
      case "VENCIDA":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Vencida</Badge>;
      default:
        return <Badge variant="secondary">Não Informada</Badge>;
    }
  };

  const getDaysColor = (days: number | null) => {
    if (days === null) return "text-muted-foreground";
    if (days < 0) return "text-red-600 font-bold";
    if (days <= 30) return "text-orange-600 font-semibold";
    if (days <= 60) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <AdminLayout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Licenças Bitrix24</h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe vencimentos e envie notificações aos clientes
            </p>
          </div>
          <Button 
            onClick={handleCheckExpirations}
            disabled={checkExpirationsMutation.isPending}
          >
            {checkExpirationsMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Verificar Vencimentos
              </>
            )}
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={daysFilter === 30 ? "default" : "outline"}
            onClick={() => setDaysFilter(30)}
          >
            Próximos 30 dias
          </Button>
          <Button
            variant={daysFilter === 60 ? "default" : "outline"}
            onClick={() => setDaysFilter(60)}
          >
            Próximos 60 dias
          </Button>
          <Button
            variant={daysFilter === 90 ? "default" : "outline"}
            onClick={() => setDaysFilter(90)}
          >
            Próximos 90 dias
          </Button>
        </div>

        {/* Métricas */}
        {licenses && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total de Licenças</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{licenses.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {licenses.filter((l: any) => l.licenseStatus === "VENCIDA").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Vencendo (30 dias)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {licenses.filter((l: any) => l.daysUntilExpiry !== null && l.daysUntilExpiry <= 30 && l.daysUntilExpiry >= 0).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Ativas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {licenses.filter((l: any) => l.licenseStatus === "ATIVA").length}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lista de Licenças */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !licenses || licenses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma licença vencendo nos próximos {daysFilter} dias</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {licenses.map((license: any) => (
              <Card key={license.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        {license.companyName}
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-2">
                        CNPJ: {license.cnpj}
                        {license.type && (
                          <Badge variant="outline" className="text-xs">
                            {license.type === "buyer" ? "Comprador" : "Parceiro"}
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                    {getStatusBadge(license.licenseStatus)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Versão da Licença</p>
                      <p className="font-medium">{license.licenseType || "Não informado"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Data de Vencimento</p>
                      <p className="font-medium">
                        {license.licenseExpiry 
                          ? new Date(license.licenseExpiry).toLocaleDateString("pt-BR")
                          : "Não informado"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Dias até Vencimento</p>
                      <p className={`font-medium ${getDaysColor(license.daysUntilExpiry)}`}>
                        {license.daysUntilExpiry !== null 
                          ? license.daysUntilExpiry < 0 
                            ? `Vencida há ${Math.abs(license.daysUntilExpiry)} dias`
                            : `${license.daysUntilExpiry} dias`
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Contato</p>
                      <p className="font-medium">{license.whatsapp || license.telefone || "Não informado"}</p>
                    </div>
                  </div>
                  {license.bitrixUrl && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">Instância Bitrix24</p>
                      <a 
                        href={`https://${license.bitrixUrl}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {license.bitrixUrl}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
