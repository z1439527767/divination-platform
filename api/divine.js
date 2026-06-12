// 全球命理平台 — API handler
// 11 核心计算引擎 + 200+ 辅助系统 AI 交叉推理
let t;
const loadEngine = async () => { if (!t) t = await import('taibu-core'); return t; };

const SYSTEMS = {
  bazi: { name: '八字命理', fn: ['calculateBazi','toBaziJson','toBaziText'],
    inputs: ['birthYear','birthMonth','birthDay','birthHour'], desc: '四柱八字推命，看一生运程' },
  ziwei: { name: '紫微斗数', fn: ['calculateZiwei','toZiweiJson','toZiweiText'],
    inputs: ['birthYear','birthMonth','birthDay','birthHour','birthMinute','longitude','latitude','gender'],
    desc: '十二宫命盘，十四主星定格局' },
  liuyao: { name: '六爻占卜', fn: ['calculateLiuyao','toLiuyaoJson','toLiuyaoText'],
    inputs: ['coins'], desc: '铜钱摇卦，问一事吉凶' },
  meihua: { name: '梅花易数', fn: ['calculateMeihua','toMeihuaJson','toMeihuaText'],
    inputs: ['upperTrigram','lowerTrigram'], desc: '随手起卦，快速断事' },
  qimen: { name: '奇门遁甲', fn: ['calculateQimen','toQimenJson','toQimenText'],
    inputs: ['birthYear','birthMonth','birthDay','birthHour'], desc: '帝王之学，方位时机决策' },
  daliuren: { name: '大六壬', fn: ['calculateDaliuren','toDaliurenJson','toDaliurenText'],
    inputs: ['birthYear','birthMonth','birthDay','birthHour'], desc: '人事之王，看一事全部细节' },
  taiyi: { name: '太乙神数', fn: ['calculateTaiyi','toTaiyiJson','toTaiyiText'],
    inputs: ['birthYear'], desc: '天人之学，看大运大势' },
  tarot: { name: '塔罗占卜', fn: ['calculateTarot','toTarotJson','toTarotText'],
    inputs: ['count'], desc: '78张牌阵，揭示潜意识的答案' },
  astrology: { name: '占星命盘', fn: ['calculateAstrology','toAstrologyJson','toAstrologyText'],
    inputs: ['birthYear','birthMonth','birthDay','birthHour','birthMinute','longitude','latitude'],
    desc: '本命星盘+行运，看人生全景' },
  almanac: { name: '黄历通书', fn: ['calculateDailyAlmanac','toAlmanacJson','toAlmanacText'],
    inputs: ['year','month','day'], desc: '择吉避凶，每日宜忌' },
  xiaoliuren: { name: '小六壬', fn: ['calculateXiaoliurenData','toXiaoliurenJson','toXiaoliurenText'],
    inputs: ['month','day','hour'], desc: '掌中掐算，即时断事' },
};

