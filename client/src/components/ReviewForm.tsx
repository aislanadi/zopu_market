import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ReviewFormProps {
  partnerId: number;
  partnerName: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ partnerId, partnerName, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const utils = trpc.useUtils();
  
  const createReviewMutation = trpc.review.create.useMutation({
    onSuccess: () => {
      toast.success("Avaliação enviada com sucesso!");
      setRating(0);
      setComment("");
      utils.review.listByPartner.invalidate({ partnerId });
      utils.review.listAll.invalidate();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar avaliação");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error("Por favor, selecione uma avaliação de 1 a 5 estrelas");
      return;
    }

    createReviewMutation.mutate({
      partnerId,
      rating,
      comment: comment.trim() || undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avaliar Parceiro</CardTitle>
        <CardDescription>
          Compartilhe sua experiência com {partnerName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Stars */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Sua avaliação *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {rating === 1 && "Muito insatisfeito"}
                {rating === 2 && "Insatisfeito"}
                {rating === 3 && "Neutro"}
                {rating === 4 && "Satisfeito"}
                {rating === 5 && "Muito satisfeito"}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium mb-2">
              Comentário (opcional)
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte mais sobre sua experiência com este parceiro..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {comment.length}/500 caracteres
            </p>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={createReviewMutation.isPending || rating === 0}
          >
            {createReviewMutation.isPending ? "Enviando..." : "Enviar Avaliação"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Sua avaliação será pública e verificada
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
