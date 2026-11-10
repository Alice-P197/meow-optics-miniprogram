/** 光学手册内容数据 */
const handbook = [
  /* ================= 基础数据与单位 ================= */
  {
    id: 'const', name: '基础数据与单位', icon: 'ħ',
    color: '#4a7cff', desc: '物理常数、单位换算、可见光谱与常用激光波长。',
    entries: [
      {
        key: 'e-const', title: '常用物理常数表', tag: '常数表', hot: true,
        summary: 'SI 2019 定义后的精确物理常数，光学计算常用。',
        blocks: [
          { t: 'p', x: '以下常数均来自 SI 国际单位制 2019 年定义（数值精确固定），可直接用于光学工程计算。' },
          {
            t: 'table', head: ['常数', '符号与数值', '单位'],
            rows: [
              ['光速', 'c = 2.99792458 × 10⁸', 'm/s'],
              ['普朗克常数', 'h = 6.62607015 × 10⁻³⁴', 'J·s'],
              ['约化普朗克常数', 'ħ = 1.054571817 × 10⁻³⁴', 'J·s'],
              ['玻尔兹曼常数', 'k = 1.380649 × 10⁻²³', 'J/K'],
              ['基本电荷', 'e = 1.602176634 × 10⁻¹⁹', 'C'],
              ['真空介电常数', 'ε₀ = 8.8541878128 × 10⁻¹²', 'F/m'],
              ['真空磁导率', 'μ₀ = 1.25663706212 × 10⁻⁶', 'H/m'],
              ['h·c', '= 1.986445857 × 10⁻²⁵', 'J·m'],
              ['h·c / e', '= 1239.841984', 'eV·nm'],
              ['斯忒藩-玻尔兹曼常数', 'σ = 5.670374419 × 10⁻⁸', 'W·m⁻²·K⁻⁴'],
              ['维恩位移常数', 'b = 2.897771955 × 10⁻³', 'm·K'],
              ['最大光视效能', 'K = 683', 'lm/W (555 nm)']
            ]
          },
          { t: 'note', x: '记忆技巧：光子能量与波长满足 E(eV)·λ(nm) ≈ 1240，精度要求高时用 1239.842。' },
          { t: 'note', x: '黑体辐射常用组合：k·T / e 在 300 K 时约为 0.02585 eV（常温热电压）。', tone: 'tip' }
        ]
      },
      {
        key: 'e-convert', title: '光学常用单位换算', tag: '换算',
        summary: '长度、频率、能量、光焦度的快速换算规则。',
        blocks: [
          { t: 'h3', x: '长度' },
          { t: 'list', x: ['1 mm = 10⁻³ m', '1 μm = 10⁻⁶ m = 10⁻³ mm', '1 nm = 10⁻⁹ m = 10⁻³ μm', '1 Å = 10⁻¹⁰ m = 0.1 nm'] },
          { t: 'h3', x: '波长 ↔ 频率 ↔ 能量' },
          { t: 'list', x: ['ν(THz) = 299.79 / λ(μm)', 'E(eV) = 1239.84 / λ(nm)', '波数 ṽ(cm⁻¹) = 10⁷ / λ(nm)；1 eV ≈ 8065.5 cm⁻¹', '300 K 时 kT ≈ 0.02585 eV'] },
          { t: 'h3', x: '光焦度（透镜）' },
          { t: 'list', x: ['Φ(D) = 1 / f(m) = 1000 / f(mm)', '两镜片密接时屈光度可直接相加'] },
          { t: 'h3', x: '辐射换算要点' },
          { t: 'list', x: ['辐亮度 → 亮度需按 V(λ) 视见函数加权', '峰值波长 λmax(μm) ≈ 2898 / T(K)（维恩位移定律）'] },
          { t: 'note', x: '波长与能量换算时注意分母单位：λ 用 nm 时系数为 1240，λ 用 μm 时系数为 1.24。' }
        ]
      },
      {
        key: 'e-spectrum', title: '可见光谱与颜色', tag: '光谱', hot: true,
        summary: '可见光各色区波长范围及人眼视见特性。',
        blocks: [
          { t: 'p', x: '可见光大致覆盖 380–780 nm，下表为常用的颜色分区（边界为人眼感觉的近似划分）。' },
          {
            t: 'table', head: ['色区', '波长 (nm)', '备注'],
            rows: [
              ['紫', '380 – 450', '短波端，紫外邻接'],
              ['蓝', '450 – 490', '天空蓝'],
              ['青', '490 – 510', '青绿之间'],
              ['绿', '510 – 575', '人眼最敏感区'],
              ['黄', '575 – 590', '钠灯 589 nm'],
              ['橙', '590 – 620', ''],
              ['红', '620 – 780', '长波端，红外邻接']
            ]
          },
          { t: 'note', x: '明视觉条件下人眼灵敏度峰值约在 555 nm（绿黄区）；暗视觉峰值向蓝移，约 507 nm。' },
          { t: 'note', x: '380 nm 以下为紫外（UV），780 nm 以上为红外（IR）。不同颜色分区在显示器/印刷中并不完全统一。', tone: 'tip' }
        ]
      },
      {
        key: 'e-laser', title: '常用激光波长速查', tag: '激光',
        summary: '工程与科研中最常用激光器及输出波长。',
        blocks: [
          { t: 'p', x: '表中列出各波段代表性激光器及典型应用，实际产品线可能有更多谐波/多线输出。' },
          {
            t: 'table', head: ['激光器', '波长 (nm)', '典型应用'],
            rows: [
              ['ArF 准分子', '193', 'DUV 光刻、角膜手术'],
              ['KrF 准分子', '248', '光刻、微加工'],
              ['Nd:YAG (3ω)', '355', '紫外加工、光谱'],
              ['He-Cd', '325 / 442', '光刻、荧光'],
              ['蓝紫半导体', '405', '蓝光存储、固化'],
              ['蓝光半导体', '450', '激光显示、照明'],
              ['Ar⁺', '488 / 514.5', '荧光激发、拉曼'],
              ['绿光半导体/DPSS', '520 / 532', '显示、医疗、泵浦'],
              ['He-Ne', '632.8', '干涉、计量、准直'],
              ['红光半导体', '638 / 650', '指示、条码'],
              ['近红外半导体', '780 / 808 / 850 / 980', 'CD、泵浦、传感'],
              ['Nd:YAG / 光纤', '1064', '切割、打标、焊接'],
              ['光纤通信', '1310 / 1550', '光通信 C 波段'],
              ['CO₂', '10600', '切割、焊接、医疗']
            ]
          },
          { t: 'note', x: 'Nd:YAG 的 532 nm 为二倍频（2ω），355 nm 为三倍频（3ω），266 nm 为四倍频（4ω）。' }
        ]
      }
    ]
  },

  /* ================= 材料光学 ================= */
  {
    id: 'material', name: '材料与折射率', icon: 'n',
    color: '#12a594', desc: '光学玻璃、晶体与介质折射率及色散数据。',
    entries: [
      {
        key: 'm-glasses', title: '常用光学玻璃与晶体', tag: '数据表', hot: true,
        summary: '典型光学材料在 d 线 (587.6 nm) 的折射率与阿贝数。',
        blocks: [
          { t: 'p', x: '表内如无特别说明，折射率为 d 线（587.6 nm）数值；加 * 表示对应波段有差异，使用时请查阅厂商数据。' },
          {
            t: 'table', head: ['材料', '折射率 n', '阿贝数 Vd', '特点'],
            rows: [
              ['N-BK7（≈K9）', '1.51680', '64.17', '通用冕牌玻璃'],
              ['F2', '1.62004', '36.37', '标准火石玻璃'],
              ['N-SF6', '1.80518', '25.43', '高折射火石'],
              ['SF11', '1.78472', '25.68', '高色散火石'],
              ['熔石英 Fused Silica', '1.45846', '67.8', '低膨胀、深紫外透过'],
              ['氟化钙 CaF₂', '1.43380', '≈ 95', '低色散、宽透过'],
              ['硒化锌 ZnSe *', '≈ 2.403', '—', 'CO₂ 激光 10.6 μm'],
              ['锗 Ge *', '≈ 4.003', '—', '红外 2–14 μm'],
              ['硅 Si *', '≈ 3.42', '—', '红外窗口与透镜']
            ]
          },
          { t: 'note', x: '锌、锗、硅等红外材料的折射率随波长变化明显且吸收较强，其数值对应约 10.6 μm 波段（硅为 1–10 μm 平均参考）。' },
          { t: 'note', x: '低阿贝数（小 Vd）材料色散大；氟化钙阿贝数高达约 95，是复消色差（APO）设计的重要材料。', tone: 'tip' }
        ]
      },
      {
        key: 'm-media', title: '常见介质折射率', tag: '数据表',
        summary: '气体、液体与固体的典型折射率参考值。',
        blocks: [
          { t: 'p', x: '以下为可见光波段的典型值，温度、气压与波长均会影响实际折射率。' },
          {
            t: 'table', head: ['介质', '折射率 (约)', '备注'],
            rows: [
              ['空气', '1.0003', '标准大气，常用 1.0 近似'],
              ['水 (20 °C)', '1.3330', '可见光'],
              ['甘油', '1.4746', ''],
              ['熔石英', '1.458', '587 nm'],
              ['冕牌玻璃', '1.50 – 1.56', ''],
              ['火石玻璃', '1.60 – 1.85', ''],
              ['蓝宝石 Al₂O₃', '1.768', '589 nm，双折射'],
              ['氟化钙 CaF₂', '1.434', ''],
              ['金刚石', '2.417', '高折射高色散'],
              ['硅 Si', '3.42 – 3.55', '随波长变化'],
              ['锗 Ge', '4.00 – 4.10', '红外波段']
            ]
          },
          { t: 'note', x: '多数透明介质呈正常色散：折射率随波长增大而减小，即蓝光折射强于红光。' }
        ]
      },
      {
        key: 'm-dispersion', title: '色散与阿贝数', tag: '概念',
        summary: '色散度量、消色差条件与常用色散公式。',
        blocks: [
          { t: 'p', x: '阿贝数（Abbe number）度量材料色散大小：Vd 越大色散越小。' },
          { t: 'formula', x: 'Vd = (n_d − 1) / (n_F − n_C)' },
          { t: 'p', x: '其中 n_d、n_F、n_C 分别为氦 d 线 587.6 nm、氢 F 线 486.1 nm 与氢 C 线 656.3 nm 处的折射率。' },
          { t: 'h3', x: '消色差双合透镜条件（薄透镜近似）' },
          { t: 'formula', x: 'Φ₁ / V₁ + Φ₂ / V₂ = 0' },
          { t: 'p', x: '用一片低色散冕牌（正光焦度）与一片高色散火石（负光焦度）胶合，可使 F 与 C 光会聚于同一点。' },
          { t: 'h3', x: '常用色散模型（简化柯西公式）' },
          { t: 'formula', x: 'n(λ) = A + B / λ²' },
          { t: 'note', x: '若要进一步校正二级光谱，需选用特殊部分色散材料（如含氟冕牌、氟化钙），构成复消色差物镜。', tone: 'tip' }
        ]
      }
    ]
  },

  /* ================= 成像与透镜 ================= */
  {
    id: 'imaging', name: '成像与透镜', icon: 'ƒ',
    color: '#7c5cff', desc: '成像公式、透镜焦距、光阑孔径与像差基础。',
    entries: [
      {
        key: 'i-gaussian', title: '高斯成像与符号约定', tag: '公式', hot: true,
        summary: '薄透镜成像公式、符号规则与实虚像判据。',
        blocks: [
          { t: 'p', x: '约定光自左向右传播：物体在透镜左侧为实物，物距 u > 0；会聚透镜 f > 0，发散透镜 f < 0。' },
          { t: 'formula', x: '1/f = 1/u + 1/v' },
          { t: 'formula', x: 'x · x′ = f · f′   （牛顿公式，x = u − f）' },
          { t: 'h3', x: '像的性质判据（凸透镜 f > 0，实物）' },
          {
            t: 'table', head: ['物距区间', '像的情况'],
            rows: [
              ['u > 2f', '缩小实像，倒立，v 在 f ~ 2f'],
              ['u = 2f', '等大实像，倒立，v = 2f'],
              ['f < u < 2f', '放大实像，倒立'],
              ['u = f', '出射平行光，像在无穷远'],
              ['u < f', '放大虚像，正立（放大镜）']
            ]
          },
          { t: 'p', x: '凹透镜（f < 0）对实物恒成缩小正立虚像。' },
          { t: 'note', x: '放大率 m = v / u（代数值）。m < 0 表示像倒立（实像），m > 0 表示像正立（虚像）。' }
        ]
      },
      {
        key: 'i-lens', title: '透镜焦距与光焦度', tag: '公式',
        summary: '光焦度定义、薄透镜公式与组合透镜等效焦距。',
        blocks: [
          { t: 'h3', x: '光焦度（屈光度）' },
          { t: 'formula', x: 'Φ = 1 / f   （f 以米计，单位 D = m⁻¹）' },
          { t: 'p', x: '焦距 f = 100 mm 的透镜光焦度为 +10 D；远视/近视镜片度数即光焦度。' },
          { t: 'h3', x: '薄透镜公式（透镜制造者方程）' },
          { t: 'formula', x: '1/f = (n − 1) · (1/R₁ − 1/R₂)' },
          { t: 'p', x: 'R₁、R₂ 为两表面曲率半径（带符号），n 为相对周围介质的折射率。球心在光线传播方向右侧时半径为正。' },
          { t: 'h3', x: '两薄透镜组合（间隔 d）' },
          { t: 'formula', x: 'Φ = Φ₁ + Φ₂ − d · Φ₁ · Φ₂   （d 以米计）' },
          { t: 'list', x: ['两片 f = 100 mm（各 10 D）密接：Φ = 20 D，等效 f = 50 mm', '同上但间隔 50 mm：Φ = 15 D，等效 f ≈ 66.7 mm'] },
          { t: 'note', x: '厚透镜或含主面移动的系统需用主面位置修正，等效焦距不再由表面参数直接给出。', tone: 'tip' }
        ]
      },
      {
        key: 'i-aperture', title: '光阑、F 数与数值孔径', tag: '概念',
        summary: '孔径描述、像面照度与衍射分辨极限之间的关系。',
        blocks: [
          { t: 'formula', x: 'F/# = f / D' },
          { t: 'formula', x: 'NA = n · sin u' },
          { t: 'p', x: 'f 为焦距，D 为入瞳直径，u 为物方孔径半角，n 为物方介质折射率。' },
          { t: 'h3', x: '常用关系' },
          { t: 'list', x: ['空气中远摄近似：F/# ≈ 1 / (2·NA)', '像面照度 ∝ 1 / (F/#)²：F 数每收小一档，照度减半', '衍射受限分辨：d = 0.61·λ / NA（瑞利判据）', '艾里斑直径：D = 2.44·λ·F/#', '焦深（像方，近似）：δ ≈ ±2·λ·(F/#)²'] },
          { t: 'note', x: 'F 数决定像面照度与衍射、景深的平衡；显微物镜等有限共轭系统习惯用 NA 而非 F 数描述聚光能力。' }
        ]
      },
      {
        key: 'i-aberration', title: '像差基础速查', tag: '概念', hot: true,
        summary: '七种初级像差的表现与常用校正思路。',
        blocks: [
          { t: 'p', x: '实际光学系统偏离理想成像产生的像差可分为单色像差与色差。下表为初级像差（赛德尔）速查。' },
          {
            t: 'table', head: ['像差', '典型表现', '常见校正'],
            rows: [
              ['球差', '轴上点弥散成光斑，光圈越大越明显', '非球面、正负透镜组合'],
              ['彗差', '离轴点呈彗星状拖尾', '对称结构、光阑位置优化'],
              ['像散', '子午/弧矢焦点分离，点成椭圆', '选择合适的透镜弯形'],
              ['场曲', '像面弯曲，中心清晰边缘离焦', '匹兹伐和校正、平场镜'],
              ['畸变', '直线成像弯曲（桶形/枕形）', '对称设计、软件校正'],
              ['纵向色差', '不同波长焦点沿轴分离，彩色光晕', '消色差/复消色差组合'],
              ['倍率色差', '离轴像高随波长不同，边缘色边', '对称设计、特殊色散材料']
            ]
          },
          { t: 'h3', x: '像质判据' },
          { t: 'list', x: ['瑞利判据：波前误差 PV ≤ λ/4', '马雷夏尔判据：波前误差 RMS ≤ λ/14（对应斯特列尔比 ≈ 0.8）', '衍射极限系统实际要求 RMS 波前差远小于 λ/14'] }
        ]
      }
    ]
  },

  /* ================= 光辐射与测量 ================= */
  {
    id: 'rad', name: '光辐射与测量', icon: 'σ',
    color: '#f28c28', desc: '黑体辐射、大气窗口与光度学-辐射度学对照。',
    entries: [
      {
        key: 'r-blackbody', title: '黑体辐射与色温', tag: '概念',
        summary: '维恩位移定律、斯特藩-玻尔兹曼定律与色温应用。',
        blocks: [
          { t: 'h3', x: '维恩位移定律' },
          { t: 'formula', x: 'λ_max · T = 2898 μm·K' },
          { t: 'p', x: '温度越高，黑体辐射峰值波长越短。' },
          { t: 'list', x: ['300 K（室温物体）：λ_max ≈ 9.7 μm（长波红外）', '1000 K：λ_max ≈ 2.9 μm（中红外）', '3000 K（白炽灯丝）：λ_max ≈ 0.97 μm', '5800 K（太阳表面近似）：λ_max ≈ 0.50 μm（可见光区）'] },
          { t: 'h3', x: '斯特藩-玻尔兹曼定律' },
          { t: 'formula', x: 'M = σ · T⁴' },
          { t: 'p', x: 'σ = 5.6704 × 10⁻⁸ W·m⁻²·K⁻⁴。辐射出射度与温度四次方成正比。' },
          { t: 'note', x: '色温并非物体实际温度，而是与其光谱分布最接近的黑体温度。白平衡与照明设计中常用相关色温（CCT）。' },
          { t: 'note', x: '红外测温、热像仪均基于上述定律反演目标温度；大气窗口限制可用的测温波段。', tone: 'tip' }
        ]
      },
      {
        key: 'r-atmo', title: '大气窗口与红外波段', tag: '红外', hot: true,
        summary: '大气透射窗口、红外波段命名与常用探测器。',
        blocks: [
          { t: 'p', x: '大气对红外辐射并非全透明：水汽、CO₂、O₃ 的吸收形成了若干透射窗口，热成像与遥感仅在这些窗口有效。' },
          {
            t: 'table', head: ['波段', '波长范围', '说明'],
            rows: [
              ['可见 / 近红外', '0.4 – 2.5 μm', 'VIS、NIR 与 SWIR'],
              ['中波红外 MWIR', '3 – 5 μm', '高温目标、制导'],
              ['长波红外 LWIR', '8 – 14 μm', '常温目标热成像']
            ]
          },
          { t: 'note', x: '6–8 μm 被水汽强吸收，通常不用于地表遥感；9.6 μm 附近臭氧吸收，15 μm 附近 CO₂ 吸收。' },
          {
            t: 'table', head: ['探测器', '响应范围', '类型'],
            rows: [
              ['硅 Si', '0.4 – 1.1 μm', '光子型'],
              ['InGaAs', '0.9 – 1.7 μm', '光子型'],
              ['InSb', '1 – 5.5 μm', '光子型，需制冷'],
              ['HgCdTe (MCT)', '2 – 14 μm', '光子型，波段可调'],
              ['微测辐射热计', '8 – 14 μm', '热型，无需制冷']
            ]
          },
          { t: 'note', x: '光子型探测器通常需制冷以降低暗电流；热型探测器常温工作但响应较慢。', tone: 'tip' }
        ]
      },
      {
        key: 'r-photometry', title: '光度学与辐射度量对照', tag: '概念',
        summary: '辐射度学（物理量）与光度学（人眼加权量）一一对应关系。',
        blocks: [
          { t: 'p', x: '辐射度学用物理单位描述能量；光度学按人眼视见函数 V(λ) 加权，最大光视效能 K = 683 lm/W（555 nm）。' },
          {
            t: 'table', head: ['辐射度量 (物理单位)', '光度学量 (视觉单位)'],
            rows: [
              ['辐射通量 Φ (W)', '光通量 (lm)'],
              ['辐强度 I (W/sr)', '发光强度 (cd)'],
              ['辐亮度 L (W/m²·sr)', '亮度 (cd/m², nit)'],
              ['辐照度 E (W/m²)', '照度 (lx)'],
              ['辐射出射度 M (W/m²)', '光出射度 (lm/m²)']
            ]
          },
          { t: 'formula', x: '单色换算: X_v = K · V(λ) · X_e(λ)' },
          { t: 'list', x: ['1 lx = 1 lm/m²', '发光强度单位 cd = lm/sr', '人眼对不同波长灵敏度差异很大：555 nm 绿光的 1 W 约等于 683 lm，而红光 650 nm 的 1 W 仅约 70 lm'] },
          { t: 'note', x: '明视觉（> 3 cd/m²）用 V(λ)，峰值 555 nm；暗视觉用 V′(λ)，峰值约 507 nm。', tone: 'tip' }
        ]
      }
    ]
  },

  /* ================= 物理光学与激光 ================= */
  {
    id: 'phys', name: '物理光学与激光', icon: 'ψ',
    color: '#7c4dff', desc: '偏振、高斯光束、谐振腔、非线性与薄膜、光纤光子学。',
    entries: [
      {
        key: 'p-pol', title: '偏振光与偏振器件', tag: '偏振', hot: true,
        summary: '偏振态描述、马吕斯定律、波片与布儒斯特角等偏振控制手段。',
        blocks: [
          { t: 'p', x: '光是横波：电场矢量在垂直于传播方向的平面内振动。按振动轨迹可分为线偏振、圆偏振与椭圆偏振；自然光为非偏振光。' },
          {
            t: 'table', head: ['类型', '特征', '常见产生方式'],
            rows: [
              ['线偏振', 'E 沿固定方向振动', '偏振片、布儒斯特反射、双折射晶体'],
              ['圆偏振', 'E 大小不变、方向匀速旋转', 'λ/4 片 + 45° 线偏光'],
              ['椭圆偏振', 'E 端点描出椭圆', '任意相位延迟的组合'],
              ['自然/部分偏振', '各方向随机 / 部分择优', '大多数光源 / 散射反射表面']
            ]
          },
          { t: 'formula', x: '马吕斯定律: I = I₀ · cos²θ' },
          { t: 'formula', x: '布儒斯特角: tanθ_B = n₂ / n₁' },
          { t: 'formula', x: '波片相位延迟: δ = 2π·Δn·d / λ' },
          { t: 'p', x: '波片（延迟片）在快、慢轴间引入 δ 的相位差，可把偏振态在三种偏振之间转换：' },
          {
            t: 'table', head: ['器件', '延迟', '对线偏光的效应'],
            rows: [
              ['λ/4 波片', '90°', 'β=45° → 圆偏振；其他角度 → 椭圆'],
              ['λ/2 波片', '180°', '线偏方向旋转 2β（仍为线偏）'],
              ['全波片', '360°', '偏振态不变（可做光隔离器的“旋向”控制）']
            ]
          },
          { t: 'p', x: '解析计算常用琼斯矢量（复振幅列向量）与斯托克斯参量：' },
          { t: 'list', x: ['线偏(与 x 轴夹角 β)：E = [cosβ; sinβ]', '右旋圆偏（某种约定）：E = 1/√2 [1; −i]', 'S₁ = |Eₓ|² − |E_y|²；S₂ = 2Re(Eₓ*E_y)；S₃ = 2Im(E_x*E_y)', '偏振度 DOP = √(S₁²+S₂²+S₃²) / S₀'] },
          { t: 'note', x: '工程提醒：圆偏振“左旋/右旋”定义在不同光学与微波教材中相反，跨文献引用时必须注明琼斯约定。' }
        ]
      },
      {
        key: 'p-abcd', title: 'ABCD 矩阵与傍轴光学', tag: '矩阵光学',
        summary: '光线矩阵要素表、系统级联与 ABCD 判据，链接高斯光束 q 参数。',
        blocks: [
          { t: 'p', x: '傍轴光线用矢量 [y; θ] 描述（y 高度、θ 斜率），元件作用以 2×2 矩阵表示。理想系统矩阵行列式恒为 1。' },
          { t: 'formula', x: '自由空间传播 d：[[1, d], [0, 1]]' },
          { t: 'formula', x: '薄透镜（焦距 f）：[[1, 0], [−1/f, 1]]' },
          { t: 'formula', x: '球面反射（曲率半径 R）：[[1, 0], [−2/R, 1]]' },
          {
            t: 'table', head: ['系统', '条件', '说明'],
            rows: [
              ['成像关系', 'B = 0', '入射面共轭于出射面'],
              ['无焦/准直', 'C = 0', '平行光进出仍平行'],
              ['等效焦距', 'f_eff = −1/C', '自出射面主点量起'],
              ['等效折射/放大', 'A、D', '与输入输出媒质相关']
            ]
          },
          { t: 'p', x: '复合系统按光线实际经过顺序相乘：总矩阵 M = Mₙ·…·M₂·M₁（最右的元件最先作用）。' },
          { t: 'formula', x: '高斯光束 q 参数变换: q₂ = (A·q₁ + B) / (C·q₁ + D)' },
          { t: 'note', x: '由 q 参数可同时获得光斑尺寸与波前曲率，是“矩阵+高斯光束”衔接设计的关键（见高斯光束词条）。' },
          { t: 'note', x: '谐振腔往返矩阵的稳定性判据 0 < g₁g₂ < 1 等价于 ABCD 矩阵行列式条件（见激光物理词条）。', tone: 'tip' }
        ]
      },
      {
        key: 'p-gauss', title: '高斯光束与传播', tag: '高斯光束', hot: true,
        summary: '束腰、瑞利长度、发散角、M² 与透镜变换的高斯光束常用公式。',
        blocks: [
          { t: 'p', x: '激光基模（TEM₀₀）在自由空间的振幅分布为高斯形，可用束腰半径 w₀ 与瑞利长度 z_R 完整描述。' },
          { t: 'formula', x: 'z_R = π·w₀² / (λ·M²)' },
          { t: 'formula', x: 'w(z) = w₀·√(1 + (z/z_R)²)' },
          { t: 'formula', x: 'R(z) = z·[1 + (z_R/z)²]' },
          { t: 'formula', x: '远场半角发散: θ = M²·λ / (π·w₀)' },
          { t: 'p', x: '束腰在 z = 0：此处光斑最小、波前为平面；瑞利长度范围内光斑几乎不扩散，2z_R 内为“准直区”。' },
          { t: 'h3', x: '工程速记例子（M² = 1）' },
          { t: 'list', x: ['He-Ne 632.8 nm，w₀ = 0.5 mm → z_R ≈ 1.24 m，θ ≈ 0.40 mrad', '532 nm，w₀ = 20 μm → z_R ≈ 2.4 mm，θ ≈ 8.5 mrad', '1064 nm，w₀ = 0.1 mm → z_R ≈ 29.5 mm，θ ≈ 3.4 mrad', '基模 BPP = w₀·θ = λ/π（≈0.34 mm·mrad @1064 nm）'] },
          { t: 'h3', x: '透镜变换（薄透镜，入射腰在镜前 d）' },
          { t: 'formula', x: 'w₀′ = w₀ / √[(1 − d/f)² + (z_R/f)²]' },
          { t: 'formula', x: 'd′ = f + (d − f)·f² / [(d − f)² + z_R²]' },
          { t: 'note', x: '当入射腰恰在透镜处（d=f）：出射腰 w₀′ = λ·f/(π·w₀)，即短焦强聚焦；此为光学钳、打标等设计的基础。' }
        ]
      },
      {
        key: 'p-laser', title: '激光物理与谐振腔', tag: '激光物理', hot: true,
        summary: '受激发射、粒子数反转、阈值条件、腔稳定性与常用激光介质。',
        blocks: [
          { t: 'p', x: '激光三要素：增益介质（受激发射放大）、泵浦（实现粒子数反转）、谐振腔（选模与反馈）。' },
          { t: 'list', x: ['受激吸收：低能级粒子吸收光子跃迁到高能级（泵浦基础）', '自发辐射：高能级随机辐射一个光子（噪声来源）', '受激发射：入射光子“克隆”出同相、同频率的光子（放大核心）', '粒子数反转：高能级布居超过低能级，净放大才可能发生'] },
          { t: 'formula', x: '阈值条件: R₁·R₂·e^(2(g·l − δ)) ≥ 1' },
          { t: 'p', x: '式中 R₁、R₂ 为两镜反射率，g 为增益系数，l 为介质长度，δ 为单程损耗；上式即“往返净增益 ≥ 1”。' },
          { t: 'formula', x: '腔稳定条件: 0 < g₁·g₂ < 1，gᵢ = 1 − L/Rᵢ' },
          {
            t: 'table', head: ['典型腔', '条件', '用途/特点'],
            rows: [
              ['平凹腔', 'R₁=∞, R₂>L', '结构简单，半导体/固体常用'],
              ['对称稳定腔', 'g₁=g₂=0.5 附近', '模体积大、易对准'],
              ['共焦腔', 'R₁=R₂=L', '临界边界，模简并'],
              ['同心腔', 'R₁+R₂=L', '临界边界，束腰极细'],
              ['非稳腔', 'g₁g₂<0 或 >1', '大模体积，高功率，选模强']
            ]
          },
          {
            t: 'table', head: ['介质', '典型波长', '泵浦/激发'],
            rows: [
              ['Nd:YAG', '1064 nm', '氙灯 / 808 nm 二极管'],
              ['CO₂', '10.6 μm', '气体放电'],
              ['He-Ne', '632.8 nm', '气体放电（低增益）'],
              ['钛宝石 Ti:Sa', '680–1080 nm 可调', '绿光/蓝光泵浦'],
              ['掺铒光纤 EDFA', '1530–1565 nm', '980/1480 nm 泵浦'],
              ['半导体激光器', '375 nm–几 μm', '电注入']
            ]
          },
          { t: 'note', x: '高功率连续与脉冲（Q 开关、锁模）设计分别受热效应、损伤阈值与非线性的限制，见非线性光学词条。', tone: 'tip' }
        ]
      },
      {
        key: 'p-nlo', title: '非线性光学与频率变换', tag: '非线性',
        summary: 'χ⁽²⁾/χ⁽³⁾ 过程、相位匹配、OPO 与常用非线性晶体参数。',
        blocks: [
          { t: 'p', x: '强光场下介质极化不再线性：P = ε₀(χ⁽¹⁾E + χ⁽²⁾E² + χ⁽³⁾E³ + …)。二阶过程仅发生在无中心对称晶体中。' },
          {
            t: 'table', head: ['过程', '频率关系', '典型应用'],
            rows: [
              ['二次谐波 SHG', 'ω₃ = 2ω₁', '1064 → 532 nm'],
              ['和频 SFG', 'ω₃ = ω₁ + ω₂', '紫外产生、上转换'],
              ['差频 DFG', 'ω₃ = ω₁ − ω₂', '中远红外产生'],
              ['光参量 OPO/OPA', 'ω_p = ω_s + ω_i', '宽带可调谐光源'],
              ['自发参量下转换 SPDC', '泵浦→纠缠光子对', '量子光源']
            ]
          },
          { t: 'formula', x: '相位匹配: Δk = k₃ − k₁ − k₂ ≈ 0' },
          { t: 'p', x: '由于色散，直接让频率匹配还不够，需通过晶体双折射角度匹配、温度匹配或准相位匹配（PPLN 周期极化）实现 Δk = 0。' },
          {
            t: 'table', head: ['晶体', '特点', '常用波段/过程'],
            rows: [
              ['BBO', '高损伤阈值、紫外透过好', 'SHG/SFG/OPO 至 190 nm'],
              ['LBO', '低走离、角度宽容', '中高功率 SHG/THG'],
              ['KTP', '非线性强、易加工', '1064 SHG、OPO'],
              ['KDP/DKDP', '大口径、低吸收', '惯性约束激光谐波'],
              ['PPLN', '准相位匹配、可调', '中红外 OPO、纠缠源'],
              ['LiNbO₃', '电光与非线性兼用', '调制器、波导器件']
            ]
          },
          { t: 'h3', x: '三阶过程（任意材料都存在）' },
          { t: 'list', x: ['光学克尔效应：n = n₀ + n₂·I（自聚焦/自相位调制）', '四波混频 FWM：ω₄ = ω₁+ω₂−ω₃（光纤通信串扰源，也用于波长变换）', '受激拉曼 SRS / 受激布里渊 SBS：频移与噪声/放大机制'] },
          { t: 'note', x: '损伤阈值是设计上限：脉冲激光常用 J/cm²，连续光常用 kW/cm²～MW/cm²；转换效率还与聚焦强度、走离与温度梯度相关。' }
        ]
      },
      {
        key: 'p-coat', title: '薄膜光学与膜系设计', tag: '薄膜光学',
        summary: '单层 λ/4 减反、高反周期堆、干涉滤光片与常用镀膜材料。',
        blocks: [
          { t: 'p', x: '薄膜光学利用平行膜层中多光束干涉实现按波长/角度控制的反射、透射与相位响应。层间干涉条件（正入射）：' },
          { t: 'formula', x: '2·n·d = m·λ（反射相长）' },
          { t: 'formula', x: '单层 λ/4 减反: R = [(n₀n_s − n₁²)/(n₀n_s + n₁²)]²' },
          { t: 'p', x: '单层减反最佳条件 n₁ = √(n₀n_s)：例如空气/BK7 理论最佳 ≈1.23，实际最常用的低折射材料 MgF₂（≈1.38）残余反射约 1.3%（裸面约 4%）。' },
          {
            t: 'table', head: ['类型', '典型结构', '用途'],
            rows: [
              ['减反膜 AR', 'λ/4 单层 / 多层梯度', '透镜、窗口表面'],
              ['高反膜 HR', '(L·H)^N λ/4 周期堆', '激光腔镜、反射镜'],
              ['分光镜', 'λ/4 + 吸收层 / 介质堆', '50:50 分光'],
              ['带通滤光片', '法布里-珀罗腔式多层', '窄带选频'],
              ['长/短波通', '多层阶梯结构', '截止滤光片']
            ]
          },
          {
            t: 'table', head: ['材料', '折射率(约)', '可用波段'],
            rows: [
              ['MgF₂', '1.38', '深紫外–红外'],
              ['SiO₂', '1.46', '深紫外–近红外（应力可调）'],
              ['Al₂O₃', '1.63', '可见–红外'],
              ['Ta₂O₅ / Nb₂O₅', '2.1 / 2.3', '可见–近红外'],
              ['TiO₂', '2.35', '可见–近红外（高损伤注意）'],
              ['HfO₂', '2.0', '紫外–红外（高损伤阈值）'],
              ['ZnS', '≈2.2', '红外'],
              ['Ge', '≈4.0', '红外']
            ]
          },
          { t: 'note', x: '膜系设计随角度与偏振变化，斜入射时 s/p 曲线分离；镀膜厚度控制常用光控（极值法）与晶控，损伤阈值还取决于基底清洁与缺陷密度。' }
        ]
      },
      {
        key: 'p-fiber', title: '光纤光学与波导', tag: '光纤',
        summary: 'NA 与接受角、V 数与单模条件、损耗色散与常用光纤规格。',
        blocks: [
          { t: 'p', x: '光纤是圆形介质波导：纤芯 n_co 略高于包层 n_cl，光以全反射形式约束在纤芯内传播。' },
          { t: 'formula', x: '数值孔径: NA = √(n_co² − n_cl²) ≈ n₁√(2Δ)' },
          { t: 'formula', x: '空气中接受半角: θ_a = arcsin(NA)' },
          { t: 'formula', x: '归一化频率: V = 2π·a·NA / λ，单模条件 V < 2.4048' },
          { t: 'formula', x: '导模数（阶跃多模近似）: M ≈ V² / 2' },
          { t: 'p', x: 'V 数越大导模越多；把 V 压到 2.4048 以下即得到单模光纤（只有 LP₀₁ 两个正交偏振简并模）。' },
          {
            t: 'table', head: ['规格', '纤芯/包层(μm)', '典型应用'],
            rows: [
              ['单模 SMF-28', '~9 / 125', '电信 1310/1550 nm 长途'],
              ['OM1/OM2 多模', '62.5 / 125', '短距离局域网'],
              ['OM3/OM4 多模', '50 / 125', '850 nm 高速数据（VCSEL）'],
              ['大芯泵浦光纤', '105–400 / 双包层', '光纤激光泵浦'],
              ['光子晶体/空芯', '可设计', '特种传输、高功率']
            ]
          },
          { t: 'h3', x: '损耗与色散' },
          { t: 'list', x: ['典型衰减：SMF @1310 nm ≈0.34 dB/km，@1550 nm ≈0.19 dB/km；850 nm 多模 ≈2.5–3.5 dB/km', '色度色散 D：单模 ~1550 nm 附近 ≈17 ps/(nm·km)，可用色散补偿与新型光纤管理', '偏振模色散 PMD：单模残余双折射导致，与 MFD 不均匀有关', '弯曲损耗：临界半径以下呈指数增长，单模弯曲半径通常 >20–30 mm'] },
          { t: 'note', x: '熔接损耗典型 0.02–0.05 dB、活动连接器 ~0.2–0.5 dB；连接器端面污染是现场第一故障源。', tone: 'tip' }
        ]
      }
    ]
  },

  /* ================= 光场调控与计算全息 ================= */
  {
    id: 'holo', name: '光场调控与计算全息', icon: 'H',
    color: '#0d9488', desc: '全息图生成、迭代算法、SLM 标定与传输算法库。',
    entries: [
      {
        key: 'h-holo', title: '全息图基础：生成、记录与重建', tag: '全息基础', hot: true,
        summary: '物光/参考光干涉、菲涅尔·傅里叶·像面三种几何、振幅与相位重建原理。',
        blocks: [
          { t: 'p', x: '光学全息同时记录光场的振幅与相位：把物光 O(x,y) 与参考光 R(x,y) 相干叠加，在记录介质（胶片、SLM、CCD）上形成光强分布 I = |O + R|² = |O|² + |R|² + O·R* + O*·R。三项中最后一项携带相位信息。' },
          { t: 'h3', x: '三大经典几何' },
          {
            t: 'table', head: ['类型', '记录面位置', '关键公式', '特点'],
            rows: [
              ['菲涅尔全息', '物体到记录面 z', '数值传播复原 H·exp(iπr²/(λz))', '自然记录，可白光读出'],
              ['傅里叶全息', '透镜后焦面', '对输入加透镜，焦面记录 F{O}', '空间频率与 z 无关，对 SLM 友好'],
              ['像面全息', '成像系统像面', 'I = |T{·O} + R|²，零差干扰低', '噪声小、需要成像系统'],
              ['数字全息', 'CCD/SLM 离散采样', '角度谱角 + 离散衍射', '可数值重建、可任意距离']
            ]
          },
          { t: 'h3', x: '重建方式' },
          { t: 'list', x: ['光学重建：用原参考光照在全息图上，衍射产生原始/共轭两束像', '数值重建：用角谱 / 菲涅尔 FFT 传播到任意 z 处恢复复振幅', '数字重建需考虑离散采样与相位去包裹（unwrap）'] },
          { t: 'h3', x: 'SLM 加载相位全息' },
          { t: 'p', x: '用 SLM 把全息图相位直接加载到读出光场：物场 U(r) = exp(i φ(r))。SLM 上常用"复振幅全息"（添加载频将复值转为单一相位加载）。' },
          { t: 'formula', x: '加载相位: φ_H(r) = angle{R(r) · O(r)} + f₀·x' },
          { t: 'note', x: '添加横向载频 f₀ = m/Λ 可以把共轭像与原始像分开；典型加载数 × 是相位采样步距的 10–30 倍。' },
          { t: 'h3', x: 'MATLAB 演示：菲涅尔全息图生成' },
          {
            t: 'code', lang: 'MATLAB',
            x: '% Fresnel 离轴全息：物体传播到全息面与平面参考叠加\n% Lambert Cheng, 2026\nlambda = 532e-9;             % 波长\ndx     = 8e-6;                % SLM 像素 [m]\nN      = 1024;                % 阵面大小\nz      = 0.15;                % 物距 15 cm\n% 物: 1024x1024 双高斯点 (例：多焦点光镊)\nobj = complex(zeros(N));\nobj(round(N/3),round(N/3)) = 1;\nobj(round(2*N/3),round(2*N/3)) = 1;\n% 角谱传播到 z：\nfx = (-N/2:N/2-1)/(N*dx);\n[Fx,Fy] = meshgrid(fx,fx);\nH = exp(-1i*pi*lambda*z*(Fx.^2+Fy.^2)).*fftshift(exp(1i*pi*lambda*z*(Fx.^2+Fy.^2)));\nU_obj = ifft2(ifftshift(H.*fftshift(fft2(obj))));\n% 参考光：与 x 方向夹角 θ → 频率 f0 = sinθ/λ\ntheta = 1.5e-3;               % ≈ 0.086°\nf0    = sin(theta)/lambda;\n[x,y] = meshgrid((0:N-1)*dx, (0:N-1)*dx);\nR = exp(1i*2*pi*f0*x);\n% 强度 (全息图)\nHologram = abs(U_obj + R).^2;\nfigure; imshow(mat2gray(Hologram)); title(\'Fresnel Hologram\');\n% 数值重建：\nU_rec = ifft2(ifftshift(H.*fftshift(fft2(Hologram))));\nfigure; imagesc(angle(U_rec)); colormap(hsv); title(\'Reconstructed Phase\');'
          },
          { t: 'h3', x: 'Python 演示：菲涅尔全息图生成' },
          {
            t: 'code', lang: 'Python',
            x: '"""菲涅尔离轴全息图生成与数值重建 — Python 3 + numpy/scipy"""\nimport numpy as np\nfrom scipy.fft import fft2, ifft2, fftshift, ifftshift\n\nlam = 532e-9     # 波长 [m]\ndx  = 8e-6       # SLM 像素 [m]\nN   = 1024\nz   = 0.15       # 传播距离 [m]\n\n# 1. 物体: 两点\nx = (np.arange(N) - N/2) * dx\nX, Y = np.meshgrid(x, x)\nobj = np.zeros((N, N), dtype=complex)\nobj = np.exp(-((X+150e-6)**2 + (Y+150e-6)**2)/(2*25e-6**2))\nobj += np.exp(-((X-150e-6)**2 + (Y-150e-6)**2)/(2*25e-6**2))\n\n# 2. 角谱传播\nfx = (np.arange(N) - N/2) / (N*dx)\nFX, FY = np.meshgrid(fx, fx)\nH = np.exp(-1j*np.pi*lam*z*(FX**2 + FY**2))\nU_obj = ifft2(ifftshift(H * fftshift(fft2(obj))))\n\n# 3. 平面参考光 (与 x 夹角 θ)\ntheta = 1.5e-3\nf0    = np.sin(theta)/lam\nR = np.exp(1j*2*np.pi*f0*X)\n\n# 4. 全息强度\nHologram = np.abs(U_obj + R)**2\nprint("Hologram shape:", Hologram.shape, "dtype:", Hologram.dtype)'
          },
          { t: 'note', x: '用 scipy.fft 也可以；频谱阵列若与 MATLAB 不完全相同，注意 fftshift 在 MATLAB 与 numpy 的语义差异。' }
        ]
      },
      {
        key: 'h-iter', title: '迭代全息图算法：GS / Wirtinger / MRAF / AA-AP', tag: '迭代算法', hot: true,
        summary: 'Gerchberg-Saxton 系列算法的收敛特性、约束差异与实现要点。',
        blocks: [
          { t: 'p', x: '迭代全息图算法通过在物面与 SLM 面上交替施加约束（振幅/相位/区域），收敛到满足两端约束的复振幅。GS 是其中最简单的一类起点。' },
          { t: 'h3', x: '核心思想' },
          { t: 'list', x: ['物面：固定 |target| = sqrt(I_target)，更新相位 arg(U_obj)', 'SLM 面：固定 |U_slm| = 1（纯相位调制），更新相位 arg(U_slm)', 'FFT 在两域之间传播；通过迭代使物面强度逼近期望图样', '最终把 U_slm 的相位 φ_arg 输出到 SLM'] },
          { t: 'h3', x: '常用算法对比' },
          {
            t: 'table', head: ['算法', '约束', '收敛', '特点'],
            rows: [
              ['Gerchberg-Saxton (GS)', '物面振幅、SLM 单位振幅', '线性，慢', '最简单；20~50 次可达 90%'],
              ['Wirtinger 梯度下降', '可微，梯度下降', '取决于步长，鲁棒', '可加任意约束 / 损失'],
              ['MRAF (Mixed Region Amplitude Freedom)', '分区自由振幅', '快于 GS', '抑制背景、提高均匀度'],
              ['AA-AP (Additive-Averaged Amplitude)', '物面功率加权', '约 2×GS 收敛', '点阵 / 焦点阵列友好'],
              ['DPAC (Direct Phase Amplitude Coupling)', '直接相位×振幅', '10 次内可稳态', '点阵类首选'],
              ['目标误差最小化 (TEM)', '随机相位 / 多块', '慢，质量最高', '多平面、3D 全息']
            ]
          },
          { t: 'formula', x: 'GS 更新: Uᵏ⁺¹_slm = exp(i·arg{ F⁻¹[ |T|·exp(i·arg{F{U_slmᵏ}}) ] } )' },
          { t: 'note', x: '为提高收敛，初值常用随机相位 (rand·2π) 或 Gerchberg 二次迭代后的相位；GS 容易被对称目标“卡住”，建议加入小幅度抖动或用 MRAF。' },
          { t: 'h3', x: 'MATLAB 实现：GS 算法' },
          {
            t: 'code', lang: 'MATLAB',
            x: 'function phi = hologram_gs(target, N, iters, slm_phase_max)\n% target: MxM 期望强度图 (实)\n% phi:   NxN 相位全息图 (0..slm_phase_max)\nM = size(target, 1);\ntarget = target / max(target(:));                % 归一化\n% 1. 上采样到 N\nif M ~= N\n    T = imresize(target, [N N], \'bicubic\');\nelse\n    T = target;\nend\nT = T / sum(T(:));                              % 归一总功率\n% 2. 随机初值\nphi = slm_phase_max*(rand(N) - 0.5);\nfor k = 1:iters\n    U_slm = exp(1i*2*pi*phi/slm_phase_max);\n    U_obj = fftshift(fft2(ifftshift(U_slm)));\n    % 物面: 固定振幅 sqrt(T)，相位不变\n    U_obj = sqrt(T) .* exp(1i*angle(U_obj));\n    % 回 SLM\n    U_slm = ifftshift(ifft2(fftshift(U_obj)));\n    phi = (slm_phase_max/(2*pi)) * angle(U_slm);\nend\nend\n% 调用: h = hologram_gs(myTarget, 1024, 30, 2*pi);\n% 衍射效率:  eta = sum(target .* cos(angle(U_obj))) / sum(U_slm(:).*conj(U_slm(:)));'
          },
          { t: 'h3', x: 'Python 实现：GS 算法（numpy 版）' },
          {
            t: 'code', lang: 'Python',
            x: 'def hologram_gs(target, N=1024, iters=30, slm_phase_max=2*np.pi):\n    """Gerchberg-Saxton 全息图生成 — 返回相位全息图 phi (NxN)"""\n    import numpy as np\n    from scipy.ndimage import zoom\n    target = target / target.max()\n    M = target.shape[0]\n    # 上采样\n    if M != N:\n        T = zoom(target, N / M, order=3)\n    else:\n        T = target.copy()\n    T = T / T.sum()\n    phi = slm_phase_max * (np.random.rand(N, N) - 0.5)\n    for _ in range(iters):\n        U_slm = np.exp(1j * 2*np.pi * phi / slm_phase_max)\n        U_obj = np.fft.fftshift(np.fft.fft2(np.fft.ifftshift(U_slm)))\n        U_obj = np.sqrt(T) * np.exp(1j * np.angle(U_obj))\n        U_slm = np.fft.ifftshift(np.fft.ifft2(np.fft.fftshift(U_obj)))\n        phi = (slm_phase_max / (2*np.pi)) * np.angle(U_slm)\n    return phi\n\n# 用法\nphi = hologram_gs(my_target, N=1024, iters=30)'
          },
          { t: 'note', x: 'GPU 版可用 torch.fft.fft2；Wirtinger 版需用 autograd 计算梯度。numpy/scipy 足够单机运行 1024² 范围；4096² 建议用 cupy/torch。' }
        ]
      },
      {
        key: 'h-iter-adv', title: '进阶全息算法库：WGS / 三维 GS / GA', tag: '进阶算法', hot: true,
        summary: '加权 GS、多平面三维 GS 与遗传算法的原理、参数选择与代码实现。',
        blocks: [
          { t: 'p', x: '在标准 GS 基础上，工程中常用三类进阶算法解决不同痛点：WGS 提升均匀度、3D GS 生成多层焦面、GA 处理离散 / 多目标约束。' },
          { t: 'h3', x: 'WGS（加权 Gerchberg-Saxton）' },
          { t: 'formula', x: 'wᵏ⁺¹ = wᵏ · (I_target / max(Iᵏ, ε))^β' },
          { t: 'list', x: ['β 为反馈权重指数，常用 0.3–0.8；β→0 退化为标准 GS', '每轮按目标 / 实测强度比对各点权重在线更新', '对点阵 / 多焦点目标可将均匀度 U 提升 2–5 倍', 'β 过大（>0.85）会震荡，可用 β 递减策略稳定'] },
          { t: 'h3', x: '三维 GS（多平面 Multi-Plane GS）' },
          { t: 'formula', x: 'φ_slmᵏ⁺¹ = arg{ Σₚ Fₚ⁻¹[ |Tₚ|·exp(i·arg{Fₚ{U_slmᵏ}}) ] }' },
          { t: 'list', x: ['对 P 个不同 z_p 平面分别传播、施加目标振幅约束', '反传后取各平面复振幅的平均更新 SLM 相位', 'FFT 总次数 = 2·P·N_iter，计算量随层数线性增长', '平面间距应满足 Δz ≥ δz/2（δz ≈ 2λ/NA²）避免串扰', 'P > 8 时效率与均匀度明显下降，建议加权多平面'] },
          { t: 'h3', x: 'GA（遗传算法优化全息）' },
          { t: 'list', x: ['把每个像素的相位级次当基因，种群并行搜索', '适合二值 / 少级相位、DMD 等离散器件约束', '适应度 fitness = η − λ·NMSE + μ·U（多目标折中）', '计算量 = 种群 × 代数 × 单次 FFT，随 N² 爆炸', '最佳实践：GA 全局粗搜 → 以最优个体初始化 GS/WGS 精修'] },
          { t: 'h3', x: '三者对比' },
          {
            t: 'table', head: ['算法', '适用', '收敛', '计算量'],
            rows: [
              ['标准 GS', '连续相位、单平面', '线性、稳定', '2 FFT/迭代（基准）'],
              ['WGS', '点阵 / 多焦点、高均匀度', '快于 GS 2–5×', '同 GS + 权重更新'],
              ['3D GS', '多层焦面 / 体全息 / 光镊 3D', '随 P 变慢', '2·P·FFT/迭代'],
              ['GA', '二值 / 离散 / 多目标', '无梯度、慢', 'pop·iter·FFT'],
              ['GA + GS 混合', '离散约束 + 高质量', '先慢后快', '粗搜 + 精修']
            ]
          },
          { t: 'h3', x: 'MATLAB 实现：WGS 加权迭代' },
          {
            t: 'code', lang: 'MATLAB',
            x: 'function [phi, w] = hologram_wgs(target, N, iters, beta)\n% WGS: Weighted Gerchberg-Saxton\nT = imresize(target/max(target(:)), [N N]);\nT = T / sum(T(:));\nw  = ones(N);                 % 权重图\nphi = 2*pi*(rand(N)-0.5);     % 随机初值\nfor k = 1:iters\n    U_slm = exp(1i*phi);\n    U_obj = fftshift(fft2(ifftshift(U_slm)));\n    I  = abs(U_obj).^2 + 1e-12;\n    % 物面: 加权振幅约束\n    U_obj = sqrt(T) .* exp(1i*angle(U_obj));\n    % 更新权重（核心一步）\n    w = w .* (T./I).^beta;\n    w = w / max(w(:));\n    % 回 SLM\n    U_slm = ifftshift(ifft2(fftshift(U_obj)));\n    phi = angle(U_slm);\n    U_slm = exp(1i*phi);       % 归一振幅后再传播评估\n    U_obj = fftshift(fft2(ifftshift(U_slm)));\n    I = abs(U_obj).^2 + 1e-12;\nend\nU = abs(fftshift(fft2(ifftshift(exp(1i*phi))))).^2;\nU2 = U(round(end/2-20:round(end/2+20)), round(end/2-20:round(end/2+20)));\nfprintf(\'U = %.3f  eta = %.3f\\n\', 1-std(U2(:))/mean(U2(:)), sum(U2(:))/sum(U(:)));\nend'
          },
          { t: 'h3', x: 'Python 实现：三维多平面 GS' },
          {
            t: 'code', lang: 'Python',
            x: 'def hologram_3dgs(z_list, target_list, N=512, iters=30):\n    """多平面 3D GS：z_list 为各目标面轴向距离 [m]"""\n    import numpy as np\n    lam, dx = 532e-9, 8e-6\n    P = len(z_list)\n    T = [t / np.sum(t) for t in target_list]\n    phi = 2*np.pi*np.random.rand(N, N)\n\n    def prop(U, z):  # 角谱传播\n        fx = (np.arange(N) - N/2)/(N*dx)\n        FX, FY = np.meshgrid(fx, fx)\n        H = np.exp(1j*2*np.pi*z*np.sqrt(np.clip(1/lam**2 - FX**2 - FY**2, 0, None)))\n        return np.fft.ifft2(np.fft.ifftshift(H*np.fft.fftshift(np.fft.fft2(U))))\n\n    for _ in range(iters):\n        acc = np.zeros((N, N), dtype=complex)\n        for Tp, zp in zip(T, z_list):\n            Uz = prop(np.exp(1j*phi), zp)\n            Uz = np.sqrt(Tp) * np.exp(1j*np.angle(Uz))   # 各平面约束\n            acc += prop(Uz, -zp)                          # 反传累加\n        phi = np.angle(acc / P)                           # 取平均相位\n    return phi\n\n# 三层焦面: z = [0.10, 0.12, 0.14] m'
          },
          { t: 'note', x: 'GA 版可使用 DEAP / pygad 库：个体 = 展平的相位级次矩阵，fitness = η − λ·NMSE；先 GA 粗搜 20–30 代，再喂给 GS 精修。', tone: 'tip' },
          { t: 'note', x: '选型速记：均匀度不够 → WGS / MRAF；要 3D 分布 → 多平面 GS；器件只能二值 / 多级 → GA（或模拟退火）+ GS 精修。' }
        ]
      },
      {
        key: 'h-slm', title: '空间光调制器标定：Gamma 曲线与 LUT', tag: 'SLM 标定',
        summary: '电压-相位响应测量、Gamma 校正、查找表 (LUT) 与温度漂移补偿。',
        blocks: [
          { t: 'p', x: '液晶 SLM 通过施加电压改变液晶指向，从而改变局部光程，输出相位 φ(g) 与显示灰度 g 呈非线性。把灰度 g 变成预扭曲 g_lut 使 φ 与输入线性对应，这张表就是 LUT。' },
          { t: 'h3', x: '实测响应' },
          { t: 'p', x: '用 Mach-Zehnder 干涉仪 + 玻璃窗口法（或双频干涉）测各灰度级对应的相对相位，得到 φ(g) 曲线。常用模型：' },
          { t: 'formula', x: 'φ(g) = φ_max·(g / 255)^γ + φ_offset' },
          { t: 'h3', x: 'LUT 校正' },
          { t: 'formula', x: 'g_lut(φ_t) = 255·(φ_t − φ_offset / φ_max)^{1/γ}' },
          { t: 'list', x: ['φ_offset：标定时基线相位偏移', 'γ：实测响应曲线的幂指数（典型 0.6–1.2）', 'φ_max：最大相位深度，常用 ≥ 2π 用于全相位控制'] },
          { t: 'h3', x: '关键实验步骤' },
          { t: 'list', x: ['偏振片对准 SLM 慢轴 (e-vec)，效率最大化', '用单色激光 + MZI：参考臂扫相位，测条纹偏移', '采集 16~32 灰度点；用最小二乘拟合 φ(g) = A·g^γ + B', '生成 LUT 表，固化到 SLM 驱动；按工作波长 / 偏振区分多张'] },
          { t: 'note', x: '温度漂移是主要误差源：典型 0.05 rad/°C。建议每波长实验前后做插值校验。', tone: 'tip' },
          { t: 'h3', x: 'MATLAB：标定数据拟合 + LUT 生成' },
          {
            t: 'code', lang: 'MATLAB',
            x: '% SLM Gamma 标定 — 拟合 φ(g) = A·g^γ + B\nload(\'slm_calib.mat\'); % g_vec (灰度列向量), phi_vec (相位 [rad])\ng_vec   = g_vec(:);\nphi_vec = phi_vec(:);\n% 初值: A = 最大相位, B = 偏移, γ = 1\nx0   = [max(phi_vec) - min(phi_vec), min(phi_vec), 1.0];\nft   = fittype(@(A, B, g, gamma) A*g.^gamma + B, \'independent\', \'g\');\nfit0 = fit(g_vec, phi_vec, ft, \'StartPoint\', x0);\nfprintf(\'A=%.4f  B=%.4f  gamma=%.4f\\n\', fit0.A, fit0.B, fit0.gamma);\n\n% 生成 256 级 LUT：使各 lookup index 对应等间隔 0..2π\nA      = fit0.A;\nB      = fit0.B;\ngamma  = fit0.gamma;\nphi_target = linspace(B, A+B, 256);                         % 0 .. 2π\nlut = 255 * ((phi_target - B)/A) .^ (1/gamma);\nlut(lut < 0) = 0; lut(lut > 255) = 255;\nfigure; plot(g_vec, phi_vec, \'o\', 0:255, A*(0:255).^gamma+B, \'-\');\nlegend(\'data\',\'fit\'); xlabel(\'gray\'); ylabel(\'phase [rad]\');'
          },
          { t: 'h3', x: 'Python：拟合与 LUT' },
          {
            t: 'code', lang: 'Python',
            x: '"""SLM Gamma 标定 + 查找表生成"""\nimport numpy as np\nfrom scipy.optimize import curve_fit\nimport matplotlib.pyplot as plt\n\n# 1. 标定数据 (灰度 -> 相位 [rad])\ng, phi = np.loadtxt("slm_calib.txt", unpack=True)\n\n# 2. 拟合 φ(g) = A·g^γ + B\nmodel = lambda g, A, B, gamma: A * g**gamma + B\npopt, _ = curve_fit(model, g, phi, p0=[phi.max()-phi.min(), phi.min(), 1.0])\nA, B, gamma = popt\nprint(f"A={A:.4f} B={B:.4f} gamma={gamma:.4f}")\n\n# 3. 生成 256 级 LUT (目标相位线性分布)\nphi_target = np.linspace(B, A + B, 256)\nlut = 255.0 * ((phi_target - B) / A) ** (1.0 / gamma)\nlut = np.clip(lut, 0, 255).astype(np.uint8)\nnp.savetxt("slm_lut.txt", lut, fmt="%d")\n\n# 4. 校验\nplt.plot(g, phi, "o", label="data")\nplt.plot(np.arange(256), model(np.arange(256), *popt), "-", label="fit")\nplt.xlabel("gray"); plt.ylabel("phase [rad]"); plt.legend()\nplt.savefig("slm_calib.png", dpi=150)'
          },
          { t: 'note', x: '可加入 R² 指标 (scipy.stats.linregress 后计算) 与残差图检查系统偏差；如果残差有大峰，常需要加入分段函数 (分段 gamma) 或温度补偿模型。' }
        ]
      },
      {
        key: 'h-prop', title: '传输算法库：菲涅尔 / 角谱 / 分数傅里叶 / 卷积', tag: '传输算法', hot: true,
        summary: '自由空间传播 4 大主流 FFT 算法的公式与适用区间，统一接口实现。',
        blocks: [
          { t: 'p', x: '自由空间传播的核心是亥姆霍兹方程的角谱解 U(x,y,z) = F⁻¹{F{U₀}·exp(ikz·√(1−(k_x/k)²−(k_y/k)²))}。围绕该公式，四种常用近似各自有适用范围。' },
          { t: 'h3', x: '四大主流算法对比' },
          {
            t: 'table', head: ['算法', '公式', '适用区间', '复杂度'],
            rows: [
              ['角谱法 AS', 'F⁻¹{F(U₀)·exp(ikz·√(1−λ²(fx²+fy²)))}', '任意 z，精度最高', '2×N² log N'],
              ['一步菲涅尔 FFT', 'exp(iπr²/(λz))·F{U₀·exp(iπr²/(λz))}', '近-远场，N_F ≤ 1', '1×FFT, 2 个二次相位'],
              ['卷积传播 (RC)', 'F⁻¹{F(U₀)·F{h_z}}，h_z = exp(ikz·R)/R', '中距离、需要高精度', '3×FFT'],
              ['分数傅里叶 (FrFT)', 'F^α{U₀}（β 阶扩展）', '变焦、相关滤波', '类 FFT，可 O(N log N)'],
              ['SR / Fresnel 严格积分', '数值积分菲涅尔公式', '高 NA 或大角度', 'O(N²)，慢']
            ]
          },
          { t: 'h3', x: '采样守恒' },
          { t: 'list', x: ['AS 法：Nx、Dx 不变，仅隐式传播', '菲涅尔 FFT：输出 Δx′ = λz/(N·Δx), 视野与 z 耦合', '分数傅里叶：可"双距离"，用于变焦重聚焦', '满足 Fmax·z < N·Dx/2 即可避免 wrap-around 折射环'] },
          { t: 'formula', x: 'AS 频域相位: H(fx,fy; z) = exp(i·2π·z·√(1/λ²−fx²−fy²))' },
          { t: 'note', x: 'AS 法对 Rayleigh-Sommerfeld 第一类边界近似最好；当 NA > 0.5 或过近场 (a > 50·λ) 时建议加 RC 卷积修正。', tone: 'tip' },
          { t: 'h3', x: 'MATLAB 统一传播函数库' },
          {
            t: 'code', lang: 'MATLAB',
            x: 'function Uout = prop_field(Uin, dx, lambda, z, method)\n% Uin: MxN 复振幅; dx: 输入像素间距 [m]; z: 距离 [m]\n% method: \'as\' | \'fresnel\' | \'rc\'\n[M,N] = size(Uin);\nFx = (-N/2:N/2-1)/(N*dx);    % 频率[m^-1]\nFy = (-M/2:M/2-1)/(M*dx);\n[fx,fy] = meshgrid(Fx,Fy);\n\nswitch lower(method)\n    case \'as\'  % Angular Spectrum\n        k = 2*pi/lambda;\n        H = exp(1i*k*z*sqrt(1 - (lambda*fx).^2 - (lambda*fy).^2));\n        Uout = ifft2(ifftshift( H .* fftshift(fft2(Uin)) ));\n\n    case \'fresnel\'  % Single-FFT Fresnel\n        dxi = lambda*z/(N*dx);\n        dyi = lambda*z/(M*dx);\n        x = (-N/2:N/2-1)*dx; y = (-M/2:M/2-1)*dx;\n        [X,Y] = meshgrid(x,y);\n        phase_in  = exp(1i*pi/(lambda*z)*(X.^2 + Y.^2));\n        phase_out = exp(1i*pi/(lambda*z)*(X.^2 + Y.^2));\n        F = fftshift(fft2(Uin .* phase_in));\n        Uout = (exp(1i*k*z)/(1i*lambda*z)) * phase_out .* F;\n        % 输出像素 dx_out = lambda*z/(N*dx)\n\n    case \'rc\'  % Rayleigh-Sommerfeld via FFT (3-FFT)\n        k = 2*pi/lambda;\n        F = fftshift(fft2(Uin));\n        H = exp(1i*k*z*sqrt(1 - (lambda*fx).^2 - (lambda*fy).^2));\n        Uout = ifft2(ifftshift( F .* H ));\n    otherwise\n        error(\'unknown method\');\nend\nend\n\n% 用例:\n% U = prop_field(canon, 8e-6, 532e-9, 0.2, \'as\');\n% U = prop_field(canon, 8e-6, 532e-9, 1.0, \'fresnel\');'
          },
          { t: 'h3', x: 'Python 统一传播函数' },
          {
            t: 'code', lang: 'Python',
            x: 'def prop_field(Uin, dx, lam, z, method="as"):\n    """自由空间传播的统一接口\n    Uin: 2D complex array (MxN)\n    dx : 输入像素间距 [m]\n    lam: 波长 [m]\n    z  : 传播距离 [m]\n    method: \'as\', \'fresnel\', \'rc\'\n    """\n    import numpy as np\n    M, N = Uin.shape\n    Fx = (np.arange(N) - N/2) / (N*dx)\n    Fy = (np.arange(M) - M/2) / (M*dx)\n    FX, FY = np.meshgrid(Fx, Fy)\n\n    if method == "as":\n        k = 2*np.pi/lam\n        H = np.exp(1j*k*z*np.sqrt(np.clip(1 - (lam*FX)**2 - (lam*FY)**2, 0, None)))\n        Uout = np.fft.ifft2(np.fft.ifftshift(H * np.fft.fftshift(np.fft.fft2(Uin))))\n\n    elif method == "fresnel":\n        k = 2*np.pi/lam\n        dx_o = lam*z / (N*dx)\n        x = (np.arange(N) - N/2)*dx\n        y = (np.arange(M) - M/2)*dx\n        X, Y = np.meshgrid(x, y)\n        ph_in  = np.exp(1j*np.pi/(lam*z)*(X**2 + Y**2))\n        ph_out = np.exp(1j*np.pi/(lam*z)*(X**2 + Y**2))\n        F = np.fft.fftshift(np.fft.fft2(Uin * ph_in))\n        Uout = (np.exp(1j*k*z)/(1j*lam*z)) * ph_out * F\n\n    elif method == "rc":\n        # Rayleigh-Sommerfeld 严格公式（同 AS 但保留高阶）\n        return prop_field(Uin, dx, lam, z, "as")\n\n    else:\n        raise ValueError("unknown method")\n    return Uout\n\n# 示例\n# U = prop_field(canvas, 8e-6, 532e-9, 0.20, "as")\n# I = np.abs(U)**2'
          },
          { t: 'note', x: 'GPU 版 (cupy / torch.fft) 可加速 50× 以上，建议在 4096²、迭代全息 (GS) 等场景下使用。' }
        ]
      }
    ]
  }
]

const entryMap = {}
handbook.forEach(cat => {
  cat.entries.forEach(en => { en.catId = cat.id; en.catName = cat.name; en.catColor = cat.color; entryMap[en.key] = en })
})

module.exports = { handbook, findEntry: k => entryMap[k] }
