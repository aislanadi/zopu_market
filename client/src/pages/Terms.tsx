import { Link } from "wouter";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <img 
              src="/logo-zopu.png" 
              alt="ZOPUMarket" 
              className="h-8 cursor-pointer"
            />
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              Início
            </Link>
            <Link href="/catalog" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              Catálogo
            </Link>
            <Link href="/contact" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              Contato
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="container max-w-4xl py-16">
        <h1 className="text-4xl font-bold mb-8">Termos de Uso</h1>
        <p className="text-sm text-muted-foreground mb-8">Última atualização: Dezembro de 2025</p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Aceitação dos Termos</h2>
            <p className="text-muted-foreground mb-4">
              Ao acessar e usar o ZOPUMarket, você concorda em cumprir e estar vinculado aos seguintes 
              termos e condições de uso. Se você não concordar com qualquer parte destes termos, não 
              deve usar nossa plataforma.
            </p>
            <p className="text-muted-foreground">
              Estes Termos de Uso aplicam-se a todos os usuários da plataforma, incluindo clientes, 
              parceiros, visitantes e qualquer pessoa que acesse ou use o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Descrição do Serviço</h2>
            <p className="text-muted-foreground mb-4">
              O ZOPUMarket é uma plataforma de marketplace B2B que conecta empresas a fornecedores 
              de soluções empresariais. Oferecemos:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Catálogo de soluções B2B de parceiros verificados</li>
              <li>Sistema de avaliações e reviews de clientes</li>
              <li>Comparação de ofertas e fornecedores</li>
              <li>Suporte especializado para encontrar soluções adequadas</li>
              <li>Processo de contratação facilitado</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Cadastro e Conta de Usuário</h2>
            <p className="text-muted-foreground mb-4">
              Para acessar determinadas funcionalidades da plataforma, você precisará criar uma conta. 
              Ao criar uma conta, você concorda em:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Fornecer informações precisas, atuais e completas</li>
              <li>Manter a segurança de sua senha e identificação</li>
              <li>Atualizar prontamente suas informações de cadastro</li>
              <li>Aceitar toda a responsabilidade por atividades que ocorram em sua conta</li>
              <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Uso Aceitável</h2>
            <p className="text-muted-foreground mb-4">
              Você concorda em usar a plataforma apenas para fins legítimos e de acordo com estes Termos. 
              Você não deve:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Violar qualquer lei ou regulamento aplicável</li>
              <li>Infringir direitos de propriedade intelectual de terceiros</li>
              <li>Transmitir conteúdo ofensivo, difamatório ou ilegal</li>
              <li>Tentar obter acesso não autorizado a sistemas ou redes</li>
              <li>Interferir no funcionamento adequado da plataforma</li>
              <li>Usar a plataforma para fins fraudulentos ou enganosos</li>
              <li>Coletar dados de outros usuários sem consentimento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Parceiros e Ofertas</h2>
            <p className="text-muted-foreground mb-4">
              O ZOPUMarket atua como intermediário entre clientes e parceiros fornecedores. 
              Importante destacar:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Não somos responsáveis pela qualidade final dos serviços prestados pelos parceiros</li>
              <li>Realizamos curadoria e verificação de parceiros, mas não garantimos resultados específicos</li>
              <li>Contratos e acordos comerciais são estabelecidos diretamente entre cliente e parceiro</li>
              <li>Avaliações e reviews refletem opiniões de usuários individuais</li>
              <li>Preços e condições podem variar conforme negociação direta</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Avaliações e Conteúdo do Usuário</h2>
            <p className="text-muted-foreground mb-4">
              Usuários podem publicar avaliações e comentários sobre parceiros e serviços. Ao publicar 
              conteúdo, você:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Garante que o conteúdo é verdadeiro e baseado em experiência real</li>
              <li>Concede ao ZOPUMarket direito de usar, modificar e exibir o conteúdo</li>
              <li>Não publicará conteúdo falso, enganoso ou difamatório</li>
              <li>Aceita que podemos moderar e remover conteúdo inadequado</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Propriedade Intelectual</h2>
            <p className="text-muted-foreground mb-4">
              Todo o conteúdo da plataforma, incluindo textos, gráficos, logos, ícones, imagens e 
              software, é propriedade do ZOPUMarket ou de seus licenciadores e está protegido por 
              leis de direitos autorais e outras leis de propriedade intelectual.
            </p>
            <p className="text-muted-foreground">
              Você não pode reproduzir, distribuir, modificar ou criar trabalhos derivados sem 
              autorização expressa por escrito.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Limitação de Responsabilidade</h2>
            <p className="text-muted-foreground mb-4">
              O ZOPUMarket não será responsável por:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Danos diretos, indiretos, incidentais ou consequenciais</li>
              <li>Perda de lucros, dados ou oportunidades de negócio</li>
              <li>Interrupções ou erros no serviço</li>
              <li>Ações ou omissões de parceiros terceiros</li>
              <li>Conteúdo de usuários ou links externos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Modificações dos Termos</h2>
            <p className="text-muted-foreground">
              Reservamo-nos o direito de modificar estes Termos a qualquer momento. Alterações 
              significativas serão comunicadas através da plataforma ou por e-mail. O uso continuado 
              da plataforma após modificações constitui aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Lei Aplicável e Jurisdição</h2>
            <p className="text-muted-foreground">
              Estes Termos serão regidos e interpretados de acordo com as leis do Brasil. 
              Qualquer disputa será submetida à jurisdição exclusiva dos tribunais de Joinville, 
              Santa Catarina.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Contato</h2>
            <p className="text-muted-foreground">
              Para questões sobre estes Termos de Uso, entre em contato conosco:
            </p>
            <ul className="list-none text-muted-foreground space-y-2 mt-4">
              <li><strong>E-mail:</strong> contato@zopu.com.br</li>
              <li><strong>Telefone:</strong> 0800 042 9000</li>
              <li><strong>WhatsApp:</strong> +55 47 3307-9280</li>
              <li><strong>Endereço:</strong> Rua Rio Grande do Sul, 385 - Joinville/SC</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/" className="text-primary hover:underline">Voltar para o início</Link>
            {" | "}
            <Link href="/privacy" className="text-primary hover:underline">Política de Privacidade</Link>
            {" | "}
            <Link href="/contact" className="text-primary hover:underline">Contato</Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted/50 border-t py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <img 
                src="/logo-zopu.png" 
                alt="ZOPUMarket" 
                className="h-8 mb-4"
              />
              <p className="text-sm text-muted-foreground">
                Marketplace B2B de Soluções Empresariais
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Plataforma</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/catalog" className="hover:text-primary transition-colors">Explorar Soluções</Link></li>
                <li><Link href="/partner/apply" className="hover:text-primary transition-colors">Seja Parceiro</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary transition-colors">Sobre Nós</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contato</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/terms" className="hover:text-primary transition-colors">Termos de Uso</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacidade</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2024 ZOPUMarket. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
