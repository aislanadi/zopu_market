import { useState } from "react";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
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
import { Search, Edit, UserCog, Shield, Briefcase, User, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Users() {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    role: "cliente" as "admin" | "gerente_contas" | "parceiro" | "cliente",
    partnerId: null as number | null,
  });

  const { data: users, isLoading, refetch } = trpc.user.list.useQuery();
  const { data: partners } = trpc.partner.list.useQuery();

  const updateRoleMutation = trpc.user.updateRole.useMutation({
    onSuccess: () => {
      toast.success("Role do usuário atualizado com sucesso!");
      setIsEditOpen(false);
      setEditingUserId(null);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar role do usuário");
    },
  });

  const deleteMutation = trpc.user.delete.useMutation({
    onSuccess: () => {
      toast.success("Usuário deletado com sucesso!");
      setIsDeleteOpen(false);
      setDeletingUserId(null);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao deletar usuário");
    },
  });

  const handleEditClick = (user: any) => {
    console.log("[DEBUG] handleEditClick - user:", user);
    console.log("[DEBUG] user.role:", user.role);
    console.log("[DEBUG] user.partnerId:", user.partnerId);
    
    const newFormData = {
      role: user.role || "cliente",
      partnerId: user.partnerId || null,
    };
    
    console.log("[DEBUG] newFormData:", newFormData);
    
    setEditingUserId(user.id);
    setFormData(newFormData);
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingUserId) return;

    updateRoleMutation.mutate({
      userId: editingUserId,
      role: formData.role,
      partnerId: formData.partnerId,
    });
  };

  const handleDeleteClick = (user: any) => {
    setDeletingUserId(user.id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deletingUserId) return;

    deleteMutation.mutate({ userId: deletingUserId });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4 text-red-600" />;
      case "gerente_contas":
        return <UserCog className="h-4 w-4 text-blue-600" />;
      case "parceiro":
        return <Briefcase className="h-4 w-4 text-green-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: "Administrador",
      gerente_contas: "Gerente de Contas",
      parceiro: "Parceiro",
      cliente: "Cliente",
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "gerente_contas":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "parceiro":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredUsers = users
    ?.filter((u) => roleFilter === "all" || u.role === roleFilter)
    ?.filter((u) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        u.name?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query)
      );
    });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
            <p className="text-muted-foreground">
              Gerencie roles e permissões dos usuários da plataforma
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Roles</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="gerente_contas">Gerente de Contas</SelectItem>
              <SelectItem value="parceiro">Parceiro</SelectItem>
              <SelectItem value="cliente">Cliente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users List */}
        {isLoading ? (
          <div className="text-center py-12">Carregando...</div>
        ) : filteredUsers && filteredUsers.length > 0 ? (
          <div className="grid gap-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{user.name || "Sem nome"}</h3>
                      <Badge className={`text-xs px-3 py-1 ${getRoleBadgeColor(user.role)}`}>
                        <span className="flex items-center gap-1">
                          {getRoleIcon(user.role)}
                          {getRoleLabel(user.role)}
                        </span>
                      </Badge>
                      {user.partnerId && (
                        <Badge variant="outline" className="text-xs">
                          Parceiro ID: {user.partnerId}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Email:</span>{" "}
                        <span className="font-medium">{user.email || "Não informado"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Método de Login:</span>{" "}
                        <span className="font-medium">{user.loginMethod || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cadastro:</span>{" "}
                        <span className="font-medium">
                          {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Último acesso:</span>{" "}
                        <span className="font-medium">
                          {new Date(user.lastSignedIn).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(user)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Role
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:border-red-600"
                      onClick={() => handleDeleteClick(user)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Deletar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground">
              {searchQuery || roleFilter !== "all"
                ? "Nenhum usuário encontrado com os filtros aplicados"
                : "Nenhum usuário cadastrado"}
            </p>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Role do Usuário</DialogTitle>
              <DialogDescription>
                Altere o role e as permissões do usuário
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-role">
                    Role <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.role || "cliente"}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        role: value as "admin" | "gerente_contas" | "parceiro" | "cliente",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um role..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cliente">Cliente</SelectItem>
                      <SelectItem value="parceiro">Parceiro</SelectItem>
                      <SelectItem value="gerente_contas">Gerente de Contas</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.role === "admin" && "Acesso total à plataforma"}
                    {formData.role === "gerente_contas" && "Gerencia carteira de clientes e indicações"}
                    {formData.role === "parceiro" && "Acesso ao painel de parceiro"}
                    {formData.role === "cliente" && "Acesso básico como comprador"}
                  </p>
                </div>

                {formData.role === "parceiro" && (
                  <div>
                    <Label htmlFor="edit-partnerId">Associar a Parceiro</Label>
                    <Select
                      value={formData.partnerId?.toString() || "none"}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          partnerId: value === "none" ? null : parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um parceiro..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {partners
                          ?.filter((p) => p.curationStatus === "APPROVED")
                          .map((partner) => (
                            <SelectItem key={partner.id} value={partner.id.toString()}>
                              {partner.companyName}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Associe o usuário a um parceiro aprovado para dar acesso ao painel
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  disabled={updateRoleMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateRoleMutation.isPending}>
                  {updateRoleMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja deletar este usuário? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteOpen(false)}
                disabled={deleteMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deletando..." : "Deletar Usuário"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
