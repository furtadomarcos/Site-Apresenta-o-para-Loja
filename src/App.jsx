import { useEffect, useMemo, useState } from "react";
import {
  Apple,
  Beef,
  Bell,
  BellRing,
  ChevronRight,
  Clock3,
  Gift,
  LogOut,
  MapPin,
  MessageCircle,
  Megaphone,
  Package,
  Phone,
  Send,
  Share2,
  Sparkles,
  Store,
  TicketPercent,
  Truck,
  UserRound,
  Wheat,
} from "lucide-react";

const whatsappNumber = "5500000000000";
const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3333";
const promoShareGoal = 5;

const sectors = [
  {
    id: 1,
    icon: Wheat,
    title: "Padaria",
    text: "Pães fresquinhos e produtos preparados diariamente.",
  },
  {
    id: 2,
    icon: Beef,
    title: "Açougue",
    text: "Carnes selecionadas com qualidade e atendimento especializado.",
  },
  {
    id: 3,
    icon: Apple,
    title: "Hortifruti",
    text: "Frutas, verduras e legumes sempre frescos.",
  },
  {
    id: 4,
    icon: Package,
    title: "Mercearia",
    text: "Grande variedade de produtos para o dia a dia.",
  },
];

const stores = [
  {
    id: 1,
    name: "Unidade Principal",
    address: "Estrada do Sabão, 878",
  },
  {
    id: 2,
    name: "Unidade 2",
    address: "Av. Dep. Cantídio Sampaio, 4847",
  },
  {
    id: 3,
    name: "Unidade 3",
    address: "Paulo Garcia Aquiline, 555",
  },
];

const peopleImages = [
  {
    id: 1,
    src: "/equipe-caixa-azul.png",
    alt: "Equipe do Supermercado Veiga atendendo uma cliente no caixa.",
    label: "Atendimento",
  },
  {
    id: 2,
    src: "/atendimento-corredor-azul.png",
    alt: "Colaborador do Supermercado Veiga auxiliando uma cliente no corredor de mercearia.",
    label: "Orientação",
  },
  {
    id: 3,
    src: "/atendimento-caixa-azul.png",
    alt: "Caixa do Supermercado Veiga finalizando uma compra com uma cliente.",
    label: "Confiança",
  },
];

const notificationTypes = [
  {
    id: "promocoes",
    icon: Sparkles,
    label: "Promoções diárias",
    text: "Receba o alerta quando as ofertas do dia estiverem disponíveis.",
    title: "Promoções do dia no Veiga",
    body: "As ofertas de hoje já estão disponíveis para você economizar.",
    url: "#promocoes",
  },
  {
    id: "avisos",
    icon: Megaphone,
    label: "Avisos da loja",
    text: "Acompanhe comunicados importantes das unidades do mercado.",
    title: "Aviso do Supermercado Veiga",
    body: "Temos um novo comunicado para os clientes do Supermercado Veiga.",
    url: "#notificacoes",
  },
  {
    id: "padaria",
    icon: Wheat,
    label: "Pão fresquinho",
    text: "Saiba quando a fornada da padaria acabou de sair.",
    title: "Pão fresquinho na padaria",
    body: "Acabou de sair pão fresquinho no Supermercado Veiga.",
    url: "#setores",
  },
];

const defaultNotificationPreferences = notificationTypes.reduce(
  (preferences, type) => ({
    ...preferences,
    [type.id]: true,
  }),
  {},
);

const notificationPermissionLabels = {
  default: "Aguardando permissão",
  denied: "Permissão bloqueada",
  granted: "Notificações ativadas",
  unsupported: "Não suportado neste navegador",
};

function getNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission;
}

function getSavedNotificationPreferences() {
  if (typeof window === "undefined") {
    return defaultNotificationPreferences;
  }

  try {
    const savedPreferences = window.localStorage.getItem(
      "veiga-notification-preferences",
    );

    if (!savedPreferences) {
      return defaultNotificationPreferences;
    }

    return {
      ...defaultNotificationPreferences,
      ...JSON.parse(savedPreferences),
    };
  } catch {
    return defaultNotificationPreferences;
  }
}

function getSavedClubMember() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const savedMember = window.localStorage.getItem("veiga-club-member");

    return savedMember ? JSON.parse(savedMember) : null;
  } catch {
    return null;
  }
}

