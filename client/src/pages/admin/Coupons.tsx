import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, TrendingUp, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function AdminCoupons() {

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);

  const { data: coupons, isLoading, refetch } = trpc.coupon.list.useQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
    search: searchTerm || undefined,
  });

  const createMutation = trpc.coupon.create.useMutation({
    onSuccess: () => {
      toast.success("Cupom criado com sucesso!");
      setIsCreateDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao criar cupom: ${error.message}`);
    },
  });

  const updateMutation = trpc.coupon.update.useMutation({
    onSuccess: () => {
      toast.success("Cupom atualizado com sucesso!");
      setIsEditDialogOpen(false);
      setSelectedCoupon(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar cupom: ${error.message}`);
    },
  });

  const deleteMutation = trpc.coupon.delete.useMutation({
    onSuccess: () => {
      toast.success("Cupom excluído com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir cupom: ${error.message}`);
    },
  });

  const handleDelete = (id: number, code: string) => {
    if (confirm(`Tem certeza que deseja excluir o cupom "${code}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const handleEdit = (coupon: any) => {
    setSelectedCoupon(coupon);
    setIsEditDialogOpen(true);
  };

  const filteredCoupons = coupons || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cupons de Desconto</h1>
          <p className="text-muted-foreground">Gerencie cupons promocionais e regras de desconto</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cupom
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Pesquisar</Label>
              <Input
                placeholder="Código ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ACTIVE">Ativos</SelectItem>
                  <SelectItem value="INACTIVE">Inativos</SelectItem>
                  <SelectItem value="EXPIRED">Expirados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Cupons */}
      {isLoading ? (
        <div className="text-center py-8">Carregando cupons...</div>
      ) : filteredCoupons.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            Nenhum cupom encontrado
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCoupons.map((coupon: any) => (
            <Card key={coupon.id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-mono">{coupon.code}</CardTitle>
                    <CardDescription className="mt-1">{coupon.description}</CardDescription>
                  </div>
                  <Badge variant={coupon.status === "ACTIVE" ? "default" : "secondary"}>
                    {coupon.status === "ACTIVE" ? "Ativo" : coupon.status === "EXPIRED" ? "Expirado" : "Inativo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Desconto:</span>
                  <span className="font-semibold">
                    {coupon.discountType === "PERCENTAGE"
                      ? `${coupon.discountValue}%`
                      : `R$ ${Number(coupon.discountValue).toFixed(2)}`}
                  </span>
                </div>

                {coupon.minPurchaseAmount && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Compra mínima:</span>
                    <span>R$ {Number(coupon.minPurchaseAmount).toFixed(2)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Válido até:</span>
                  <span>{new Date(coupon.endDate).toLocaleDateString("pt-BR")}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Usos:</span>
                  <span>
                    {coupon.currentUsageCount}
                    {coupon.maxUsageTotal ? ` / ${coupon.maxUsageTotal}` : " / ∞"}
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(coupon)}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(coupon.id, coupon.code)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de Criação */}
      <CouponFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />

      {/* Dialog de Edição */}
      {selectedCoupon && (
        <CouponFormDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          coupon={selectedCoupon}
          onSubmit={(data) => updateMutation.mutate({ id: selectedCoupon.id, ...data })}
          isLoading={updateMutation.isPending}
        />
      )}
    </div>
  );
}

// Componente de formulário reutilizável
function CouponFormDialog({
  open,
  onOpenChange,
  coupon,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon?: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  // Buscar ofertas e categorias para os seletores
  const { data: offers } = trpc.offer.list.useQuery({ status: "APPROVED" });
  const { data: categories } = trpc.category.list.useQuery();

  const [formData, setFormData] = useState({
    code: coupon?.code || "",
    description: coupon?.description || "",
    discountType: coupon?.discountType || "PERCENTAGE",
    discountValue: coupon?.discountValue || "",
    maxDiscountAmount: coupon?.maxDiscountAmount || "",
    minPurchaseAmount: coupon?.minPurchaseAmount || "",
    startDate: coupon?.startDate ? new Date(coupon.startDate).toISOString().slice(0, 16) : "",
    endDate: coupon?.endDate ? new Date(coupon.endDate).toISOString().slice(0, 16) : "",
    maxUsageTotal: coupon?.maxUsageTotal || "",
    maxUsagePerUser: coupon?.maxUsagePerUser || 1,
    firstPurchaseOnly: coupon?.firstPurchaseOnly === 1 || false,
    status: coupon?.status || "ACTIVE",
    applicableOfferIds: coupon?.applicableOfferIds ? JSON.parse(coupon.applicableOfferIds) : [],
    applicableCategoryIds: coupon?.applicableCategoryIds ? JSON.parse(coupon.applicableCategoryIds) : [],
    excludedOfferIds: coupon?.excludedOfferIds ? JSON.parse(coupon.excludedOfferIds) : [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: any = {
      code: formData.code.toUpperCase(),
      description: formData.description,
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      maxUsagePerUser: Number(formData.maxUsagePerUser),
      firstPurchaseOnly: formData.firstPurchaseOnly,
      status: formData.status,
    };

    if (formData.maxDiscountAmount) {
      data.maxDiscountAmount = Number(formData.maxDiscountAmount);
    }
    if (formData.minPurchaseAmount) {
      data.minPurchaseAmount = Number(formData.minPurchaseAmount);
    }
    if (formData.maxUsageTotal) {
      data.maxUsageTotal = Number(formData.maxUsageTotal);
    }
    if (formData.applicableOfferIds && formData.applicableOfferIds.length > 0) {
      data.applicableOfferIds = formData.applicableOfferIds;
    }
    if (formData.applicableCategoryIds && formData.applicableCategoryIds.length > 0) {
      data.applicableCategoryIds = formData.applicableCategoryIds;
    }
    if (formData.excludedOfferIds && formData.excludedOfferIds.length > 0) {
      data.excludedOfferIds = formData.excludedOfferIds;
    }

    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{coupon ? "Editar Cupom" : "Novo Cupom"}</DialogTitle>
          <DialogDescription>
            Configure as regras de desconto e condições de uso do cupom
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informações Básicas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Código do Cupom *</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="NATAL2025"
                required
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Ativo</SelectItem>
                  <SelectItem value="INACTIVE">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Desconto de Natal - 20% off em todas as ofertas"
            />
          </div>

          {/* Configuração de Desconto */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Tipo de Desconto *</Label>
              <Select
                value={formData.discountType}
                onValueChange={(value) => setFormData({ ...formData, discountType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Porcentagem (%)</SelectItem>
                  <SelectItem value="FIXED_AMOUNT">Valor Fixo (R$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Valor do Desconto *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                placeholder={formData.discountType === "PERCENTAGE" ? "10" : "50.00"}
                required
              />
            </div>
            {formData.discountType === "PERCENTAGE" && (
              <div>
                <Label>Desconto Máximo (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.maxDiscountAmount}
                  onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                  placeholder="100.00"
                />
              </div>
            )}
          </div>

          {/* Período de Validade */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data de Início *</Label>
              <Input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Data de Término *</Label>
              <Input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Limites e Restrições */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Compra Mínima (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.minPurchaseAmount}
                onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Usos Totais</Label>
              <Input
                type="number"
                value={formData.maxUsageTotal}
                onChange={(e) => setFormData({ ...formData, maxUsageTotal: e.target.value })}
                placeholder="Ilimitado"
              />
            </div>
            <div>
              <Label>Usos por Usuário *</Label>
              <Input
                type="number"
                value={formData.maxUsagePerUser}
                onChange={(e) => setFormData({ ...formData, maxUsagePerUser: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Aplicabilidade por Categoria */}
          <div>
            <Label>Categorias Aplicáveis (deixe vazio para todas)</Label>
            <Select
              value=""
              onValueChange={(value) => {
                if (value && !formData.applicableCategoryIds.includes(Number(value))) {
                  setFormData({
                    ...formData,
                    applicableCategoryIds: [...formData.applicableCategoryIds, Number(value)],
                  });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione categorias..." />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat: any) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.applicableCategoryIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.applicableCategoryIds.map((catId: number) => {
                  const cat = categories?.find((c: any) => c.id === catId);
                  return (
                    <Badge key={catId} variant="secondary" className="gap-1">
                      {cat?.name}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            applicableCategoryIds: formData.applicableCategoryIds.filter(
                              (id: number) => id !== catId
                            ),
                          })
                        }
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          {/* Aplicabilidade por Oferta */}
          <div>
            <Label>Ofertas Aplicáveis (deixe vazio para todas)</Label>
            <Select
              value=""
              onValueChange={(value) => {
                if (value && !formData.applicableOfferIds.includes(Number(value))) {
                  setFormData({
                    ...formData,
                    applicableOfferIds: [...formData.applicableOfferIds, Number(value)],
                  });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione ofertas..." />
              </SelectTrigger>
              <SelectContent>
                {offers?.map((offer: any) => (
                  <SelectItem key={offer.id} value={String(offer.id)}>
                    {offer.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.applicableOfferIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.applicableOfferIds.map((offerId: number) => {
                  const offer = offers?.find((o: any) => o.id === offerId);
                  return (
                    <Badge key={offerId} variant="secondary" className="gap-1">
                      {offer?.title}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            applicableOfferIds: formData.applicableOfferIds.filter(
                              (id: number) => id !== offerId
                            ),
                          })
                        }
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="firstPurchaseOnly"
              checked={formData.firstPurchaseOnly}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, firstPurchaseOnly: checked as boolean })
              }
            />
            <label
              htmlFor="firstPurchaseOnly"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Válido apenas para primeira compra
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : coupon ? "Atualizar" : "Criar Cupom"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
