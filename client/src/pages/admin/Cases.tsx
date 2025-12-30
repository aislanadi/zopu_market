import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Plus, Pencil, Trash2, Eye, EyeOff, Upload, X } from "lucide-react";
import { toast } from "sonner";

export default function AdminCases() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    clientName: "",
    clientCompany: "",
    description: "",
    results: "",
    testimonial: "",
    imageUrl: "",
    displayOrder: 0,
  });

  const { data: partners } = trpc.partner.list.useQuery();
  const { data: cases, refetch } = trpc.partnerCase.listAll.useQuery(
    { partnerId: parseInt(selectedPartnerId) },
    { enabled: !!selectedPartnerId }
  );

  const createMutation = trpc.partnerCase.adminCreate.useMutation({
    onSuccess: () => {
      toast.success("Case criado com sucesso!");
      setIsCreateOpen(false);
      resetForm();
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar case: ${error.message}`);
    },
  });

  const updateMutation = trpc.partnerCase.adminUpdate.useMutation({
    onSuccess: () => {
      toast.success("Case atualizado!");
      setSelectedCase(null);
      resetForm();
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar case: ${error.message}`);
    },
  });

  const deleteMutation = trpc.partnerCase.adminDelete.useMutation({
    onSuccess: () => {
      toast.success("Case excluído!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir case: ${error.message}`);
    },
  });

  const togglePublishMutation = trpc.partnerCase.adminUpdate.useMutation({
    onSuccess: () => {
      toast.success("Status de publicação atualizado!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      clientName: "",
      clientCompany: "",
      description: "",
      results: "",
      testimonial: "",
      imageUrl: "",
      displayOrder: 0,
    });
  };

  const handleCreate = () => {
    if (!selectedPartnerId) {
      toast.error("Selecione um parceiro");
      return;
    }
    createMutation.mutate({
      partnerId: parseInt(selectedPartnerId),
      ...formData,
    });
  };

  const handleUpdate = () => {
    if (!selectedCase) return;
    updateMutation.mutate({
      id: selectedCase.id,
      ...formData,
    });
  };

  const handleEdit = (caseItem: any) => {
    setSelectedCase(caseItem);
    setFormData({
      title: caseItem.title,
      clientName: caseItem.clientName,
      clientCompany: caseItem.clientCompany || "",
      description: caseItem.description,
      results: caseItem.results || "",
      testimonial: caseItem.testimonial || "",
      imageUrl: caseItem.imageUrl || "",
      displayOrder: caseItem.displayOrder || 0,
    });
  };

  const handleTogglePublish = (caseId: number, currentStatus: number) => {
    togglePublishMutation.mutate({
      id: caseId,
      isPublished: currentStatus === 1 ? 0 : 1,
    });
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestão de Cases de Sucesso</h1>
          <p className="text-muted-foreground">
            Crie e gerencie cases de sucesso dos parceiros
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Case
        </Button>
      </div>

      {/* Seletor de Parceiro */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Selecione um Parceiro</CardTitle>
          <CardDescription>Escolha o parceiro para visualizar e gerenciar seus cases</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId}>
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
        </CardContent>
      </Card>

      {/* Lista de Cases */}
      {selectedPartnerId && (
        <div className="grid gap-6">
          {!cases || cases.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Nenhum case cadastrado para este parceiro</p>
              </CardContent>
            </Card>
          ) : (
            cases.map((caseItem: any) => (
              <Card key={caseItem.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-2">{caseItem.title}</CardTitle>
                      <CardDescription>
                        {caseItem.clientName}
                        {caseItem.clientCompany && ` • ${caseItem.clientCompany}`}
                      </CardDescription>
                    </div>
                    <Badge variant={caseItem.isPublished === 1 ? "default" : "secondary"}>
                      {caseItem.isPublished === 1 ? "Publicado" : "Rascunho"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{caseItem.description}</p>
                  
                  {caseItem.results && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">Resultados:</p>
                      <p className="text-sm text-muted-foreground">{caseItem.results}</p>
                    </div>
                  )}

                  {caseItem.testimonial && (
                    <div className="mb-4 border-l-4 border-primary pl-4 py-2 bg-muted/30 rounded-r">
                      <p className="text-sm italic text-muted-foreground">"{caseItem.testimonial}"</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(caseItem)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePublish(caseItem.id, caseItem.isPublished)}
                    >
                      {caseItem.isPublished === 1 ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Despublicar
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Publicar
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm("Tem certeza que deseja excluir este case?")) {
                          deleteMutation.mutate({ id: caseItem.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Dialog Criar/Editar */}
      <Dialog open={isCreateOpen || !!selectedCase} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false);
          setSelectedCase(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCase ? "Editar Case" : "Novo Case de Sucesso"}</DialogTitle>
            <DialogDescription>
              {selectedCase ? "Atualize as informações do case" : "Preencha os dados do novo case"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Título do Case *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Implementação de ERP Completo"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome do Cliente *</Label>
                <Input
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="Ex: Carlos Silva"
                />
              </div>
              <div>
                <Label>Empresa do Cliente</Label>
                <Input
                  value={formData.clientCompany}
                  onChange={(e) => setFormData({ ...formData, clientCompany: e.target.value })}
                  placeholder="Ex: Indústria XYZ Ltda"
                />
              </div>
            </div>

            <div>
              <Label>Descrição do Projeto *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o projeto realizado..."
                rows={4}
              />
            </div>

            <div>
              <Label>Resultados Alcançados</Label>
              <Textarea
                value={formData.results}
                onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                placeholder="Descreva os resultados quantitativos e qualitativos..."
                rows={3}
              />
            </div>

            <div>
              <Label>Depoimento do Cliente</Label>
              <Textarea
                value={formData.testimonial}
                onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                placeholder="Depoimento do cliente sobre o trabalho realizado..."
                rows={3}
              />
            </div>

            <div>
              <Label>URL da Imagem</Label>
              <Input
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label>Ordem de Exibição</Label>
              <Input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Menor número aparece primeiro
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateOpen(false);
              setSelectedCase(null);
              resetForm();
            }}>
              Cancelar
            </Button>
            <Button
              onClick={selectedCase ? handleUpdate : handleCreate}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {selectedCase ? "Atualizar" : "Criar"} Case
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
