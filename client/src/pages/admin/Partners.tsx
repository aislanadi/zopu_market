import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Check, X, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

export default function AdminPartners() {
  const utils = trpc.useUtils();
  const { data: partners, isLoading } = trpc.partner.list.useQuery();

  const updateStatusMutation = trpc.partner.updateCurationStatus.useMutation({
    onSuccess: () => {
      utils.partner.list.invalidate();
      toast.success("Status do parceiro atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar status");
    },
  });

  const handleApprove = async (partnerId: number) => {
    if (confirm("Deseja aprovar este parceiro?")) {
      await updateStatusMutation.mutateAsync({
        id: partnerId,
        status: "APPROVED",
      });
    }
  };

  const handleReject = async (partnerId: number) => {
    if (confirm("Deseja rejeitar este parceiro?")) {
      await updateStatusMutation.mutateAsync({
        id: partnerId,
        status: "REJECTED",
      });
    }
  };

  const pendingPartners = partners?.filter(p => p.curationStatus === "PENDING") || [];
  const approvedPartners = partners?.filter(p => p.curationStatus === "APPROVED") || [];
  const rejectedPartners = partners?.filter(p => p.curationStatus === "REJECTED") || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Parceiros</h1>
          <p className="text-muted-foreground">
            Aprovar, rejeitar e gerenciar parceiros da plataforma
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingPartners.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedPartners.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Rejeitados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedPartners.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Partners */}
        {pendingPartners.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Parceiros Pendentes de Aprovação</CardTitle>
              <CardDescription>
                Revise e aprove ou rejeite os cadastros de novos parceiros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPartners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{partner.companyName}</p>
                          <p className="text-sm text-muted-foreground">
                            {partner.legalName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{partner.cnpj || "-"}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3" />
                            {partner.contactEmail}
                          </div>
                          {partner.contactPhone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {partner.contactPhone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(partner.createdAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprove(partner.id)}
                            disabled={updateStatusMutation.isPending}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(partner.id)}
                            disabled={updateStatusMutation.isPending}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Rejeitar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Approved Partners */}
        {approvedPartners.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Parceiros Aprovados</CardTitle>
              <CardDescription>
                Parceiros ativos na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Bitrix Configurado</TableHead>
                    <TableHead>Data de Aprovação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedPartners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{partner.companyName}</p>
                          <p className="text-sm text-muted-foreground">
                            {partner.legalName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{partner.cnpj || "-"}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3" />
                            {partner.contactEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {partner.bitrixWebhookUrl ? (
                          <span className="text-green-600 text-sm">✓ Sim</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">Não</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(partner.updatedAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando parceiros...</p>
          </div>
        )}

        {!isLoading && partners?.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                Nenhum parceiro cadastrado ainda
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
