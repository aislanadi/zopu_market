import { useState } from "react";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Pencil, CheckCircle, XCircle, Clock, Upload, X, Crown, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";


export default function PartnersManagement() {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingPartnerId, setEditingPartnerId] = useState<number | null>(null);
  const [viewingPartner, setViewingPartner] = useState<any>(null);
  const [deletingPartnerId, setDeletingPartnerId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isUploading, setIsUploading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    companyName: "",
    cnpj: "",
    legalName: "",
    description: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    institutionalVideoUrl: "",
    curationStatus: "PENDING" as "PENDING" | "APPROVED" | "REJECTED",
  });

  const { data: partners, isLoading, refetch } = trpc.partner.list.useQuery();

  const updatePartnerMutation = trpc.partner.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Parceiro atualizado com sucesso!");
      setIsEditOpen(false);
      resetForm();
      setEditingPartnerId(null);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar parceiro");
    },
  });

  const updateStatusMutation = trpc.partner.updateCurationStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado com sucesso!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar status");
    },
  });

  const updateTierMutation = trpc.partner.updateTier.useMutation({
    onSuccess: () => {
      toast.success("Plano atualizado com sucesso!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar plano");
    },
  });

  const deletePartnerMutation = trpc.partner.delete.useMutation({
    onSuccess: () => {
      toast.success("Parceiro excluído com sucesso!");
      setIsDeleteOpen(false);
      setDeletingPartnerId(null);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir parceiro");
    },
  });

  const resetForm = () => {
    setFormData({
      companyName: "",
      cnpj: "",
      legalName: "",
      description: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      institutionalVideoUrl: "",
      curationStatus: "PENDING",
    });
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogoToS3 = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
      credentials: "include", // Include cookies for authentication
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Erro ao fazer upload do logo");
    }

    const data = await response.json();
    return data.url;
  };

  const handleEditClick = (partner: any) => {
    setEditingPartnerId(partner.id);
    setFormData({
      companyName: partner.companyName || "",
      cnpj: partner.cnpj || "",
      legalName: partner.legalName || "",
      description: partner.description || "",
      contactName: partner.contactName || "",
      contactEmail: partner.contactEmail || "",
      contactPhone: partner.contactPhone || "",
      institutionalVideoUrl: partner.institutionalVideoUrl || "",
      curationStatus: partner.curationStatus || "PENDING",
    });
    if (partner.logoUrl) {
      setLogoPreview(partner.logoUrl);
    }
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingPartnerId) return;

    try {
      setIsUploading(true);
      let logoUrl = logoPreview;

      if (logoFile) {
        logoUrl = await uploadLogoToS3(logoFile);
      }

      // Check if status is changing - if so, use updateCurationStatus to trigger user creation
      const currentPartner = partners?.find(p => p.id === editingPartnerId);
      const statusChanged = currentPartner && currentPartner.curationStatus !== formData.curationStatus;

      // Update profile data (without curationStatus if it's changing)
      await updatePartnerMutation.mutateAsync({
        id: editingPartnerId,
        companyName: formData.companyName,
        cnpj: formData.cnpj || undefined,
        legalName: formData.legalName || undefined,
        description: formData.description || undefined,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone || undefined,
        institutionalVideoUrl: formData.institutionalVideoUrl || undefined,
        logoUrl: logoUrl || undefined,
        // Only include curationStatus if not changing (to avoid duplicate update)
        ...(!statusChanged && { curationStatus: formData.curationStatus }),
      });

      // If status changed, use updateCurationStatus to properly trigger user creation
      if (statusChanged) {
        await updateStatusMutation.mutateAsync({ id: editingPartnerId, status: formData.curationStatus });
      }
    } catch (error) {
      console.error("Erro ao atualizar parceiro:", error);
      toast.error("Erro ao atualizar parceiro");
    } finally {
      setIsUploading(false);
    }
  };

  const handleStatusChange = (partnerId: number, newStatus: "PENDING" | "APPROVED" | "REJECTED") => {
    updateStatusMutation.mutate({ id: partnerId, status: newStatus });
  };

  const handleTierToggle = (partnerId: number, currentTier: string) => {
    const newTier = currentTier === "PREMIUM" ? "STANDARD" : "PREMIUM";
    updateTierMutation.mutate({ id: partnerId, tier: newTier });
  };

  const handleViewClick = (partner: any) => {
    setViewingPartner(partner);
    setIsViewOpen(true);
  };

  const handleDeleteClick = (partnerId: number) => {
    setDeletingPartnerId(partnerId);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deletingPartnerId) {
      deletePartnerMutation.mutate({ id: deletingPartnerId });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      PENDING: "Pendente",
      APPROVED: "Aprovado",
      REJECTED: "Rejeitado",
    };
    return labels[status as keyof typeof labels] || status;
  };

  const filteredPartners = partners?.filter((p) => 
    statusFilter === "all" || p.curationStatus === statusFilter
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Parceiros</h1>
            <p className="text-muted-foreground">
              Gerencie perfis e status de curadoria dos parceiros
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="PENDING">Pendentes</SelectItem>
              <SelectItem value="APPROVED">Aprovados</SelectItem>
              <SelectItem value="REJECTED">Rejeitados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Partners List */}
        {isLoading ? (
          <div className="text-center py-12">Carregando...</div>
        ) : filteredPartners && filteredPartners.length > 0 ? (
          <div className="grid gap-4">
            {filteredPartners.map((partner) => (
              <div
                key={partner.id}
                className="border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    {partner.logoUrl && (
                      <img
                        src={partner.logoUrl}
                        alt={partner.companyName}
                        className="w-16 h-16 object-contain rounded border"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{partner.companyName}</h3>
                        {partner.tier === "PREMIUM" && (
                          <Badge className="text-xs px-2 py-0 bg-gradient-to-r from-amber-500 to-orange-500 border-0">
                            ⭐ Premium
                          </Badge>
                        )}
                        <div className="flex items-center gap-1">
                          {getStatusIcon(partner.curationStatus)}
                          <span className="text-sm text-muted-foreground">
                            {getStatusLabel(partner.curationStatus)}
                          </span>
                        </div>
                      </div>
                      {partner.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {partner.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Contato:</span>{" "}
                          <span className="font-medium">{partner.contactName}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email:</span>{" "}
                          <span className="font-medium">{partner.contactEmail}</span>
                        </div>
                        {partner.institutionalVideoUrl && (
                          <div>
                            <span className="text-muted-foreground">✓ Vídeo institucional</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {partner.curationStatus === "PENDING" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(partner.id, "APPROVED")}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Aprovar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(partner.id, "REJECTED")}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Rejeitar
                        </Button>
                      </>
                    )}
                    <Button
                      variant={partner.tier === "PREMIUM" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTierToggle(partner.id, partner.tier)}
                      className={partner.tier === "PREMIUM" ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600" : ""}
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      {partner.tier === "PREMIUM" ? "Remover Premium" : "Tornar Premium"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewClick(partner)}
                      title="Visualizar detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(partner)}
                      title="Editar parceiro"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(partner.id)}
                      className="text-destructive hover:text-destructive"
                      title="Excluir parceiro"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground">
              Nenhum parceiro encontrado
            </p>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            resetForm();
            setEditingPartnerId(null);
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Parceiro</DialogTitle>
              <DialogDescription>
                Atualize as informações do parceiro
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-6">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Logo</Label>
                {logoPreview && (
                  <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                    <img
                      src={logoPreview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG ou SVG (recomendado: 200x200px)
                  </p>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-companyName">
                    Nome da Empresa <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-cnpj">CNPJ</Label>
                    <Input
                      id="edit-cnpj"
                      value={formData.cnpj}
                      onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-legalName">Razão Social</Label>
                    <Input
                      id="edit-legalName"
                      value={formData.legalName}
                      onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-description">Descrição</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-institutionalVideoUrl">Vídeo Institucional (YouTube)</Label>
                  <Input
                    id="edit-institutionalVideoUrl"
                    type="url"
                    value={formData.institutionalVideoUrl}
                    onChange={(e) => setFormData({ ...formData, institutionalVideoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Cole a URL do vídeo institucional do YouTube
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-contactName">
                      Nome do Contato <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="edit-contactName"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-contactPhone">Telefone</Label>
                    <Input
                      id="edit-contactPhone"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-contactEmail">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="edit-status">Status de Curadoria</Label>
                  <Select
                    value={formData.curationStatus}
                    onValueChange={(value) => setFormData({ ...formData, curationStatus: value as "PENDING" | "APPROVED" | "REJECTED" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pendente</SelectItem>
                      <SelectItem value="APPROVED">Aprovado</SelectItem>
                      <SelectItem value="REJECTED">Rejeitado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditOpen(false);
                    resetForm();
                    setEditingPartnerId(null);
                  }}
                  disabled={isUploading || updatePartnerMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isUploading || updatePartnerMutation.isPending}
                >
                  {isUploading || updatePartnerMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes do Parceiro</DialogTitle>
              <DialogDescription>
                Visualização completa do cadastro do parceiro
              </DialogDescription>
            </DialogHeader>
            {viewingPartner && (
              <div className="space-y-6">
                {/* Logo */}
                {viewingPartner.logoUrl && (
                  <div className="flex justify-center">
                    <img
                      src={viewingPartner.logoUrl}
                      alt={viewingPartner.companyName}
                      className="w-32 h-32 object-contain border rounded-lg"
                    />
                  </div>
                )}

                {/* Informações Básicas */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Informações Básicas</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Nome da Empresa</Label>
                      <p className="font-medium">{viewingPartner.companyName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">CNPJ</Label>
                      <p className="font-medium">{viewingPartner.cnpj || "Não informado"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Razão Social</Label>
                      <p className="font-medium">{viewingPartner.legalName || "Não informado"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Status</Label>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(viewingPartner.curationStatus)}
                        <span className="font-medium">{getStatusLabel(viewingPartner.curationStatus)}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Plano</Label>
                      <p className="font-medium">
                        {viewingPartner.tier === "PREMIUM" ? (
                          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 border-0">
                            ⭐ Premium
                          </Badge>
                        ) : (
                          "Standard"
                        )}
                      </p>
                    </div>
                  </div>

                  {viewingPartner.description && (
                    <div>
                      <Label className="text-muted-foreground">Descrição</Label>
                      <p className="text-sm mt-1">{viewingPartner.description}</p>
                    </div>
                  )}
                </div>

                {/* Informações de Contato */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Informações de Contato</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Nome do Contato</Label>
                      <p className="font-medium">{viewingPartner.contactName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium">{viewingPartner.contactEmail}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Telefone</Label>
                      <p className="font-medium">{viewingPartner.contactPhone || "Não informado"}</p>
                    </div>
                  </div>
                </div>

                {/* Vídeo Institucional */}
                {viewingPartner.institutionalVideoUrl && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Vídeo Institucional</h3>
                    <a
                      href={viewingPartner.institutionalVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {viewingPartner.institutionalVideoUrl}
                    </a>
                  </div>
                )}

                {/* Datas */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Informações do Sistema</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Data de Cadastro</Label>
                      <p className="font-medium">
                        {new Date(viewingPartner.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Última Atualização</Label>
                      <p className="font-medium">
                        {new Date(viewingPartner.updatedAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir este parceiro? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            {deletingPartnerId && partners && (
              <div className="py-4">
                <p className="text-sm">
                  Parceiro:{" "}
                  <span className="font-semibold">
                    {partners.find((p) => p.id === deletingPartnerId)?.companyName}
                  </span>
                </p>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteOpen(false);
                  setDeletingPartnerId(null);
                }}
                disabled={deletePartnerMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deletePartnerMutation.isPending}
              >
                {deletePartnerMutation.isPending ? "Excluindo..." : "Excluir Parceiro"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