function App() {
  const [contact, setContact] = useState({ name: "", message: "" });
  const [notificationPermission, setNotificationPermission] = useState(
    getNotificationPermission,
  );
  const [notificationPreferences, setNotificationPreferences] = useState(
    getSavedNotificationPreferences,
  );
  const [notificationFeedback, setNotificationFeedback] = useState("");
  const [clubMember, setClubMember] = useState(getSavedClubMember);
  const [clubForm, setClubForm] = useState(() => {
    const savedMember = getSavedClubMember();

    return {
      name: savedMember?.name || "",
      phone: savedMember?.phone || "",
    };
  });
  const [clubFeedback, setClubFeedback] = useState("");
  const [isClubLoading, setIsClubLoading] = useState(false);
  const [isSharingPromo, setIsSharingPromo] = useState(false);

  const whatsappLink = useMemo(() => {
    const text = contact.message
      ? `Ola, sou ${contact.name || "cliente"}. ${contact.message}`
      : "Olá, gostaria de falar com o Supermercado Veiga.";

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
  }, [contact]);

  const notificationButtonLabel =
    notificationPermission === "granted"
      ? "Notificações ativadas"
      : "Receber notificações";
  const promoShareCount = Math.min(
    clubMember?.shareCount || 0,
    clubMember?.targetShares || promoShareGoal,
  );
  const promoShareTarget = clubMember?.targetShares || promoShareGoal;
  const promoShareProgress = `${(promoShareCount / promoShareTarget) * 100}%`;
  const remainingPromoShares = Math.max(
    promoShareTarget - (clubMember?.shareCount || 0),
    0,
  );

  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      "veiga-notification-preferences",
      JSON.stringify(notificationPreferences),
    );
  }, [notificationPreferences]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (clubMember) {
      window.localStorage.setItem("veiga-club-member", JSON.stringify(clubMember));
      return;
    }

    window.localStorage.removeItem("veiga-club-member");
  }, [clubMember]);

  useEffect(() => {
    if (notificationPermission !== "default" || typeof window === "undefined") {
      return undefined;
    }

    const hasAskedAutomatically = window.localStorage.getItem(
      "veiga-notification-auto-requested",
    );

    if (hasAskedAutomatically) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      window.localStorage.setItem("veiga-notification-auto-requested", "true");
      requestNotificationPermission("auto");
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [notificationPermission]);

  async function handleWhatsApp() {
    try {
      await fetch(`${apiBaseUrl}/api/whatsapp-leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contact),
      });
    } finally {
      window.open(whatsappLink, "_blank", "noopener,noreferrer");
    }
  }

  async function handleClubLogin(event) {
    event.preventDefault();
    setClubFeedback("");
    setIsClubLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/club/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clubForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setClubMember(data.member);
      setClubFeedback("Entrada no Clube Veiga confirmada.");
    } catch (error) {
      setClubFeedback(
        error.message || "Não foi possível entrar no Clube Veiga agora.",
      );
    } finally {
      setIsClubLoading(false);
    }
  }

  function handleClubLogout() {
    setClubMember(null);
    setClubFeedback("Você saiu do Clube Veiga neste navegador.");
  }

  async function registerPromoShare(channel) {
    if (!clubMember) {
      setClubFeedback(
        "Promoção compartilhada. Entre no Clube Veiga para contar no cupom.",
      );
      return;
    }

    const response = await fetch(`${apiBaseUrl}/api/promo-shares`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel,
        memberId: clubMember.id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    setClubMember(data.member);

    if (data.couponIssued) {
      setClubFeedback("Cupom liberado. Obrigado por compartilhar o Veiga.");
      return;
    }

    const sharesLeft = Math.max(
      data.member.targetShares - data.member.shareCount,
      0,
    );

    setClubFeedback(
      sharesLeft === 0
        ? "Cupom já liberado para este cadastro."
        : `Compartilhamento confirmado. Faltam ${sharesLeft} para liberar o cupom.`,
    );
  }

  async function handleShareDailyPromotion() {
    setClubFeedback("");
    setIsSharingPromo(true);

    const shareUrl = `${window.location.origin}${window.location.pathname}#promocoes`;
    const shareText =
      "Confira as promoções do dia no Supermercado Veiga.";

    try {
      if (!navigator.share) {
        if (!navigator.clipboard?.writeText) {
          throw new Error(
            "Este navegador não permite compartilhar ou copiar a promoção.",
          );
        }

        await navigator.clipboard.writeText(shareUrl);
        setClubFeedback(
          "Link da promoção copiado. Para contar no cupom, use o compartilhamento nativo do celular.",
        );
        return;
      }

      const shareData = {
        title: "Promoções do dia - Supermercado Veiga",
        text: shareText,
        url: shareUrl,
      };

      try {
        const imageResponse = await fetch("/promocao-diaria.jpg");
        const imageBlob = await imageResponse.blob();
        const promoFile = new File([imageBlob], "promocao-diaria.jpg", {
          type: imageBlob.type || "image/jpeg",
        });
        const fileShareData = {
          ...shareData,
          files: [promoFile],
        };

        if (navigator.canShare?.(fileShareData)) {
          await navigator.share(fileShareData);
          await registerPromoShare("web-share-file");
          return;
        }
      } catch {
        // Some browsers support Web Share, but not file sharing.
      }

      await navigator.share(shareData);
      await registerPromoShare("web-share-link");
    } catch (error) {
      if (error.name === "AbortError") {
        setClubFeedback("Compartilhamento cancelado.");
        return;
      }

      setClubFeedback(
        error.message || "Não foi possível compartilhar a promoção agora.",
      );
    } finally {
      setIsSharingPromo(false);
    }
  }

  async function requestNotificationPermission(source = "button") {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotificationPermission("unsupported");
      setNotificationFeedback(
        "Este navegador não permite notificações neste dispositivo.",
      );
      return "unsupported";
    }

    if (Notification.permission === "granted") {
      setNotificationPermission("granted");
      setNotificationFeedback("As notificações já estão ativas neste navegador.");
      return "granted";
    }

    if (Notification.permission === "denied") {
      setNotificationPermission("denied");
      setNotificationFeedback(
        "A permissão está bloqueada. Para ativar, libere as notificações nas configurações do navegador.",
      );
      return "denied";
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === "granted") {
        setNotificationFeedback(
          "Pronto. Você pode receber promoções, avisos e alertas da padaria.",
        );
        await deliverNotification({
          id: "boas-vindas",
          title: "Notificações ativadas",
          body: "Você receberá novidades do Supermercado Veiga por aqui.",
          url: "#notificacoes",
        });
      } else if (source === "auto") {
        setNotificationFeedback(
          "Você também pode ativar os alertas pelo botão de notificações.",
        );
      } else {
        setNotificationFeedback(
          "Sem a permissão do navegador, os alertas ficam pausados.",
        );
      }

      return permission;
    } catch {
      setNotificationFeedback(
        "Seu navegador pediu que a permissão seja liberada pelo botão.",
      );
      return "default";
    }
  }

  async function deliverNotification(notification) {
    const options = {
      body: notification.body,
      icon: "/logo-veiga.jpg",
      badge: "/logo-veiga.jpg",
      tag: `veiga-${notification.id}`,
      renotify: true,
      data: {
        url: notification.url,
      },
    };

    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready.catch(() => null);

      if (registration?.showNotification) {
        await registration.showNotification(notification.title, options);
        return;
      }
    }

    new Notification(notification.title, options);
  }

  async function sendNotification(typeId) {
    const notification = notificationTypes.find((type) => type.id === typeId);

    if (!notification) {
      return;
    }

    if (!notificationPreferences[typeId]) {
      setNotificationFeedback(
        `Ative "${notification.label}" para receber esse tipo de alerta.`,
      );
      return;
    }

    const permission =
      getNotificationPermission() === "granted"
        ? "granted"
        : await requestNotificationPermission();

    if (permission !== "granted") {
      return;
    }

    try {
      await deliverNotification(notification);
      setNotificationFeedback(`${notification.label}: teste enviado.`);
    } catch {
      setNotificationFeedback(
        "Não foi possível enviar a notificação de teste agora.",
      );
    }
  }

  function toggleNotificationPreference(typeId) {
    setNotificationPreferences((current) => ({
      ...current,
      [typeId]: !current[typeId],
    }));
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Supermercado Veiga">
          <span className="brand-mark">
            <img src="/logo-veiga.jpg" alt="" aria-hidden="true" />
          </span>
          <span>
            <strong>Supermercado Veiga</strong>
            <small>mais de 20 anos</small>
          </span>
        </a>

        <nav className="nav-links" aria-label="Navegação principal">
          <a href="#promocoes">Promoções</a>
          <a href="#clube">Clube</a>
          <a href="#notificacoes">Notificações</a>
          <a href="#sobre">Sobre</a>
          <a href="#setores">Setores</a>
          <a href="#lojas">Lojas</a>
          <a href="#entrega">Entrega</a>
          <a href="#contato">Contato</a>
        </nav>

        <a className="header-action" href={whatsappLink}>
          <MessageCircle size={18} aria-hidden="true" />
          WhatsApp
        </a>
      </header>

      <section className="daily-promo" id="promocoes">
        <div className="daily-promo-copy">
          <span className="eyebrow">
            <Sparkles size={16} aria-hidden="true" />
            Promoções diárias
          </span>
          <h2>Ofertas do dia para economizar na sua compra.</h2>
          <p>
            Confira os destaques preparados pelo Supermercado Veiga e aproveite
            as promoções atualizadas para hoje.
          </p>
        </div>

        <figure className="daily-promo-frame">
          <img
            src="/promocao-diaria.jpg"
            alt="Promoções diárias do Supermercado Veiga"
          />
        </figure>
      </section>

      <section className="promo-club-section" id="clube">
        <div className="club-card club-intro-card">
          <span className="eyebrow">
            <Gift size={16} aria-hidden="true" />
            Clube Veiga
          </span>
          <h2>Compartilhe a promoção diária e acompanhe seu cupom.</h2>
          <p>
            Entre no Clube Veiga para salvar seu progresso. Ao completar 5
            compartilhamentos confirmados da promoção do dia, um cupom aparece
            aqui.
          </p>

          {!clubMember ? (
            <form className="club-form" onSubmit={handleClubLogin}>
              <label>
                Nome
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={clubForm.name}
                  onChange={(event) =>
                    setClubForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Telefone
                <input
                  type="tel"
                  placeholder="DDD + telefone"
                  value={clubForm.phone}
                  onChange={(event) =>
                    setClubForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                />
              </label>
              <button type="submit" disabled={isClubLoading}>
                <UserRound size={18} aria-hidden="true" />
                {isClubLoading ? "Entrando..." : "Entrar no Clube"}
              </button>
            </form>
          ) : (
            <div className="club-member-panel">
              <div>
                <span>Cadastro ativo</span>
                <strong>{clubMember.name}</strong>
                <small>{clubMember.phone}</small>
              </div>
              <button type="button" onClick={handleClubLogout}>
                <LogOut size={17} aria-hidden="true" />
                Sair
              </button>
            </div>
          )}
        </div>

        <div className="club-card share-card">
          <div className="share-card-heading">
            <span className="share-icon">
              <Share2 size={24} aria-hidden="true" />
            </span>
            <div>
              <h3>Promoção diária</h3>
              <p>
                Compartilhe a arte do dia pelo celular e acompanhe seu
                progresso no Clube Veiga.
              </p>
            </div>
          </div>

          <div className="share-progress-row">
            <span>{promoShareCount}</span>
            <div className="share-progress-track" aria-hidden="true">
              <span style={{ width: promoShareProgress }} />
            </div>
            <span>{promoShareTarget}</span>
          </div>

          <div className="club-stat-grid">
            <div>
              <span>Confirmados</span>
              <strong>
                {clubMember?.shareCount || 0}/{promoShareTarget}
              </strong>
            </div>
            <div>
              <span>Faltam</span>
              <strong>{remainingPromoShares}</strong>
            </div>
          </div>

          {clubMember?.coupon && (
            <div className="coupon-box">
              <TicketPercent size={22} aria-hidden="true" />
              <div>
                <span>Cupom liberado</span>
                <strong>{clubMember.coupon.code}</strong>
                <small>{clubMember.coupon.description}</small>
              </div>
            </div>
          )}

          <button
            className="share-promo-button"
            type="button"
            onClick={handleShareDailyPromotion}
            disabled={isSharingPromo}
          >
            <Share2 size={18} aria-hidden="true" />
            {isSharingPromo ? "Compartilhando..." : "Compartilhar promoção"}
          </button>

          {clubFeedback && (
            <p className="club-feedback" role="status">
              {clubFeedback}
            </p>
          )}
        </div>
      </section>

      <section className="notification-section" id="notificacoes">
        <div className="notification-card">
          <span className="eyebrow">
            <BellRing size={16} aria-hidden="true" />
            Alertas do mercado
          </span>
          <h2>Receba promoções, avisos e pão fresquinho.</h2>
          <p>
            Ative os alertas do Supermercado Veiga e escolha quais novidades
            deseja acompanhar neste navegador.
          </p>

          <div className="notification-status-row">
            <span className={`permission-pill ${notificationPermission}`}>
              {notificationPermissionLabels[notificationPermission]}
            </span>
            <button
              className="notification-main-button"
              type="button"
              onClick={() => requestNotificationPermission()}
              disabled={notificationPermission === "granted"}
            >
              <Bell size={18} aria-hidden="true" />
              {notificationButtonLabel}
            </button>
          </div>

          {notificationFeedback && (
            <p className="notification-feedback" role="status">
              {notificationFeedback}
            </p>
          )}
        </div>

        <div
          className="notification-preferences"
          aria-label="Preferências de notificação"
        >
          {notificationTypes.map(({ id, icon: Icon, label, text }) => (
            <article className="notification-type-card" key={id}>
              <div className="notification-type-heading">
                <span className="notification-type-icon">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <div>
                  <h3>{label}</h3>
                  <p>{text}</p>
                </div>
              </div>

              <label className="notification-switch">
                <span>{notificationPreferences[id] ? "Ativo" : "Pausado"}</span>
                <input
                  type="checkbox"
                  checked={notificationPreferences[id]}
                  onChange={() => toggleNotificationPreference(id)}
                />
                <span className="switch-track" aria-hidden="true" />
              </label>

              <button
                className="test-notification-button"
                type="button"
                onClick={() => sendNotification(id)}
                disabled={!notificationPreferences[id]}
              >
                <BellRing size={17} aria-hidden="true" />
                Testar
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="hero" id="inicio">
        <div className="hero-content">
          <span className="eyebrow">
            <Sparkles size={16} aria-hidden="true" />
            Mais de 20 anos na região
          </span>
          <h1>Supermercado Veiga</h1>
          <p>
            Há mais de 20 anos fazendo parte da rotina das famílias da região,
            o Supermercado Veiga oferece qualidade, variedade e um atendimento
            baseado no respeito, confiança e educação com cada cliente.
          </p>

          <div className="hero-actions">
            <a className="primary-button" href="#lojas">
              Conheça nossas lojas
              <ChevronRight size={18} aria-hidden="true" />
            </a>
            <a className="secondary-button" href="#contato">
              Falar com a loja
            </a>
          </div>

          <div className="trust-strip" aria-label="Diferenciais">
            <span>
              <Store size={16} aria-hidden="true" />
              Qualidade
            </span>
            <span>
              <Package size={16} aria-hidden="true" />
              Variedade
            </span>
            <span>
              <Clock3 size={16} aria-hidden="true" />
              Atendimento próximo
            </span>
            <span>
              <Truck size={16} aria-hidden="true" />
              Entrega no mesmo dia
            </span>
          </div>
        </div>

        <aside className="hero-panel" aria-label="Resumo do Supermercado Veiga">
          <div className="panel-top">
            <span className="status-dot" />
            <span>Tradição e confiança</span>
          </div>
          <div className="basket-visual">
            <div className="hero-logo-card">
              <img src="/logo-veiga.jpg" alt="Logo do Supermercado Veiga" />
            </div>
          </div>
          <div className="deal-card">
            <Truck size={20} aria-hidden="true" />
            <div>
              <strong>Entrega para compras acima de R$ 150,00</strong>
              <small>Receba sua compra em casa no mesmo dia.</small>
            </div>
          </div>
        </aside>
      </section>

      <section className="section about-section" id="sobre">
        <div className="section-heading">
          <span>Sobre Nós</span>
          <h2>Uma história construída com a comunidade.</h2>
        </div>

        <p className="lead-text">
          O Supermercado Veiga nasceu com o propósito de oferecer praticidade,
          qualidade e um atendimento próximo da comunidade. Ao longo de duas
          décadas, construímos uma história marcada pela confiança dos nossos
          clientes e pelo compromisso em atender sempre com respeito e
          dedicação.
        </p>
      </section>

      <section className="section people-section" id="atendimento">
        <div className="people-copy">
          <span className="eyebrow">
            <Store size={16} aria-hidden="true" />
            Atendimento no dia a dia
          </span>
          <h2>Uma experiência de compra feita por pessoas.</h2>
          <p>
            Do caixa aos corredores, nossa equipe trabalha para orientar,
            atender e tornar a compra mais simples, próxima e acolhedora.
          </p>
        </div>

        <div className="people-gallery" aria-label="Fotos do atendimento">
          {peopleImages.map((image, index) => (
            <figure
              className={`people-image-card image-card-${index + 1}`}
              key={image.id}
            >
              <img src={image.src} alt={image.alt} loading="lazy" />
              <figcaption>{image.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="section" id="setores">
        <div className="section-heading">
          <span>Nossos Setores</span>
          <h2>Tudo o que você precisa em um só lugar.</h2>
          <p>
            Contamos com diversos setores para oferecer tudo o que você precisa
            em um só lugar.
          </p>
        </div>

        <div className="sector-grid">
          {sectors.map(({ icon: Icon, title, text }) => (
            <article className="sector-card" key={title}>
              <Icon size={24} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section content-band" id="lojas">
        <div className="section-heading">
          <span>Nossas Lojas</span>
          <h2>Três unidades para atender você melhor.</h2>
        </div>

        <div className="store-grid">
          {stores.map((store) => (
            <article className="store-card" key={store.id}>
              <MapPin size={24} aria-hidden="true" />
              <div>
                <h3>{store.name}</h3>
                <p>{store.address}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section delivery-section" id="entrega">
        <div className="section-heading">
          <span>Entrega</span>
          <h2>Comprou acima de R$ 150,00? A entrega pode ser no mesmo dia.</h2>
          <p>
            O Supermercado Veiga também conta com sistema de entrega para levar
            praticidade até a residência do cliente. Em compras acima de R$
            150,00, consulte a disponibilidade e receba seu pedido no mesmo dia.
          </p>
        </div>

        <div className="delivery-layout">
          <div className="delivery-card">
            <Truck size={30} aria-hidden="true" />
            <div>
              <strong>Entrega residencial</strong>
              <span>Compras acima de R$ 150,00</span>
            </div>
            <a href="#contato">
              Consultar entrega
              <ChevronRight size={17} aria-hidden="true" />
            </a>
          </div>

          <figure className="delivery-photo">
            <img
              src="/atendimento-caixa-azul.png"
              alt="Atendimento no caixa do Supermercado Veiga com compra pronta."
              loading="lazy"
            />
            <figcaption>Compra pronta para seguir com você.</figcaption>
          </figure>
        </div>
      </section>

      <section className="contact-section" id="contato">
        <div>
          <span className="eyebrow">
            <Phone size={16} aria-hidden="true" />
            Atendimento
          </span>
          <h2>Fale com o Supermercado Veiga.</h2>
          <p>
            Fale com o Supermercado Veiga pelo WhatsApp para tirar dúvidas,
            consultar informações das unidades ou enviar sua mensagem.
          </p>
        </div>

        <form className="contact-form">
          <label>
            Nome
            <input
              type="text"
              placeholder="Seu nome"
              value={contact.name}
              onChange={(event) =>
                setContact((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
            />
          </label>
          <label>
            Mensagem
            <textarea
              placeholder="O que voce precisa hoje?"
              rows="4"
              value={contact.message}
              onChange={(event) =>
                setContact((current) => ({
                  ...current,
                  message: event.target.value,
                }))
              }
            />
          </label>
          <button type="button" onClick={handleWhatsApp}>
            <Send size={18} aria-hidden="true" />
            Enviar pelo WhatsApp
          </button>
        </form>
      </section>

      <footer className="footer">
        <div>
          <span>Supermercado Veiga</span>
          <p>
            O Supermercado Veiga segue crescendo sem deixar de lado aquilo que
            sempre foi nossa prioridade: atender bem, oferecer qualidade e
            manter a confiança construída ao longo de mais de 20 anos.
          </p>
        </div>
      </footer>
    </main>
  );
}

export default App;
