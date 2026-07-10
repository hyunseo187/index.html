import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import {
  Stethoscope,
  ClipboardList,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Users,
  Loader2,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const STYLE_META = {
  jargon: { label: "전문어만", short: "전문어", color: "#B5555A" },
  easy: { label: "쉬운 말만", short: "쉬운 말", color: "#2F7A73" },
  detailed: { label: "전문어 + 자세한 설명", short: "전문어+설명", color: "#C98A2E" },
};

const STYLE_KEYS = ["jargon", "easy", "detailed"];

const TOPICS = [
  {
    id: "htn",
    title: "고혈압",
    subtitle: "본태성 고혈압 진단 및 치료 안내",
    texts: {
      jargon:
        "환자는 본태성 고혈압(essential hypertension) 진단 하에 수축기혈압 150mmHg, 이완기혈압 95mmHg로 측정되었으며, ACE 억제제 투여를 통한 혈압 강하 및 표적장기손상(target organ damage) 예방을 위한 약물요법을 시작합니다. 정기적인 혈압 모니터링과 함께 나트륨 섭취 제한을 권고드립니다.",
      easy:
        "혈압이 정상보다 많이 높아요. 위쪽 숫자가 150, 아래쪽 숫자가 95인데, 보통은 120/80 정도가 좋아요. 혈압을 낮추는 약을 드릴게요. 짠 음식을 줄이고, 혈압을 자주 재보시는 게 좋아요. 혈압이 계속 높으면 심장이나 콩팥에 무리가 갈 수 있어요.",
      detailed:
        "환자분은 '본태성 고혈압'이라는 진단을 받으셨어요. 쉽게 말하면 특별한 원인 없이 혈압이 꾸준히 높은 상태를 말해요. 지금 혈압은 150/95인데, 정상은 120/80 이하예요. 앞으로 혈압을 낮추기 위해 'ACE 억제제'라는 약을 드릴 건데, 이 약은 혈관을 좁히는 호르몬 작용을 막아서 혈관을 편하게 넓혀주는 역할을 해요. 혈압이 오래 높으면 심장이나 콩팥 같은 장기(의학용어로 '표적장기')에 손상이 갈 수 있어서, 이를 예방하려는 목적도 있어요. 짠 음식을 줄이고 혈압을 정기적으로 체크해 주세요.",
    },
  },
  {
    id: "dm",
    title: "당뇨병",
    subtitle: "제2형 당뇨병 진단 및 치료 안내",
    texts: {
      jargon:
        "공복혈당 148mg/dL, 당화혈색소(HbA1c) 7.8%로 제2형 당뇨병(Type 2 Diabetes Mellitus) 진단 기준에 부합합니다. 메트포르민(metformin) 투여를 통한 인슐린 저항성 개선 및 혈당 조절을 시작하며, 정기적인 자가혈당측정과 식이요법 병행을 권고합니다.",
      easy:
        "혈당이 많이 높아요. 밥 먹기 전 혈당이 148인데, 정상은 100 아래예요. 최근 3개월 평균 혈당을 보는 검사도 높게 나왔어요. 이건 '당뇨병'이라는 병이에요. 혈당을 낮추는 약을 드릴 거고요, 집에서 혈당을 직접 재보시고, 식사도 조절해 주셔야 해요.",
      detailed:
        "검사 결과 공복 혈당이 148로 정상(100 이하)보다 높고, 최근 3개월 평균 혈당 상태를 보여주는 '당화혈색소' 수치도 7.8%로 높게 나와서 '제2형 당뇨병'으로 진단됩니다. 이는 몸에서 만든 인슐린이 있어도 그 효과가 잘 안 먹히는, 즉 '인슐린 저항성'이 생긴 상태예요. '메트포르민'이라는 약을 드릴 건데, 이 약은 몸이 인슐린을 더 잘 활용하도록 도와서 혈당을 낮춰줘요. 집에서 직접 혈당을 재는 습관을 들이시고, 식사 조절도 함께 해주셔야 효과가 좋아요.",
    },
  },
];

const SCALE_LABELS = ["매우 어려움", "어려움", "보통", "쉬움", "매우 쉬움"];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function emptyRatings() {
  const r = {};
  TOPICS.forEach((t) => {
    r[t.id] = { jargon: null, easy: null, detailed: null };
  });
  return r;
}

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function Thermometer({ value, color, onChange }) {
  return (
    <div className="thermo-shell">
      <div
        className="thermo-bulb"
        style={{ background: value ? color : "#DCE3E2" }}
      >
        {value || ""}
      </div>
      <div className="thermo-track">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={SCALE_LABELS[n - 1]}
            className="thermo-seg"
            onClick={() => onChange(n)}
            style={{
              background: value >= n ? color : "#E7ECEB",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ExplanationCard({ label, badgeColor, text, value, onChange }) {
  return (
    <div className="exp-card">
      <div className="exp-card-badge" style={{ background: badgeColor }}>
        {label}
      </div>
      <p className="exp-card-text">{text}</p>
      <div className="exp-card-rating">
        <span className="rating-caption">이 설명, 이해하기 얼마나 쉬웠나요?</span>
        <Thermometer value={value} color={badgeColor} onChange={onChange} />
        <div className="thermo-scale-labels">
          <span>매우 어려움</span>
          <span>매우 쉬움</span>
        </div>
      </div>
    </div>
  );
}

function ProgressRail({ step, total }) {
  return (
    <div className="progress-rail">
      <div className="progress-line">
        <div
          className="progress-line-fill"
          style={{ width: `${(step / (total - 1)) * 100}%` }}
        />
      </div>
      <div className="progress-dots">
        {TOPICS.map((t, i) => (
          <div key={t.id} className="progress-dot-wrap">
            <div className={`progress-dot ${i <= step ? "filled" : ""} ${i === step ? "current" : ""}`}>
              {i < step ? <CheckCircle2 size={13} /> : i + 1}
            </div>
            <span className="progress-dot-label">{t.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main app                                                             */
/* ------------------------------------------------------------------ */

export default function MedicalExplanationSurvey() {
  const [screen, setScreen] = useState("intro"); // intro | survey | submitting | results
  const [topicIndex, setTopicIndex] = useState(0);
  const [ratings, setRatings] = useState(emptyRatings());
  const [orderMap] = useState(() => {
    const m = {};
    TOPICS.forEach((t) => {
      m[t.id] = shuffle(STYLE_KEYS);
    });
    return m;
  });

  const [responses, setResponses] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState(null);
  const [justSubmittedId, setJustSubmittedId] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [pendingPayload, setPendingPayload] = useState(null);

  const currentTopic = TOPICS[topicIndex];
  const currentOrder = orderMap[currentTopic.id];
  const currentTopicRatings = ratings[currentTopic.id];
  const allRatedForTopic = STYLE_KEYS.every(
    (k) => currentTopicRatings[k] !== null
  );

  const setRating = useCallback(
    (styleKey, value) => {
      setRatings((prev) => ({
        ...prev,
        [currentTopic.id]: { ...prev[currentTopic.id], [styleKey]: value },
      }));
    },
    [currentTopic.id]
  );

  const goNext = async () => {
    if (topicIndex < TOPICS.length - 1) {
      setTopicIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      await submitSurvey();
    }
  };

  const goPrev = () => {
    if (topicIndex > 0) {
      setTopicIndex((i) => i - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const saveResponse = async (payload) => {
    const key = `response:${payload.id}`;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await window.storage.set(key, JSON.stringify(payload), true);
        if (result) {
          // verify the write actually landed by reading it back
          const check = await window.storage.get(key, true);
          if (check && check.value) return true;
        }
      } catch (e) {
        console.error(`저장 시도 ${attempt}회 실패:`, e);
      }
      // brief backoff before retrying
      await new Promise((res) => setTimeout(res, 400 * attempt));
    }
    return false;
  };

  const submitSurvey = async () => {
    setScreen("submitting");
    setSubmitError(null);
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const payload = { id, timestamp: Date.now(), ratings };
    setPendingPayload(payload);

    const ok = await saveResponse(payload);

    if (!ok) {
      setSubmitError("응답 저장에 실패했어요. 네트워크 상태를 확인하고 다시 시도해 주세요.");
      setScreen("submit_error");
      return;
    }

    setJustSubmittedId(id);
    await loadResults();
    setScreen("results");
  };

  const retrySubmit = async () => {
    if (!pendingPayload) {
      await submitSurvey();
      return;
    }
    setScreen("submitting");
    setSubmitError(null);
    const ok = await saveResponse(pendingPayload);
    if (!ok) {
      setSubmitError("이번에도 저장에 실패했어요. 잠시 후 다시 시도해 주세요.");
      setScreen("submit_error");
      return;
    }
    setJustSubmittedId(pendingPayload.id);
    await loadResults();
    setScreen("results");
  };

  const loadResults = async () => {
    setResultsLoading(true);
    setResultsError(null);
    try {
      const list = await window.storage.list("response:", true);
      const keys = list && list.keys ? list.keys : [];
      const items = [];
      for (const key of keys) {
        try {
          const res = await window.storage.get(key, true);
          if (res && res.value) {
            items.push(JSON.parse(res.value));
          }
        } catch (e) {
          // skip unreadable entry
        }
      }
      setResponses(items);
    } catch (e) {
      setResultsError("결과를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
    setResultsLoading(false);
  };

  useEffect(() => {
    if (screen === "results" && responses.length === 0 && !resultsLoading) {
      loadResults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  const restart = () => {
    setRatings(emptyRatings());
    setTopicIndex(0);
    setJustSubmittedId(null);
    setSubmitError(null);
    setPendingPayload(null);
    setScreen("intro");
  };

  /* ---------------- aggregate results ---------------- */

  const stats = useMemo(() => {
    if (responses.length === 0) return null;

    const overallSum = { jargon: 0, easy: 0, detailed: 0 };
    const overallCount = { jargon: 0, easy: 0, detailed: 0 };
    const perTopic = {};
    const winCounts = { jargon: 0, easy: 0, detailed: 0 };

    TOPICS.forEach((t) => {
      perTopic[t.id] = {
        name: t.title,
        jargonSum: 0,
        easySum: 0,
        detailedSum: 0,
        n: 0,
      };
    });

    responses.forEach((r) => {
      TOPICS.forEach((t) => {
        const tr = r.ratings && r.ratings[t.id];
        if (!tr) return;
        const vals = STYLE_KEYS.map((k) => tr[k]);
        if (vals.some((v) => v === null || v === undefined)) return;

        STYLE_KEYS.forEach((k) => {
          overallSum[k] += tr[k];
          overallCount[k] += 1;
        });
        perTopic[t.id].jargonSum += tr.jargon;
        perTopic[t.id].easySum += tr.easy;
        perTopic[t.id].detailedSum += tr.detailed;
        perTopic[t.id].n += 1;

        const max = Math.max(tr.jargon, tr.easy, tr.detailed);
        const winners = STYLE_KEYS.filter((k) => tr[k] === max);
        if (winners.length === 1) winCounts[winners[0]] += 1;
      });
    });

    const overallAvg = {};
    STYLE_KEYS.forEach((k) => {
      overallAvg[k] = overallCount[k] ? overallSum[k] / overallCount[k] : 0;
    });

    const perTopicChartData = TOPICS.map((t) => {
      const p = perTopic[t.id];
      return {
        name: t.title,
        전문어만: p.n ? +(p.jargonSum / p.n).toFixed(2) : 0,
        쉬운말: p.n ? +(p.easySum / p.n).toFixed(2) : 0,
        "전문어+설명": p.n ? +(p.detailedSum / p.n).toFixed(2) : 0,
      };
    });

    const overallChartData = STYLE_KEYS.map((k) => ({
      name: STYLE_META[k].label,
      평균이해도: +overallAvg[k].toFixed(2),
      key: k,
    }));

    return {
      respondents: responses.length,
      overallAvg,
      perTopicChartData,
      overallChartData,
      winCounts,
    };
  }, [responses]);

  /* ---------------- render ---------------- */

  return (
    <div className="survey-app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@500;600;700&family=Noto+Sans+KR:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');

        .survey-app {
          --bg: #F5F7F6;
          --card: #FFFFFF;
          --ink: #1E2D2B;
          --ink-soft: #55625F;
          --border: #DCE3E2;
          --jargon: #B5555A;
          --easy: #2F7A73;
          --detailed: #C98A2E;
          font-family: 'Noto Sans KR', sans-serif;
          background: var(--bg);
          color: var(--ink);
          min-height: 100vh;
          padding: 32px 16px 80px;
          box-sizing: border-box;
        }
        .survey-app * { box-sizing: border-box; }
        .survey-app h1, .survey-app h2, .survey-app h3, .font-serif {
          font-family: 'Noto Serif KR', serif;
        }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }

        .shell { max-width: 720px; margin: 0 auto; }

        .eyebrow {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; letter-spacing: 0.08em; font-weight: 600;
          color: var(--ink-soft); text-transform: uppercase;
          background: #ECF1F0; border: 1px solid var(--border);
          padding: 5px 11px; border-radius: 999px;
        }

        /* ---- intro ---- */
        .intro-hero { text-align: center; padding: 20px 0 8px; }
        .intro-title {
          font-size: 32px; font-weight: 700; line-height: 1.35; margin: 18px 0 12px;
        }
        .intro-desc {
          color: var(--ink-soft); font-size: 15px; line-height: 1.7; max-width: 520px;
          margin: 0 auto 28px;
        }
        .ecg-divider { width: 100%; max-width: 420px; margin: 0 auto 28px; display:block; }
        .ecg-path {
          stroke: var(--easy); stroke-width: 2; fill: none;
          stroke-dasharray: 600; stroke-dashoffset: 600;
          animation: draw 1.6s ease-out forwards;
        }
        @keyframes draw { to { stroke-dashoffset: 0; } }

        .intro-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 32px; }
        @media (max-width: 560px) { .intro-cards { grid-template-columns: 1fr; } }
        .intro-style-card {
          background: var(--card); border: 1px solid var(--border); border-radius: 12px;
          padding: 16px 14px; text-align: left;
        }
        .intro-style-dot { width: 10px; height: 10px; border-radius: 50%; margin-bottom: 10px; }
        .intro-style-name { font-weight: 700; font-size: 14px; margin-bottom: 4px; }
        .intro-style-desc { font-size: 12.5px; color: var(--ink-soft); line-height: 1.5; }

        .btn-row { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        .btn {
          font-family: 'Noto Sans KR', sans-serif; font-weight: 600; font-size: 14.5px;
          padding: 13px 26px; border-radius: 10px; border: 1px solid transparent;
          cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
          transition: transform 0.12s ease, box-shadow 0.12s ease;
        }
        .btn:active { transform: scale(0.97); }
        .btn-primary { background: var(--easy); color: #fff; }
        .btn-primary:hover { box-shadow: 0 4px 14px rgba(47,122,115,0.28); }
        .btn-ghost { background: transparent; color: var(--ink); border-color: var(--border); }
        .btn-ghost:hover { background: #ECF1F0; }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* ---- progress rail ---- */
        .progress-rail { margin-bottom: 28px; }
        .progress-line { height: 2px; background: var(--border); border-radius: 2px; position: relative; margin-bottom: 14px; }
        .progress-line-fill { position: absolute; top: 0; left: 0; height: 100%; background: var(--easy); border-radius: 2px; transition: width 0.3s ease; }
        .progress-dots { display: flex; justify-content: space-between; }
        .progress-dot-wrap { display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .progress-dot {
          width: 26px; height: 26px; border-radius: 50%; background: var(--card);
          border: 2px solid var(--border); color: var(--ink-soft);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; font-family: 'IBM Plex Mono', monospace;
        }
        .progress-dot.filled { border-color: var(--easy); color: var(--easy); }
        .progress-dot.current { background: var(--easy); border-color: var(--easy); color: #fff; }
        .progress-dot-label { font-size: 11px; color: var(--ink-soft); }

        /* ---- topic header ---- */
        .topic-header { margin-bottom: 20px; }
        .topic-title { font-size: 24px; font-weight: 700; margin: 6px 0 4px; }
        .topic-subtitle { font-size: 13.5px; color: var(--ink-soft); }

        /* ---- explanation cards ---- */
        .exp-card {
          background: var(--card); border: 1px solid var(--border); border-radius: 14px;
          padding: 20px; margin-bottom: 16px;
        }
        .exp-card-badge {
          display: inline-block; color: #fff; font-size: 12px; font-weight: 700;
          padding: 4px 11px; border-radius: 999px; margin-bottom: 12px;
        }
        .exp-card-text { font-size: 14.5px; line-height: 1.8; color: var(--ink); margin: 0 0 18px; }
        .exp-card-rating { border-top: 1px dashed var(--border); padding-top: 14px; }
        .rating-caption { font-size: 12.5px; color: var(--ink-soft); font-weight: 600; display: block; margin-bottom: 10px; }

        /* ---- thermometer ---- */
        .thermo-shell { display: flex; align-items: center; gap: 8px; }
        .thermo-bulb {
          flex: 0 0 30px; width: 30px; height: 30px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-family: 'IBM Plex Mono', monospace; font-weight: 700; font-size: 13px;
          transition: background 0.15s ease;
        }
        .thermo-track { flex: 1; display: flex; gap: 4px; }
        .thermo-seg {
          flex: 1; height: 16px; border: none; border-radius: 4px; cursor: pointer;
          transition: background 0.15s ease, transform 0.1s ease;
        }
        .thermo-seg:hover { transform: scaleY(1.15); }
        .thermo-scale-labels {
          display: flex; justify-content: space-between; font-size: 10.5px;
          color: var(--ink-soft); margin-top: 6px; padding-left: 38px;
        }

        /* ---- nav ---- */
        .survey-nav { display: flex; justify-content: space-between; align-items: center; margin-top: 24px; }
        .nav-hint { font-size: 12px; color: var(--ink-soft); }

        /* ---- submitting / thanks ---- */
        .center-state { text-align: center; padding: 80px 20px; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ---- results ---- */
        .results-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 22px; flex-wrap: wrap; }
        .results-title { font-size: 26px; font-weight: 700; margin: 4px 0; }
        .stat-strip { display: flex; gap: 10px; align-items: center; color: var(--ink-soft); font-size: 13px; }
        .chart-card {
          background: var(--card); border: 1px solid var(--border); border-radius: 14px;
          padding: 20px 16px 8px; margin-bottom: 20px;
        }
        .chart-card h3 { font-size: 15px; margin: 0 0 4px; }
        .chart-card .chart-sub { font-size: 12px; color: var(--ink-soft); margin-bottom: 10px; }
        .legend-row { display: flex; gap: 14px; flex-wrap: wrap; font-size: 12px; color: var(--ink-soft); margin-bottom: 6px; }
        .legend-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 5px; }
        .win-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        @media (max-width: 560px) { .win-grid { grid-template-columns: 1fr; } }
        .win-card { border: 1px solid var(--border); border-radius: 12px; padding: 14px; text-align: center; }
        .win-num { font-family: 'IBM Plex Mono', monospace; font-size: 26px; font-weight: 700; }
        .win-label { font-size: 12.5px; color: var(--ink-soft); margin-top: 4px; }
      `}</style>

      <div className="shell">
        {screen === "intro" && (
          <div className="intro-hero">
            <span className="eyebrow">
              <Stethoscope size={13} /> 병원 설명 방식 연구
            </span>
            <h1 className="intro-title">
              같은 진단, 다른 설명 —<br />
              어떤 말이 가장 잘 들리시나요?
            </h1>
            <p className="intro-desc">
              같은 진료 상황을 <strong>전문어만</strong>, <strong>쉬운 말만</strong>,{" "}
              <strong>전문어 + 자세한 설명</strong>, 세 가지 방식으로 보여드려요.
              총 {TOPICS.length}개 상황을 읽고, 각 설명이 얼마나 이해하기 쉬웠는지
              &lsquo;이해도 체온계&rsquo;로 표시해 주세요. 약 2분 정도 걸려요.
            </p>

            <svg className="ecg-divider" viewBox="0 0 420 40" preserveAspectRatio="none">
              <path
                className="ecg-path"
                d="M0,20 L90,20 L110,20 L120,4 L132,36 L144,20 L165,20 L180,20 L195,10 L210,30 L225,20 L420,20"
              />
            </svg>

            <div className="intro-cards">
              {STYLE_KEYS.map((k) => (
                <div className="intro-style-card" key={k}>
                  <div className="intro-style-dot" style={{ background: STYLE_META[k].color }} />
                  <div className="intro-style-name">{STYLE_META[k].label}</div>
                  <div className="intro-style-desc">
                    {k === "jargon" && "의학 용어를 그대로 사용한 설명이에요."}
                    {k === "easy" && "전문 용어 없이 일상 말로 풀어낸 설명이에요."}
                    {k === "detailed" && "용어는 그대로 두되, 뜻을 자세히 풀어 설명해요."}
                  </div>
                </div>
              ))}
            </div>

            <div className="btn-row">
              <button className="btn btn-primary" onClick={() => setScreen("survey")}>
                <ClipboardList size={16} /> 설문 시작하기
              </button>
              <button className="btn btn-ghost" onClick={() => setScreen("results")}>
                결과만 보기
              </button>
            </div>
          </div>
        )}

        {screen === "survey" && (
          <div>
            <ProgressRail step={topicIndex} total={TOPICS.length} />

            <div className="topic-header">
              <span className="eyebrow font-mono">
                문항 {topicIndex + 1} / {TOPICS.length}
              </span>
              <h2 className="topic-title">{currentTopic.title}</h2>
              <p className="topic-subtitle">{currentTopic.subtitle}</p>
            </div>

            {currentOrder.map((styleKey, idx) => (
              <ExplanationCard
                key={styleKey}
                label={`설명 ${String.fromCharCode(65 + idx)}`}
                badgeColor={STYLE_META[styleKey].color}
                text={currentTopic.texts[styleKey]}
                value={currentTopicRatings[styleKey]}
                onChange={(v) => setRating(styleKey, v)}
              />
            ))}

            <div className="survey-nav">
              <button className="btn btn-ghost" onClick={goPrev} disabled={topicIndex === 0}>
                <ChevronLeft size={16} /> 이전
              </button>
              <span className="nav-hint">
                {allRatedForTopic ? "모두 응답했어요" : "세 설명 모두 평가해 주세요"}
              </span>
              <button className="btn btn-primary" onClick={goNext} disabled={!allRatedForTopic}>
                {topicIndex === TOPICS.length - 1 ? "제출하기" : "다음"} <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {screen === "submitting" && (
          <div className="center-state">
            <Loader2 size={28} className="spin" style={{ color: "var(--easy)" }} />
            <p style={{ marginTop: 14, color: "var(--ink-soft)" }}>응답을 저장하고 있어요…</p>
          </div>
        )}

        {screen === "submit_error" && (
          <div className="center-state">
            <p style={{ color: "var(--jargon)", fontWeight: 600, marginBottom: 6 }}>
              저장에 실패했어요
            </p>
            <p style={{ color: "var(--ink-soft)", marginBottom: 20 }}>{submitError}</p>
            <div className="btn-row">
              <button className="btn btn-primary" onClick={retrySubmit}>
                <RefreshCw size={16} /> 다시 시도
              </button>
              <button className="btn btn-ghost" onClick={() => setScreen("survey")}>
                <ChevronLeft size={16} /> 응답으로 돌아가기
              </button>
            </div>
          </div>
        )}

        {screen === "results" && (
          <div>
            <div className="results-header">
              <div>
                <span className="eyebrow">
                  <CheckCircle2 size={13} /> {justSubmittedId ? "응답이 저장됐어요" : "결과 보기"}
                </span>
                <h2 className="results-title">설문 결과</h2>
              </div>
              <button className="btn btn-ghost" onClick={loadResults}>
                <RefreshCw size={14} className={resultsLoading ? "spin" : ""} /> 새로고침
              </button>
            </div>

            {resultsLoading && responses.length === 0 && (
              <div className="center-state">
                <Loader2 size={26} className="spin" style={{ color: "var(--easy)" }} />
                <p style={{ marginTop: 12, color: "var(--ink-soft)" }}>결과를 불러오는 중이에요…</p>
              </div>
            )}

            {resultsError && <p style={{ color: "var(--jargon)" }}>{resultsError}</p>}

            {!resultsLoading && stats && (
              <>
                <div className="stat-strip" style={{ marginBottom: 18 }}>
                  <Users size={15} />
                  <span className="font-mono">{stats.respondents}</span>
                  <span>명이 참여했어요</span>
                </div>

                <div className="chart-card">
                  <h3>전체 평균 이해도</h3>
                  <p className="chart-sub">1(매우 어려움) ~ 5(매우 쉬움), 전체 문항 평균</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stats.overallChartData} margin={{ top: 4, right: 8, left: -18, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E7ECEB" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#55625F" }} />
                      <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "#55625F" }} />
                      <Tooltip
                        contentStyle={{ borderRadius: 10, border: "1px solid #DCE3E2", fontSize: 12 }}
                      />
                      <Bar dataKey="평균이해도" radius={[6, 6, 0, 0]}>
                        {stats.overallChartData.map((entry) => (
                          <Cell key={entry.key} fill={STYLE_META[entry.key].color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <h3>상황별 이해도 비교</h3>
                  <p className="chart-sub">문항마다 세 설명 방식의 평균 이해도예요</p>
                  <div className="legend-row">
                    {STYLE_KEYS.map((k) => (
                      <span key={k}>
                        <span className="legend-dot" style={{ background: STYLE_META[k].color }} />
                        {STYLE_META[k].label}
                      </span>
                    ))}
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={stats.perTopicChartData} margin={{ top: 4, right: 8, left: -18, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E7ECEB" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#55625F" }} />
                      <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "#55625F" }} />
                      <Tooltip
                        contentStyle={{ borderRadius: 10, border: "1px solid #DCE3E2", fontSize: 12 }}
                      />
                      <Bar dataKey="전문어만" fill={STYLE_META.jargon.color} radius={[5, 5, 0, 0]} />
                      <Bar dataKey="쉬운말" fill={STYLE_META.easy.color} radius={[5, 5, 0, 0]} />
                      <Bar dataKey="전문어+설명" fill={STYLE_META.detailed.color} radius={[5, 5, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <h3>가장 이해하기 쉬웠던 방식</h3>
                  <p className="chart-sub">문항별로 가장 높은 점수를 받은 설명 방식의 횟수예요</p>
                  <div className="win-grid" style={{ marginBottom: 14 }}>
                    {STYLE_KEYS.map((k) => (
                      <div className="win-card" key={k}>
                        <div className="win-num" style={{ color: STYLE_META[k].color }}>
                          {stats.winCounts[k]}
                        </div>
                        <div className="win-label">{STYLE_META[k].label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {!resultsLoading && !stats && !resultsError && (
              <div className="center-state">
                <p style={{ color: "var(--ink-soft)" }}>아직 응답이 없어요. 첫 번째로 참여해 보세요!</p>
              </div>
            )}

            <div className="btn-row" style={{ marginTop: 24 }}>
              <button className="btn btn-primary" onClick={restart}>
                <RotateCcw size={16} /> 설문 다시 참여하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
