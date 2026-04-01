const STORAGE_KEY = 'sigpim-mvp-html-refinado-data';
const SESSION_KEY = 'sigpim-mvp-html-refinado-session';

const initialData = {
  imoveis: [
    {
      id: 'IMV-001',
      nome: 'Escola Municipal Vila Esperança',
      tipo: 'Próprio',
      fase: 'Validado',
      ocupacao: 'Ocupado',
      orgao: 'SEMED',
      responsavel: 'Maria Conceição',
      bairro: 'Cohab',
      endereco: 'Rua das Mangueiras, 120',
      coordenadas: '-2.5602, -44.2287',
      statusJuridico: 'Regular',
      conservacao: 'Regular',
      criticidade: 'Média',
      destinacao: 'Educação',
      areaTerreno: '2.100 m²',
      areaConstruida: '1.260 m²',
      observacoes: 'Cadastro validado com Selo GIS-SEMURH. Unidade em operação normal.',
      documentos: 4,
      pendencias: 1,
      ultimaAtualizacao: '2026-03-28'
    },
    {
      id: 'IMV-002',
      nome: 'Unidade Básica de Saúde do Anil',
      tipo: 'Locado',
      fase: 'Pré-cadastro',
      ocupacao: 'Ocupado',
      orgao: 'SEMUS',
      responsavel: 'José Ribamar',
      bairro: 'Anil',
      endereco: 'Av. Principal, 87',
      coordenadas: '-2.5480, -44.2491',
      statusJuridico: 'Em apuração',
      conservacao: 'Bom',
      criticidade: 'Baixa',
      destinacao: 'Saúde',
      areaTerreno: '980 m²',
      areaConstruida: '620 m²',
      observacoes: 'Necessita anexar contrato e validar coordenadas com SEMURH.',
      documentos: 2,
      pendencias: 2,
      ultimaAtualizacao: '2026-03-30'
    },
    {
      id: 'IMV-003',
      nome: 'Galpão Operacional SEMOSP',
      tipo: 'Próprio',
      fase: 'Gestão plena',
      ocupacao: 'Ocupado',
      orgao: 'SEMOSP',
      responsavel: 'Carlos Filho',
      bairro: 'Distrito Industrial',
      endereco: 'Rod. BR, km 12',
      coordenadas: '-2.5902, -44.3001',
      statusJuridico: 'Regular',
      conservacao: 'Ruim',
      criticidade: 'Alta',
      destinacao: 'Operacional',
      areaTerreno: '5.400 m²',
      areaConstruida: '2.800 m²',
      observacoes: 'Imóvel crítico para operação. Recomendada intervenção corretiva prioritária.',
      documentos: 7,
      pendencias: 3,
      ultimaAtualizacao: '2026-03-26'
    }
  ],
  pendencias: [
    { id: 'PEN-001', imovelId: 'IMV-001', titulo: 'Validar instrumento de uso', criticidade: 'Crítica', responsavel: 'SEMAD', prazo: '2026-04-05', status: 'Aberta' },
    { id: 'PEN-002', imovelId: 'IMV-002', titulo: 'Informar contrato de locação', criticidade: 'Crítica', responsavel: 'SEMAD', prazo: '2026-04-02', status: 'Aberta' },
    { id: 'PEN-003', imovelId: 'IMV-002', titulo: 'Validar coordenadas com SEMURH', criticidade: 'Média', responsavel: 'SEMURH', prazo: '2026-04-10', status: 'Em andamento' },
    { id: 'PEN-004', imovelId: 'IMV-003', titulo: 'Programar vistoria corretiva', criticidade: 'Alta', responsavel: 'SEMOSP', prazo: '2026-04-04', status: 'Aberta' }
  ],
  documentos: [
    { id: 'DOC-001', imovelId: 'IMV-001', nome: 'Ficha cadastral inicial.pdf', tipo: 'Ficha', status: 'Validado', origem: 'SEMAD', data: '2026-03-20' },
    { id: 'DOC-002', imovelId: 'IMV-001', nome: 'Foto fachada 01.jpg', tipo: 'Foto', status: 'Validado', origem: 'SEMAD', data: '2026-03-20' },
    { id: 'DOC-003', imovelId: 'IMV-002', nome: 'Minuta contrato locação.pdf', tipo: 'Contrato', status: 'Não validado', origem: 'SEMAD', data: '2026-03-29' },
    { id: 'DOC-004', imovelId: 'IMV-003', nome: 'Laudo vistoria 2026.pdf', tipo: 'Laudo', status: 'Validado', origem: 'SEMOSP', data: '2026-03-26' }
  ],
  auditoria: [
    { id: 'AUD-001', data: '31/03/2026 09:12', usuario: 'admin.semad', acao: 'Atualizou imóvel', alvo: 'IMV-002', detalhe: 'Alterou status dominial para Em apuração' },
    { id: 'AUD-002', data: '30/03/2026 15:44', usuario: 'vistoria.semosp', acao: 'Registrou vistoria', alvo: 'IMV-003', detalhe: 'Criticidade definida como Alta' },
    { id: 'AUD-003', data: '29/03/2026 10:21', usuario: 'cadastro.semad', acao: 'Anexou documento', alvo: 'IMV-001', detalhe: 'Upload de ficha cadastral inicial' }
  ],
  usuarios: [
    { id: 'USR-001', nome: 'Administrador SEMAD', email: 'admin@sigpim.local', perfil: 'Administrador do sistema', orgao: 'SEMAD', status: 'Ativo' },
    { id: 'USR-002', nome: 'Ana GIS SEMURH', email: 'ana.gis@sigpim.local', perfil: 'Validador documental/jurídico', orgao: 'SEMURH', status: 'Ativo' },
    { id: 'USR-003', nome: 'João Cadastro SEMED', email: 'joao.semed@sigpim.local', perfil: 'Cadastrador setorial', orgao: 'SEMED', status: 'Ativo' }
  ]
};

