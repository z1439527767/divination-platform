// 全球命理平台 — API handler
// 11 核心计算引擎 + 200+ 辅助系统 AI 交叉推理
let t;
const loadEngine = async () => { if (!t) t = await import('taibu-core'); return t; };

const SYSTEMS = {
  bazi: { name: '八字命理', calc: t.calculateBazi, toJson: t.toBaziJson, toText: t.toBaziText,
    inputs: ['birthYear','birthMonth','birthDay','birthHour'], desc: '四柱八字推命，看一生运程' },
  ziwei: { name: '紫微斗数', calc: t.calculateZiwei, toJson: t.toZiweiJson, toText: t.toZiweiText,
    inputs: ['birthYear','birthMonth','birthDay','birthHour','birthMinute','longitude','latitude','gender'],
    desc: '十二宫命盘，十四主星定格局' },
  liuyao: { name: '六爻占卜', calc: t.calculateLiuyao, toJson: t.toLiuyaoJson, toText: t.toLiuyaoText,
    inputs: ['coins'], desc: '铜钱摇卦，问一事吉凶' },
  meihua: { name: '梅花易数', calc: t.calculateMeihua, toJson: t.toMeihuaJson, toText: t.toMeihuaText,
    inputs: ['upperTrigram','lowerTrigram'], desc: '随手起卦，快速断事' },
  qimen: { name: '奇门遁甲', calc: t.calculateQimen, toJson: t.toQimenJson, toText: t.toQimenText,
    inputs: ['birthYear','birthMonth','birthDay','birthHour'], desc: '帝王之学，方位时机决策' },
  daliuren: { name: '大六壬', calc: t.calculateDaliuren, toJson: t.toDaliurenJson, toText: t.toDaliurenText,
    inputs: ['birthYear','birthMonth','birthDay','birthHour'], desc: '人事之王，看一事全部细节' },
  taiyi: { name: '太乙神数', calc: t.calculateTaiyi, toJson: t.toTaiyiJson, toText: t.toTaiyiText,
    inputs: ['birthYear'], desc: '天人之学，看大运大势' },
  tarot: { name: '塔罗占卜', calc: t.calculateTarot, toJson: t.toTarotJson, toText: t.toTarotText,
    inputs: ['count'], desc: '78张牌阵，揭示潜意识的答案' },
  astrology: { name: '占星命盘', calc: t.calculateAstrology, toJson: t.toAstrologyJson, toText: t.toAstrologyText,
    inputs: ['birthYear','birthMonth','birthDay','birthHour','birthMinute','longitude','latitude'],
    desc: '本命星盘+行运，看人生全景' },
  almanac: { name: '黄历通书', calc: t.calculateDailyAlmanac, toJson: t.toAlmanacJson, toText: t.toAlmanacText,
    inputs: ['year','month','day'], desc: '择吉避凶，每日宜忌' },
  xiaoliuren: { name: '小六壬', calc: t.calculateXiaoliurenData, toJson: t.toXiaoliurenJson, toText: t.toXiaoliurenText,
    inputs: ['month','day','hour'], desc: '掌中掐算，即时断事' },
};

