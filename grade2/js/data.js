// بيانات الكتاب: الفهرس والمجسّمات — العلوم الصف الثاني (رقم صفحة الملف = الرقم المطبوع)
export const BOOK = { title: 'العلوم – الصف الثاني الابتدائي – الجزء الأول', pages: 177, w: 1152, h: 1484 };
export const toPdf = p => p;
export const toPrinted = n => n;

export const TOC = [
  { t: 'مقدمة الكتاب', items: [['الغلاف', 1], ['المقدمة', 3], ['قائمة المحتويات', 5], ['تعليمات السلامة', 7], ['دليل الأسرة', 8], ['أعمل كالعلماء: المهارات العلمية', 10], ['الطريقة العلمية', 18]] },
  { t: 'الوحدة الأولى: النباتات والحيوانات', items: [
    ['الفصل الأول: النباتات', 28, 'ch'], ['الدرس الأول: حاجات المخلوقات الحية', 30], ['التركيز على المهارات: الملاحظة', 36], ['الدرس الثاني: النباتات تنتج نباتات جديدة', 38], ['العلوم والرياضيات: ما عدد البذور؟', 45], ['مراجعة الفصل الأول ونموذج الاختبار', 46],
    ['الفصل الثاني: الحيوانات', 50, 'ch'], ['الدرس الأول: مجموعات الحيوانات', 52], ['التركيز على المهارات: التصنيف', 58], ['الدرس الثاني: الحيوانات تنمو وتتغير', 60], ['أعمل كالعلماء: كيف تنمو دودة الأرض؟', 66], ['مراجعة الفصل الثاني ونموذج الاختبار', 68]] },
  { t: 'الوحدة الثانية: المواطن', items: [
    ['الفصل الثالث: نظرة إلى المواطن', 74, 'ch'], ['الدرس الأول: أماكن العيش', 76], ['التركيز على المهارات: ترتيب الأشياء', 82], ['الدرس الثاني: سلاسل الغذاء', 84], ['العلوم والرياضيات: غذاء الضفدع', 89], ['مراجعة الفصل الثالث ونموذج الاختبار', 90],
    ['الفصل الرابع: أنواع المواطن', 94, 'ch'], ['الدرس الأول: الصحاري الحارة والباردة', 96], ['التركيز على المهارات: الاستنتاج', 102], ['الدرس الثاني: الغابات', 104], ['قراءة علمية: غابات في المملكة العربية السعودية', 108], ['مراجعة الفصل الرابع ونموذج الاختبار', 109]] },
  { t: 'الوحدة الثالثة: أرضنا', items: [
    ['الفصل الخامس: اليابسة والماء', 114, 'ch'], ['الدرس الأول: اليابسة', 116], ['التركيز على المهارات: عمل نموذج', 122], ['الدرس الثاني: الماء على الأرض', 124], ['كتابة علمية: الماء في منطقتي', 130], ['مراجعة الفصل الخامس ونموذج الاختبار', 132],
    ['الفصل السادس: موارد الأرض', 136, 'ch'], ['الدرس الأول: الصخور والمعادن', 138], ['مهن مرتبطة مع العلوم: عالم الأحجار الكريمة', 144], ['الدرس الثاني: التربة', 146], ['أعمل كالعلماء: أي أنواع التربة يحتفظ بالماء؟', 152], ['مراجعة الفصل السادس ونموذج الاختبار', 154]] },
  { t: 'مرجعيات الطالب', items: [['مرجعيات الطالب', 159], ['جسم الإنسان', 160], ['الصحة', 164], ['السلامة', 168], ['المصطلحات', 170], ['المهارات العلمية', 174]] }
];