const routesMeta = {
  dashboard: ['Dashboard', 'Visão executiva do MVP para apresentação'],
  imoveis: ['Imóveis', 'Consulta, busca e ficha operacional dos imóveis'],
  'novo-imovel': ['Novo imóvel', 'Cadastro enxuto orientado a apresentação do MVP'],
  documentos: ['Documentos', 'Evidências, status e organização documental'],
  pendencias: ['Pendências', 'Pendências críticas e evolução do cadastro'],
  auditoria: ['Auditoria', 'Quem fez o quê e quando no MVP'],
  relatorios: ['Relatórios', 'Saídas executivas e técnicas para demonstração'],
  usuarios: ['Usuários', 'Gestão básica de acesso e perfis'],
  configuracoes: ['Configurações', 'Catálogos mínimos e decisões do recorte MVP']
};

const state = {
  route: 'dashboard',
  selectedId: null,
  detailTab: 'resumo',
  wizardStep: 0,
  filters: { busca: '', fase: '', tipo: '' },
  session: null,
  data: loadData()
};

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : structuredClone(initialData);
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
}

function loadSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

function saveSession() {
  localStorage.setItem(SESSION_KEY, JSON.stringify(state.session));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function resetData() {
  if (!confirm('Restaurar os dados demo? Isso apaga alterações feitas na apresentação.')) return;
  state.data = structuredClone(initialData);
  saveData();
  state.selectedId = null;
  state.detailTab = 'resumo';
  render();
}

function card(content) { return `<article class="card">${content}</article>`; }

function getImovel(id) {
  return state.data.imoveis.find(i => i.id === id);
}

function statusClass(value = '') {
  const v = value.toLowerCase();
  if (v.includes('valid') || v.includes('regular') || v.includes('ativo') || v.includes('bom') || v.includes('gestão')) return 'green';
  if (v.includes('crít') || v.includes('alta') || v.includes('ruim') || v.includes('não validado') || v.includes('litígio')) return 'red';
  if (v.includes('pré') || v.includes('média') || v.includes('apuração') || v.includes('aberta') || v.includes('andamento')) return 'orange';
  if (v.includes('locado') || v.includes('próprio') || v.includes('ocupado')) return 'blue';
  return 'gray';
}

function htmlBadge(value) {
  return `<span class="badge ${statusClass(String(value))}">${value}</span>`;
}

function setRoute(route, id = null) {
  state.route = route;
  state.selectedId = id;
  if (route !== 'imoveis') state.detailTab = 'resumo';
  render();
}

function setDetailTab(tab) {
  state.detailTab = tab;
  render();
}

function login(email) {
  const user = state.data.usuarios.find(u => u.email.toLowerCase() === email.toLowerCase()) || state.data.usuarios[0];
  state.session = { nome: user.nome, email: user.email, perfil: user.perfil, orgao: user.orgao };
  saveSession();
  mountApp();
}

function logout() {
  state.session = null;
  clearSession();
  document.getElementById('app').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  renderLogin();
}

function mountApp() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('userChip').textContent = `${state.session.nome} · ${state.session.orgao}`;
  render();
}

function renderLogin() {
  const totalImoveis = state.data.imoveis.length;
  const pendenciasCriticas = state.data.pendencias.filter(p => p.criticidade === 'Crítica').length;
  const usuariosAtivos = state.data.usuarios.filter(u => u.status === 'Ativo').length;
  document.getElementById('loginScreen').innerHTML = `
    <div class="login-grid">
      <section class="hero">
        <div>${htmlBadge('MVP para apresentação funcional')}</div>
        <div>
          <h1>SIGPIM-SLZ</h1>
          <p>Sistema integrado para cadastro, governança, documentos, pendências, auditoria e visão executiva do patrimônio imobiliário municipal.</p>
        </div>
        <div class="hero-grid">
          <div class="hero-stat"><div class="label">Imóveis demo</div><div class="value">${totalImoveis}</div></div>
          <div class="hero-stat"><div class="label">Pendências críticas</div><div class="value">${pendenciasCriticas}</div></div>
          <div class="hero-stat"><div class="label">Usuários ativos</div><div class="value">${usuariosAtivos}</div></div>
        </div>
        <div class="highlight">
          <strong>Fluxo recomendado para apresentar:</strong>
          Dashboard → Imóveis → Ficha do imóvel → Pendências → Documentos → Auditoria → Relatórios.
        </div>
      </section>
      <section class="login-card">
        <h2>Acesso ao MVP</h2>
        <p class="card-subtitle">Use qualquer e-mail demo cadastrado ou siga direto com o perfil administrador.</p>
        <form id="loginForm" class="content">
          <div>
            <label>E-mail</label>
            <input name="email" type="email" placeholder="admin@sigpim.local" value="admin@sigpim.local" />
          </div>
          <div>
            <label>Senha</label>
            <input name="senha" type="password" placeholder="123456" value="123456" />
          </div>
          <div class="actions" style="justify-content:flex-start">
            <button class="primary" type="submit">Entrar no MVP</button>
          </div>
        </form>
        <div class="login-hint">
          Perfis demo disponíveis: admin@sigpim.local, ana.gis@sigpim.local, joao.semed@sigpim.local.
        </div>
      </section>
    </div>
  `;

  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    login(form.get('email'));
  });
}