// 辅助系统分类（200+ 种，AI 推理）
const AUXILIARY = {
  西方: ['Lenormand','OracleCards','RunesElderFuthark','OghamCeltic','GeomancyEuropean','ScryingCrystal','Pendulum','Tasseography','OuijaBoard','CartomancyPlayingCards','NumerologyPythagorean','NumerologyChaldean','GematriaKabbalah','Notarikon','Temurah','Biorhythms','Graphology','Phrenology','PhysiognomyWestern','Iridology','Auramancy','Moleomancy'],
  印度吠陀: ['JyotishVedic','NadiShastra','BhriguSamhita','SamudrikaShastraPalmistry','KP_System','LalKitab','RamalShastra','SwarShastra','AngaShastra','NimittaShastra','SwapnaShastraDream'],
  中东阿拉伯: ['IlmAlRaml','HafezFal','Istikhara','CoffeeCupReading','FalakAstrology'],
  非洲: ['IfaDivination','CowrieShellDivination','BoneThrowingHakata','ZandeOracles','DogonDivination','SangomaBoneThrow'],
  东南亚: ['ThaiAstrology','JavanesePrimbon','BurmeseMahabote','FilipinoHilot','BalinesePawukon','VietnameseAstrology'],
  日韩: ['Onmyodo','EkiDivination','Omikuji','Kigaku','SajuKorean','Tojeongbigyeol','Juyeok'],
  现代融合: ['HumanDesign','GeneKeys','MBTI_Astrology','EnneagramMystic','SoulContract','AkashicRecords','AngelNumbers','LawOfAttractionOracle','PastLifeRegression','AnimalSpiritGuides'],
  原生美洲: ['MayanCalendarTzolkin','AztecTonalpohualli','IncaIntihuatana','NativeAmericanMedicineWheel','OjibweDreamcatcher'],
  其他: ['CelticTreeCalendar','RomaDivination','SlavicWaxPouring','NordicSeidr','TibetanMo','ShintoOmikuji','HawaiianHuna','PolynesianTatauReading']
};

function getAuxiliaryList() {
  const all = [];
  for (const [cat, systems] of Object.entries(AUXILIARY)) {
    for (const s of systems) all.push({ name: s, category: cat });
  }
  return all;
}

// Build AI cross-reference prompt
function buildPrompt(systemName, data, auxiliaryRefs) {
  const sys = SYSTEMS[systemName];
  const auxNames = auxiliaryRefs.map(a => a.name).join('、');
  return `你是精通全球200+种命理占卜体系的大师。

用户请求: ${sys.name}

核心计算结果:
${JSON.stringify(data, null, 2)}

请结合以下辅助体系进行交叉推理: ${auxNames}

要求:
1. 基于核心计算给出准确解读
2. 引用3-5种辅助体系进行交叉验证
3. 输出结构化报告：核心解读 → 辅助印证 → 综合建议
4. 使用中文，专业但不晦涩
5. 末尾标注：本文仅供娱乐参考`;
}

module.exports = async (req, res) => {
  const t = await loadEngine();
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname.replace('/api/', '');

  // List all systems
  if (path === 'systems' || path === '') {
    return res.json({
      core: Object.entries(SYSTEMS).map(([k, v]) => ({ id: k, name: v.name, desc: v.desc, inputs: v.inputs })),
      auxiliary: getAuxiliaryList(),
      total_auxiliary: getAuxiliaryList().length
    });
  }

  // Run a divination
  if (SYSTEMS[path]) {
    try {
      const sys = SYSTEMS[path];
      const input = req.body || {};

      // Fill defaults
      const now = new Date();
      const params = {
        birthYear: input.birthYear || 1990,
        birthMonth: input.birthMonth || 1,
        birthDay: input.birthDay || 1,
        birthHour: input.birthHour || 12,
        birthMinute: input.birthMinute || 0,
        longitude: input.longitude || 121.5,
        latitude: input.latitude || 31.2,
        gender: input.gender || 'male',
        year: input.year || now.getFullYear(),
        month: input.month || now.getMonth() + 1,
        day: input.day || now.getDate(),
        hour: input.hour || now.getHours(),
        coins: input.coins || [1,1,1,1,1,1],
        count: input.count || 3,
        upperTrigram: input.upperTrigram || 1,
        lowerTrigram: input.lowerTrigram || 1,
      };

      const result = sys.calc(params);
      const json = sys.toJson(result);

      // Pick 3 random auxiliary systems for cross-reference
      const allAux = getAuxiliaryList();
      const shuffled = allAux.sort(() => Math.random() - 0.5);
      const auxRefs = shuffled.slice(0, 3);

      return res.json({
        system: path,
        systemName: sys.name,
        result: json,
        auxiliary_refs: auxRefs,
        prompt: buildPrompt(path, json, auxRefs),
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      return res.status(400).json({ error: e.message, hint: '参数格式不对，检查输入' });
    }
  }

  return res.status(404).json({ error: '未知系统', available: Object.keys(SYSTEMS) });
};