// 辅助系统（200+ 种，AI 交叉推理）
const AUXILIARY = {
  命理推运: ['八字BaZi四柱','紫微斗数ZiWei','铁板神数TieBan','称骨算命BoneWeight','七政四余SevenLuminaries','河洛理数HeLuo','邵子神数ShaoZi','达摩一掌经YiZhangJing','三世书ThreeLives','袁天罡称骨法','李虚中命书','鬼谷子两头钳'],
  占卜问事: ['六爻LiuYao','梅花易数MeiHua','大六壬DaLiuRen','奇门遁甲QiMen','太乙神数TaiYi','小六壬XiaoLiuRen','文王卦WenWang','焦氏易林JiaoShi','元包经YuanBao','灵棋经LingQi','牙牌神数YaPai','金钱卦JinQian','诸葛神数ZhuGe'],
  相术识人: ['面相FaceReading','手相Palmistry','骨相BoneReading','痣相MoleReading','声相VoiceReading','行相GaitReading','字相手相综合Samudrika','足相FootReading','耳相EarReading','齿相TeethReading','发相HairReading'],
  风水堪舆: ['八宅风水BaZhai','玄空飞星XuanKong','形法派XingFa','金锁玉关JinSuo','三合派SanHe','三元派SanYuan','龙门八局LongMen','阳宅三要YangZhai','阴宅风水YinZhai','水法ShuiFa','龙穴砂水LongXueShaShui'],
  择吉选日: ['黄历通书Almanac','择吉ZheJi','嫁娶吉日WeddingDate','开业吉日BusinessDate','入宅吉日MoveIn','安葬吉日FuneralDate','出行吉日TravelDate','签约定约吉日ContractDate','董公择日DongGong','鳌头通书AoTou'],
  姓名测字: ['姓名学Nameology','测字Glyphomancy','笔画五行StrokeFiveElements','音韵姓名PhoneticName','三才五格SanCaiWuGe','生肖姓名ZodiacName','拆字诠字WordBreak','测字断事WordDivining'],
  西方神秘学: ['塔罗TarotRiderWaite','塔罗Thoth','塔罗马赛Marseille','Lenormand','OracleCards神谕卡','RunesElderFuthark符文','RunesAngloSaxon盎格鲁符文','OghamCeltic欧甘树文','Geomancy地占术','ScryingCrystal水晶灵视','Pendulum灵摆','Tasseography茶叶占卜','OuijaBoard通灵板','Cartomancy纸牌占卜','Lithomancy石卜','Ceromancy蜡卜','Molybdomancy铅卜'],
  卡巴拉数秘: ['Gematria字母数值','Notarikon首字母法','Temurah字母置换','KabbalahTreeOfLife生命树','Sefirot十质源','NumerologyPythagorean毕达哥拉斯','NumerologyChaldean迦勒底','AngelNumbers天使数字','LifePathNumber生命灵数','DestinyNumber命运数','SoulUrgeNumber灵魂驱力'],
  西洋占星: ['NatalAstrology本命占星','HoraryAstrology卜卦占星','ElectionalAstrology择时占星','MedicalAstrology医疗占星','MundaneAstrology世俗占星','Synastry合盘','Transit行运','SolarReturn太阳返照','LunarReturn月亮返照','Progressions推运','Asteroids小行星','FixedStars恒星','ArabicParts阿拉伯点','SabianSymbols萨比恩符号','Midpoints中点'],
  吠陀印度: ['JyotishParashari帕拉夏拉','JaiminiSutra杰米尼','NadiShastra纳迪','BhriguSamhita布里古','TajikaSystem塔吉卡','KP_System克里希那穆提','LalKitab红书','Ashtakavarga八层法','Varshaphala年运','Yoga意相','Dasha大运','Nakshatra月宿','Shadbala六力','Panchang五支'],
  中东伊斯兰: ['IlmAlRaml沙占术','HafezFal哈菲兹诗占','Istikhara求善占','CoffeeCupReading咖啡渣占卜','FalakIslamicAstrology伊期兰占星','AbjadNumerology阿拉伯数秘','DreamInterpretationIslamic伊斯兰解梦','Hurufism字母神秘主义'],
  非洲传统: ['IfaDivination伊法256Odu','CowrieShellDivination贝币占卜','BoneThrowingHakata骨卜','ZandeOracles赞德神谕','DogonDivination多贡占星','SangomaBoneThrow桑戈马骨卜','DahomeyFa贝宁法占','MandeSandDivination曼德沙占','YorubaObi椰子占卜','KikuyuDivination基库尤占卜'],
  东南亚: ['ThaiAstrology泰国占星','JavanesePrimbon爪哇历书','BurmeseMahabote缅甸大运','FilipinoHilot菲律宾疗愈','BalinesePawukon巴厘历法','VietnameseAstrology越南占星','CambodianKruKhmer高棉占卜','LaoHoroscope老挝命理'],
  日本韩国: ['Onmyodo阴阳道','EkiDivination易占','Omikuji神签','Kigaku气学','SajuKorean四柱','Tojeongbigyeol土亭秘诀','Juyeok周易','Myeongri学命理学','SasangConstitution四象体质','GungHap宫合'],
  现代融合: ['HumanDesign人类图','GeneKeys基因钥匙','MBTI_Astrology性格占星','EnneagramMystic九型神秘','SoulContract灵魂契约','AkashicRecords阿卡西记录','AngelNumbers天使数字','LawOfAttractionOracle吸引力法则','PastLifeRegression前世回溯','AnimalSpiritGuides动物灵导','Biorhythms生物节律','Iridology虹膜学','Graphology笔迹学','Phrenology颅相学','Auramancy气场阅读'],
  原生美洲: ['MayanCalendarTzolkin玛雅卓尔金历','AztecTonalpohualli阿兹特克260天历','IncaIntihuatana印加太阳石','NativeAmericanMedicineWheel药轮','OjibweDreamcatcher奥吉布瓦捕梦','HopiProphecy霍皮预言','LakotaSweatLodge拉科塔汗屋','CherokeeCrystal彻罗基水晶','InuitAurora因纽特极光'],
  凯尔特北欧: ['CelticTreeCalendar凯尔特树历','CelticAnimalZodiac凯尔特动物星座','RomaDivination吉普赛占卜','SlavicWaxPouring斯拉夫蜡卜','NordicSeidr北欧Seidr','VikingRunecasting维京符文','FinnishKalevala芬兰卡勒瓦拉','ScottishSecondSight苏格兰灵视','IrishImbas爱尔兰灵启'],
  藏传蒙古: ['TibetanMo藏传摩占','KalachakraAstrology时轮占星','TibetanDreamYoga梦瑜伽','TibetanDiceDivination骰子占','BuryatShamanism布里亚特萨满','MongolianAstrology蒙古占星','TibetanElements藏传五行','BonPoDivination苯教占卜','NechungOracle乃琼神谕'],
  澳洲大洋洲: ['AboriginalSonglines原住民歌线','MaoriMatakite毛利预视','HawaiianHuna夏威夷胡纳','PolynesianTatauReading波利尼西亚纹身','PapuanDreamDivination巴布亚解梦','TonganFaiva汤加占卜','SamoanPese萨摩亚诗舞','MicronesianStarNav密克罗尼西亚星航'],
  神谕签诗: ['KauCim求签','观音灵签Guanyin','妈祖灵签Mazu','关帝灵签GuanDi','吕祖灵签LvZu','保生大帝签BaoSheng','灵签灵数签文综合Oracle','土地公签TuDi','城隍签ChengHuang','月老灵签YueLao','黄大仙灵签WongTaiSin'],
  符咒法术: ['符箓FuLu','咒语Mantra','六壬符LiuRenFu','茅山符MaoShan','闾山符LvShan','祝由术ZhuYou','厌胜术YaSheng','辟邪物Talisman','护身符Amulet','开运物LuckyCharm'],
  通灵感应: ['通灵Channeling','自动书写AutomaticWriting','灵应盘SpiritBoard','降神Seance','前世回溯PastLifeRegression','灵魂出窍AstralProjection','遥视RemoteViewing','心灵感应Telepathy','预知Precognition','灵摆探测Dowsing'],
};

