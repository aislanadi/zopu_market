import { Link } from "wouter";

export default function Privacy() {
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
        <h1 className="text-4xl font-bold mb-8">Política de Privacidade</h1>
        <p className="text-sm text-muted-foreground mb-8">Última atualização: Dezembro de 2025</p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introdução</h2>
            <p className="text-muted-foreground mb-4">
              O ZOPUMarket ("nós", "nosso" ou "plataforma") está comprometido em proteger a privacidade 
              e os dados pessoais de seus usuários. Esta Política de Privacidade descreve como coletamos, 
              usamos, armazenamos e protegemos suas informações pessoais de acordo com a Lei Geral de 
              Proteção de Dados (LGPD - Lei nº 13.709/2018).
            </p>
            <p className="text-muted-foreground">
              Ao usar nossa plataforma, você concorda com as práticas descritas nesta política.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Informações que Coletamos</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Informações Fornecidas por Você</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Dados de cadastro:</strong> nome, e-mail, telefone, empresa, cargo</li>
              <li><strong>Dados de perfil:</strong> foto, biografia, preferências</li>
              <li><strong>Dados de contato:</strong> mensagens, avaliações, comentários</li>
              <li><strong>Dados de contratação:</strong> histórico de serviços contratados</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Informações Coletadas Automaticamente</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Dados de navegação:</strong> endereço IP, tipo de navegador, páginas visitadas</li>
              <li><strong>Dados de dispositivo:</strong> sistema operacional, identificadores únicos</li>
              <li><strong>Cookies:</strong> preferências, sessões, análise de uso</li>
              <li><strong>Dados de uso:</strong> interações com a plataforma, tempo de permanência</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.3 Informações de Terceiros</h3>
            <p className="text-muted-foreground">
              Podemos receber informações de parceiros, fornecedores de serviços de autenticação 
              (OAuth) e outras fontes legítimas para complementar os dados que você nos fornece.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Como Usamos Suas Informações</h2>
            <p className="text-muted-foreground mb-4">
              Utilizamos suas informações pessoais para:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Criar e gerenciar sua conta de usuário</li>
              <li>Processar e facilitar transações e contratações</li>
              <li>Fornecer suporte ao cliente e responder suas solicitações</li>
              <li>Personalizar sua experiência na plataforma</li>
              <li>Enviar notificações importantes sobre o serviço</li>
              <li>Melhorar nossos serviços e desenvolver novos recursos</li>
              <li>Realizar análises e pesquisas de mercado</li>
              <li>Prevenir fraudes e garantir a segurança da plataforma</li>
              <li>Cumprir obrigações legais e regulatórias</li>
              <li>Enviar comunicações de marketing (com seu consentimento)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Base Legal para Processamento</h2>
            <p className="text-muted-foreground mb-4">
              Processamos seus dados pessoais com base em:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Consentimento:</strong> quando você nos autoriza expressamente</li>
              <li><strong>Execução de contrato:</strong> para fornecer os serviços solicitados</li>
              <li><strong>Obrigação legal:</strong> para cumprir requisitos legais e regulatórios</li>
              <li><strong>Interesses legítimos:</strong> para melhorar nossos serviços e prevenir fraudes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Compartilhamento de Informações</h2>
            <p className="text-muted-foreground mb-4">
              Podemos compartilhar suas informações com:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Parceiros fornecedores:</strong> quando necessário para processar contratações</li>
              <li><strong>Prestadores de serviços:</strong> que nos auxiliam na operação da plataforma</li>
              <li><strong>Autoridades legais:</strong> quando exigido por lei ou para proteger direitos</li>
              <li><strong>Sucessores empresariais:</strong> em caso de fusão, aquisição ou venda de ativos</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              <strong>Importante:</strong> Não vendemos, alugamos ou comercializamos suas informações 
              pessoais para terceiros para fins de marketing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Cookies e Tecnologias Similares</h2>
            <p className="text-muted-foreground mb-4">
              Utilizamos cookies e tecnologias similares para:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Manter você conectado à sua conta</li>
              <li>Lembrar suas preferências e configurações</li>
              <li>Analisar o uso da plataforma</li>
              <li>Personalizar conteúdo e anúncios</li>
              <li>Melhorar a segurança</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Você pode gerenciar cookies através das configurações do seu navegador, mas isso pode 
              afetar a funcionalidade da plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Segurança dos Dados</h2>
            <p className="text-muted-foreground mb-4">
              Implementamos medidas técnicas e organizacionais apropriadas para proteger suas 
              informações pessoais, incluindo:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Criptografia de dados em trânsito e em repouso</li>
              <li>Controles de acesso rigorosos</li>
              <li>Monitoramento contínuo de segurança</li>
              <li>Auditorias regulares de segurança</li>
              <li>Treinamento de equipe em proteção de dados</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Apesar de nossos esforços, nenhum sistema é 100% seguro. Você também tem responsabilidade 
              em manter a segurança de sua conta e senha.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Retenção de Dados</h2>
            <p className="text-muted-foreground">
              Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir as finalidades 
              descritas nesta política, a menos que um período de retenção mais longo seja exigido ou 
              permitido por lei. Após esse período, seus dados serão anonimizados ou excluídos de forma 
              segura.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Seus Direitos (LGPD)</h2>
            <p className="text-muted-foreground mb-4">
              De acordo com a LGPD, você tem os seguintes direitos em relação aos seus dados pessoais:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Acesso:</strong> confirmar se processamos seus dados e acessá-los</li>
              <li><strong>Correção:</strong> corrigir dados incompletos, inexatos ou desatualizados</li>
              <li><strong>Anonimização, bloqueio ou eliminação:</strong> de dados desnecessários ou excessivos</li>
              <li><strong>Portabilidade:</strong> receber seus dados em formato estruturado</li>
              <li><strong>Eliminação:</strong> excluir dados processados com base no consentimento</li>
              <li><strong>Revogação do consentimento:</strong> retirar consentimento a qualquer momento</li>
              <li><strong>Oposição:</strong> opor-se ao tratamento de dados</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Para exercer seus direitos, entre em contato através de contato@zopu.com.br
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Transferência Internacional de Dados</h2>
            <p className="text-muted-foreground">
              Alguns de nossos prestadores de serviços podem estar localizados fora do Brasil. 
              Nestes casos, garantimos que medidas adequadas de proteção sejam implementadas de 
              acordo com a LGPD.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Privacidade de Menores</h2>
            <p className="text-muted-foreground">
              Nossa plataforma não é destinada a menores de 18 anos. Não coletamos intencionalmente 
              informações de menores. Se tomarmos conhecimento de que coletamos dados de um menor, 
              tomaremos medidas para excluir essas informações.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Alterações nesta Política</h2>
            <p className="text-muted-foreground">
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre 
              alterações significativas através da plataforma ou por e-mail. Recomendamos que você 
              revise esta política regularmente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Encarregado de Dados (DPO)</h2>
            <p className="text-muted-foreground mb-4">
              Para questões relacionadas à proteção de dados pessoais, você pode entrar em contato 
              com nosso Encarregado de Proteção de Dados:
            </p>
            <ul className="list-none text-muted-foreground space-y-2">
              <li><strong>E-mail:</strong> dpo@zopu.com.br</li>
              <li><strong>Telefone:</strong> 0800 042 9000</li>
              <li><strong>Endereço:</strong> Rua Rio Grande do Sul, 385 - Joinville/SC - Brasil</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Contato</h2>
            <p className="text-muted-foreground mb-4">
              Para dúvidas, solicitações ou reclamações sobre esta Política de Privacidade:
            </p>
            <ul className="list-none text-muted-foreground space-y-2">
              <li><strong>E-mail:</strong> contato@zopu.com.br</li>
              <li><strong>Telefone:</strong> 0800 042 9000</li>
              <li><strong>WhatsApp:</strong> +55 47 3307-9280</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/" className="text-primary hover:underline">Voltar para o início</Link>
            {" | "}
            <Link href="/terms" className="text-primary hover:underline">Termos de Uso</Link>
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