function renderDashboard() {
  const total = state.data.imoveis.length;
  const validado = state.data.imoveis.filter(i => i.fase === 'Validado').length;
  const gestaoPlena = state.data.imoveis.filter(i => i.fase === 'Gestão plena').length;
  const criticas = state.data.pendencias.filter(p => p.criticidade === 'Crítica').length;

  return `
    <section class="grid grid-4">
      <div class="kpi"><div class="label">Imóveis cadastrados</div><div class="value">${total}</div><div class="meta">Base demo persistida no navegador</div></div>
      <div class="kpi"><div class="label">Validados</div><div class="value">${validado}</div><div class="meta">Prontos para uso oficial</div></div>
      <div class="kpi"><div class="label">Gestão plena</div><div class="value">${gestaoPlena}</div><div class="meta">Com ciclo avançado de gestão</div></div>
      <div class="kpi"><div class="label">Pendências críticas</div><div class="value">${criticas}</div><div class="meta">Exigem tratamento imediato</div></div>
    </section>

    <section class="grid grid-2">
      ${card(`
        <h3>Radar do MVP</h3>
        <div class="status-grid">
          <div class="status-card"><div class="label">Pré-cadastro</div><div class="value">${state.data.imoveis.filter(i => i.fase === 'Pré-cadastro').length}</div></div>
          <div class="status-card"><div class="label">Validado</div><div class="value">${validado}</div></div>
          <div class="status-card"><div class="label">Gestão plena</div><div class="value">${gestaoPlena}</div></div>
          <div class="status-card"><div class="label">Estado ruim</div><div class="value">${state.data.imoveis.filter(i => i.conservacao === 'Ruim').length}</div></div>
        </div>
      `)}
      ${card(`
        <h3>Roteiro de apresentação sugerido</h3>
        <div class="definition-list">
          <div class="definition-item"><strong>1. Mostrar o problema</strong>Dashboard evidencia visão consolidada, pendências e governança.</div>
          <div class="definition-item"><strong>2. Mostrar o núcleo</strong>Abra a ficha de um imóvel e navegue por resumo, documentos, pendências e auditoria.</div>
          <div class="definition-item"><strong>3. Mostrar operação</strong>Cadastre um novo imóvel pelo wizard enxuto.</div>
          <div class="definition-item"><strong>4. Mostrar gestão</strong>Finalize em relatórios e usuários.</div>
        </div>
      `)}
    </section>

    <section class="grid grid-2">
      ${card(`
        <h3>Imóveis com maior atenção</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Imóvel</th><th>Fase</th><th>Criticidade</th><th>Pendências</th><th></th></tr></thead>
            <tbody>
              ${state.data.imoveis
                .slice()
                .sort((a, b) => b.pendencias - a.pendencias)
                .map(i => `<tr><td>${i.nome}</td><td>${htmlBadge(i.fase)}</td><td>${htmlBadge(i.criticidade)}</td><td>${i.pendencias}</td><td><button class="link-button" onclick="setRoute('imoveis','${i.id}')">Abrir ficha</button></td></tr>`)
                .join('')}
            </tbody>
          </table>
        </div>
      `)}
      ${card(`
        <h3>Últimos eventos de auditoria</h3>
        <div class="definition-list">
          ${state.data.auditoria.slice(0, 4).map(a => `<div class="definition-item"><strong>${a.data} · ${a.usuario}</strong>${a.acao} em <b>${a.alvo}</b><br>${a.detalhe}</div>`).join('')}
        </div>
      `)}
    </section>
  `;
}

function filteredImoveis() {
  return state.data.imoveis.filter(i => {
    const busca = state.filters.busca.toLowerCase();
    const matchBusca = !busca || [i.id, i.nome, i.bairro, i.orgao].join(' ').toLowerCase().includes(busca);
    const matchFase = !state.filters.fase || i.fase === state.filters.fase;
    const matchTipo = !state.filters.tipo || i.tipo === state.filters.tipo;
    return matchBusca && matchFase && matchTipo;
  });
}

