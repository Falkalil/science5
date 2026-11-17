// بيانات الكتاب: الفهرس والمجسّمات — العلوم الصف الأول (رقم صفحة الملف = الرقم المطبوع)
export const BOOK = { title: 'العلوم – الصف الأول الابتدائي – الجزء الأول', pages: 119, w: 1152, h: 1484 };
export const toPdf = p => p;
export const toPrinted = n => n;

export const TOC = [
  { t: 'مقدمة الكتاب', items: [['الغلاف', 1], ['المقدمة', 4], ['قائمة المحتويات', 6], ['تعليمات السلامة', 8], ['دليل الأسرة', 9]] },
  { t: 'الوحدة الأولى: النباتات من حولنا', items: [
    ['الفصل الأول: النباتات مخلوقات حية', 12, 'ch'], ['الدرس الأول: المخلوقات الحية', 14], ['الدرس الثاني: النباتات وأجزاؤها', 20], ['قراءة علمية: زراعة المانجو', 25], ['مراجعة الفصل الأول', 26],
    ['الفصل الثاني: النباتات تنمو وتتغير', 28, 'ch'], ['الدرس الأول: نمو النباتات', 30], ['الدرس الثاني: تعيش النباتات في أماكن كثيرة', 36], ['العلوم والرياضيات: بذور متنوعة', 41], ['مراجعة الفصل الثاني', 43]] },
  { t: 'الوحدة الثانية: الحيوانات ومساكنها', items: [
    ['الفصل الثالث: الحيوانات من حولنا', 46, 'ch'], ['الدرس الأول: أنواع الحيوانات', 48], ['الدرس الثاني: الحيوانات وحاجاتها', 56], ['أعمل كالعلماء: ماذا تأكل الحيوانات؟', 64], ['مراجعة الفصل الثالث', 66],
    ['الفصل الرابع: أماكن العيش', 68, 'ch'], ['الدرس الأول: مواطن على اليابسة', 70], ['الدرس الثاني: مواطن في الماء', 76], ['العلوم والرياضيات: أعد الأرجل', 82], ['مراجعة الفصل الرابع', 83]] },
  { t: 'الوحدة الثالثة: أرضنا', items: [
    ['الفصل الخامس: موارد الأرض', 86, 'ch'], ['الدرس الأول: موارد الأرض', 88], ['الدرس الثاني: الاستفادة من موارد الأرض', 94], ['الدرس الثالث: المحافظة على موارد الأرض', 100], ['العلوم والرياضيات: تدوير العلب المعدنية الفارغة', 106], ['مراجعة الفصل الخامس', 107]] },
  { t: 'مرجعيات الطالب', items: [['مرجعيات الطالب', 109], ['تعليمات السلامة', 110], ['المصطلحات', 112]] }
];

