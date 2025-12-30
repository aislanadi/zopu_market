import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Eye, Archive, Upload, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Offers() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    offerType: "",
    saleMode: "",
    price: "",
    profitMargin: "",
    successFeePercent: "",
    zopuTakeRatePercent: "",
    partnerSharePercent: "",
    icp: "",
    promessa: "",
    entregaveis: "",
    cases: "",
    faq: "",
    exclusiveBenefitText: "",
    videoUrl: "",
    status: "DRAFT",
  });

  const { data: offers, isLoading, refetch } = trpc.offer.list.useQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const { data: categories } = trpc.category.list.useQuery();

  const createOfferMutation = trpc.offer.create.useMutation({
    onSuccess: () => {
      toast.success("Oferta criada com sucesso!");
      setIsCreateOpen(false);
      resetForm();
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar oferta");
    },
  });

  const updateStatusMutation = trpc.offer.update.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado com sucesso!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar status");
    },
  });

  const updateOfferMutation = trpc.offer.update.useMutation({
    onSuccess: () => {
      toast.success("Oferta atualizada com sucesso!");
      setIsEditOpen(false);
      setEditingOfferId(null);
      resetForm();
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar oferta");
    },
  });

  const deleteOfferMutation = trpc.offer.delete.useMutation({
    onSuccess: () => {
      toast.success("Oferta excluída com sucesso!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir oferta");
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      categoryId: "",
      offerType: "",
      saleMode: "",
      price: "",
      profitMargin: "",
      successFeePercent: "",
      zopuTakeRatePercent: "",
      partnerSharePercent: "",
      icp: "",
      promessa: "",
      entregaveis: "",
      cases: "",
      faq: "",
      exclusiveBenefitText: "",
      videoUrl: "",
      status: "DRAFT",
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Imagem muito grande. Máximo 5MB.");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const uploadImageToS3 = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Erro ao fazer upload da imagem");
    }

    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.categoryId || !formData.offerType || !formData.saleMode || !formData.successFeePercent) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setIsUploading(true);
      let imageUrl = undefined;

      if (imageFile) {
        imageUrl = await uploadImageToS3(imageFile);
      }

      await createOfferMutation.mutateAsync({
        title: formData.title,
        description: formData.description || undefined,
        categoryId: parseInt(formData.categoryId),
        offerType: formData.offerType as "DIGITAL" | "SERVICE_STANDARD" | "SERVICE_COMPLEX" | "LICENSE",
        saleMode: formData.saleMode as "CHECKOUT" | "LEAD_FORM" | "BOTH",
        price: formData.price ? Math.round(parseFloat(formData.price) * 100) : undefined,
        profitMargin: formData.profitMargin ? parseInt(formData.profitMargin) : undefined,
        successFeePercent: parseInt(formData.successFeePercent),
        zopuTakeRatePercent: formData.zopuTakeRatePercent ? parseInt(formData.zopuTakeRatePercent) : undefined,
        partnerSharePercent: formData.partnerSharePercent ? parseInt(formData.partnerSharePercent) : undefined,
        icp: formData.icp || undefined,
        promessa: formData.promessa || undefined,
        entregaveis: formData.entregaveis || undefined,
        cases: formData.cases || undefined,
        faq: formData.faq || undefined,
        exclusiveBenefitText: formData.exclusiveBenefitText || undefined,
        imageUrl,
        videoUrl: formData.videoUrl || undefined,
        status: formData.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
      });
    } catch (error) {
      console.error("Erro ao criar oferta:", error);
      toast.error("Erro ao criar oferta");
    } finally {
      setIsUploading(false);
    }
  };

  const handleStatusChange = (offerId: number, newStatus: string) => {
    updateStatusMutation.mutate({ id: offerId, status: newStatus as "DRAFT" | "PUBLISHED" | "ARCHIVED" });
  };

  const handleDelete = (offerId: number, offerTitle: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a oferta "${offerTitle}"? Esta ação não pode ser desfeita.`)) {
      deleteOfferMutation.mutate({ id: offerId });
    }
  };

  const handleEdit = (offer: any) => {
    setEditingOfferId(offer.id);
    setFormData({
      title: offer.title || "",
      description: offer.description || "",
      categoryId: offer.categoryId?.toString() || "",
      offerType: offer.offerType || "",
      saleMode: offer.saleMode || "",
      price: offer.price ? (offer.price / 100).toString() : "",
      profitMargin: offer.profitMargin?.toString() || "",
      successFeePercent: offer.successFeePercent?.toString() || "",
      zopuTakeRatePercent: offer.zopuTakeRatePercent?.toString() || "",
      partnerSharePercent: offer.partnerSharePercent?.toString() || "",
      icp: offer.icp || "",
      promessa: offer.promessa || "",
      entregaveis: offer.entregaveis || "",
      cases: offer.cases || "",
      faq: offer.faq || "",
      exclusiveBenefitText: offer.exclusiveBenefitText || "",
      videoUrl: offer.videoUrl || "",
      status: offer.status || "DRAFT",
    });
    if (offer.imageUrl) {
      setImagePreview(offer.imageUrl);
    }
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingOfferId || !formData.title || !formData.categoryId || !formData.offerType || !formData.saleMode || !formData.successFeePercent) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setIsUploading(true);
      let imageUrl = imagePreview; // Manter imagem existente

      if (imageFile) {
        imageUrl = await uploadImageToS3(imageFile);
      }

      await updateOfferMutation.mutateAsync({
        id: editingOfferId,
        title: formData.title,
        description: formData.description || undefined,
        categoryId: parseInt(formData.categoryId),
        offerType: formData.offerType as "DIGITAL" | "SERVICE_STANDARD" | "SERVICE_COMPLEX" | "LICENSE",
        saleMode: formData.saleMode as "CHECKOUT" | "LEAD_FORM" | "BOTH",
        price: formData.price ? Math.round(parseFloat(formData.price) * 100) : undefined,
        profitMargin: formData.profitMargin ? parseInt(formData.profitMargin) : undefined,
        successFeePercent: parseInt(formData.successFeePercent),
        zopuTakeRatePercent: formData.zopuTakeRatePercent ? parseInt(formData.zopuTakeRatePercent) : undefined,
        partnerSharePercent: formData.partnerSharePercent ? parseInt(formData.partnerSharePercent) : undefined,
        icp: formData.icp || undefined,
        promessa: formData.promessa || undefined,
        entregaveis: formData.entregaveis || undefined,
        cases: formData.cases || undefined,
        faq: formData.faq || undefined,
        exclusiveBenefitText: formData.exclusiveBenefitText || undefined,
        imageUrl: imageUrl || undefined,
        videoUrl: formData.videoUrl || undefined,
        status: formData.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
      });
    } catch (error) {
      console.error("Erro ao atualizar oferta:", error);
      toast.error("Erro ao atualizar oferta");
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: "bg-gray-100 text-gray-800",
      PUBLISHED: "bg-green-100 text-green-800",
      ARCHIVED: "bg-red-100 text-red-800",
    };
    return styles[status as keyof typeof styles] || styles.DRAFT;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      DRAFT: "Rascunho",
      PUBLISHED: "Publicado",
      ARCHIVED: "Arquivado",
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Ofertas</h1>
            <p className="text-muted-foreground">
              Gerencie todas as ofertas do marketplace
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Oferta
          </Button>
        </div>

        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="DRAFT">Rascunho</SelectItem>
              <SelectItem value="PUBLISHED">Publicado</SelectItem>
              <SelectItem value="ARCHIVED">Arquivado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando ofertas...</p>
          </div>
        ) : offers && offers.length > 0 ? (
          <div className="space-y-4">
            {offers.map((offer: any) => (
              <div
                key={offer.id}
                className="border border-border rounded-lg p-6 bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{offer.title}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(
                          offer.status
                        )}`}
                      >
                        {getStatusLabel(offer.status)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {offer.description}
                    </p>
                    <div className="flex gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">Categoria:</span>{" "}
                        <span className="font-medium">
                          {categories?.find((c: any) => c.id === offer.categoryId)?.name ||
                            "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tipo:</span>{" "}
                        <span className="font-medium">{offer.offerType}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Modo:</span>{" "}
                        <span className="font-medium">{offer.saleMode}</span>
                      </div>
                      {offer.price && (
                        <div>
                          <span className="text-muted-foreground">Preço:</span>{" "}
                          <span className="font-medium">
                            R$ {(offer.price / 100).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {offer.status === "DRAFT" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(offer.id, "PUBLISHED")}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Publicar
                      </Button>
                    )}
                    {offer.status === "PUBLISHED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(offer.id, "ARCHIVED")}
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Arquivar
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(offer)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(offer.id, offer.title)}
                      className="text-destructive hover:text-destructive"
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
            <p className="text-muted-foreground mb-4">
              Nenhuma oferta cadastrada ainda
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Oferta
            </Button>
          </div>
        )}

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Oferta</DialogTitle>
              <DialogDescription>
                Preencha os dados da nova oferta do marketplace
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações Básicas</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="title">
                      Título <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Nome da oferta"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descrição detalhada da oferta"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="categoryId">
                      Categoria <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="offerType">
                      Tipo <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.offerType}
                      onValueChange={(value) => setFormData({ ...formData, offerType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DIGITAL">Digital</SelectItem>
                        <SelectItem value="SERVICE_STANDARD">Serviço Padrão</SelectItem>
                        <SelectItem value="SERVICE_COMPLEX">Serviço Complexo</SelectItem>
                        <SelectItem value="LICENSE">Licença</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="saleMode">
                      Modo de Venda <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.saleMode}
                      onValueChange={(value) => setFormData({ ...formData, saleMode: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o modo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CHECKOUT">Checkout Direto</SelectItem>
                        <SelectItem value="LEAD_FORM">Formulário de Proposta</SelectItem>
                        <SelectItem value="BOTH">Ambos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="price">Preço (R$)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Comissionamento */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Comissionamento</h3>
                
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="profitMargin">
                      Margem Líquida (%)
                    </Label>
                    <Input
                      id="profitMargin"
                      type="number"
                      value={formData.profitMargin}
                      onChange={(e) => setFormData({ ...formData, profitMargin: e.target.value })}
                      placeholder="30"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Informado pelo parceiro
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="successFeePercent">
                      Success Fee (%) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="successFeePercent"
                      type="number"
                      value={formData.successFeePercent}
                      onChange={(e) => setFormData({ ...formData, successFeePercent: e.target.value })}
                      placeholder="10"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Negociado após entrevista
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="zopuTakeRatePercent">ZOPU Take Rate (%)</Label>
                    <Input
                      id="zopuTakeRatePercent"
                      type="number"
                      value={formData.zopuTakeRatePercent}
                      onChange={(e) => setFormData({ ...formData, zopuTakeRatePercent: e.target.value })}
                      placeholder="20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="partnerSharePercent">Parceiro Share (%)</Label>
                    <Input
                      id="partnerSharePercent"
                      type="number"
                      value={formData.partnerSharePercent}
                      onChange={(e) => setFormData({ ...formData, partnerSharePercent: e.target.value })}
                      placeholder="80"
                    />
                  </div>
                </div>
              </div>

              {/* Detalhes da Oferta */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Detalhes da Oferta</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="icp">ICP (Perfil Ideal de Cliente)</Label>
                    <Textarea
                      id="icp"
                      value={formData.icp}
                      onChange={(e) => setFormData({ ...formData, icp: e.target.value })}
                      placeholder="Descreva o perfil ideal de cliente para esta oferta"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="promessa">Promessa de Valor</Label>
                    <Textarea
                      id="promessa"
                      value={formData.promessa}
                      onChange={(e) => setFormData({ ...formData, promessa: e.target.value })}
                      placeholder="Qual é a promessa de valor desta oferta?"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="entregaveis">Entregáveis</Label>
                    <Textarea
                      id="entregaveis"
                      value={formData.entregaveis}
                      onChange={(e) => setFormData({ ...formData, entregaveis: e.target.value })}
                      placeholder="O que está incluído nesta oferta?"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="cases">Cases de Sucesso</Label>
                    <Textarea
                      id="cases"
                      value={formData.cases}
                      onChange={(e) => setFormData({ ...formData, cases: e.target.value })}
                      placeholder="Exemplos de casos de sucesso"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="faq">FAQ</Label>
                    <Textarea
                      id="faq"
                      value={formData.faq}
                      onChange={(e) => setFormData({ ...formData, faq: e.target.value })}
                      placeholder="Perguntas frequentes"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="exclusiveBenefitText">Benefício Exclusivo ZOPU</Label>
                    <Input
                      id="exclusiveBenefitText"
                      value={formData.exclusiveBenefitText}
                      onChange={(e) => setFormData({ ...formData, exclusiveBenefitText: e.target.value })}
                      placeholder="Condição especial para clientes ZOPU"
                    />
                  </div>
                </div>
              </div>

              {/* Upload de Imagem */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Imagem da Oferta</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="image">Imagem (máx. 5MB)</Label>
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <Label
                        htmlFor="image"
                        className="cursor-pointer text-primary hover:underline"
                      >
                        Clique para fazer upload
                      </Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        PNG, JPG ou WEBP (máx. 5MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Vídeo do YouTube */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Vídeo de Review/Demonstração</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">URL do Vídeo do YouTube</Label>
                  <Input
                    id="videoUrl"
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Cole a URL completa do vídeo do YouTube (ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ)
                  </p>
                </div>
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status">Status Inicial</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Rascunho</SelectItem>
                    <SelectItem value="PUBLISHED">Publicado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateOpen(false);
                    resetForm();
                  }}
                  disabled={isUploading || createOfferMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isUploading || createOfferMutation.isPending}
                >
                  {isUploading || createOfferMutation.isPending ? "Criando..." : "Criar Oferta"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog de Edição */}
        <Dialog open={isEditOpen} onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setEditingOfferId(null);
            resetForm();
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Oferta</DialogTitle>
              <DialogDescription>
                Atualize os dados da oferta
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-6">
              {/* Mesmo formulário do Dialog de criação, mas com handleUpdate */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações Básicas</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="edit-title">
                      Título <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="edit-title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Nome da oferta"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="edit-description">Descrição</Label>
                    <Textarea
                      id="edit-description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descrição detalhada da oferta"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-categoryId">
                      Categoria <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="edit-offerType">
                      Tipo de Oferta <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.offerType}
                      onValueChange={(value) => setFormData({ ...formData, offerType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DIGITAL">Digital</SelectItem>
                        <SelectItem value="SERVICE_STANDARD">Serviço Padrão</SelectItem>
                        <SelectItem value="SERVICE_COMPLEX">Serviço Complexo</SelectItem>
                        <SelectItem value="LICENSE">Licença</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="edit-saleMode">
                      Modo de Venda <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.saleMode}
                      onValueChange={(value) => setFormData({ ...formData, saleMode: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CHECKOUT">Checkout Direto</SelectItem>
                        <SelectItem value="LEAD_FORM">Formulário de Proposta</SelectItem>
                        <SelectItem value="BOTH">Ambos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="edit-price">Preço (R$)</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Vídeo */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Vídeo de Review/Demonstração</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-videoUrl">URL do Vídeo do YouTube</Label>
                  <Input
                    id="edit-videoUrl"
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Cole a URL completa do vídeo do YouTube (ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ)
                  </p>
                </div>
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Rascunho</SelectItem>
                    <SelectItem value="PUBLISHED">Publicado</SelectItem>
                    <SelectItem value="ARCHIVED">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingOfferId(null);
                    resetForm();
                  }}
                  disabled={isUploading || updateOfferMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isUploading || updateOfferMutation.isPending}
                >
                  {isUploading || updateOfferMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