function getAuxiliaryList() {
  const all = [];
  for (const [cat, systems] of Object.entries(AUXILIARY)) {
    for (const s of systems) all.push({ name: s, category: cat });
  }
  return all;
}

// Cross-reference: select relevant auxiliary categories based on core system
const SYSTEM_AUX_MAP = {
  bazi: ['命理推运','相术识人','风水堪舆','择吉选日','姓名测字','印度吠陀','卡巴拉数秘','西洋占星','现代融合','神谕签诗'],
  ziwei: ['命理推运','相术识人','风水堪舆','印度吠陀','西洋占星','现代融合','神谕签诗','通灵感应'],
  liuyao: ['占卜问事','神谕签诗','中东伊斯兰','非洲传统','符咒法术','通灵感应','姓名测字'],
  meihua: ['占卜问事','神谕签诗','东南亚','日本韩国','非洲传统','符咒法术'],
  qimen: ['风水堪舆','择吉选日','占卜问事','符咒法术','印度吠陀','藏传蒙古'],
  daliuren: ['占卜问事','择吉选日','印度吠陀','中东伊斯兰','凯尔特北欧'],
  taiyi: ['占卜问事','藏传蒙古','原生美洲','澳洲大洋洲','通灵感应'],
  tarot: ['西方神秘学','卡巴拉数秘','西洋占星','现代融合','凯尔特北欧','通灵感应'],
  astrology: ['西洋占星','印度吠陀','卡巴拉数秘','现代融合','凯尔特北欧','命理推运'],
  almanac: ['择吉选日','风水堪舆','神谕签诗','符咒法术','占卜问事'],
  xiaoliuren: ['占卜问事','神谕签诗','择吉选日','东南亚','日本韩国']
};

