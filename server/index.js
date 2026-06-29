import cors from "cors";
import express from "express";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = process.env.PORT || 3333;
const shareGoal = 5;
const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const distPath = join(projectRoot, "dist");
const distIndexPath = join(distPath, "index.html");

app.use(cors());
app.use(express.json());

const promotions = [
  {
    id: 1,
    title: "Hortifruti selecionado",
    description: "Frutas e verduras frescas com troca diaria.",
    tag: "oferta do dia",
  },
  {
    id: 2,
    title: "Padaria quentinha",
    description: "Produtos para cafe da manha e lanche da tarde.",
    tag: "combo cafe",
  },
  {
    id: 3,
    title: "Cesta da casa",
    description: "Itens essenciais para economizar no mes.",
    tag: "economia",
  },
];

const posts = [
  {
    id: 1,
    title: "Como montar uma compra semanal mais inteligente",
    category: "Dica do mercado",
  },
  {
    id: 2,
    title: "Receita rapida com ingredientes do corredor de massas",
    category: "Receita rapida",
  },
  {
    id: 3,
    title: "Produtos locais chegando nas prateleiras",
    category: "Novidade",
  },
];

const clubMembers = new Map();
const clubMemberIdsByPhone = new Map();

function normalizePhone(phone) {
  return String(phone ?? "").replace(/\D/g, "").slice(0, 15);
}

function normalizeName(name) {
  return String(name ?? "").trim().slice(0, 80);
}

function createCoupon(member) {
  return {
    code: `VEIGA-${member.id.slice(0, 6).toUpperCase()}`,
    description: "Cupom de desconto liberado por compartilhamento.",
    issuedAt: new Date().toISOString(),
  };
}

function serializeClubMember(member) {
  return {
    id: member.id,
    name: member.name,
    phone: member.phone,
    shareCount: member.shareCount,
    targetShares: shareGoal,
    coupon: member.coupon,
  };
}

app.get("/api/health", (request, response) => {
  response.json({ status: "ok", service: "mercado-veiga-api" });
});

app.get("/api/promotions", (request, response) => {
  response.json(promotions);
});

app.get("/api/posts", (request, response) => {
  response.json(posts);
});

app.post("/api/club/login", (request, response) => {
  const name = normalizeName(request.body.name);
  const phone = normalizePhone(request.body.phone);

  if (name.length < 2 || phone.length < 8) {
    response.status(400).json({
      error: "invalid_member",
      message: "Informe nome e telefone para entrar no Clube Veiga.",
    });
    return;
  }

  const existingMemberId = clubMemberIdsByPhone.get(phone);

  if (existingMemberId) {
    const member = clubMembers.get(existingMemberId);
    member.name = name;

    response.json({
      member: serializeClubMember(member),
      status: "updated",
    });
    return;
  }

  const member = {
    id: randomUUID(),
    name,
    phone,
    shareCount: 0,
    coupon: null,
    createdAt: new Date().toISOString(),
  };

  clubMembers.set(member.id, member);
  clubMemberIdsByPhone.set(phone, member.id);

  response.status(201).json({
    member: serializeClubMember(member),
    status: "created",
  });
});

app.get("/api/club/members/:memberId", (request, response) => {
  const member = clubMembers.get(request.params.memberId);

  if (!member) {
    response.status(404).json({
      error: "member_not_found",
      message: "Cliente nao encontrado no Clube Veiga.",
    });
    return;
  }

  response.json({
    member: serializeClubMember(member),
  });
});

app.post("/api/promo-shares", (request, response) => {
  const member = clubMembers.get(request.body.memberId);

  if (!member) {
    response.status(404).json({
      error: "member_not_found",
      message: "Entre no Clube Veiga para contar compartilhamentos.",
    });
    return;
  }

  member.shareCount += 1;

  const couponIssued = member.shareCount >= shareGoal && !member.coupon;

  if (couponIssued) {
    member.coupon = createCoupon(member);
  }

  response.status(201).json({
    member: serializeClubMember(member),
    couponIssued,
    share: {
      channel: request.body.channel || "web-share",
      confirmedAt: new Date().toISOString(),
    },
  });
});

app.post("/api/whatsapp-leads", (request, response) => {
  const { name, message } = request.body;

  response.status(201).json({
    status: "received",
    lead: {
      name,
      message,
      channel: "whatsapp",
      createdAt: new Date().toISOString(),
    },
  });
});

if (existsSync(distIndexPath)) {
  app.use(express.static(distPath));

  app.get(/^(?!\/api).*/, (request, response) => {
    response.sendFile(distIndexPath);
  });
} else {
  app.get("/", (request, response) => {
    response.status(503).send(
      "Site ainda nao foi gerado. Execute npm run build antes de iniciar a API.",
    );
  });
}

app.listen(port, () => {
  console.log(`Mercado Veiga running on http://localhost:${port}`);
});
