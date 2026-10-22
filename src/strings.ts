/**
 * كل النصوص (strings) بتشوف المستخدم في مكان واحد (A4/A7).
 * الـ keys اللي القيم English (goal/level/equipment) هي constant values مخزَّنة —
 * العرض بالعربي من هنا.
 */

export const S = {
  /* ===== Hero ===== */
  hero: {
    badge: "مدربك الشخصي في جيبك",
    cta: "يلا نبدأ",
    foot: "مجاني · بدون إعلانات · بياناتك محفوظة على جهازك",
  },

  /* ===== Onboarding ===== */
  onboarding: {
    incomplete: "كمّل كل الخطوات الأول.",
    cancel: "إلغاء",
    next: "التالي",
    save: "احفظ",
    start: "ابدأ",
    qName: "اسمك إيه؟",
    phName: "اسمك",
    qAbout: "قولّنا عن نفسك",
    age: "العمر",
    years: "سنة",
    weight: "الوزن",
    height: "الطول",
    qGoal: "هدفك إيه؟",
    qTarget: "الوزن المستهدف",
    phTarget: "الوزن المستهدف",
    qLevel: "مستوى الخبرة؟",
    qDays: "تمرنين قد إيه في الأسبوع؟",
    qEquipment: "إيه المعدات المتاحة ليك؟",
    done: (name: string) => (name ? `جاهز يا ${name}!` : "جاهز!"),
    lblGoal: "الهدف",
    lblTarget: "المستهدف",
    lblLevel: "المستوى",
    lblDays: "أيام التمرين",
    daysWeek: "أيام/أسبوع",
  },

  /* ===== التابات ===== */
  home: {
    title: "تماريني",
    sub: (ex: number, days: number) => `${ex} تمارين على ${days} أيام`,
    start: "ابدأ التمرين",
    daysReady: (n: number) => `${n} أيام جاهزة`,
    noEx: "لسه مفيش تمارين",
    addHere: "اضغط + عشان تضيف تمارين",
    addExercise: "ضيف تمرين",
    quickLog: "خلصت التمرين — تسجيل سريع",
    addNewDay: "ضيف يوم جديد",
    dayLabelPh: "اسم اليوم (مثلاً Day 4 — Arms)",
    apply: "ضيف",
    cancel: "إلغاء",
    pickDay: "يلا نبدأ — اختار اليوم",
    pickDaySub: "بنكون وزن كل مجموعة ووقت الاستراحة تلقائيًا",
    empty: "فاضي",
    exCount: (n: number) => `${n} تمارين`,
    editTitle: "تعديل التمرين",
    sets: "مجموعات",
    reps: "عددات",
    weightPerSet: "وزن العدة",
    searchPh: "دوّر على التمرين...",
    swapBtn: "استبدل التمرين ببديل",
    swapTitle: "بدائل لنفس العضلة — اختار واحد",
    noResults: "مفيش نتايج",
    rename: "غيّر الاسم",
    removeEx: "احذف التمرين",
    deleteDay: "احذف اليوم",
    logged: "تم تسجيل التمرين 💪",
  },

  schedule: {
    title: "خطط جاهزة",
    sub: "اختار خطة وطبّقها على خطتك فورًا",
    apply: "طبّق على خطتي",
    emptyLevel: "مفيش خطط للمستوى ده",
    appliedOne: "الخطة اتطبّقت — يوم واحد مش اكتمل بالكامل، ممكن تضيف تمارين يدويًا",
    appliedMany: (n: number) => `الخطة اتطبّقت — ${n} أيام مش اكتملت بالكامل، ممكن تضيف تمارين يدويًا`,
  },

  progress: {
    title: "تقدمك",
    sub: (n: number) => `كل كيلو بتحسبه · ${n} تمرين مسجّل`,
    theme: "الثيم",
    // B8
    weekTitle: "الأسبوع ده",
    weekSub: (n: number, v: string) => `${n} ${n === 1 ? "تمرين" : "تمارين"} · حجم ${v}`,
    // B4
    exProgress: "تقدم أي تمرين",
    pickPh: "اختار التمرين",
    noSessions: "اختار تمرين تظهر لك أحدث جلساته",
    lastSessions: "أحدث الجلسات",
    // B5
    prTitle: "أرقامك الشخصية",
    prEmpty: "سجل تمارين بأوزان — يبنى لك الليست هنا",
    // B6
    bodyTitle: "وزن جسدك",
    bodyPh: "وزنك دلووقتي",
    save: "سجّل",
    bodyEmpty: "سجّل وزنك الأول — وتتتبخط هنا",
    // B7
    confirmDel: "متأكد؟ اضغط تاني",
    emptyRecent: "لسه مسجلتش تمرين",
  },

  session: {
    quit: "إلغاء",
    emptyDay: "اليوم ده فاضي — ضيف تمارين الأول",
    finished: (clock: string) => `تم التسجيل 💪 ${clock}`,
  },

  /* ===== الإعدادات (A7) ===== */
  settings: {
    title: "الإعدادات",
    editProfile: "تعديل الملف الشخصي",
    export: "تصدير البيانات (نسخة احتياطية)",
    import: "استيراد نسخة",
    theme: "اختار ثيم",
    rest: "الاستراحة الافتراضية",
    exported: "النسخة الاتنزّلت ✅",
    exportCsv: "تصدير CSV (Excel)",
    csvExported: "الملف الاتنزّل ✅",
    imported: "البيانات اترجعت ✅",
    importFailed: "الملف مش مفهوم — اتأكد إنه نسخة صح من التطبيق",
    importEmpty: "الملف مفيهوش بيانات مفهومة",
  },

  errorBoundary: {
    title: "حصلت مشكلة 😕",
    sub: "التمرين ما اتسيبش — بياناتك محفوظة على جهازك.",
    reload: "أعيد تحميل التطبيق",
  },

  levelLabel: (v: string): string =>
    v === "Beginner" ? "مبتدئ" : v === "Advanced" ? "متقدم" : v === "Intermediate" ? "متوسط" : v,

  goalLabel: (v: string): string =>
    v === "Cutting" ? "تخفيض" : v === "Bulking" ? "زيادة" : v === "General Fitness" ? "لياقة عامة" : v,

  equipmentLabel: (v: string): string =>
    v === "Full Gym" ? "جيم كامل" : v === "Dumbbells" ? "دمبلات" : v === "Barbell" ? "بار" : v === "Bodyweight Only" ? "وزن الجسم بس" : v,
} as const;