const W = '#ffffff';
export const MODELS = [
  { id: 'living1', unit: 1, build: 'living', title: 'صفات المخلوقات الحية', lesson: 'المخلوقات الحية', page: 16, cover: [0, 650, 1152, 1484], keep: [], bg: '#eef8e6' },
  { id: 'needs1', unit: 1, build: 'needs', title: 'ماذا يحتاج النبات؟', lesson: 'المخلوقات الحية', page: 18, cover: [0, 300, 1152, 1484], keep: [], bg: '#f4fbea' },
  { id: 'straw1', unit: 1, build: 'plantparts', title: 'أجزاء النبات', lesson: 'النباتات وأجزاؤها', page: 22, cover: [200, 490, 1110, 1370], keep: [], bg: 'linear-gradient(180deg,#d8eefc,#fff)' },
  { id: 'plantparts1', unit: 1, build: 'photosyn', title: 'الأوراق تصنع الغذاء', lesson: 'النباتات وأجزاؤها', page: 23, cover: [0, 640, 1152, 1484], keep: [], bg: '#fffbe0' },
  { id: 'flower1', unit: 1, build: 'flower', title: 'الزهرة تكوّن البذور', lesson: 'نمو النباتات', page: 32, cover: [130, 500, 920, 1320], keep: [], bg: '#fff6dc' },
  { id: 'bean1', unit: 1, build: 'seed', title: 'البذرة تنمو وتصير نباتًا', lesson: 'نمو النباتات', page: 34, cover: [0, 560, 1152, 1484], keep: [], bg: '#f6f2e8' },
  { id: 'twoplaces1', unit: 1, build: 'twoplaces', title: 'نباتات الصحراء ونباتات الغابة', lesson: 'تعيش النباتات في أماكن كثيرة', page: 40, cover: [0, 600, 1152, 1484], keep: [], bg: 'linear-gradient(180deg,#d8ecfa,#fff)' },
  { id: 'kinds1', unit: 2, build: 'groups', title: 'أنواع الحيوانات', lesson: 'أنواع الحيوانات', page: 50, cover: [0, 640, 1152, 1484], keep: [], bg: '#f3f8ec' },
  { id: 'fish1', unit: 2, build: 'fish', title: 'أجزاء السمكة', lesson: 'أنواع الحيوانات', page: 54, cover: [0, 640, 1152, 1484], keep: [], bg: 'linear-gradient(180deg,#d6ecfa,#fff)' },
  { id: 'animalneeds1', unit: 2, build: 'homes', title: 'كيف تلبي الحيوانات حاجاتها؟', lesson: 'الحيوانات وحاجاتها', page: 58, cover: [0, 640, 1152, 1484], keep: [], bg: 'linear-gradient(180deg,#dff2ff,#f2fbe8)' },
  { id: 'teeth1', unit: 2, build: 'teeth', title: 'أسنان آكلات الأعشاب وآكلات اللحوم', lesson: 'الحيوانات وحاجاتها', page: 61, cover: [0, 640, 1152, 1484], keep: [], bg: '#f8f4ee' },
  { id: 'desert1', unit: 2, build: 'desert', title: 'موطن الصحراء', lesson: 'مواطن على اليابسة', page: 72, cover: [0, 760, 1152, 1484], keep: [], bg: 'linear-gradient(180deg,#d8ecfa,#f6e6c8)' },
  { id: 'grass1', unit: 2, build: 'habitats', title: 'مواطن مختلفة', lesson: 'مواطن على اليابسة', page: 73, cover: [0, 700, 1152, 1484], keep: [], bg: 'linear-gradient(180deg,#d8ecfa,#fff)' },
  { id: 'forest1', unit: 2, build: 'forest', variant: 0, title: 'موطن الغابة', lesson: 'مواطن على اليابسة', page: 74, cover: [0, 500, 1152, 1484], keep: [], bg: 'linear-gradient(180deg,#d6ecff,#eef8e0)' },
  { id: 'lake1', unit: 2, build: 'pond', title: 'موطن البحيرة', lesson: 'مواطن في الماء', page: 78, cover: [0, 700, 1152, 1484], keep: [], bg: 'linear-gradient(180deg,#d6ecff,#eaf6ff)' },
  { id: 'ocean1', unit: 2, build: 'chain2', variant: 1, title: 'حيوانات المحيط', lesson: 'مواطن في الماء', page: 81, cover: [0, 500, 1152, 1484], keep: [], bg: 'linear-gradient(180deg,#cfe6f5,#f4fbff)' },
  { id: 'resources1', unit: 3, build: 'resources', title: 'الموارد الطبيعية', lesson: 'موارد الأرض', page: 90, cover: [150, 620, 1050, 1200], keep: [], bg: 'linear-gradient(180deg,#d8ecfa,#fff)' },
  { id: 'soil1', unit: 3, build: 'soil', title: 'التربة', lesson: 'موارد الأرض', page: 92, cover: [0, 460, 1152, 1484], keep: [], bg: '#f6efe6' },
  { id: 'pollution1', unit: 3, build: 'pollution', title: 'التلوث ونظافة الأرض', lesson: 'الاستفادة من موارد الأرض', page: 98, cover: [0, 600, 1152, 1484], keep: [], bg: 'linear-gradient(180deg,#d8ecfa,#fff)' },
  { id: 'reuse1', unit: 3, build: 'recycle', title: 'إعادة الاستخدام والتدوير', lesson: 'المحافظة على موارد الأرض', page: 102, cover: [100, 480, 1135, 1000], keep: [], bg: '#f4fbf2' },
  { id: 'recycle1', unit: 3, build: 'recycle', title: 'الترشيد والتدوير', lesson: 'المحافظة على موارد الأرض', page: 105, cover: [80, 120, 440, 560], keep: [], bg: '#f4fbf2' }
];
