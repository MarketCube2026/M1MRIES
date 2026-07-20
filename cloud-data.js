(function () {
  const config = window.MEETING_SUPPORT_CLOUD_CONFIG || {};
  const sessionKey = "meetingSupportSupabaseSession";

  function isConfigured() {
    return Boolean(config.enabled && config.supabaseUrl && config.supabaseAnonKey);
  }

  function isCloudOnly() {
    return config.cloudOnly !== false;
  }

  function assertConfigured() {
    if (!config.enabled || !config.supabaseUrl) {
      throw new Error("云端数据库尚未启用，请检查 cloud-config.js。");
    }
    if (!config.supabaseAnonKey) {
      throw new Error("Supabase anon public key 尚未配置，请在 cloud-config.js 填入 supabaseAnonKey。");
    }
  }

  function tableName() {
    return config.tableName || "applications";
  }

  function endpoint(path) {
    return `${String(config.supabaseUrl).replace(/\/$/, "")}${path}`;
  }

  function loadSession() {
    try {
      const raw = localStorage.getItem(sessionKey);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function saveSession(session) {
    if (session && session.access_token) {
      localStorage.setItem(sessionKey, JSON.stringify(session));
    } else {
      localStorage.removeItem(sessionKey);
    }
  }

  function authHeader() {
    const session = loadSession();
    return session && session.access_token ? `Bearer ${session.access_token}` : `Bearer ${config.supabaseAnonKey}`;
  }

  function headers(extra = {}) {
    return {
      apikey: config.supabaseAnonKey,
      Authorization: authHeader(),
      "Content-Type": "application/json",
      ...extra
    };
  }

  function localList(storageKey) {
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function persistLocal(storageKey, records) {
    localStorage.setItem(storageKey, JSON.stringify(records || []));
  }

  function asNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function toDbRow(record) {
    const form = record.form || {};
    const scores = record.scores || {};
    const details = record.details || {};
    const support = record.support || {};
    return {
      id: record.id,
      status: record.status || "saved",
      updated_at: record.updatedAt || new Date().toISOString(),
      project_name: form.projectName || null,
      applicant: form.applicant || null,
      kol: form.kol || null,
      region: form.region || null,
      district: form.district || null,
      meeting_date: form.meetingDate || null,
      hospital: form.hospital || null,
      requested_amount: asNumber(form.requestAmount),
      meeting_level: form.meetingLevel || null,
      academic_rights: form.academicRights || null,
      expert_level: form.expertLevel || null,
      product_type: form.productType || null,
      hospital_value: form.hospitalValue || null,
      monthly_sales: asNumber(form.monthlySales),
      sales_trend: form.salesTrend || null,
      growth_opportunity: form.growthOpportunity || null,
      communication_value: form.communicationValue || null,
      execution_quality: form.executionQuality || null,
      meeting_content: form.meetingContent || null,
      meeting_level_score: asNumber(details.meetingLevel),
      academic_rights_score: asNumber(details.academicRights),
      expert_level_score: asNumber(details.expertLevel),
      product_type_score: asNumber(details.productType),
      hospital_value_score: asNumber(details.hospitalValue),
      monthly_sales_score: asNumber(details.monthlySales),
      sales_trend_score: asNumber(details.salesTrend),
      growth_opportunity_score: asNumber(details.growthOpportunity),
      communication_value_score: asNumber(details.communicationValue),
      execution_quality_score: asNumber(details.executionQuality),
      medical_score: asNumber(scores.medical),
      strategy_score: asNumber(scores.strategy),
      business_score: asNumber(scores.business),
      communication_score: asNumber(scores.communication),
      execution_score: asNumber(scores.execution),
      total_score: asNumber(scores.total),
      support_level: support.level || null,
      support_range: support.range || null,
      support_amount: asNumber(support.amount),
      budget_note: record.budgetNote || null,
      evaluation: record.evaluation || null,
      raw_payload: record
    };
  }

  function fromDbRow(row) {
    const raw = row.raw_payload && typeof row.raw_payload === "object" ? row.raw_payload : null;
    if (raw) {
      return {
        ...raw,
        id: row.id || raw.id,
        status: row.status || raw.status || "saved",
        updatedAt: row.updated_at || raw.updatedAt || row.created_at
      };
    }
    return {
      id: row.id,
      status: row.status || "saved",
      updatedAt: row.updated_at || row.created_at,
      form: {
        applicant: row.applicant || "",
        projectName: row.project_name || "",
        hospital: row.hospital || "",
        kol: row.kol || "",
        region: row.region || "",
        district: row.district || "",
        meetingDate: row.meeting_date || "",
        requestAmount: row.requested_amount ?? "",
        meetingLevel: row.meeting_level || "",
        academicRights: row.academic_rights || "",
        expertLevel: row.expert_level || "",
        productType: row.product_type || "",
        hospitalValue: row.hospital_value || "",
        monthlySales: row.monthly_sales ?? "",
        salesTrend: row.sales_trend || "",
        growthOpportunity: row.growth_opportunity || "",
        communicationValue: row.communication_value || "",
        executionQuality: row.execution_quality || "",
        meetingContent: row.meeting_content || ""
      },
      details: {
        meetingLevel: row.meeting_level_score || 0,
        academicRights: row.academic_rights_score || 0,
        expertLevel: row.expert_level_score || 0,
        productType: row.product_type_score || 0,
        hospitalValue: row.hospital_value_score || 0,
        monthlySales: row.monthly_sales_score || 0,
        salesTrend: row.sales_trend_score || 0,
        growthOpportunity: row.growth_opportunity_score || 0,
        communicationValue: row.communication_value_score || 0,
        executionQuality: row.execution_quality_score || 0
      },
      scores: {
        medical: row.medical_score || 0,
        strategy: row.strategy_score || 0,
        business: row.business_score || 0,
        communication: row.communication_score || 0,
        execution: row.execution_score || 0,
        total: row.total_score || 0
      },
      support: {
        level: row.support_level || "",
        range: row.support_range || "",
        amount: row.support_amount || 0
      },
      budgetNote: row.budget_note || "",
      evaluation: row.evaluation || ""
    };
  }

  async function listRecords(storageKey) {
    assertConfigured();
    const response = await fetch(endpoint(`/rest/v1/${tableName()}?select=*&order=updated_at.desc`), {
      headers: headers(),
      cache: "no-store"
    });
    if (!response.ok) throw new Error(await response.text());
    const rows = await response.json();
    const records = Array.isArray(rows) ? rows.map(fromDbRow) : [];
    persistLocal(storageKey, records);
    return { ok: true, source: "cloud", records };
  }

  async function saveRecord(record, storageKey) {
    assertConfigured();
    const response = await fetch(endpoint(`/rest/v1/${tableName()}`), {
      method: "POST",
      headers: headers({ Prefer: "return=representation" }),
      body: JSON.stringify(toDbRow(record))
    });
    if (!response.ok) throw new Error(await response.text());
    const rows = await response.json();
    const saved = rows && rows[0] ? fromDbRow(rows[0]) : record;
    const local = [saved, ...localList(storageKey).filter((item) => item.id !== saved.id)];
    persistLocal(storageKey, local);
    return { ok: true, source: "cloud", record: saved };
  }

  async function deleteRecord(id, storageKey) {
    assertConfigured();
    const response = await fetch(endpoint(`/rest/v1/${tableName()}?id=eq.${encodeURIComponent(id)}`), {
      method: "DELETE",
      headers: headers()
    });
    if (!response.ok) throw new Error(await response.text());
    const records = localList(storageKey).filter((record) => record.id !== id);
    persistLocal(storageKey, records);
    return { ok: true, source: "cloud", records };
  }

  async function clearRecords(storageKey) {
    assertConfigured();
    const response = await fetch(endpoint(`/rest/v1/${tableName()}?id=not.is.null`), {
      method: "DELETE",
      headers: headers()
    });
    if (!response.ok) throw new Error(await response.text());
    persistLocal(storageKey, []);
    return { ok: true, source: "cloud", records: [] };
  }

  async function signIn(email, password) {
    if (!isConfigured()) throw new Error("Supabase 尚未配置");
    const response = await fetch(endpoint("/auth/v1/token?grant_type=password"), {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) throw new Error(await response.text());
    const session = await response.json();
    saveSession(session);
    return session;
  }

  function signOut() {
    saveSession(null);
  }

  function mountCloudBar(container) {
    if (!container || !config.enabled || !config.supabaseUrl) return;
    const style = document.createElement("style");
    style.textContent = ".cloud-bar{display:flex;gap:10px;align-items:center;justify-content:space-between;margin:0 0 14px;padding:10px 12px;border:1px solid #d9dfd8;border-radius:8px;background:#fff}.cloud-bar small{color:#65716c}.cloud-login{display:flex;gap:8px;flex-wrap:wrap}.cloud-login input{width:180px;min-height:34px}.cloud-login button{min-height:34px;border:1px solid #d9dfd8;border-radius:8px;background:#fff;padding:0 12px;cursor:pointer}";
    document.head.appendChild(style);
    const bar = document.createElement("div");
    bar.className = "cloud-bar";
    container.prepend(bar);

    function render(message) {
      const session = loadSession();
      if (!config.supabaseAnonKey) {
        bar.innerHTML = `<small>云端数据库已指定，但尚未填写 Supabase anon public key。请在 cloud-config.js 中配置 supabaseAnonKey 后再保存和查看记录。</small>`;
        return;
      }
      if (!config.authRequired) {
        bar.innerHTML = `<small>云端数据已启用：保存后自动同步到 Supabase。</small>`;
        return;
      }
      if (session && session.user) {
        bar.innerHTML = `<small>已登录：${session.user.email || "当前用户"}，数据将同步到云端。</small><div class="cloud-login"><button type="button" data-cloud-logout>退出</button></div>`;
        bar.querySelector("[data-cloud-logout]").addEventListener("click", () => {
          signOut();
          render("已退出");
        });
        return;
      }
      bar.innerHTML = `<small>${message || "请登录后保存和查看云端申请记录。"}</small><div class="cloud-login"><input type="email" placeholder="邮箱" data-cloud-email><input type="password" placeholder="密码" data-cloud-password><button type="button" data-cloud-login>登录</button></div>`;
      bar.querySelector("[data-cloud-login]").addEventListener("click", async () => {
        const email = bar.querySelector("[data-cloud-email]").value.trim();
        const password = bar.querySelector("[data-cloud-password]").value;
        try {
          await signIn(email, password);
          render();
          window.dispatchEvent(new CustomEvent("meeting-support-cloud-auth"));
        } catch (error) {
          render("登录失败，请检查邮箱、密码或 Supabase Auth 设置。");
        }
      });
    }

    render();
  }

  window.MeetingSupportData = {
    isConfigured,
    isCloudOnly,
    loadSession,
    mountCloudBar,
    listRecords,
    saveRecord,
    deleteRecord,
    clearRecords
  };
})();
