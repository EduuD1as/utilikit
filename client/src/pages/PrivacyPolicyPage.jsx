import { LegalLayout } from '../components/LegalLayout.jsx';
import { LEGAL } from '../data/legal.js';

export function PrivacyPolicyPage({ onNavigate }) {
  return (
    <LegalLayout title="Política de Privacidade" onNavigate={onNavigate}>
      <p className="legal-page__meta">
        Última atualização: {LEGAL.lastUpdated} · {LEGAL.siteUrl}
      </p>

      <p>
        Esta Política de Privacidade descreve como o <strong>{LEGAL.siteName}</strong>{' '}
        ({LEGAL.siteUrl}) trata dados pessoais, em conformidade com a Lei Geral de
        Proteção de Dados (LGPD — Lei nº 13.709/2018) e demais normas aplicáveis no
        Brasil.
      </p>

      <h2>1. Quem somos</h2>
      <p>
        O {LEGAL.siteName} é um site de ferramentas online gratuitas (calculadoras,
        conversores, contadores e utilitários). Para questões sobre privacidade e
        exercício de direitos, entre em contato:{' '}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
      </p>

      <h2>2. Dados que tratamos</h2>
      <p>Dependendo de como você usa o site, podemos tratar:</p>
      <ul>
        <li>
          <strong>Dados de uso e técnicos:</strong> endereço IP, tipo de navegador,
          páginas visitadas, data/hora de acesso e identificadores de cookies (quando
          consentidos).
        </li>
        <li>
          <strong>Dados informados por você:</strong> termos de busca de canais no
          contador do YouTube, consultas SQL coladas no formatador (processadas no seu
          navegador, sem envio ao nosso servidor para formatação).
        </li>
        <li>
          <strong>Preferências de privacidade:</strong> escolhas do banner de cookies
          (armazenadas localmente no seu dispositivo).
        </li>
      </ul>
      <p>
        Não solicitamos cadastro, CPF, pagamento ou dados sensíveis para usar as
        ferramentas gratuitas.
      </p>

      <h2 id="cookies">3. Cookies e tecnologias semelhantes</h2>
      <p>Utilizamos as seguintes categorias:</p>
      <ul>
        <li>
          <strong>Essenciais:</strong> necessários para o funcionamento do site (ex.:
          registrar sua escolha sobre cookies). Base legal: legítimo interesse e
          execução de funcionalidade solicitada por você.
        </li>
        <li>
          <strong>Análise (opcional):</strong> apenas se você consentir — ajudam a
          entender uso agregado do site.
        </li>
        <li>
          <strong>Publicidade (opcional):</strong> apenas se você consentir — cookies
          do Google AdSense para exibir e medir anúncios.
        </li>
      </ul>
      <p>
        Você pode aceitar, recusar categorias opcionais ou alterar sua escolha a
        qualquer momento em <strong>Preferências de cookies</strong> no rodapé.
      </p>

      <h2>4. Finalidades e bases legais (LGPD)</h2>
      <table className="legal-page__table">
        <thead>
          <tr>
            <th>Finalidade</th>
            <th>Base legal</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Exibir e operar as ferramentas</td>
            <td>Execução de funcionalidade / legítimo interesse</td>
          </tr>
          <tr>
            <td>Memorizar preferências de cookies</td>
            <td>Consentimento / legítimo interesse (essenciais)</td>
          </tr>
          <tr>
            <td>Publicidade (AdSense)</td>
            <td>Consentimento</td>
          </tr>
          <tr>
            <td>Segurança e prevenção a abusos</td>
            <td>Legítimo interesse</td>
          </tr>
          <tr>
            <td>Atender solicitações e direitos do titular</td>
            <td>Obrigação legal / exercício de direitos</td>
          </tr>
        </tbody>
      </table>

      <h2>5. Compartilhamento com terceiros</h2>
      <p>Podemos compartilhar dados limitados com:</p>
      <ul>
        <li>
          <strong>Google (YouTube Data API):</strong> quando você busca um canal no
          contador — o servidor envia a consulta para obter dados públicos do canal.
        </li>
        <li>
          <strong>SocialCounts (api.socialcounts.org):</strong> contagem estimada de
          inscritos, chamada diretamente do seu navegador.
        </li>
        <li>
          <strong>Google AdSense:</strong> se você consentir cookies de publicidade.
        </li>
        <li>
          <strong>Hospedagem (Render):</strong> processamento técnico e logs de
          servidor.
        </li>
      </ul>
      <p>
        Esses provedores podem processar dados fora do Brasil. Nesses casos,
        aplicamos medidas contratuais e técnicas compatíveis com a LGPD, conforme
        políticas dos fornecedores.
      </p>

      <h2>6. Retenção</h2>
      <ul>
        <li>
          <strong>Preferências de cookies:</strong> até você apagar os dados do
          navegador ou alterar a escolha.
        </li>
        <li>
          <strong>Logs de servidor:</strong> período necessário para segurança e
          operação, em geral limitado.
        </li>
        <li>
          <strong>Dados em ferramentas locais:</strong> SQL formatado no navegador não
          é armazenado pelo site após você fechar a página.
        </li>
      </ul>

      <h2>7. Seus direitos (titular de dados)</h2>
      <p>Você pode, mediante solicitação a {LEGAL.contactEmail}:</p>
      <ul>
        <li>Confirmar se tratamos seus dados</li>
        <li>Acessar, corrigir ou atualizar dados</li>
        <li>Solicitar anonimização, bloqueio ou eliminação de dados desnecessários</li>
        <li>Revogar consentimento (cookies opcionais)</li>
        <li>Solicitar portabilidade, quando aplicável</li>
        <li>
          Opor-se a tratamentos baseados em legítimo interesse, quando cabível
        </li>
      </ul>
      <p>
        Responderemos em prazo razoável, conforme a LGPD. Você também pode
        apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD).
      </p>

      <h2>8. Segurança</h2>
      <p>
        Adotamos medidas técnicas e organizacionais proporcionais (HTTPS, controle de
        acesso, minimização de dados). Nenhum sistema é 100% seguro; em caso de
        incidente relevante, buscaremos mitigar e comunicar conforme a lei.
      </p>

      <h2>9. Crianças e adolescentes</h2>
      <p>
        O site não é direcionado a menores de 18 anos. Se tomarmos conhecimento de
        dados de menores tratados indevidamente, adotaremos medidas para eliminá-los.
      </p>

      <h2>10. Alterações</h2>
      <p>
        Podemos atualizar esta política. A data no topo indica a versão vigente.
        Mudanças relevantes podem ser destacadas no site.
      </p>
    </LegalLayout>
  );
}
