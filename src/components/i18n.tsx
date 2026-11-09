import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

// Keep the wording plain. Have a native Arabic speaker review the Arabic before any real use.
const en = {
  appName: "Deep AI",
  otherLang: "العربية",
  tagline: "Is this video, photo or voice message real?",
  heroSub: "Choose a file and get a clear answer.",
  pickVisual: "Check a video or photo",
  pickAudio: "Check a voice message",
  shareTip: "You can also share a file to this app from WhatsApp.",
  safetyTitle: "Before you send money",
  safetyBody:
    "Call the person on a number you already know. Do not tap links in the message.",
  howTitle: "How it works",
  how: [
    "Choose the file",
    "We check it for signs of editing",
    "You get a clear answer and what to do next",
  ],
  // Keep this line only if the backend really deletes files after the check.
  privacy: "We only use your file to run this check.",

  analysing: "Checking your file",
  stepMeta: "Reading file details",
  stepVisual: "Looking for signs of editing",
  stepVoice: "Checking the voice",
  stepCombine: "Putting the results together",
  error: "Something went wrong. Check your connection and try again.",
  demoBadge: "Demo result",

  verdict: {
    fake: "Likely fake",
    unsure: "Not sure",
    ok: "No signs of manipulation found",
  },
  explain: {
    fake: "This looks edited or computer-made. Do not trust it yet.",
    unsure: "We could not tell. Treat it with care and check another way.",
    ok: "We did not find signs of editing. That does not prove it is real, so still check before sending money.",
  },
  foundTitle: "What we found",
  sigMeta: "File details",
  sigVisual: "Video or picture",
  sigVoice: "Voice",
  stFlag: "Signs of editing",
  stOk: "Nothing unusual",
  stUnknown: "Could not tell",
  nextTitle: "What to do now",
  next: {
    fake: [
      "Do not send money or tap any link.",
      "Call the person on a number you already know.",
      "Report it so others are protected.",
    ],
    unsure: [
      "Do not act in a hurry.",
      "Ask something only the real person would know.",
      "Call them on a number you already know.",
    ],
    ok: [
      "Still confirm any money request by phone.",
      "Agree a family safe word for urgent requests.",
    ],
  },
  limits: "Results are estimates and can be wrong.",
  report: "Report this",
  again: "Check another file",
  back: "Back",

  reportTitle: "Report to the authorities",
  reportDemo:
    "Demo only. In the real app, your report would go to the right authority.",
  consent: "I agree to share this file and result in the report",
  send: "Send report",
  sent: "Report prepared (demo)",
  close: "Close",
};

const ar: typeof en = {
  appName: "Deep AI",
  otherLang: "English",
  tagline: "هل هذا الفيديو أو الصورة أو الرسالة الصوتية حقيقي؟",
  heroSub: "اختر ملفًا واحصل على إجابة واضحة.",
  pickVisual: "افحص فيديو أو صورة",
  pickAudio: "افحص رسالة صوتية",
  shareTip: "يمكنك أيضًا مشاركة الملف مع التطبيق من واتساب.",
  safetyTitle: "قبل أن ترسل أي مبلغ",
  safetyBody:
    "اتصل بالشخص على رقم تعرفه مسبقًا، ولا تضغط على أي رابط في الرسالة.",
  howTitle: "كيف يعمل",
  how: [
    "اختر الملف",
    "نفحصه بحثًا عن علامات التعديل",
    "تحصل على إجابة واضحة وما يجب فعله",
  ],
  privacy: "نستخدم ملفك فقط لإجراء هذا الفحص.",

  analysing: "جارٍ فحص ملفك",
  stepMeta: "قراءة تفاصيل الملف",
  stepVisual: "البحث عن علامات التعديل",
  stepVoice: "فحص الصوت",
  stepCombine: "جمع النتائج",
  error: "حدث خطأ. تحقق من الاتصال وحاول مرة أخرى.",
  demoBadge: "نتيجة تجريبية",

  verdict: {
    fake: "مزيّف على الأرجح",
    unsure: "غير متأكدين",
    ok: "لم نجد علامات تلاعب",
  },
  explain: {
    fake: "يبدو أن هذا الملف معدّل أو مصنوع بالحاسوب. لا تثق به الآن.",
    unsure: "لم نتمكن من الحسم. تعامل معه بحذر وتحقق بطريقة أخرى.",
    ok: "لم نجد علامات تعديل. هذا لا يثبت أنه حقيقي، لذا تأكد قبل إرسال أي مبلغ.",
  },
  foundTitle: "ما وجدناه",
  sigMeta: "تفاصيل الملف",
  sigVisual: "الفيديو أو الصورة",
  sigVoice: "الصوت",
  stFlag: "علامات تعديل",
  stOk: "لا شيء غريب",
  stUnknown: "لم نستطع الحسم",
  nextTitle: "ماذا تفعل الآن",
  next: {
    fake: [
      "لا ترسل أموالًا ولا تضغط على أي رابط.",
      "اتصل بالشخص على رقم تعرفه مسبقًا.",
      "أبلغ عنه لحماية الآخرين.",
    ],
    unsure: [
      "لا تتصرف على عجل.",
      "اسأل سؤالًا لا يعرف جوابه إلا الشخص الحقيقي.",
      "اتصل به على رقم تعرفه مسبقًا.",
    ],
    ok: [
      "ما زال عليك التأكد هاتفيًا من أي طلب مال.",
      "اتفقوا على كلمة سر عائلية للطلبات العاجلة.",
    ],
  },
  limits: "النتائج تقديرية وقد تكون خاطئة.",
  report: "أبلغ عن هذا",
  again: "افحص ملفًا آخر",
  back: "رجوع",

  reportTitle: "الإبلاغ للجهات المختصة",
  reportDemo:
    "نسخة تجريبية فقط. في التطبيق الحقيقي سيصل بلاغك إلى الجهة المناسبة.",
  consent: "أوافق على مشاركة الملف والنتيجة في هذا البلاغ",
  send: "إرسال البلاغ",
  sent: "تم تجهيز البلاغ (تجريبي)",
  close: "إغلاق",
};

type Lang = "en" | "ar";
type Ctx = { lang: Lang; isRTL: boolean; t: typeof en; toggle: () => void };

const dict = { en, ar };
const LangCtx = createContext<Ctx>({
  lang: "en",
  isRTL: false,
  t: en,
  toggle: () => {},
});

// RTL is handled per component (row-reverse + text alignment), so switching language
// needs no app reload. For production, use I18nManager and expo-localization instead.
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const toggle = useCallback(
    () => setLang((l) => (l === "en" ? "ar" : "en")),
    [],
  );
  
  const value = useMemo(
    () => ({ lang, isRTL: lang === "ar", t: dict[lang], toggle }),
    [lang, toggle],
  );
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);