const W = '#ffffff';
export const MODELS = [
  { id: 'needs2', unit: 1, build: 'needs', title: 'حاجات المخلوقات الحية', lesson: 'حاجات المخلوقات الحية', page: 32, cover: [41, 700, 1135, 1466], keep: [], bg: '#eef8e6' },
  { id: 'plantparts2', unit: 1, build: 'plantparts', title: 'أجزاء النبات وصنع الغذاء', lesson: 'حاجات المخلوقات الحية', page: 34, cover: [200, 540, 990, 1205], keep: [], bg: 'linear-gradient(180deg,#d8eefc,#fff)' },
  { id: 'photo2', unit: 1, build: 'photosyn', title: 'النباتات تصنع غذاءها وتطلق الأكسجين', lesson: 'حاجات المخلوقات الحية', page: 35, cover: [14, 410, 1115, 960], keep: [], bg: '#fffbe0' },
  { id: 'flower2', unit: 1, build: 'flower', title: 'الزهرة وحبوب اللقاح', lesson: 'النباتات تنتج نباتات جديدة', page: 40, cover: [230, 720, 1125, 1466], keep: [], bg: '#fff6dc' },
  { id: 'seed2', unit: 1, build: 'seed', title: 'البذرة تنمو وتصير نباتًا', lesson: 'النباتات تنتج نباتات جديدة', page: 42, cover: [160, 440, 1046, 1250], keep: [], bg: '#f6f2e8' },
  { id: 'cycle2', unit: 1, build: 'cycle', title: 'دورة حياة النبات', lesson: 'النباتات تنتج نباتات جديدة', page: 43, cover: [55, 425, 990, 1345], keep: [], bg: W },
  { id: 'groups2', unit: 1, build: 'groups', title: 'مجموعات الحيوانات', lesson: 'مجموعات الحيوانات', page: 54, cover: [41, 620, 1135, 1466], keep: [], bg: '#f3f8ec' },
  { id: 'insect2', unit: 1, build: 'insect', title: 'الخنفساء: حشرة', lesson: 'مجموعات الحيوانات', page: 56, cover: [160, 470, 745, 1135], keep: [], bg: 'linear-gradient(180deg,#eaf6ff,#fff)' },
  { id: 'acycle2', unit: 1, build: 'acycle', variant: 1, title: 'دورات حياة الماعز والدجاج والفراشة', lesson: 'الحيوانات تنمو وتتغير', page: 62, cover: [41, 560, 1135, 1466], keep: [], bg: '#fbf4e6' },
  { id: 'meta2', unit: 1, build: 'acycle', variant: 2, title: 'دورة حياة الفراشة', lesson: 'الحيوانات تنمو وتتغير', page: 64, cover: [41, 14, 1135, 590], keep: [], bg: '#eef6fb' },
  { id: 'habitats2', unit: 2, build: 'habitats', title: 'أنواع المواطن', lesson: 'أماكن العيش', page: 78, cover: [41, 560, 1135, 1466], keep: [], bg: 'linear-gradient(180deg,#d8ecfa,#fff)' },
  { id: 'homes2', unit: 2, build: 'homes', title: 'كيف تستخدم الحيوانات مواطنها؟', lesson: 'أماكن العيش', page: 80, cover: [41, 700, 1135, 1466], keep: [], bg: 'linear-gradient(180deg,#dff2ff,#f2fbe8)' },
  { id: 'chain2', unit: 2, build: 'chain2', title: 'سلسلة غذائية على اليابسة وفي الماء', lesson: 'سلاسل الغذاء', page: 86, cover: [41, 470, 1135, 1462], keep: [], bg: 'linear-gradient(180deg,#d8ecfa,#fff6e0)' },
  { id: 'chaindesert2', unit: 2, build: 'chain2', variant: 2, title: 'سلسلة غذائية في الصحراء', lesson: 'سلاسل الغذاء', page: 88, cover: [41, 14, 540, 1466], keep: [], bg: 'linear-gradient(180deg,#d8ecfa,#f6e6c8)' },
  { id: 'desert2', unit: 2, build: 'desert', title: 'تكيف نباتات الصحراء وحيواناتها', lesson: 'الصحاري الحارة والباردة', page: 98, cover: [240, 700, 1135, 1466], keep: [], bg: 'linear-gradient(180deg,#d8ecfa,#f6e6c8)' },
  { id: 'polar2', unit: 2, build: 'polar', title: 'المنطقة القطبية', lesson: 'الصحاري الحارة والباردة', page: 100, cover: [0, 540, 1152, 1120], keep: [], bg: 'linear-gradient(180deg,#cfe4f6,#ffffff)' },
  { id: 'forest2', unit: 2, build: 'forest', variant: 0, title: 'الحياة في الغابة', lesson: 'الغابات', page: 106, cover: [41, 1025, 1135, 1466], keep: [], bg: 'linear-gradient(180deg,#d6ecff,#eef8e0)' },
  { id: 'rainforest2', unit: 2, build: 'forest', variant: 1, title: 'الغابة المطيرة', lesson: 'الغابات', page: 107, cover: [14, 650, 1115, 1466], keep: [], bg: 'linear-gradient(180deg,#c8dcc8,#e8f4e0)' },
  { id: 'spheres2', unit: 3, build: 'globe', variant: 0, title: 'أغلفة الأرض', lesson: 'اليابسة', page: 118, cover: [515, 590, 1065, 810], keep: [], bg: '#0f1e3a' },
  { id: 'landforms2', unit: 3, build: 'landforms', variant: 0, title: 'أشكال اليابسة', lesson: 'اليابسة', page: 118, cover: [41, 800, 1135, 1466], keep: [], bg: 'linear-gradient(180deg,#cfe6f5,#f4fbff)' },
  { id: 'map2', unit: 3, build: 'globe', variant: 1, title: 'الكرة الجغرافية: قارة وجزيرة ومحيط', lesson: 'اليابسة', page: 120, cover: [200, 680, 1046, 1320], keep: [], bg: '#0f1e3a' },
  { id: 'waters2', unit: 3, build: 'landforms', variant: 1, title: 'المياه على الأرض: أنهار وبحيرات وبحار', lesson: 'الماء على الأرض', page: 127, cover: [110, 955, 1035, 1350], keep: [], bg: 'linear-gradient(180deg,#cfe6f5,#f4fbff)' },
  { id: 'ocean2', unit: 3, build: 'globe', variant: 2, title: 'المحيطات تغطي معظم الأرض', lesson: 'الماء على الأرض', page: 128, cover: [160, 575, 1040, 1262], keep: [], bg: '#0f1e3a' },
  { id: 'rockshapes2', unit: 3, build: 'rocks', variant: 0, title: 'تصنيف الصخور', lesson: 'الصخور والمعادن', page: 140, cover: [68, 725, 1135, 1466], keep: [], bg: '#f6efe6' },
  { id: 'minerals2', unit: 3, build: 'rocks', variant: 1, title: 'المعادن واستعمالاتها', lesson: 'الصخور والمعادن', page: 142, cover: [265, 480, 1040, 1190], keep: [], bg: '#f4f0fa' },
  { id: 'soiltypes2', unit: 3, build: 'soiltypes', variant: 1, title: 'أنواع التربة', lesson: 'التربة', page: 148, cover: [41, 555, 1135, 1305], keep: [], bg: '#fff' },
  { id: 'soillayers2', unit: 3, build: 'soil', title: 'طبقات التربة', lesson: 'التربة', page: 150, cover: [160, 470, 1046, 1320], keep: [], bg: '#f6efe6' }
];