function renderImoveis() {
  const items = filteredImoveis();
  const selected = state.selectedId ? getImovel(state.selectedId) : null;

  return `
    ${card(`
      <div class="filters">
        <div style="flex:2"><label>Buscar</label><input id="filtroBusca" placeholder="Nome, ID, bairro ou órgão" value="${state.filters.busca}" /></div>
        <div style="flex:1"><label>Fase</label><select id="filtroFase"><option value="">Todas</option><option ${state.filters.fase==='Pré-cadastro'?'selected':''}>Pré-cadastro</option><option ${state.filters.fase==='Validado'?'selected':''}>Validado</option><option ${state.filters.fase==='Gestão plena'?'selected':''}>Gestão plena</option></select></div>
        <div style="flex:1"><label>Tipo</label><select id="filtroTipo"><option value="">Todos</option><option ${state.filters.tipo==='Próprio'?'selected':''}>Próprio</option><option ${state.filters.tipo==='Locado'?'selected':''}>Locado</option></select></div>
        <div class="actions" style="margin-top:30px"><button class="secondary" onclick="clearImovelFilters()">Limpar filtros</button></div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Imóvel</th><th>Tipo</th><th>Fase</th><th>Órgão</th><th>Bairro</th><th>Pendências</th><th></th></tr></thead>
          <tbody>
            ${items.map(i => `<tr>
              <td>${i.id}</td>
              <td><strong>${i.nome}</strong><br><span class="card-subtitle">${i.endereco}</span></td>
              <td>${htmlBadge(i.tipo)}</td>
              <td>${htmlBadge(i.fase)}</td>
              <td>${i.orgao}</td>
              <td>${i.bairro}</td>
              <td>${i.pendencias}</td>
              <td><button class="link-button" onclick="setRoute('imoveis','${i.id}')">Ver ficha</button></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    `)}

    ${selected ? renderImovelDetail(selected) : card(`<div class="empty-state">Selecione um imóvel para abrir a ficha operacional.</div>`)}
  `;
}

function renderImovelDetail(imovel) {
  const docs = state.data.documentos.filter(d => d.imovelId === imovel.id);
  const pends = state.data.pendencias.filter(p => p.imovelId === imovel.id);
  const auds = state.data.auditoria.filter(a => a.alvo === imovel.id).slice(0, 5);

  const tabContent = {
    resumo: `
      <div class="info-grid">
        <div class="info-box"><strong>Tipo</strong>${htmlBadge(imovel.tipo)}</div>
        <div class="info-box"><strong>Fase</strong>${htmlBadge(imovel.fase)}</div>
        <div class="info-box"><strong>Status jurídico</strong>${htmlBadge(imovel.statusJuridico)}</div>
        <div class="info-box"><strong>Criticidade</strong>${htmlBadge(imovel.criticidade)}</div>
        <div class="info-box"><strong>Ocupação</strong>${htmlBadge(imovel.ocupacao)}</div>
        <div class="info-box"><strong>Conservação</strong>${htmlBadge(imovel.conservacao)}</div>
        <div class="info-box"><strong>Órgão</strong>${imovel.orgao}</div>
        <div class="info-box"><strong>Responsável</strong>${imovel.responsavel}</div>
        <div class="info-box"><strong>Destinação</strong>${imovel.destinacao}</div>
        <div class="info-box"><strong>Bairro</strong>${imovel.bairro}</div>
        <div class="info-box"><strong>Área do terreno</strong>${imovel.areaTerreno}</div>
        <div class="info-box"><strong>Área construída</strong>${imovel.areaConstruida}</div>
        <div class="info-box full"><strong>Endereço</strong>${imovel.endereco}</div>
        <div class="info-box full"><strong>Coordenadas</strong>${imovel.coordenadas}</div>
      </div>
      <div class="highlight" style="margin-top:14px"><strong>Observações operacionais</strong><br>${imovel.observacoes || 'Sem observações registradas.'}</div>
    `,
    documentos: docs.length ? `
      <div class="table-wrap"><table><thead><tr><th>Documento</th><th>Tipo</th><th>Status</th><th>Origem</th><th>Data</th></tr></thead><tbody>
      ${docs.map(d => `<tr><td>${d.nome}</td><td>${d.tipo}</td><td>${htmlBadge(d.status)}</td><td>${d.origem}</td><td>${d.data}</td></tr>`).join('')}
      </tbody></table></div>` : `<div class="empty-state">Sem documentos para este imóvel.</div>`,
    pendencias: pends.length ? `
      <div class="table-wrap"><table><thead><tr><th>Título</th><th>Criticidade</th><th>Responsável</th><th>Prazo</th><th>Status</th></tr></thead><tbody>
      ${pends.map(p => `<tr><td>${p.titulo}</td><td>${htmlBadge(p.criticidade)}</td><td>${p.responsavel}</td><td>${p.prazo}</td><td>${htmlBadge(p.status)}</td></tr>`).join('')}
      </tbody></table></div>` : `<div class="empty-state">Sem pendências abertas para este imóvel.</div>`,
    auditoria: auds.length ? `
      <div class="definition-list">
        ${auds.map(a => `<div class="definition-item"><strong>${a.data} · ${a.usuario}</strong>${a.acao}<br>${a.detalhe}</div>`).join('')}
      </div>` : `<div class="empty-state">Sem eventos de auditoria para este imóvel.</div>`
  };

  return card(`
    <div class="toolbar" style="justify-content:space-between">
      <div>
        <h3 style="margin-bottom:6px">${imovel.nome}</h3>
        <div class="card-subtitle">${imovel.id} · ${imovel.endereco}</div>
      </div>
      <div class="inline-list">
        <button class="secondary" onclick="openImovelEdit('${imovel.id}')">Editar imóvel</button>
        <button class="ghost" onclick="state.selectedId=null; render()">Fechar ficha</button>
      </div>
    </div>
    <div class="tabs">
      <button class="tab ${state.detailTab==='resumo'?'active':''}" onclick="setDetailTab('resumo')">Resumo</button>
      <button class="tab ${state.detailTab==='documentos'?'active':''}" onclick="setDetailTab('documentos')">Documentos (${docs.length})</button>
      <button class="tab ${state.detailTab==='pendencias'?'active':''}" onclick="setDetailTab('pendencias')">Pendências (${pends.length})</button>
      <button class="tab ${state.detailTab==='auditoria'?'active':''}" onclick="setDetailTab('auditoria')">Auditoria</button>
    </div>
    ${tabContent[state.detailTab]}
  `);
}

function renderWizard() {
  const steps = ['Identificação', 'Localização', 'Classificação', 'Ocupação', 'Fechamento'];
  const forms = [
    `<div class="form-grid">
      <div><label>ID</label><input id="f-id" placeholder="IMV-010" /></div>
      <div><label>Nome do imóvel</label><input id="f-nome" placeholder="Nome do imóvel" /></div>
      <div><label>Tipo</label><select id="f-tipo"><option>Próprio</option><option>Locado</option><option>Incerto</option></select></div>
      <div><label>Fase</label><select id="f-fase"><option>Pré-cadastro</option><option>Validado</option><option>Gestão plena</option></select></div>
    </div>`,
    `<div class="form-grid">
      <div><label>Bairro</label><input id="f-bairro" placeholder="Bairro" /></div>
      <div><label>Coordenadas</label><input id="f-coord" placeholder="-2.5, -44.2" /></div>
      <div class="full"><label>Endereço</label><input id="f-endereco" placeholder="Rua, número, referência" /></div>
    </div>`,
    `<div class="form-grid">
      <div><label>Status jurídico</label><select id="f-status-juridico"><option>Regular</option><option>Em apuração</option><option>Irregular</option></select></div>
      <div><label>Destinação</label><input id="f-destinacao" placeholder="Educação, Saúde, Operacional..." /></div>
      <div><label>Conservação</label><select id="f-conservacao"><option>Bom</option><option>Regular</option><option>Ruim</option></select></div>
      <div><label>Criticidade</label><select id="f-criticidade"><option>Baixa</option><option>Média</option><option>Alta</option><option>Crítica</option></select></div>
      <div><label>Área do terreno</label><input id="f-area-terreno" placeholder="m²" /></div>
      <div><label>Área construída</label><input id="f-area-construida" placeholder="m²" /></div>
    </div>`,
    `<div class="form-grid">
      <div><label>Ocupação</label><select id="f-ocupacao"><option>Ocupado</option><option>Desocupado</option><option>Desconhecido</option></select></div>
      <div><label>Órgão ocupante</label><input id="f-orgao" placeholder="SEMAD, SEMUS, SEMED..." /></div>
      <div class="full"><label>Responsável local</label><input id="f-responsavel" placeholder="Nome do responsável" /></div>
    </div>`,
    `<div class="form-grid">
      <div class="full"><label>Observações / evidências iniciais</label><textarea id="f-observacoes" rows="6" placeholder="Descreva evidências, documentos esperados, pendências ou contexto do cadastro."></textarea></div>
    </div>`
  ];

  return `
    ${card(`
      <div class="stepper">${steps.map((s, idx) => `<div class="step ${idx === state.wizardStep ? 'active' : ''}">${idx + 1}. ${s}</div>`).join('')}</div>
      <h3>Cadastro enxuto orientado à apresentação</h3>
      <p class="card-subtitle">O objetivo aqui é provar o fluxo do produto: registrar rápido, manter evidência e transformar falta de informação em pendência rastreável.</p>
      ${forms[state.wizardStep]}
      <div class="actions">
        ${state.wizardStep > 0 ? `<button class="secondary" onclick="state.wizardStep -= 1; render()">Voltar</button>` : ''}
        ${state.wizardStep < steps.length - 1 ? `<button class="primary" onclick="state.wizardStep += 1; render()">Próxima etapa</button>` : `<button class="primary" onclick="submitWizard()">Salvar imóvel</button>`}
      </div>
    `)}
  `;
}

function submitWizard() {
  const nome = document.getElementById('f-nome')?.value?.trim();
  if (!nome) return alert('Informe pelo menos o nome do imóvel para salvar o cadastro demo.');

  const newItem = {
    id: document.getElementById('f-id')?.value?.trim() || `IMV-${String(state.data.imoveis.length + 1).padStart(3, '0')}`,
    nome,
    tipo: document.getElementById('f-tipo')?.value || 'Incerto',
    fase: document.getElementById('f-fase')?.value || 'Pré-cadastro',
    ocupacao: document.getElementById('f-ocupacao')?.value || 'Desconhecido',
    orgao: document.getElementById('f-orgao')?.value || 'SEMAD',
    responsavel: document.getElementById('f-responsavel')?.value || 'A definir',
    bairro: document.getElementById('f-bairro')?.value || 'Não informado',
    endereco: document.getElementById('f-endereco')?.value || 'Não informado',
    coordenadas: document.getElementById('f-coord')?.value || 'Não informado',
    statusJuridico: document.getElementById('f-status-juridico')?.value || 'Em apuração',
    conservacao: document.getElementById('f-conservacao')?.value || 'Regular',
    criticidade: document.getElementById('f-criticidade')?.value || 'Baixa',
    destinacao: document.getElementById('f-destinacao')?.value || 'Em definição',
    areaTerreno: document.getElementById('f-area-terreno')?.value || '-',
    areaConstruida: document.getElementById('f-area-construida')?.value || '-',
    observacoes: document.getElementById('f-observacoes')?.value || 'Cadastro criado pelo wizard do MVP.',
    documentos: 0,
    pendencias: 1,
    ultimaAtualizacao: new Date().toISOString().slice(0, 10)
  };

  state.data.imoveis.unshift(newItem);
  state.data.pendencias.unshift({
    id: `PEN-${String(state.data.pendencias.length + 1).padStart(3, '0')}`,
    imovelId: newItem.id,
    titulo: 'Completar documentação inicial do cadastro',
    criticidade: 'Média',
    responsavel: 'SEMAD',
    prazo: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    status: 'Aberta'
  });
  state.data.auditoria.unshift({
    id: `AUD-${String(state.data.auditoria.length + 1).padStart(3, '0')}`,
    data: new Date().toLocaleString('pt-BR'),
    usuario: state.session.email,
    acao: 'Criou imóvel',
    alvo: newItem.id,
    detalhe: 'Cadastro realizado pelo wizard enxuto do MVP'
  });
  saveData();
  state.wizardStep = 0;
  setRoute('imoveis', newItem.id);
}

function renderDocumentos() {
  return card(`
    <div class="toolbar" style="justify-content:space-between">
      <div>
        <h3>Repositório documental</h3>
        <p class="card-subtitle">Aqui o MVP demonstra tipo, origem, data e status de validação dos documentos.</p>
      </div>
      <button class="primary" onclick="addDocument()">Adicionar documento demo</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>ID</th><th>Imóvel</th><th>Documento</th><th>Tipo</th><th>Status</th><th>Origem</th><th>Data</th></tr></thead>
        <tbody>
          ${state.data.documentos.map(d => {
            const i = getImovel(d.imovelId);
            return `<tr><td>${d.id}</td><td>${i ? i.nome : d.imovelId}</td><td>${d.nome}</td><td>${d.tipo}</td><td>${htmlBadge(d.status)}</td><td>${d.origem}</td><td>${d.data}</td></tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  `);
}

function addDocument() {
  const target = state.data.imoveis[0];
  state.data.documentos.unshift({
    id: `DOC-${String(state.data.documentos.length + 1).padStart(3, '0')}`,
    imovelId: target.id,
    nome: `Documento demo ${state.data.documentos.length + 1}.pdf`,
    tipo: 'Anexo',
    status: 'Não validado',
    origem: 'SEMAD',
    data: new Date().toISOString().slice(0, 10)
  });
  target.documentos += 1;
  state.data.auditoria.unshift({
    id: `AUD-${String(state.data.auditoria.length + 1).padStart(3, '0')}`,
    data: new Date().toLocaleString('pt-BR'),
    usuario: state.session.email,
    acao: 'Anexou documento',
    alvo: target.id,
    detalhe: 'Documento demo criado durante apresentação'
  });
  saveData();
  render();
}

function renderPendencias() {
  return card(`
    <div class="toolbar" style="justify-content:space-between">
      <div>
        <h3>Pendências operacionais</h3>
        <p class="card-subtitle">No SIGPIM, pendência é mecanismo de evolução do cadastro, não erro escondido.</p>
      </div>
      <button class="primary" onclick="resolveFirstPendencia()">Resolver 1ª pendência demo</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>ID</th><th>Título</th><th>Imóvel</th><th>Criticidade</th><th>Responsável</th><th>Prazo</th><th>Status</th></tr></thead>
        <tbody>
          ${state.data.pendencias.map(p => {
            const i = getImovel(p.imovelId);
            return `<tr><td>${p.id}</td><td>${p.titulo}</td><td>${i ? i.nome : p.imovelId}</td><td>${htmlBadge(p.criticidade)}</td><td>${p.responsavel}</td><td>${p.prazo}</td><td>${htmlBadge(p.status)}</td></tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  `);
}

function resolveFirstPendencia() {
  const pend = state.data.pendencias.find(p => p.status !== 'Concluída');
  if (!pend) return alert('Todas as pendências demo já estão concluídas.');
  pend.status = 'Concluída';
  const imovel = getImovel(pend.imovelId);
  if (imovel && imovel.pendencias > 0) imovel.pendencias -= 1;
  state.data.auditoria.unshift({
    id: `AUD-${String(state.data.auditoria.length + 1).padStart(3, '0')}`,
    data: new Date().toLocaleString('pt-BR'),
    usuario: state.session.email,
    acao: 'Concluiu pendência',
    alvo: pend.imovelId,
    detalhe: `${pend.titulo} marcada como concluída`
  });
  saveData();
  render();
}

function renderAuditoria() {
  return card(`
    <h3>Trilha de auditoria</h3>
    <p class="card-subtitle">Ideal para mostrar governança e rastreabilidade na apresentação.</p>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Data</th><th>Usuário</th><th>Ação</th><th>Alvo</th><th>Detalhe</th></tr></thead>
        <tbody>${state.data.auditoria.map(a => `<tr><td>${a.data}</td><td>${a.usuario}</td><td>${a.acao}</td><td>${a.alvo}</td><td>${a.detalhe}</td></tr>`).join('')}</tbody>
      </table>
    </div>
  `);
}

function renderRelatorios() {
  const total = state.data.imoveis.length;
  const proprios = state.data.imoveis.filter(i => i.tipo === 'Próprio').length;
  const locados = state.data.imoveis.filter(i => i.tipo === 'Locado').length;
  const criticas = state.data.pendencias.filter(p => p.criticidade === 'Crítica' && p.status !== 'Concluída').length;
  return `
    <section class="grid grid-3">
      ${card(`<h3>Relatório Executivo</h3><p class="card-subtitle">Resumo 1 página com status, ocupação, riscos e pendências principais.</p><button class="secondary" onclick="window.print()">Gerar visualmente</button>`)}
      ${card(`<h3>Relatório Técnico</h3><p class="card-subtitle">Visão detalhada por imóvel com conformidade, documentos e auditoria.</p><button class="secondary" onclick="window.print()">Gerar visualmente</button>`)}
      ${card(`<h3>Visão Portfólio</h3><p class="card-subtitle">Leitura consolidada por secretaria, fase, criticidade e volume de pendências.</p><button class="secondary" onclick="window.print()">Gerar visualmente</button>`)}
    </section>
    ${card(`
      <h3>Indicadores do recorte MVP</h3>
      <div class="status-grid">
        <div class="status-card"><div class="label">Imóveis</div><div class="value">${total}</div></div>
        <div class="status-card"><div class="label">Próprios</div><div class="value">${proprios}</div></div>
        <div class="status-card"><div class="label">Locados</div><div class="value">${locados}</div></div>
        <div class="status-card"><div class="label">Pendências críticas abertas</div><div class="value">${criticas}</div></div>
      </div>
    `)}
  `;
}

function renderUsuarios() {
  return card(`
    <div class="toolbar" style="justify-content:space-between">
      <div>
        <h3>Usuários e perfis</h3>
        <p class="card-subtitle">Recorte básico de governança de acesso para o MVP.</p>
      </div>
      <button class="primary" onclick="openUserCreate()">Novo usuário</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Órgão</th><th>Status</th><th></th></tr></thead>
        <tbody>
          ${state.data.usuarios.map(u => `<tr><td>${u.nome}</td><td>${u.email}</td><td>${htmlBadge(u.perfil)}</td><td>${u.orgao}</td><td>${htmlBadge(u.status)}</td><td><button class="link-button" onclick="toggleUserStatus('${u.id}')">Alternar status</button></td></tr>`).join('')}
        </tbody>
      </table>
    </div>
  `);
}

function openUserCreate() {
  openModal('Novo usuário', `
    <div class="form-grid">
      <div><label>Nome</label><input id="u-nome" placeholder="Nome completo" /></div>
      <div><label>E-mail</label><input id="u-email" placeholder="email@sigpim.local" /></div>
      <div><label>Perfil</label><select id="u-perfil"><option>Administrador do sistema</option><option>Administrador patrimonial</option><option>Cadastrador setorial</option><option>Validador documental/jurídico</option><option>Vistoriador</option><option>Planejamento</option><option>Auditor/Controladoria</option></select></div>
      <div><label>Órgão</label><input id="u-orgao" placeholder="SEMAD" /></div>
    </div>
    <div class="actions"><button class="secondary" onclick="closeModal()">Cancelar</button><button class="primary" onclick="submitUserCreate()">Salvar usuário</button></div>
  `);
}

function submitUserCreate() {
  const nome = document.getElementById('u-nome').value.trim();
  const email = document.getElementById('u-email').value.trim();
  if (!nome || !email) return alert('Preencha nome e e-mail.');
  state.data.usuarios.unshift({
    id: `USR-${String(state.data.usuarios.length + 1).padStart(3, '0')}`,
    nome,
    email,
    perfil: document.getElementById('u-perfil').value,
    orgao: document.getElementById('u-orgao').value || 'SEMAD',
    status: 'Ativo'
  });
  state.data.auditoria.unshift({
    id: `AUD-${String(state.data.auditoria.length + 1).padStart(3, '0')}`,
    data: new Date().toLocaleString('pt-BR'),
    usuario: state.session.email,
    acao: 'Criou usuário',
    alvo: email,
    detalhe: 'Usuário criado via gestão básica do MVP'
  });
  saveData();
  closeModal();
  render();
}

function toggleUserStatus(id) {
  const user = state.data.usuarios.find(u => u.id === id);
  user.status = user.status === 'Ativo' ? 'Inativo' : 'Ativo';
  saveData();
  render();
}

function renderConfiguracoes() {
  return `
    <section class="grid grid-2">
      ${card(`<h3>Catálogos mínimos</h3><div class="definition-list"><div class="definition-item"><strong>Tipos de imóvel</strong>Próprio, Locado, Incerto</div><div class="definition-item"><strong>Fases</strong>Pré-cadastro, Validado, Gestão plena</div><div class="definition-item"><strong>Criticidade</strong>Baixa, Média, Alta, Crítica</div><div class="definition-item"><strong>Status documental</strong>Validado, Não validado</div></div>`) }
      ${card(`<h3>Decisões do recorte MVP</h3><div class="definition-list"><div class="definition-item"><strong>Sem backend real</strong>Persistência local para apresentação funcional.</div><div class="definition-item"><strong>Sem upload real</strong>Documentos são simulados para demonstrar o fluxo.</div><div class="definition-item"><strong>Sem GIS operacional completo</strong>Coordenadas e localização demonstrativas.</div><div class="definition-item"><strong>Foco em validação</strong>Fluxo, navegação, narrativa e aderência ao SIGPIM.</div></div>`) }
    </section>
  `;
}

function clearImovelFilters() {
  state.filters = { busca: '', fase: '', tipo: '' };
  render();
}

function openImovelEdit(id) {
  const i = getImovel(id);
  openModal(`Editar imóvel · ${i.id}`, `
    <div class="form-grid">
      <div><label>Nome</label><input id="e-nome" value="${i.nome}" /></div>
      <div><label>Órgão</label><input id="e-orgao" value="${i.orgao}" /></div>
      <div><label>Fase</label><select id="e-fase"><option ${i.fase==='Pré-cadastro'?'selected':''}>Pré-cadastro</option><option ${i.fase==='Validado'?'selected':''}>Validado</option><option ${i.fase==='Gestão plena'?'selected':''}>Gestão plena</option></select></div>
      <div><label>Criticidade</label><select id="e-criticidade"><option ${i.criticidade==='Baixa'?'selected':''}>Baixa</option><option ${i.criticidade==='Média'?'selected':''}>Média</option><option ${i.criticidade==='Alta'?'selected':''}>Alta</option><option ${i.criticidade==='Crítica'?'selected':''}>Crítica</option></select></div>
      <div class="full"><label>Observações</label><textarea id="e-observacoes" rows="5">${i.observacoes || ''}</textarea></div>
    </div>
    <div class="actions"><button class="secondary" onclick="closeModal()">Cancelar</button><button class="primary" onclick="submitImovelEdit('${i.id}')">Salvar alterações</button></div>
  `);
}

function submitImovelEdit(id) {
  const i = getImovel(id);
  i.nome = document.getElementById('e-nome').value.trim() || i.nome;
  i.orgao = document.getElementById('e-orgao').value.trim() || i.orgao;
  i.fase = document.getElementById('e-fase').value;
  i.criticidade = document.getElementById('e-criticidade').value;
  i.observacoes = document.getElementById('e-observacoes').value.trim();
  i.ultimaAtualizacao = new Date().toISOString().slice(0, 10);
  state.data.auditoria.unshift({
    id: `AUD-${String(state.data.auditoria.length + 1).padStart(3, '0')}`,
    data: new Date().toLocaleString('pt-BR'),
    usuario: state.session.email,
    acao: 'Atualizou imóvel',
    alvo: i.id,
    detalhe: 'Campos principais ajustados pela ficha operacional'
  });
  saveData();
  closeModal();
  render();
}

function openModal(title, body) {
  document.getElementById('modalRoot').innerHTML = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-header">
          <div><h3>${title}</h3></div>
          <button class="close-btn" onclick="closeModal()">✕</button>
        </div>
        ${body}
      </div>
    </div>
  `;
}

function closeModal() {
  document.getElementById('modalRoot').innerHTML = '';
}

function renderRoute() {
  switch (state.route) {
    case 'dashboard': return renderDashboard();
    case 'imoveis': return renderImoveis();
    case 'novo-imovel': return renderWizard();
    case 'documentos': return renderDocumentos();
    case 'pendencias': return renderPendencias();
    case 'auditoria': return renderAuditoria();
    case 'relatorios': return renderRelatorios();
    case 'usuarios': return renderUsuarios();
    case 'configuracoes': return renderConfiguracoes();
    default: return renderDashboard();
  }
}

function updateMenuState() {
  document.querySelectorAll('.menu-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.route === state.route);
  });
}

function bindDynamicEvents() {
  const busca = document.getElementById('filtroBusca');
  if (busca) busca.addEventListener('input', e => { state.filters.busca = e.target.value; render(); });
  const fase = document.getElementById('filtroFase');
  if (fase) fase.addEventListener('change', e => { state.filters.fase = e.target.value; render(); });
  const tipo = document.getElementById('filtroTipo');
  if (tipo) tipo.addEventListener('change', e => { state.filters.tipo = e.target.value; render(); });
}

function render() {
  const [title, subtitle] = routesMeta[state.route] || routesMeta.dashboard;
  document.getElementById('pageTitle').textContent = title;
  document.getElementById('pageSubtitle').textContent = subtitle;
  document.getElementById('content').innerHTML = renderRoute();
  updateMenuState();
  bindDynamicEvents();
}

window.setRoute = setRoute;
window.setDetailTab = setDetailTab;
window.render = render;
window.submitWizard = submitWizard;
window.openUserCreate = openUserCreate;
window.submitUserCreate = submitUserCreate;
window.toggleUserStatus = toggleUserStatus;
window.openImovelEdit = openImovelEdit;
window.submitImovelEdit = submitImovelEdit;
window.clearImovelFilters = clearImovelFilters;
window.addDocument = addDocument;
window.resolveFirstPendencia = resolveFirstPendencia;
window.closeModal = closeModal;

document.getElementById('menu').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-route]');
  if (!btn) return;
  setRoute(btn.dataset.route);
  if (window.innerWidth <= 840) document.getElementById('sidebar').classList.remove('open');
});
document.getElementById('seedDataBtn').addEventListener('click', resetData);
document.getElementById('toggleSidebar').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));
document.getElementById('logoutBtn').addEventListener('click', logout);
document.getElementById('printBtn').addEventListener('click', () => window.print());

state.session = loadSession();
if (state.session) {
  mountApp();
} else {
  renderLogin();
}
