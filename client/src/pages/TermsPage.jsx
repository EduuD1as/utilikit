import { LegalLayout } from '../components/LegalLayout.jsx';
import { LEGAL } from '../data/legal.js';

export function TermsPage({ onNavigate }) {
  return (
    <LegalLayout title="Termos de Uso" onNavigate={onNavigate}>
      <p className="legal-page__meta">
        Última atualização: {LEGAL.lastUpdated} · {LEGAL.siteUrl}
      </p>

      <p>
        Ao acessar e usar o <strong>{LEGAL.siteName}</strong> ({LEGAL.siteUrl}), você
        concorda com estes Termos de Uso. Se não concordar, não utilize o site.
      </p>

      <h2>1. O serviço</h2>
      <p>
        O {LEGAL.siteName} oferece ferramentas online gratuitas para uso pessoal e
        profissional. Funcionalidades podem ser adicionadas, alteradas ou removidas sem
        aviso prévio.
      </p>

      <h2>2. Uso permitido</h2>
      <p>Você concorda em:</p>
      <ul>
        <li>Usar o site de forma lícita e respeitosa</li>
        <li>Não tentar sobrecarregar, invadir ou burlar sistemas de segurança</li>
        <li>
          Não utilizar as ferramentas para violar direitos de terceiros ou termos de
          plataformas (ex.: YouTube, Google)
        </li>
        <li>Não automatizar acessos de forma abusiva (scraping massivo, bots)</li>
      </ul>

      <h2>3. Sem garantias</h2>
      <p>
        As ferramentas são fornecidas <strong>“como estão”</strong>. Não garantimos
        precisão absoluta de resultados (ex.: contagem de inscritos estimada, SQL
        formatado). Verifique informações críticas em fontes oficiais antes de
        decisões financeiras, jurídicas ou técnicas.
      </p>

      <h2>4. Propriedade intelectual</h2>
      <p>
        Marca, layout, textos e código do {LEGAL.siteName} são protegidos. Você mantém
        os direitos sobre o conteúdo que inserir (ex.: consultas SQL). Não copie ou
        redistribua o site inteiro sem autorização.
      </p>

      <h2>5. Serviços de terceiros</h2>
      <p>
        Algumas funções dependem de APIs e serviços externos (Google/YouTube,
        SocialCounts, hospedagem). Não somos responsáveis por indisponibilidade,
        alterações ou políticas desses terceiros.
      </p>

      <h2>6. Publicidade</h2>
      <p>
        O site pode exibir anúncios (ex.: Google AdSense) se você consentir cookies de
        publicidade. Não somos responsáveis pelo conteúdo de anúncios de terceiros.
      </p>

      <h2>7. Limitação de responsabilidade</h2>
      <p>
        Na extensão permitida pela lei, o {LEGAL.siteName} e seus operadores não serão
        responsáveis por danos indiretos, lucros cessantes ou perdas decorrentes do uso
        ou impossibilidade de uso do site.
      </p>

      <h2>8. Privacidade</h2>
      <p>
        O tratamento de dados pessoais é regido pela nossa{' '}
        <button
          type="button"
          className="legal-page__inline-link"
          onClick={() => onNavigate('/privacidade')}
        >
          Política de Privacidade
        </button>
        , em conformidade com a LGPD.
      </p>

      <h2>9. Alterações e contato</h2>
      <p>
        Podemos atualizar estes termos a qualquer momento. Dúvidas:{' '}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
      </p>
    </LegalLayout>
  );
}