function selectAuxiliaryRefs(systemId) {
  const relevantCats = SYSTEM_AUX_MAP[systemId] || Object.keys(AUXILIARY);
  const selected = [];
  // Pick at least 1 from each relevant category, up to 15 total
  for (const cat of relevantCats) {
    if (!AUXILIARY[cat]) continue;
    const list = AUXILIARY[cat];
    // Pick 2-3 from each category
    const n = Math.min(3, list.length);
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    for (let i = 0; i < n; i++) selected.push({ name: shuffled[i], category: cat });
  }
  return selected.slice(0, 25); // Cap at 25 auxiliary refs
}

// Build deep cross-reference prompt
function buildPrompt(systemId, data, auxRefs) {
  const sys = SYSTEMS[systemId];
  const auxByCat = {};
  auxRefs.forEach(a => {
    if (!auxByCat[a.category]) auxByCat[a.category] = [];
    auxByCat[a.category].push(a.name);
  });

  let auxSection = '';
  for (const [cat, names] of Object.entries(auxByCat)) {
    auxSection += `\n【${cat}】${names.join('、')}`;
  }

  return `你是精通全球200+种命理占卜体系的大师级解读专家。

用户所选核心体系: ${sys.name} (${sys.desc})

=== 核心计算结果 ===
${JSON.stringify(data, null, 2)}

=== 交叉推理参考体系 (共${auxRefs.length}种) ===
${auxSection}

请进行深度交叉推理:

1. 【核心解读】基于${sys.name}的原始结果，用通俗易懂的语言解读用户的命运/运势/答案
2. 【多体系印证】从上述分类中各选1-2种相关体系，与核心结果进行交叉印证——找出多个体系中一致指向的信号
3. 【矛盾分析】如果不同体系之间有矛盾或不同侧重点，分析为什么，可能揭示什么更深层的信息
4. 【综合结论】融合所有体系的信号，给出一个统一的、具体的、可操作的综合解读
5. 【建议与警示】基于综合结论，给出具体建议和需要避免的事项

输出格式: 使用Markdown，分节清晰，专业但不晦涩，让普通用户能看懂。
末尾标注: *以上内容由AI综合全球命理体系生成，仅供娱乐参考。命运掌握在自己手中。*`;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname.replace('/api/', '');

  // Payment verification
  if (path.startsWith('verify')) {
    const sessionId = url.searchParams.get('session_id');
    if (!sessionId) return res.json({ paid: false, error: 'missing session_id' });
    try {
      const r = await fetch('https://api.stripe.com/v1/checkout/sessions/' + sessionId, {
        headers: { 'Authorization': 'Bearer ' + process.env.STRIPE_SECRET_KEY }
      });
      const session = await r.json();
      return res.json({ paid: session.payment_status === 'paid', amount: session.amount_total, email: session.customer_email });
    } catch (e) {
      return res.json({ paid: false, error: e.message });
    }
  }

  if (path === 'systems' || path === '') {
    return res.json({
      core: Object.entries(SYSTEMS).map(([k, v]) => ({ id: k, name: v.name, desc: v.desc, inputs: v.inputs })),
      auxiliary: getAuxiliaryList(),
      total_auxiliary: getAuxiliaryList().length
    });
  }

  if (SYSTEMS[path]) {
    try {
      const t = await loadEngine();
      const sys = SYSTEMS[path];
      const input = req.body || {};
      const now = new Date();
      const params = {
        birthYear: input.birthYear || 1990, birthMonth: input.birthMonth || 1,
        birthDay: input.birthDay || 1, birthHour: input.birthHour || 12,
        birthMinute: input.birthMinute || 0, longitude: input.longitude || 121.5,
        latitude: input.latitude || 31.2, gender: input.gender || 'male',
        year: input.year || now.getFullYear(), month: input.month || now.getMonth() + 1,
        day: input.day || now.getDate(), hour: input.hour || now.getHours(),
        coins: input.coins || [1,1,1,1,1,1], count: input.count || 3,
        upperTrigram: input.upperTrigram || 1, lowerTrigram: input.lowerTrigram || 1,
      };
      const [calcFn, toJsonFn] = sys.fn;
      const result = t[calcFn](params);
      const json = t[toJsonFn](result);
      const auxRefs = selectAuxiliaryRefs(path);
      return res.json({
        system: path, systemName: sys.name, result: json, auxiliary_refs: auxRefs,
        prompt: buildPrompt(path, json, auxRefs), auxiliary_count: auxRefs.length,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      return res.status(400).json({ error: e.message, hint: '参数格式错误' });
    }
  }

  return res.status(404).json({ error: '未知系统', available: Object.keys(SYSTEMS) });
};
